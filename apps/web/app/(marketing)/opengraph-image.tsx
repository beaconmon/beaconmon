import { ImageResponse } from 'next/og';

export const alt = 'Monitor your store and competitors automatically | Beaconmon';
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
      {/* Subtle green radial glow */}
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

      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '52px' }}>
        <div
          style={{
            width: '34px',
            height: '34px',
            background: '#00E57A',
            borderRadius: '8px',
            display: 'flex',
          }}
        />
        <span style={{ color: '#FFFFFF', fontSize: '22px', fontWeight: 700, letterSpacing: '-0.01em' }}>
          Beaconmon
        </span>
      </div>

      {/* Headline */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          color: '#FFFFFF',
          fontSize: '58px',
          fontWeight: 800,
          lineHeight: 1.08,
          letterSpacing: '-0.035em',
          maxWidth: '900px',
          marginBottom: '28px',
        }}
      >
        <span>Monitor your store and</span>
        <span style={{ color: '#00E57A' }}>competitors automatically.</span>
      </div>

      {/* Subheadline */}
      <div
        style={{
          color: '#7A7A8A',
          fontSize: '22px',
          lineHeight: 1.5,
          maxWidth: '740px',
          display: 'flex',
        }}
      >
        Outages, pricing changes, SSL expiry, and competitor updates before they hurt sales.
      </div>

      {/* Bottom bar */}
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
        <div style={{ height: '1px', background: '#1E1E2A', flex: 1, display: 'flex' }} />
        <span style={{ color: '#00E57A', fontSize: '13px', fontWeight: 600, letterSpacing: '0.1em' }}>
          BEACONMON.COM
        </span>
      </div>
    </div>,
    { width: 1200, height: 630 },
  );
}
