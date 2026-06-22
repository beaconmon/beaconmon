import { Box, InlineStack, Tooltip, type BoxProps } from "@shopify/polaris";
import type { DailyUptimeStat } from "@beaconmon/types";

// Color each day by its state, matching the public status page conventions.
const STATE_BG: Record<DailyUptimeStat["state"], BoxProps["background"]> = {
  up: "bg-fill-success",
  degraded: "bg-fill-caution",
  outage: "bg-fill-critical",
  nodata: "bg-fill-disabled",
};

function dayLabel(stat: DailyUptimeStat): string {
  if (stat.state === "nodata") return `${stat.date}: no data yet`;
  return `${stat.date}: ${stat.uptimePercent.toFixed(2)}% uptime`;
}

// A compact row of one segment per day, oldest first. Built from Polaris Box
// primitives since Polaris has no native uptime bar.
export function UptimeBar({ stats }: { stats: DailyUptimeStat[] }) {
  return (
    <InlineStack gap="050" blockAlign="center">
      {stats.map((s) => (
        <Tooltip key={s.date} content={dayLabel(s)} preferredPosition="above">
          <Box
            background={STATE_BG[s.state]}
            borderRadius="100"
            width="10px"
            minHeight="28px"
          />
        </Tooltip>
      ))}
    </InlineStack>
  );
}

// Average uptime across days that have data. Returns null when no day has run a
// check yet (a freshly provisioned store), so the caller can hide the figure.
export function aggregateUptime(stats: DailyUptimeStat[]): number | null {
  const withData = stats.filter((s) => s.state !== "nodata");
  if (withData.length === 0) return null;
  return (
    withData.reduce((sum, s) => sum + s.uptimePercent, 0) / withData.length
  );
}
