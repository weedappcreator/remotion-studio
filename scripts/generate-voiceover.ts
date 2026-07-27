/**
 * CLI script to pre-generate voiceover audio before rendering.
 *
 * Run:
 *   npm run voiceover
 *   # or with custom text:
 *   VOICEOVER_TEXT="Your custom script" npm run voiceover
 *
 * Outputs:
 *   public/audio/voiceover.wav        — main promo voiceover
 *   public/audio/voiceover.json       — word timestamps for animation sync
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { generateVoiceover } from '../src/lib/voiceover';

const SCRIPTS: Record<string, string> = {
  promo: process.env.VOICEOVER_TEXT ??
    'Build faster. Ship production-ready websites in minutes with AI. No design skills needed.',
  logo:
    'Your brand. Elevated.',
  kinetic:
    'Make it unforgettable. Make it yours.',
};

async function main() {
  const target = process.argv[2] ?? 'promo';
  const text = SCRIPTS[target];

  if (!text) {
    console.error(`Unknown target "${target}". Available: ${Object.keys(SCRIPTS).join(', ')}`);
    process.exit(1);
  }

  try {
    const result = await generateVoiceover(text, target);

    // Save timestamps JSON for the composition to import
    const jsonPath = path.join(process.cwd(), 'public', 'audio', `${target}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2));

    console.log('\n✓ Voiceover generated:');
    console.log(`  Audio:      public/audio/${target}.wav`);
    console.log(`  Timestamps: public/audio/${target}.json`);
    console.log(`  Duration:   ${result.durationSecs.toFixed(2)}s → ${result.durationFrames} frames @ 30fps`);
    console.log(`  Words:      ${result.wordTimestamps.length}`);
    console.log('\nSet this in your Composition:');
    console.log(`  durationInFrames={${result.durationFrames}}`);
  } catch (err) {
    console.error('\n✗ Failed:', (err as Error).message);
    console.error('\nMake sure you have set:');
    console.error('  RESEMBLE_API_KEY=...');
    console.error('  RESEMBLE_PROJECT_UUID=...');
    console.error('  RESEMBLE_VOICE_UUID=...');
    process.exit(1);
  }
}

main();
