#!/usr/bin/env bash
#
# Build a crossfade slideshow demo (MP4 + GIF) from framed showcase images.
#
# Pairs with apps/web/scripts/frame-screenshot.ts: frame the screens first,
# then stitch them into a looping product demo for directory listings.
#
# Usage:
#   bash scripts/make-demo.sh                       # uses the default showcase order
#   bash scripts/make-demo.sh img1.png img2.png ... # custom order
#
# Env overrides:
#   HOLD=2.5   seconds each frame is held
#   FADE=0.6   seconds of crossfade between frames
#   FPS=30     output frame rate (MP4)
#   GIF_FPS=15 GIF frame rate (lower = smaller file)
#   GIF_W=1100 GIF width in px (height auto)
#   OUT=showcase/demo   output path prefix (.mp4 / .gif appended)
set -euo pipefail

HOLD=${HOLD:-2.5}
FADE=${FADE:-0.6}
FPS=${FPS:-30}
GIF_FPS=${GIF_FPS:-15}
GIF_W=${GIF_W:-1100}
OUT=${OUT:-showcase/demo}

if [ "$#" -gt 0 ]; then
  IMAGES=("$@")
else
  IMAGES=(
    showcase/wire-framed.png
    showcase/products-framed.png
    showcase/competitor-framed.png
    showcase/today-framed.png
    showcase/monitors-framed.png
  )
fi

N=${#IMAGES[@]}
if [ "$N" -lt 2 ]; then
  echo "Need at least 2 images to build a demo." >&2
  exit 1
fi

for img in "${IMAGES[@]}"; do
  [ -f "$img" ] || { echo "Missing image: $img" >&2; exit 1; }
done

# One looped still per image, each $HOLD seconds long.
inputs=()
for img in "${IMAGES[@]}"; do
  inputs+=(-loop 1 -t "$HOLD" -i "$img")
done

# Chain xfade transitions. Transition k starts at k*(HOLD-FADE).
# All framed images share dimensions, so no pre-scaling is needed here.
filter=""
prev="0"
for ((k = 1; k < N; k++)); do
  offset=$(awk -v k="$k" -v h="$HOLD" -v f="$FADE" 'BEGIN { printf "%.3f", k * (h - f) }')
  label="x$k"
  filter+="[$prev][$k]xfade=transition=fade:duration=$FADE:offset=$offset[$label];"
  prev="$label"
done
# Finalize: pad frame rate + web-safe pixel format.
filter+="[$prev]fps=$FPS,format=yuv420p[v]"

mkdir -p "$(dirname "$OUT")"

echo "Building MP4 ($N frames, ${HOLD}s hold, ${FADE}s fade)..."
ffmpeg -y -hide_banner -loglevel error \
  "${inputs[@]}" \
  -filter_complex "$filter" -map "[v]" \
  -c:v libx264 -preset slow -crf 20 -movflags +faststart \
  "$OUT.mp4"

echo "Building GIF (palette-optimized, ${GIF_FPS}fps, ${GIF_W}px wide)..."
palette="$(mktemp -t demo-palette-XXXX).png"
ffmpeg -y -hide_banner -loglevel error -i "$OUT.mp4" \
  -vf "fps=$GIF_FPS,scale=$GIF_W:-1:flags=lanczos,palettegen=stats_mode=diff" \
  "$palette"
ffmpeg -y -hide_banner -loglevel error -i "$OUT.mp4" -i "$palette" \
  -lavfi "fps=$GIF_FPS,scale=$GIF_W:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=3" \
  "$OUT.gif"
rm -f "$palette"

mp4_size=$(du -h "$OUT.mp4" | cut -f1)
gif_size=$(du -h "$OUT.gif" | cut -f1)
total=$(awk -v h="$HOLD" -v f="$FADE" -v n="$N" 'BEGIN { printf "%.1f", n * h - (n - 1) * f }')
echo "Done. ${total}s loop."
echo "  $OUT.mp4 ($mp4_size)"
echo "  $OUT.gif ($gif_size)"
