/**
 * sound-design.ts — ElevenLabs Sound Effects for Landhar Homes
 *
 * Generates two ambient audio layers via the ElevenLabs sound generation API:
 *   1. public/audio/ambient.mp3  — subtle interior architecture ambience
 *   2. public/audio/tone.mp3     — deep cinematic drone / sustained note
 *
 * Usage:
 *   npm run sound
 *   npx tsx scripts/sound-design.ts
 *
 * Required env:
 *   ELEVENLABS_API_KEY
 */

import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';

const AUDIO_DIR = path.join(process.cwd(), 'public', 'audio');

interface SoundLayer {
  name: string;
  outputFile: string;
  prompt: string;
  duration_seconds: number;
  prompt_influence: number;
}

const LAYERS: SoundLayer[] = [
  {
    name: 'Ambient Architecture',
    outputFile: 'ambient.mp3',
    prompt:
      'Subtle interior ambience, luxury home, distant birds outside, gentle ventilation hum, very quiet, premium architectural feel, 27 seconds',
    duration_seconds: 27,
    prompt_influence: 0.3,
  },
  {
    name: 'Cinematic Tone',
    outputFile: 'tone.mp3',
    prompt:
      'Deep low cinematic drone, single sustained note, warm, architectural, premium real estate, very subtle, 27 seconds',
    duration_seconds: 27,
    prompt_influence: 0.5,
  },
];

async function generateSoundEffect(layer: SoundLayer): Promise<void> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error('ELEVENLABS_API_KEY not set in .env');

  console.log(`\n[sound-design] Generating: ${layer.name}`);
  console.log(`  Prompt    : "${layer.prompt.slice(0, 80)}..."`);
  console.log(`  Duration  : ${layer.duration_seconds}s`);
  console.log(`  Influence : ${layer.prompt_influence}`);

  const res = await fetch('https://api.elevenlabs.io/v1/sound-generation', {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg',
    },
    body: JSON.stringify({
      text: layer.prompt,
      duration_seconds: layer.duration_seconds,
      prompt_influence: layer.prompt_influence,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`ElevenLabs sound-generation error ${res.status}: ${err}`);
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  fs.mkdirSync(AUDIO_DIR, { recursive: true });

  const outPath = path.join(AUDIO_DIR, layer.outputFile);
  fs.writeFileSync(outPath, buffer);

  const sizeKB = (buffer.length / 1024).toFixed(0);
  console.log(`  ✓ Saved   : public/audio/${layer.outputFile} (${sizeKB} KB)`);
}

async function main(): Promise<void> {
  console.log('[Ruflo sound-design] Generating Landhar ambient sound layers...\n');

  for (const layer of LAYERS) {
    await generateSoundEffect(layer);
  }

  console.log('\n[sound-design] ✓ All layers generated.');
  console.log('  public/audio/ambient.mp3  — mix at volume 0.12');
  console.log('  public/audio/tone.mp3     — mix at volume 0.06');
  console.log('\n  Add to LandharLaunchTeaser.tsx:');
  console.log("    <Audio src={staticFile('audio/ambient.mp3')} volume={0.12} />");
  console.log("    <Audio src={staticFile('audio/tone.mp3')} volume={0.06} />\n");
}

main().catch((err) => {
  console.error('[sound-design] Error:', (err as Error).message);
  process.exit(1);
});
