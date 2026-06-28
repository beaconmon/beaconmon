import { ImageResponse } from 'next/og';

export const alt = 'Competitor Price Increases Outnumber Cuts 55% to 45% on Shopify';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', padding: '72px 80px', background: '#0A0A0F', fontFamily: 'sans-serif', position: 'relative' }}>
      <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(0,229,122,0.12) 0%, transparent 65%)', display: 'flex' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="34" height="34">
          <rect fill="#0f172a" width="32" height="32" rx="7" />
          <path d="M4 22a12 12 0 0 0 24 0" fill="none" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" style={{ opacity: 0.28 }} />
          <path d="M8 22a8 8 0 0 0 16 0" fill="none" stroke="#06b6d4" strokeWidth="2.2" strokeLinecap="round" style={{ opacity: 0.62 }} />
          <path d="M12 22a4 4 0 0 0 8 0" fill="none" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M16 24.5V28" fill="none" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" style={{ opacity: 0.45 }} />
          <circle cx="16" cy="22" r="2.5" fill="#06b6d4" />
        </svg>
        <span style={{ color: '#FFFFFF', fontSize: '20px', fontWeight: 700, letterSpacing: '-0.01em' }}>Beaconmon</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,229,122,0.1)', border: '1px solid rgba(0,229,122,0.25)', borderRadius: '100px', padding: '6px 16px', marginBottom: '28px' }}>
        <span style={{ color: '#00E57A', fontSize: '13px', fontWeight: 600, letterSpacing: '0.1em' }}>DATA &amp; RESEARCH</span>
      </div>
      <div style={{ color: '#FFFFFF', fontSize: '44px', fontWeight: 800, lineHeight: 1.12, letterSpacing: '-0.03em', maxWidth: '920px', display: 'flex', flexWrap: 'wrap' }}>
        Competitor Price Increases Outnumber Cuts 55% to 45% on Shopify
      </div>
      <div style={{ position: 'absolute', bottom: '64px', left: '80px', right: '80px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(0,229,122,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00E57A', fontSize: '14px', fontWeight: 700 }}>H</div>
          <span style={{ color: '#8C8C9D', fontSize: '15px', display: 'flex' }}>Haimanot Getu</span>
          <span style={{ color: '#3A3A4A', fontSize: '15px', display: 'flex' }}>·</span>
          <span style={{ color: '#8C8C9D', fontSize: '15px', display: 'flex' }}>6 min read</span>
        </div>
        <span style={{ color: '#00E57A', fontSize: '13px', fontWeight: 600, letterSpacing: '0.1em', display: 'flex' }}>BEACONMON.COM</span>
      </div>
    </div>,
    { width: 1200, height: 630 },
  );
}
