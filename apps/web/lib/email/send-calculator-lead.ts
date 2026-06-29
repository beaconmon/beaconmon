import * as React from 'react';
import { Resend } from 'resend';
import { render } from '@react-email/render';
import { logger } from '@/lib/logger';
import { CalculatorLeadEmail } from '@/emails/calculator-lead';

interface ToolConfig {
  label: string;
  resultLabel: string;
  subject: string;
  tip: string;
}

const TOOL_CONFIG: Record<string, ToolConfig> = {
  'downtime-detection-calculator': {
    label: 'Downtime Detection Calculator',
    resultLabel: 'Your detection window',
    subject: 'Your downtime detection window result',
    tip: 'The fastest way to shrink your detection window is to drop your check interval to 1 minute and enable multi-location checks. Most plans fail first at an edge location, so a single-region check can miss outages for 5 to 10 minutes before you even know.',
  },
  'competitor-intelligence-roi': {
    label: 'Competitor Intelligence ROI Calculator',
    resultLabel: 'Your annual opportunity',
    subject: 'Your competitor intelligence ROI result',
    tip: "The biggest driver of missed revenue isn't missing a competitor price change, it's the lag between spotting it and acting. Teams that route change alerts directly into Slack or email cut their reaction time from days to hours. That one workflow change is usually worth more than any tool.",
  },
};

const FALLBACK_CONFIG: ToolConfig = {
  label: 'Beaconmon Calculator',
  resultLabel: 'Your result',
  subject: 'Your calculator result from Beaconmon',
  tip: 'Monitoring your competitors and your own store gives you a reaction time advantage that compounds over time. The sooner you set up alerts, the sooner you stop leaving revenue on the table.',
};

export async function sendCalculatorLeadEmail({
  email,
  tool,
  result,
}: {
  email: string;
  tool: string;
  result?: string | null;
}): Promise<boolean> {
  const resendApiKey = process.env['RESEND_API_KEY'];
  const emailFrom = process.env['EMAIL_FROM'];
  const appUrl = process.env['BETTER_AUTH_URL'] ?? 'https://beaconmon.com';

  if (!resendApiKey || !emailFrom) {
    logger.warn({ service: 'web', tool }, 'RESEND_API_KEY or EMAIL_FROM not set — skipping calculator lead email');
    return false;
  }

  const config = TOOL_CONFIG[tool] ?? FALLBACK_CONFIG;
  const ctaUrl = `${appUrl}/register`;

  const html = await render(
    React.createElement(CalculatorLeadEmail, {
      toolLabel: config.label,
      resultLabel: config.resultLabel,
      result: result ?? 'See below',
      tip: config.tip,
      ctaUrl,
    })
  );

  const resend = new Resend(resendApiKey);
  const { error } = await resend.emails.send({
    from: emailFrom,
    to: email,
    subject: config.subject,
    html,
  });

  if (error) {
    logger.error({ service: 'web', tool, err: error }, 'Failed to send calculator lead email');
    throw error;
  }

  return true;
}
