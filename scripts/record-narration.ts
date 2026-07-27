/**
 * record-narration.ts — capture your voice as the video narration
 *
 * Works alongside OpenLess:
 *   - OpenLess hotkey → speaks → text goes to OpenRouter → script.json
 *   - This script → records the same speech → public/audio/*.wav → <Audio> in Remotion
 *
 * Usage:
 *   npm run record              # records → public/audio/voiceover.wav
 *   npm run record:landhar      # records → public/audio/landhar-narration.wav
 *
 * Requires: ffmpeg (already installed at /Users/macbookpro/.local/bin/ffmpeg)
 * Records from: default macOS microphone (input device :0)
 *
 * Workflow:
 *   1. Run this script in one terminal
 *   2. Hold your OpenLess hotkey
 *   3. Speak the narration
 *   4. Release hotkey
 *   5. Press Enter here to stop recording
 *   6. Audio saved → Remotion Studio hot-reloads and plays it
 */

import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as readline from 'readline';
import 'dotenv/config';

// ── Scripts to display as teleprompter ───────────────────────────────────────
const SCRIPTS: Record<string, { lines: string[]; filename: string }> = {
  voiceover: {
    filename: 'voiceover.wav',
    lines: [
      'Build faster.',
      'Ship production-ready websites in minutes with AI.',
      'No design skills needed.',
    ],
  },
  landhar: {
    filename: 'landhar-narration.wav',
    lines: [
      'It begins with the work.',
      'Every commission is held to one uncompromising standard.',
      'Every detail considered. Every finish resolved.',
      'That commitment has always been there.',
      'Now, the standard comes into view.',
      'Landhar Homes.',
      'Custom homes, commissioned across Greater Sydney.',
    ],
  },
};

// ── Args ─────────────────────────────────────────────────────────────────────
const target = process.argv[2] ?? 'voiceover';
const script = SCRIPTS[target];

if (!script) {
  console.error(`Unknown target "${target}". Available: ${Object.keys(SCRIPTS).join(', ')}`);
  process.exit(1);
}

const FFMPEG    = '/Users/macbookpro/.local/bin/ffmpeg';
const OUT_DIR   = path.join(process.cwd(), 'public', 'audio');
const OUT_FILE  = path.join(OUT_DIR, script.filename);
const TEMP_FILE = path.join(OUT_DIR, `_tmp_${script.filename}`);

// ── Teleprompter display ──────────────────────────────────────────────────────
function printScript(): void {
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║              NARRATION SCRIPT                        ║');
  console.log('╠══════════════════════════════════════════════════════╣');
  script.lines.forEach((line, i) => {
    console.log(`║  ${String(i + 1).padStart(2)}.  ${line.padEnd(47)}║`);
  });
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log('\nPace: calm, assured — ~90 words per minute');
  console.log('Leave a short pause between each line.\n');
}

// ── Countdown ────────────────────────────────────────────────────────────────
async function countdown(seconds: number): Promise<void> {
  for (let i = seconds; i > 0; i--) {
    process.stdout.write(`\r[Ruflo tts-generator] Recording in ${i}...`);
    await new Promise(r => setTimeout(r, 1000));
  }
  process.stdout.write('\r[Ruflo tts-generator] 🎙  RECORDING — press Enter to stop\n\n');
}

// ── Record ───────────────────────────────────────────────────────────────────
async function record(): Promise<void> {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  printScript();
  await countdown(3);

  // Start ffmpeg recording from default macOS mic
  // -f avfoundation: macOS audio capture
  // ":0" = default input device (microphone)
  // -ar 44100: 44.1kHz sample rate (Remotion standard)
  // -ac 1: mono (voice)
  // -acodec pcm_s16le: uncompressed WAV
  const ffmpegArgs = [
    '-y',                    // overwrite without asking
    '-f', 'avfoundation',
    '-i', ':0',              // default mic input
    '-ar', '44100',          // sample rate
    '-ac', '1',              // mono
    '-acodec', 'pcm_s16le',  // uncompressed PCM
    TEMP_FILE,
  ];

  const proc = spawn(FFMPEG, ffmpegArgs, {
    stdio: ['ignore', 'ignore', 'pipe'], // suppress ffmpeg output
  });

  // Wait for Enter to stop recording
  const rl = readline.createInterface({ input: process.stdin });
  await new Promise<void>((resolve) => {
    rl.once('line', () => {
      rl.close();
      resolve();
    });
  });

  // Kill ffmpeg gracefully (SIGINT lets it finalize the WAV header)
  proc.kill('SIGINT');

  // Give ffmpeg 500ms to flush
  await new Promise(r => setTimeout(r, 500));

  // Rename temp to final
  if (fs.existsSync(TEMP_FILE)) {
    fs.renameSync(TEMP_FILE, OUT_FILE);
  }

  // Check output
  if (!fs.existsSync(OUT_FILE)) {
    console.error('\n[tts-generator] Recording failed — no output file.');
    console.error('Make sure your microphone is enabled for Terminal in System Settings → Privacy → Microphone.');
    process.exit(1);
  }

  const stats    = fs.statSync(OUT_FILE);
  const sizeMB   = (stats.size / 1024 / 1024).toFixed(2);
  const durationEst = ((stats.size - 44) / (44100 * 2)).toFixed(1); // PCM 16-bit mono estimate

  console.log('\n[tts-generator] ✓ Narration recorded:');
  console.log(`  File     : public/audio/${script.filename}`);
  console.log(`  Size     : ${sizeMB} MB`);
  console.log(`  Duration : ~${durationEst}s`);
  console.log('\n[timing-validator] Remotion Studio will hot-reload and play the audio.');
  console.log(`  Verify in Studio → select composition → press Play.\n`);
}

record().catch(err => {
  console.error('[record-narration] Fatal:', err.message);
  process.exit(1);
});
