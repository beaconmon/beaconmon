import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Resend } from 'resend';
import { prisma } from '@beaconmon/db';
import { logger } from './lib/logger.js';
import { env } from './lib/env.js';
import { UptimeReport } from './lib/reports/uptime-report.js';
import type { ReportJob } from '@beaconmon/queue';
import type {
  MonitorReportData,
  IncidentReportData,
} from './lib/reports/uptime-report.js';

export async function processReportJob(data: ReportJob): Promise<void> {
  const { teamId, periodStart, periodEnd, clientName, clientNotes } = data;
  const service = 'report-worker';
  const periodStartDate = new Date(periodStart);
  const periodEndDate = new Date(periodEnd);
  const reportId = crypto.randomUUID();

  logger.info(
    { service, teamId, reportId, periodStart, periodEnd, clientName },
    'Generating uptime report'
  );

  // 1. Load team branding + owner email
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: {
      reportAgencyName: true,
      reportBrandColor: true,
      reportLogoUrl: true,
      members: {
        where: { role: 'owner' },
        include: { user: { select: { email: true } } },
        take: 1,
      },
    },
  });

  if (!team) throw new Error(`Team ${teamId} not found`);

  const agencyName = team.reportAgencyName ?? 'Beaconmon';
  const brandColor = team.reportBrandColor ?? '#2563eb';
  const logoUrl = team.reportLogoUrl ?? null;
  const ownerEmail = team.members[0]?.user.email ?? null;

  // 2. Load monitors for this team
  const monitors = await prisma.monitor.findMany({
    where: { teamId, deletedAt: null },
    select: { id: true, name: true, url: true },
  });

  if (monitors.length === 0) {
    logger.info({ service, teamId }, 'No monitors found — skipping report generation');
    return;
  }

  const monitorIds = monitors.map((m) => m.id);

  // 3. Compute per-monitor uptime %
  type UptimeRow = { monitor_id: string; uptime: number; avg_ms: number | null; p95_ms: number | null };
  const uptimeRows = await prisma.$queryRaw<UptimeRow[]>`
    SELECT
      monitor_id,
      ROUND(
        (SUM(CASE WHEN success THEN 1 ELSE 0 END)::float / NULLIF(COUNT(*), 0)::float * 100)::numeric,
        2
      )::float AS uptime,
      ROUND(AVG(response_time_ms)::numeric, 0)::int AS avg_ms,
      PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY response_time_ms) AS p95_ms
    FROM check_results
    WHERE monitor_id = ANY(${monitorIds})
      AND checked_at >= ${periodStartDate}
      AND checked_at < ${periodEndDate}
      AND maintenance = false
    GROUP BY monitor_id
  `;

  const uptimeMap = new Map(uptimeRows.map((r) => [r.monitor_id, r]));

  // 4. Incident counts
  const incidentRows = await prisma.$queryRaw<{ monitor_id: string; count: bigint }[]>`
    SELECT monitor_id, COUNT(*) AS count
    FROM incidents
    WHERE team_id = ${teamId}
      AND started_at >= ${periodStartDate}
      AND started_at < ${periodEndDate}
    GROUP BY monitor_id
  `;

  const incidentCountMap = new Map(
    incidentRows.map((r) => [r.monitor_id, Number(r.count)])
  );

  const monitorData: MonitorReportData[] = monitors.map((m) => {
    const stats = uptimeMap.get(m.id);
    return {
      id: m.id,
      name: m.name,
      url: m.url,
      uptimePct: stats?.uptime ?? 100,
      incidentCount: incidentCountMap.get(m.id) ?? 0,
      avgResponseTimeMs: stats?.avg_ms ?? null,
      p95ResponseTimeMs: stats?.p95_ms != null ? Math.round(Number(stats.p95_ms)) : null,
    };
  });

  // 5. Incident history
  const incidentList = await prisma.incident.findMany({
    where: {
      teamId,
      startedAt: { gte: periodStartDate, lt: periodEndDate },
    },
    include: { monitor: { select: { name: true } } },
    orderBy: { startedAt: 'desc' },
  });

  const incidentData: IncidentReportData[] = incidentList.map((inc) => ({
    id: inc.id,
    monitorName: inc.monitor.name,
    startedAt: inc.startedAt,
    resolvedAt: inc.resolvedAt,
    durationMs:
      inc.resolvedAt != null
        ? inc.resolvedAt.getTime() - inc.startedAt.getTime()
        : null,
    resolutionType: inc.resolutionType,
  }));

  // 6. Render PDF
  // Cast required: React.createElement returns FunctionComponentElement<Props>
  // but renderToBuffer expects ReactElement<DocumentProps>. The Document wrapper
  // inside UptimeReport satisfies the runtime contract.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reportElement = React.createElement(UptimeReport as any, {
    agencyName,
    brandColor,
    logoUrl,
    clientName,
    clientNotes: clientNotes ?? null,
    periodStart: periodStartDate,
    periodEnd: periodEndDate,
    generatedAt: new Date(),
    monitors: monitorData,
    incidents: incidentData,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any;
  const pdfBuffer = await renderToBuffer(reportElement);

  logger.info({ service, teamId, reportId, pdfSizeBytes: pdfBuffer.length }, 'PDF rendered');

  // 7. Upload to R2
  if (!env.R2_BUCKET || !env.R2_ACCOUNT_ID || !env.R2_ACCESS_KEY_ID || !env.R2_SECRET_ACCESS_KEY) {
    throw new Error('R2 credentials not configured — cannot store report');
  }

  const s3 = new S3Client({
    region: 'auto',
    endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    },
  });

  const objectKey = `reports/${teamId}/${reportId}.pdf`;

  await s3.send(
    new PutObjectCommand({
      Bucket: env.R2_BUCKET,
      Key: objectKey,
      Body: pdfBuffer,
      ContentType: 'application/pdf',
      ContentDisposition: `attachment; filename="uptime-report-${reportId}.pdf"`,
    })
  );

  // Generate a 7-day signed URL
  const signedUrl = await getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: env.R2_BUCKET, Key: objectKey }),
    { expiresIn: 7 * 24 * 60 * 60 }
  );

  logger.info({ service, teamId, reportId, objectKey }, 'PDF uploaded to R2');

  // 8. Email the download link to the team owner
  if (!ownerEmail || !env.RESEND_API_KEY || !env.EMAIL_FROM) {
    logger.warn({ service, teamId, reportId }, 'No owner email or Resend not configured — skipping email');
    return;
  }

  const resend = new Resend(env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: env.EMAIL_FROM,
    to: ownerEmail,
    subject: `Your uptime report for ${clientName} is ready`,
    html: `
      <p>Hi,</p>
      <p>Your uptime report for <strong>${clientName}</strong>
      (${periodStartDate.toLocaleDateString('en-US')} –
      ${periodEndDate.toLocaleDateString('en-US')}) is ready.</p>
      <p><a href="${signedUrl}" style="color:#2563eb">Download PDF Report</a></p>
      <p><em>This link expires in 7 days.</em></p>
      <p>– ${agencyName} via Beaconmon</p>
    `,
  });

  if (error) {
    logger.error({ service, teamId, reportId, err: error.message }, 'Failed to send report email');
    throw new Error(`Resend error: ${error.message}`);
  }

  logger.info({ service, teamId, reportId, ownerEmail }, 'Report email sent');
}
