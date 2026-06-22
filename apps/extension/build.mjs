// Dependency-light MV3 build: esbuild bundles the three TS entry points
// (service worker, content detector, popup) and we copy the static shell
// (manifest, popup HTML/CSS) into dist/. No framework, no @crxjs — the surface
// is small enough that a hand-rolled build stays easier to reason about than a
// plugin we'd have to track across Chrome/Vite churn.
import * as esbuild from 'esbuild';
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const outdir = resolve(root, 'dist');
const watch = process.argv.includes('--watch');

const entryPoints = {
  // Keys become the output basenames; manifest.json references these paths.
  'service-worker': resolve(root, 'src/background/service-worker.ts'),
  'content/detect': resolve(root, 'src/content/detect.ts'),
  'popup/popup': resolve(root, 'src/popup/popup.ts'),
};

/** @type {import('esbuild').BuildOptions} */
const options = {
  entryPoints,
  outdir,
  bundle: true,
  format: 'esm',
  // Chrome 110+ is a safe MV3 floor; matches the target we test against.
  target: ['chrome110'],
  platform: 'browser',
  sourcemap: watch ? 'inline' : false,
  minify: !watch,
  logLevel: 'info',
};

async function copyStatic() {
  await cp(resolve(root, 'static'), outdir, { recursive: true });
}

// Strip localhost from externally_connectable so it never ships in a release build.
async function patchManifest() {
  const manifestPath = resolve(outdir, 'manifest.json');
  const raw = JSON.parse(await readFile(manifestPath, 'utf8'));
  if (raw.externally_connectable?.matches) {
    raw.externally_connectable.matches = raw.externally_connectable.matches.filter(
      (m) => !m.startsWith('http://localhost'),
    );
  }
  await writeFile(manifestPath, JSON.stringify(raw, null, 2) + '\n');
}

async function run() {
  await rm(outdir, { recursive: true, force: true });
  await mkdir(outdir, { recursive: true });

  if (watch) {
    const ctx = await esbuild.context(options);
    await ctx.watch();
    await copyStatic();
    console.log('[extension] watching for changes — load dist/ as an unpacked extension');
    return;
  }

  await esbuild.build(options);
  await copyStatic();
  await patchManifest();
  console.log('[extension] built to dist/');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
