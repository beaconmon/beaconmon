'use client';

export default function DashboardPreview() {
  return (
    <div className="relative max-w-[700px]">
      {/* Main mock window */}
      <div
        className="bg-brand-bg2 border border-brand-line rounded-[14px] overflow-hidden shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.02)]"
        style={{ maskImage: 'linear-gradient(180deg,#000 80%,transparent 100%)', WebkitMaskImage: 'linear-gradient(180deg,#000 80%,transparent 100%)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-[18px] py-[14px] border-b border-brand-line-soft">
          <div className="flex items-center gap-[10px] text-[13px] font-semibold">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: '#9A9AA8' }}>
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
            <span>Monitors</span>
            <span className="text-[10px] tracking-[0.06em] uppercase bg-brand-bg3 text-brand-dim px-[7px] py-[3px] rounded font-semibold">8 ACTIVE</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-brand-muted">
            <span className="w-[6px] h-[6px] rounded-full bg-brand-green shadow-[0_0_6px_#00E57A] animate-blip" />
            <span className="font-mono text-[11px]">Last checked 18s ago</span>
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-px bg-brand-line-soft border-b border-brand-line-soft">
          {[
            { label: 'All monitors', value: '8', color: '' },
            { label: 'Up', value: '7', color: 'text-brand-green' },
            { label: 'Down', value: '1', color: 'text-brand-red' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-brand-bg2 px-[18px] py-[14px]">
              <div className="text-[11px] text-brand-muted uppercase tracking-[0.05em] mb-1">{label}</div>
              <div className={`text-[22px] font-bold tracking-[-0.02em] ${color}`}>{value}</div>
            </div>
          ))}
        </div>

        {/* Monitor rows */}
        <div className="py-1">
          {/* Row 1 — UP */}
          <MockRow
            dotColor="brand-green"
            name="acme-storefront.com"
            url="https://acme-storefront.com"
            type="HTTP"
            status="up"
            sparkPoints="0,14 10,12 20,13 30,11 40,14 50,10 60,12 70,11 80,13 90,12 100,10"
            sparkColor="#00E57A"
          />
          {/* Row 2 — UP */}
          <MockRow
            dotColor="brand-green"
            name="Portfolio — marquez.design"
            url="https://marquez.design"
            type="HTTP"
            status="up"
            sparkPoints="0,10 10,12 20,11 30,12 40,10 50,11 60,10 70,13 80,11 90,12 100,11"
            sparkColor="#00E57A"
          />
          {/* Row 3 — DOWN */}
          <MockRow
            dotColor="brand-red"
            name="api.loomwave.io"
            url="https://api.loomwave.io/health"
            type="HTTP"
            status="down"
            sparkPoints="0,10 10,12 20,11 30,14 40,12 50,11 60,18 70,22 80,22 90,22 100,22"
            sparkColor="#FF4444"
          />
          {/* Row 4 — SSL OK */}
          <MockRow
            dotColor="brand-green"
            name="greenhaus-coffee.com · SSL"
            url="Expires in 47 days"
            type="SSL"
            status="ok"
            sparkPoints="0,12 10,12 20,12 30,12 40,12 50,12 60,12 70,12 80,12 90,12 100,12"
            sparkColor="#00E57A"
          />
        </div>
      </div>

      {/* Floating alert card */}
      <div className="absolute right-[-14px] bottom-10 max-[1024px]:right-2 max-[1024px]:bottom-5 max-[640px]:static max-[640px]:mt-[-20px] w-[300px] max-[1024px]:w-[270px] bg-brand-bg3 border border-brand-line border-l-2 border-l-brand-red rounded-[10px] px-4 py-[14px] shadow-[0_20px_40px_rgba(0,0,0,0.5)] text-[13px] flex gap-3 items-start">
        <div className="w-8 h-8 rounded-lg bg-[rgba(255,68,68,0.12)] text-brand-red inline-flex items-center justify-center shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
        </div>
        <div>
          <div className="font-semibold mb-[3px]">api.loomwave.io is down</div>
          <div className="text-brand-dim text-[12px] leading-[1.4]">Returned HTTP 503 from us-east &amp; eu-west. Sent to #alerts.</div>
          <div className="font-mono text-[10px] text-brand-muted mt-[6px] tracking-[0.04em]">12s ago · via Slack</div>
        </div>
      </div>
    </div>
  );
}

function MockRow({
  dotColor,
  name,
  url,
  type,
  status,
  sparkPoints,
  sparkColor,
}: {
  dotColor: string;
  name: string;
  url: string;
  type: string;
  status: 'up' | 'down' | 'ok';
  sparkPoints: string;
  sparkColor: string;
}) {
  const isUp = status === 'up' || status === 'ok';
  const pillClass = isUp
    ? 'bg-[rgba(0,229,122,0.1)] text-brand-green border border-[rgba(0,229,122,0.25)]'
    : 'bg-[rgba(255,68,68,0.1)] text-brand-red border border-[rgba(255,68,68,0.3)]';
  const dotClass = isUp ? 'bg-brand-green' : 'bg-brand-red';

  return (
    <div className="grid grid-cols-[20px_1.5fr_70px_80px_1fr] gap-4 items-center px-[18px] py-3 border-b border-brand-line-soft last:border-b-0 text-[13px] max-[640px]:grid-cols-[12px_1fr_70px] max-[640px]:gap-[10px] max-[640px]:px-[14px] max-[640px]:py-[10px]">
      {/* Live dot */}
      <span className={`w-2 h-2 rounded-full ${dotClass} animate-breathe shadow-[0_0_6px_currentColor]`} />
      {/* Name */}
      <div>
        <div className="font-medium">{name}</div>
        <div className="font-mono text-[11px] text-brand-muted">{url}</div>
      </div>
      {/* Type */}
      <div className="max-[640px]:hidden">
        <span className="text-[10px] tracking-[0.06em] uppercase bg-brand-bg3 text-brand-dim px-[7px] py-[3px] rounded font-semibold">{type}</span>
      </div>
      {/* Status pill */}
      <span className={`inline-flex items-center gap-[6px] text-[11px] font-semibold px-2 py-[3px] rounded-full tracking-[0.02em] ${pillClass}`}>
        <span className={`w-[6px] h-[6px] rounded-full ${dotClass}`} />
        {status.toUpperCase()}
      </span>
      {/* Sparkline */}
      <div className="max-[640px]:hidden">
        <svg className="w-full h-6" viewBox="0 0 100 24" preserveAspectRatio="none">
          <polyline fill="none" stroke={sparkColor} strokeWidth="1.5" points={sparkPoints} />
        </svg>
      </div>
    </div>
  );
}
