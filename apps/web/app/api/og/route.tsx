import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

const MONITORS = [
  { label: 'beaconmon.com', time: '42ms', up: true },
  { label: 'api.acme.com', time: '118ms', up: true },
  { label: 'checkout.store.io', time: '—', up: false },
  { label: 'ssl.example.com', time: '89ms', up: true },
];

export async function GET(_req: NextRequest) {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          backgroundColor: '#0A0A0F',
          padding: '64px 72px',
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Left column */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            paddingRight: '60px',
          }}
        >
          {/* Logo + wordmark */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              marginBottom: '52px',
            }}
          >
            <svg
              width="44"
              height="44"
              viewBox="0 0 32 32"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="32" height="32" rx="7" fill="#0f172a" />
              <path
                d="M4 22a12 12 0 0 0 24 0"
                fill="none"
                stroke="#06b6d4"
                stroke-width="2"
                stroke-linecap="round"
                opacity="0.28"
              />
              <path
                d="M8 22a8 8 0 0 0 16 0"
                fill="none"
                stroke="#06b6d4"
                stroke-width="2.2"
                stroke-linecap="round"
                opacity="0.62"
              />
              <path
                d="M12 22a4 4 0 0 0 8 0"
                fill="none"
                stroke="#06b6d4"
                stroke-width="2.5"
                stroke-linecap="round"
              />
              <circle cx="16" cy="22" r="2.5" fill="#06b6d4" />
            </svg>
            <span
              style={{
                color: '#ECECF1',
                fontSize: '30px',
                fontWeight: 700,
                letterSpacing: '-0.5px',
              }}
            >
              Beaconmon
            </span>
          </div>

          {/* Headline */}
          <div
            style={{
              color: '#ECECF1',
              fontSize: '62px',
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: '-2px',
              maxWidth: '580px',
            }}
          >
            Know the second your site goes down.
          </div>

          {/* Subtitle */}
          <div
            style={{
              color: '#9A9AA8',
              fontSize: '26px',
              fontWeight: 400,
              marginTop: '24px',
              lineHeight: 1.4,
            }}
          >
            Uptime monitoring for freelancers &amp; agencies.
          </div>

          {/* Tags */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              marginTop: 'auto',
              paddingTop: '40px',
            }}
          >
            {(['30s checks', 'Email & Slack alerts', 'Status pages'] as const).map((tag) => (
              <div
                key={tag}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#111118',
                  border: '1px solid #222230',
                  borderRadius: '8px',
                  padding: '8px 18px',
                  color: '#00E57A',
                  fontSize: '18px',
                  fontWeight: 600,
                }}
              >
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#00E57A',
                  }}
                />
                {tag}
              </div>
            ))}
          </div>
        </div>

        {/* Right panel — monitor status widget */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '340px',
            backgroundColor: '#111118',
            border: '1px solid #222230',
            borderRadius: '16px',
            padding: '28px',
          }}
        >
          {/* Widget header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
            }}
          >
            <span style={{ color: '#9A9AA8', fontSize: '14px', fontWeight: 500 }}>
              Monitors
            </span>
            <span
              style={{
                backgroundColor: '#00E57A20',
                color: '#00E57A',
                fontSize: '12px',
                fontWeight: 700,
                borderRadius: '6px',
                padding: '3px 10px',
                letterSpacing: '0.5px',
              }}
            >
              3 UP · 1 DOWN
            </span>
          </div>

          {/* Monitor rows */}
          {MONITORS.map((m, i) => (
            <div
              key={m.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 0',
                borderTop: i === 0 ? 'none' : '1px solid #222230',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '9px',
                    height: '9px',
                    borderRadius: '50%',
                    backgroundColor: m.up ? '#00E57A' : '#FF4444',
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    color: '#ECECF1',
                    fontSize: '15px',
                    fontWeight: 500,
                  }}
                >
                  {m.label}
                </span>
              </div>
              <span
                style={{
                  color: m.up ? '#9A9AA8' : '#FF4444',
                  fontSize: '14px',
                  fontWeight: m.up ? 400 : 600,
                  fontFamily: 'monospace',
                }}
              >
                {m.up ? m.time : 'DOWN'}
              </span>
            </div>
          ))}

          {/* Uptime bar */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              marginTop: '20px',
              gap: '8px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ color: '#9A9AA8', fontSize: '12px' }}>90-day uptime</span>
              <span style={{ color: '#00E57A', fontSize: '12px', fontWeight: 600 }}>
                99.97%
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                height: '6px',
                borderRadius: '3px',
                backgroundColor: '#222230',
              }}
            >
              <div
                style={{
                  width: '99.97%',
                  backgroundColor: '#00E57A',
                  borderRadius: '3px',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
