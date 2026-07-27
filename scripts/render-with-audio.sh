#!/bin/bash
# render-with-audio.sh — Full render pipeline for macOS 13
# Renders video muted then merges all audio layers via system ffmpeg
#
# Usage: npm run render:landhar-full
#        COMPOSITION=LandharMagazine npm run render:landhar-full

set -e

COMPOSITION="${COMPOSITION:-LandharLaunchTeaser}"
FFMPEG="/Users/macbookpro/.local/bin/ffmpeg"
OUT_DIR="out"
AUDIO_DIR="public/audio"

mkdir -p "$OUT_DIR"

echo "▶ Rendering $COMPOSITION (video only)..."
npx remotion render src/index.ts "$COMPOSITION" \
  --output "$OUT_DIR/${COMPOSITION}-no-audio.mp4" \
  --muted

echo "▶ Merging audio layers..."
"$FFMPEG" -y \
  -i "$OUT_DIR/${COMPOSITION}-no-audio.mp4" \
  -i "$AUDIO_DIR/ambient.mp3" \
  -i "$AUDIO_DIR/tone.mp3" \
  -i "$AUDIO_DIR/landhar-v2.mp3" \
  -filter_complex "
    [1:a]volume=0.12[a1];
    [2:a]volume=0.06[a2];
    [3:a]adelay=333|333,volume=0.9[a3];
    [a1][a2][a3]amix=inputs=3:duration=first:dropout_transition=2[aout]
  " \
  -map 0:v -map "[aout]" \
  -c:v copy -c:a aac -b:a 192k \
  "$OUT_DIR/${COMPOSITION}.mp4"

rm -f "$OUT_DIR/${COMPOSITION}-no-audio.mp4"

SIZE=$(du -sh "$OUT_DIR/${COMPOSITION}.mp4" | cut -f1)
echo "✓ Done: out/${COMPOSITION}.mp4 ($SIZE)"
open "$OUT_DIR/${COMPOSITION}.mp4"
