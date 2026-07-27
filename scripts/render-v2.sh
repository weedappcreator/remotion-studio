#!/bin/bash
# render-v2.sh — LandharPremiumV2 full render pipeline (macOS 13)
# Renders 784 frames muted → merges 7 ElevenLabs voiceover tracks via system ffmpeg

set -e

COMPOSITION="LandharPremiumV2"
FFMPEG="/Users/macbookpro/.local/bin/ffmpeg"
AUDIO="public/voiceover/landhar-premium-v2"
OUT="out"

mkdir -p "$OUT"

echo "▶ [Ruflo render-optimizer] Rendering $COMPOSITION — 784 frames, muted..."
npx remotion render src/index.ts "$COMPOSITION" \
  --output "$OUT/${COMPOSITION}-no-audio.mp4" \
  --muted

echo "▶ [Ruflo voiceover-sync] Merging 7 ElevenLabs narration tracks..."
# Audio start times: sequence_start + 10 frames, converted to ms
# Card 1:  frame   0+10 =   10f = 333ms   "The work comes first."
# Card 2:  frame  90+10 =  100f = 3333ms  "Every commission, held to one uncompromising standard."
# Card 3:  frame 210+10 =  220f = 7333ms  "Every detail considered. Every finish resolved."
# Card 4:  frame 330+10 =  340f = 11333ms "That has never changed."
# Card 5:  frame 450+10 =  460f = 15333ms "Now, the standard comes into view."
# Card 6:  frame 570+10 =  580f = 19333ms "Landhar Homes."
# Card 7:  frame 660+10 =  670f = 22333ms "Custom homes, commissioned across Greater Sydney."

"$FFMPEG" -y \
  -i "$OUT/${COMPOSITION}-no-audio.mp4" \
  -i "$AUDIO/01-work.mp3" \
  -i "$AUDIO/02-standard.mp3" \
  -i "$AUDIO/03-detail.mp3" \
  -i "$AUDIO/04-constant.mp3" \
  -i "$AUDIO/05-view.mp3" \
  -i "$AUDIO/06-brand.mp3" \
  -i "$AUDIO/07-location.mp3" \
  -filter_complex "
    [1:a]adelay=333|333[a1];
    [2:a]adelay=3333|3333[a2];
    [3:a]adelay=7333|7333[a3];
    [4:a]adelay=11333|11333[a4];
    [5:a]adelay=15333|15333[a5];
    [6:a]adelay=19333|19333[a6];
    [7:a]adelay=22333|22333[a7];
    [a1][a2][a3][a4][a5][a6][a7]amix=inputs=7:duration=first:dropout_transition=0[aout]
  " \
  -map 0:v -map "[aout]" \
  -c:v copy -c:a aac -b:a 192k \
  "$OUT/${COMPOSITION}.mp4"

rm -f "$OUT/${COMPOSITION}-no-audio.mp4"

SIZE=$(du -sh "$OUT/${COMPOSITION}.mp4" | cut -f1)
echo ""
echo "✓ Done: out/${COMPOSITION}.mp4 ($SIZE)"
echo "  Duration: ~26s · 1080×1920 · 30fps · 7-track narration"
open "$OUT/${COMPOSITION}.mp4"
