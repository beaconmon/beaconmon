import { ImageResponse } from 'next/og';

export const alt = 'How much revenue are slow competitor reactions costing you? | Beaconmon';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '80px',
        background: '#0A0A0F',
        fontFamily: 'sans-serif',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(0,229,122,0.12) 0%, transparent 65%)',
          display: 'flex',
        }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '52px' }}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="36" height="36">
          <rect fill="#0f172a" width="32" height="32" rx="7" />
          <path d="M4 22a12 12 0 0 0 24 0" fill="none" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" style={{ opacity: 0.28 }} />
          <path d="M8 22a8 8 0 0 0 16 0" fill="none" stroke="#06b6d4" strokeWidth="2.2" strokeLinecap="round" style={{ opacity: 0.62 }} />
          <path d="M12 22a4 4 0 0 0 8 0" fill="none" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M16 24.5V28" fill="none" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" style={{ opacity: 0.45 }} />
          <circle cx="16" cy="22" r="2.5" fill="#06b6d4" />
        </svg>
        <span style={{ color: '#FFFFFF', fontSize: '22px', fontWeight: 700, letterSpacing: '-0.01em' }}>
          Beaconmon
        </span>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          color: '#FFFFFF',
          fontSize: '48px',
          fontWeight: 800,
          lineHeight: 1.08,
          letterSpacing: '-0.035em',
          maxWidth: '900px',
          marginBottom: '28px',
        }}
      >
        <span>How much revenue are</span>
        <span>slow competitor reactions</span>
        <span style={{ color: '#00E57A' }}>costing you?</span>
      </div>
      <div
        style={{
          color: '#8C8C9D',
          fontSize: '22px',
          lineHeight: 1.5,
          maxWidth: '740px',
          display: 'flex',
        }}
      >
        Calculate the dollar gap between reacting in hours vs. days
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: '72px',
          left: '80px',
          right: '80px',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
        }}
      >
        <div style={{ height: '1px', background: '#2A2A3A', flex: 1, display: 'flex' }} />
        <span style={{ color: '#00E57A', fontSize: '13px', fontWeight: 600, letterSpacing: '0.1em' }}>
          BEACONMON.COM
        </span>
      </div>
    </div>,
    { width: 1200, height: 630 },
  );
}
