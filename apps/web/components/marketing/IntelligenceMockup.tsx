interface IntelligenceMockupProps {
  storeLabel: string;
  stats: {
    competitorMoves: number;
    storeChanges: number;
    storeChangesLabel: string;
    smartAlerts: number;
    smartAlertsLabel: string;
  };
  events: Array<{
    type: 'competitor' | 'store' | 'alert';
    icon: string;
    label: string;
    detail: string;
    timeAgo: string;
    bigText?: boolean;
  }>;
  slackNotification: {
    title: string;
    body: string;
    timeAgo: string;
    channel: string;
  };
}

function eventColors(type: 'competitor' | 'store' | 'alert'): { bg: string; text: string; dot: string } {
  if (type === 'competitor') return { bg: 'bg-amber-400/15', text: 'text-amber-400', dot: 'bg-amber-400' };
  if (type === 'store') return { bg: 'bg-green-400/15', text: 'text-green-400', dot: 'bg-green-400' };
  return { bg: 'bg-red-400/15', text: 'text-red-400', dot: 'bg-red-400' };
}

export default function IntelligenceMockup({ storeLabel, stats, events, slackNotification }: IntelligenceMockupProps) {
  return (
    <div className="relative w-full max-w-[620px] mx-auto">
      {/* Main card */}
      <div className="bg-[#0d1117] border border-[rgba(255,255,255,0.08)] rounded-2xl overflow-hidden font-mono text-sm">
        {/* Header bar */}
        <div className="flex items-center justify-between px-5 py-3 bg-[#161b22] border-b border-[rgba(255,255,255,0.06)]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00e57a] inline-block" />
            <span className="text-[11px] text-[rgba(255,255,255,0.5)] tracking-wide">{storeLabel}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold tracking-[0.1em] uppercase text-[rgba(255,255,255,0.55)]">Competitor Feed</span>
            <span className="text-[9px] font-bold tracking-[0.12em] uppercase text-amber-400">· LIVE</span>
          </div>
        </div>

        {/* Stat strip */}
        <div className="grid grid-cols-3 gap-px bg-[rgba(255,255,255,0.04)] border-b border-[rgba(255,255,255,0.06)]">
          <div className="bg-[#0d1117] px-4 py-3 flex flex-col gap-1">
            <span className="text-[22px] font-bold text-amber-400 leading-none">{stats.competitorMoves}</span>
            <span className="text-[10px] text-[rgba(255,255,255,0.55)] leading-tight">competitor moves</span>
          </div>
          <div className="bg-[#0d1117] px-4 py-3 flex flex-col gap-1">
            <span className="text-[22px] font-bold text-green-400 leading-none">{stats.storeChanges}</span>
            <span className="text-[10px] text-[rgba(255,255,255,0.55)] leading-tight">{stats.storeChangesLabel}</span>
          </div>
          <div className="bg-[#0d1117] px-4 py-3 flex flex-col gap-1">
            <span className="text-[22px] font-bold text-yellow-400 leading-none">{stats.smartAlerts}</span>
            <span className="text-[10px] text-[rgba(255,255,255,0.55)] leading-tight">{stats.smartAlertsLabel}</span>
          </div>
        </div>

        {/* Feed rows */}
        <div className="divide-y divide-[rgba(255,255,255,0.04)]">
          {events.map((event, i) => {
            const colors = eventColors(event.type);
            return (
              <div key={i} className="flex items-start gap-3 px-5 py-3 hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                <span className={`shrink-0 mt-[2px] w-6 h-6 rounded-lg flex items-center justify-center text-[13px] ${colors.bg} ${colors.text}`}>
                  {event.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <span className={`${event.bigText ? 'text-[13px]' : 'text-[12px]'} font-semibold ${colors.text}`}>{event.label}</span>
                  <p className="text-[11px] text-[rgba(255,255,255,0.55)] mt-0.5 leading-snug truncate">{event.detail}</p>
                </div>
                <span className="shrink-0 text-[10px] text-[rgba(255,255,255,0.55)] whitespace-nowrap mt-0.5">{event.timeAgo}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Slack notification overlay — bottom-left */}
      <div className="absolute bottom-20 -left-7 bg-[#1a1d21] border border-l-2 border-[rgba(255,255,255,0.12)] border-l-amber-400 rounded-xl p-4 max-w-[260px] shadow-2xl">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 rounded bg-[#6c5ce7] flex items-center justify-center shrink-0">
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden>
              <rect x="0" y="0" width="4" height="4" rx="1" fill="white" opacity="0.9" />
              <rect x="7" y="0" width="4" height="4" rx="1" fill="white" opacity="0.6" />
              <rect x="0" y="7" width="4" height="4" rx="1" fill="white" opacity="0.6" />
              <rect x="7" y="7" width="4" height="4" rx="1" fill="white" opacity="0.9" />
            </svg>
          </div>
          <span className="text-[11px] font-semibold text-white">{slackNotification.title}</span>
        </div>
        <p className="text-[11px] text-[rgba(255,255,255,0.5)] leading-snug mb-2">{slackNotification.body}</p>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-[rgba(255,255,255,0.55)]">{slackNotification.timeAgo}</span>
          <span className="text-[10px] text-[#a29bfe]">{slackNotification.channel}</span>
        </div>
      </div>
    </div>
  );
}
