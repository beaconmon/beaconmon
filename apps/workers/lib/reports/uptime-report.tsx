import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MonitorReportData {
  id: string;
  name: string;
  url: string;
  uptimePct: number;
  incidentCount: number;
  avgResponseTimeMs: number | null;
  p95ResponseTimeMs: number | null;
}

export interface IncidentReportData {
  id: string;
  monitorName: string;
  startedAt: Date;
  resolvedAt: Date | null;
  durationMs: number | null;
  resolutionType: string | null;
}

export interface UptimeReportProps {
  agencyName: string;
  brandColor: string;
  logoUrl: string | null;
  clientName: string;
  clientNotes: string | null;
  periodStart: Date;
  periodEnd: Date;
  generatedAt: Date;
  monitors: MonitorReportData[];
  incidents: IncidentReportData[];
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function buildStyles(brandColor: string) {
  return StyleSheet.create({
    page: {
      fontFamily: 'Helvetica',
      fontSize: 10,
      padding: 40,
      color: '#1f2937',
    },
    coverPage: {
      fontFamily: 'Helvetica',
      fontSize: 10,
      padding: 60,
      color: '#1f2937',
      backgroundColor: '#f9fafb',
    },
    brandBar: {
      backgroundColor: brandColor,
      height: 8,
      marginBottom: 32,
    },
    logo: {
      width: 120,
      marginBottom: 16,
    },
    agencyName: {
      fontSize: 14,
      fontFamily: 'Helvetica-Bold',
      color: brandColor,
      marginBottom: 4,
    },
    coverTitle: {
      fontSize: 28,
      fontFamily: 'Helvetica-Bold',
      color: '#111827',
      marginTop: 48,
      marginBottom: 8,
    },
    coverSubtitle: {
      fontSize: 13,
      color: '#6b7280',
      marginBottom: 4,
    },
    coverDate: {
      fontSize: 11,
      color: '#9ca3af',
      marginTop: 8,
    },
    coverNotes: {
      fontSize: 10,
      color: '#374151',
      marginTop: 24,
      padding: 16,
      backgroundColor: '#f3f4f6',
      borderRadius: 4,
    },
    sectionTitle: {
      fontSize: 14,
      fontFamily: 'Helvetica-Bold',
      color: '#111827',
      marginBottom: 12,
      marginTop: 24,
      borderBottomWidth: 1,
      borderBottomColor: '#e5e7eb',
      paddingBottom: 6,
    },
    monitorCard: {
      marginBottom: 16,
      padding: 14,
      backgroundColor: '#f9fafb',
      borderRadius: 4,
      borderLeftWidth: 4,
      borderLeftColor: brandColor,
    },
    monitorName: {
      fontSize: 11,
      fontFamily: 'Helvetica-Bold',
      marginBottom: 4,
    },
    monitorUrl: {
      fontSize: 9,
      color: '#6b7280',
      marginBottom: 8,
    },
    statsRow: {
      flexDirection: 'row',
      gap: 16,
    },
    statBox: {
      flex: 1,
    },
    statLabel: {
      fontSize: 8,
      color: '#9ca3af',
      textTransform: 'uppercase',
      marginBottom: 2,
    },
    statValue: {
      fontSize: 13,
      fontFamily: 'Helvetica-Bold',
    },
    uptimeGreen: { color: '#16a34a' },
    uptimeAmber: { color: '#d97706' },
    uptimeRed: { color: '#dc2626' },
    tableHeader: {
      flexDirection: 'row',
      backgroundColor: '#f3f4f6',
      padding: 6,
      fontSize: 8,
      fontFamily: 'Helvetica-Bold',
      color: '#6b7280',
    },
    tableRow: {
      flexDirection: 'row',
      padding: 6,
      borderBottomWidth: 1,
      borderBottomColor: '#f3f4f6',
    },
    tableRowAlt: {
      flexDirection: 'row',
      padding: 6,
      backgroundColor: '#fafafa',
      borderBottomWidth: 1,
      borderBottomColor: '#f3f4f6',
    },
    col1: { width: '25%' },
    col2: { width: '20%' },
    col3: { width: '20%' },
    col4: { width: '20%' },
    col5: { width: '15%' },
    footer: {
      position: 'absolute',
      bottom: 24,
      left: 40,
      right: 40,
      flexDirection: 'row',
      justifyContent: 'space-between',
      fontSize: 8,
      color: '#9ca3af',
    },
  });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${totalSeconds % 60}s`;
  return `${totalSeconds}s`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function UptimeReport(props: UptimeReportProps) {
  const {
    agencyName,
    brandColor,
    logoUrl,
    clientName,
    clientNotes,
    periodStart,
    periodEnd,
    generatedAt,
    monitors,
    incidents,
  } = props;

  const styles = buildStyles(brandColor);

  return (
    <Document title={`Uptime Report — ${clientName}`} author={agencyName}>
      {/* ─── Cover page ─────────────────────────────────────── */}
      <Page size="A4" style={styles.coverPage}>
        <View style={styles.brandBar} />
        {logoUrl && <Image src={logoUrl} style={styles.logo} />}
        <Text style={styles.agencyName}>{agencyName}</Text>
        <Text style={styles.coverTitle}>Uptime Report</Text>
        <Text style={styles.coverSubtitle}>Prepared for {clientName}</Text>
        <Text style={styles.coverDate}>
          {formatDate(periodStart)} – {formatDate(periodEnd)}
        </Text>
        {clientNotes && <Text style={styles.coverNotes}>{clientNotes}</Text>}
        <View style={styles.footer}>
          <Text>Generated {formatDate(generatedAt)}</Text>
          <Text>Powered by Beaconmon</Text>
        </View>
      </Page>

      {/* ─── Monitor uptime pages ────────────────────────────── */}
      <Page size="A4" style={styles.page}>
        <View style={styles.brandBar} />
        <Text style={styles.sectionTitle}>Monitor Summary</Text>

        {monitors.map((m) => {
          const uptimeStyle =
            m.uptimePct >= 99.9
              ? styles.uptimeGreen
              : m.uptimePct >= 95
                ? styles.uptimeAmber
                : styles.uptimeRed;

          return (
            <View key={m.id} style={styles.monitorCard}>
              <Text style={styles.monitorName}>{m.name}</Text>
              <Text style={styles.monitorUrl}>{m.url}</Text>
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Uptime</Text>
                  <Text style={[styles.statValue, uptimeStyle]}>{m.uptimePct.toFixed(2)}%</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Incidents</Text>
                  <Text style={styles.statValue}>{m.incidentCount}</Text>
                </View>
                {m.avgResponseTimeMs != null && (
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Avg Response</Text>
                    <Text style={styles.statValue}>{m.avgResponseTimeMs}ms</Text>
                  </View>
                )}
                {m.p95ResponseTimeMs != null && (
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>P95 Response</Text>
                    <Text style={styles.statValue}>{m.p95ResponseTimeMs}ms</Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}

        <View style={styles.footer}>
          <Text>{agencyName} — {clientName}</Text>
          <Text>Powered by Beaconmon</Text>
        </View>
      </Page>

      {/* ─── Incident history ────────────────────────────────── */}
      {incidents.length > 0 && (
        <Page size="A4" style={styles.page}>
          <View style={styles.brandBar} />
          <Text style={styles.sectionTitle}>Incident History</Text>

          <View style={styles.tableHeader}>
            <Text style={styles.col1}>Monitor</Text>
            <Text style={styles.col2}>Started</Text>
            <Text style={styles.col3}>Resolved</Text>
            <Text style={styles.col4}>Duration</Text>
            <Text style={styles.col5}>Resolution</Text>
          </View>

          {incidents.map((inc, i) => (
            <View key={inc.id} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
              <Text style={styles.col1}>{inc.monitorName}</Text>
              <Text style={styles.col2}>{formatDate(inc.startedAt)}</Text>
              <Text style={styles.col3}>
                {inc.resolvedAt ? formatDate(inc.resolvedAt) : 'Ongoing'}
              </Text>
              <Text style={styles.col4}>
                {inc.durationMs != null ? formatDuration(inc.durationMs) : '—'}
              </Text>
              <Text style={styles.col5}>{inc.resolutionType ?? '—'}</Text>
            </View>
          ))}

          <View style={styles.footer}>
            <Text>{agencyName} — {clientName}</Text>
            <Text>Powered by Beaconmon</Text>
          </View>
        </Page>
      )}
    </Document>
  );
}
