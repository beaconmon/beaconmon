/**
 * Frame a raw product screenshot into a branded browser-window mockup.
 *
 * Reuses the same next/og (Satori) renderer as the marketing OG image, so the
 * background, green glow, and brand tokens stay in sync with the site.
 *
 * Usage:
 *   pnpm frame-screenshot --in shot.png --out framed.png
 *   pnpm frame-screenshot --in shot.png --out framed.png --url beaconmon.com/dashboard
 *
 * Flags:
 *   --in       Path to the source screenshot (PNG). Required.
 *   --out      Path to write the framed PNG. Required.
 *   --url      Address shown in the fake browser URL bar. Default: beaconmon.com
 *   --width    Canvas width in px.  Default: 1600
 *   --height   Canvas height in px. Default: 1000
 *   --preset   Sizing preset: "showcase" (1600x1000) | "producthunt" (1270x760).
 */

import { ImageResponse } from 'next/og';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Brand tokens. Keep in sync with apps/web/app/(marketing)/opengraph-image.tsx
const BRAND = {
  bg: '#0A0A0F',
  green: '#00E57A',
  muted: '#8C8C9D',
  border: '#2A2A3A',
  window: '#14141C',
  chrome: '#1C1C26',
  urlBar: '#0A0A0F',
} as const;

type Props = Record<string, unknown> & { style?: Record<string, unknown> };

// Hyperscript helper. Satori/next-og accept this {type, props} shape directly,
// so we avoid JSX entirely and run cleanly under root `tsx`.
function h(type: string, props: Props | null, ...children: unknown[]): unknown {
  return { type, props: { ...(props ?? {}), children: children.length <= 1 ? children[0] : children } };
}

function parseArgs(argv: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith('--')) {
        out[key] = next;
        i++;
      } else {
        out[key] = 'true';
      }
    }
  }
  return out;
}

// Read intrinsic PNG dimensions from the IHDR chunk (no image deps needed).
function pngSize(buf: Buffer): { width: number; height: number } {
  const sig = buf.subarray(0, 8).toString('hex');
  if (sig !== '89504e470d0a1a0a') {
    throw new Error('Input is not a PNG file. Capture screenshots as PNG.');
  }
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

const PRESETS: Record<string, { width: number; height: number }> = {
  showcase: { width: 1600, height: 1000 },
  producthunt: { width: 1270, height: 760 },
};

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!args.in || !args.out) {
    console.error('Required: --in <screenshot.png> --out <framed.png>');
    process.exit(1);
  }

  const preset = args.preset ? PRESETS[args.preset] : undefined;
  if (args.preset && !preset) {
    console.error(`Unknown preset "${args.preset}". Options: ${Object.keys(PRESETS).join(', ')}`);
    process.exit(1);
  }

  const canvasW = Number(args.width) || preset?.width || 1600;
  const canvasH = Number(args.height) || preset?.height || 1000;
  const urlText = args.url || 'beaconmon.com';

  const inPath = resolve(process.cwd(), args.in);
  const outPath = resolve(process.cwd(), args.out);

  const shot = readFileSync(inPath);
  const { width: srcW, height: srcH } = pngSize(shot);
  const dataUri = `data:image/png;base64,${shot.toString('base64')}`;

  // Layout math: fit the window (chrome bar + image) inside the canvas margins.
  const marginX = Math.round(canvasW * 0.075);
  const marginY = Math.round(canvasH * 0.08);
  const chromeBar = 44;

  const availW = canvasW - marginX * 2;
  const availH = canvasH - marginY * 2 - chromeBar;
  const scale = Math.min(availW / srcW, availH / srcH);
  const imgW = Math.round(srcW * scale);
  const imgH = Math.round(srcH * scale);

  const dot = (color: string) =>
    h('div', { style: { width: 12, height: 12, borderRadius: 6, background: color, display: 'flex' } });

  const tree = h(
    'div',
    {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: BRAND.bg,
        fontFamily: 'sans-serif',
        position: 'relative',
      },
    },
    // Green radial glow, same hue as the OG image.
    h('div', {
      style: {
        position: 'absolute',
        top: '-18%',
        right: '-8%',
        width: 700,
        height: 700,
        background: `radial-gradient(circle, rgba(0,229,122,0.12) 0%, transparent 65%)`,
        display: 'flex',
      },
    }),
    h('div', {
      style: {
        position: 'absolute',
        bottom: '-22%',
        left: '-10%',
        width: 600,
        height: 600,
        background: `radial-gradient(circle, rgba(0,229,122,0.06) 0%, transparent 65%)`,
        display: 'flex',
      },
    }),
    // The browser window.
    h(
      'div',
      {
        style: {
          display: 'flex',
          flexDirection: 'column',
          width: imgW,
          borderRadius: 14,
          overflow: 'hidden',
          border: `1px solid ${BRAND.border}`,
          boxShadow: '0 50px 120px rgba(0,0,0,0.6)',
          background: BRAND.window,
        },
      },
      // Chrome top bar.
      h(
        'div',
        {
          style: {
            display: 'flex',
            alignItems: 'center',
            height: chromeBar,
            paddingLeft: 18,
            paddingRight: 18,
            background: BRAND.chrome,
            borderBottom: `1px solid ${BRAND.border}`,
          },
        },
        h(
          'div',
          { style: { display: 'flex', alignItems: 'center', gap: 8 } },
          dot('#FF5F57'),
          dot('#FEBC2E'),
          dot('#28C840'),
        ),
        h(
          'div',
          {
            style: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              marginLeft: 16,
              marginRight: 72,
              height: 26,
              borderRadius: 7,
              background: BRAND.urlBar,
              border: `1px solid ${BRAND.border}`,
            },
          },
          h('div', {
            style: {
              width: 6,
              height: 6,
              borderRadius: 3,
              background: BRAND.green,
              marginRight: 8,
              display: 'flex',
            },
          }),
          h(
            'div',
            { style: { color: BRAND.muted, fontSize: 13, display: 'flex' } },
            urlText,
          ),
        ),
      ),
      // The screenshot.
      h('img', { src: dataUri, width: imgW, height: imgH, style: { display: 'flex' } }),
    ),
  );

  const response = new ImageResponse(tree as never, { width: canvasW, height: canvasH });
  const png = Buffer.from(await response.arrayBuffer());
  writeFileSync(outPath, png);

  console.log(`Framed ${srcW}x${srcH} screenshot -> ${canvasW}x${canvasH}`);
  console.log(`Wrote ${outPath} (${(png.length / 1024).toFixed(0)} KB)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
