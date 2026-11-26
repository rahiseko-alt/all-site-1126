#!/bin/bash
# mp4-to-gif.sh — 2パスパレット生成で高品質GIF変換
# Usage: bash scripts/mp4-to-gif.sh <input.mp4> [fps=15] [width=480]

set -e

INPUT="$1"
FPS="${2:-15}"
WIDTH="${3:-480}"

if [ -z "$INPUT" ]; then
  echo "Usage: bash scripts/mp4-to-gif.sh <input.mp4> [fps] [width]"
  exit 1
fi

if [ ! -f "$INPUT" ]; then
  echo "Error: $INPUT not found"
  exit 1
fi

OUTPUT="${INPUT%.*}.gif"
PALETTE=$(mktemp /tmp/palette-XXXXXX.png)
FILTERS="fps=${FPS},scale=${WIDTH}:-1:flags=lanczos"

echo "=== mp4-to-gif ==="
echo "Input:  $INPUT"
echo "Output: $OUTPUT"
echo "FPS:    $FPS"
echo "Width:  $WIDTH"

# Pass 1: パレット生成
echo "[1/2] Generating palette..."
ffmpeg -y -i "$INPUT" -vf "${FILTERS},palettegen=stats_mode=diff" "$PALETTE" 2>/dev/null

# Pass 2: GIF生成（パレット適用）
echo "[2/2] Generating GIF..."
ffmpeg -y -i "$INPUT" -i "$PALETTE" -lavfi "${FILTERS} [x]; [x][1:v] paletteuse=dither=floyd_steinberg" "$OUTPUT" 2>/dev/null

rm -f "$PALETTE"

SIZE=$(du -h "$OUTPUT" | cut -f1)
echo "Done: $OUTPUT ($SIZE)"
