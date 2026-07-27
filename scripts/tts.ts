/**
 * tts.ts — ElevenLabs Text-to-Speech for Remotion
 *
 * Generates narration audio via ElevenLabs and saves it to public/audio/
 * so Remotion compositions can load it with staticFile().
 *
 * Usage:
 *   npm run tts:landhar          # Landhar narration → public/audio/landhar-narration.mp3
 *   npm run tts:promo            # Promo narration  → public/audio/voiceover.mp3
 *   VOICE_ID=xxx npm run tts:landhar   # Override voice
 *
 * Required env:
 *   ELEVENLABS_API_KEY
 *
 * Voice options (Australian English):
 *   Charlie  IKne3meq5aSn9XLyUdCD — young Australian male, warm
 *   Callum   N2lVS1w4EtoT3dr4eOWO — Australian male, calm and assured
 *   Brian    nPczCjzI2devNBz1zQrb — deep, calm (US but works for editorial)
 *   George   JBFqnCBsd6RMkjVDRZzb — warm British, excellent for editorial
 */

import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';
import { buildVoiceInputSwarmConfig, logSwarmInit } from '../src/lib/ruflo';

// ── Ruflo swarm ──────────────────────────────────────────────────────────────
const { agents } = buildVoiceInputSwarmConfig('elevenlabs tts narration pipeline');
logSwarmInit(agents, 'elevenlabs-tts');

// ── Narration scripts ─────────────────────────────────────────────────────────
const SCRIPTS: Record<string, { text: string; filename: string; voiceId: string; outputBasePath?: string }> = {
  landhar: {
    voiceId: 'IKne3meq5aSn9XLyUdCD', // Charlie — Australian, calm, warm
    filename: 'landhar-narration.mp3',
    text: [
      'It begins with the work.',
      'Every commission is held to one uncompromising standard.',
      'Every detail considered. Every finish resolved.',
      'That commitment has always been there.',
      'Now, the standard comes into view.',
      'Landhar Homes.',
      'Custom homes, commissioned across Greater Sydney.',
    ].join('\n'),
  },
  promo: {
    voiceId: 'IKne3meq5aSn9XLyUdCD',
    filename: 'voiceover.mp3',
    text: 'Build faster. Ship production-ready websites in minutes with AI. No design skills needed.',
  },
  // Light Luxury Magazine — same script, same voice, slightly warmer delivery
  magazine: {
    voiceId: 'IKne3meq5aSn9XLyUdCD', // Charlie
    filename: 'landhar-magazine.mp3',
    text: [
      'It begins with the work.',
      'Every commission is held to one uncompromising standard.',
      'Every detail considered. Every finish resolved.',
      'That commitment has always been there.',
      'Now, the standard comes into view.',
      'Landhar Homes.',
      'Custom homes, commissioned across Greater Sydney.',
    ].join('\n'),
  },
  // Luxury Slow Burn — deeper, more intimate, higher stability
  slowburn: {
    voiceId: 'JBFqnCBsd6RMkjVDRZzb', // George — warm, calm, editorial gravitas
    filename: 'landhar-slowburn.mp3',
    text: [
      'It begins with the work.',
      'Every commission is held to one uncompromising standard.',
      'Every detail considered. Every finish resolved.',
      'That commitment has always been there.',
      'Now, the standard comes into view.',
      'Landhar Homes.',
      'Custom homes, commissioned across Greater Sydney.',
    ].join('\n'),
  },
  // ── v2 variants — with word-level timestamp extraction ──────────────────────
  'landhar-v2': {
    voiceId: 'IKne3meq5aSn9XLyUdCD', // Charlie — Australian, calm, warm
    filename: 'landhar-v2.mp3',
    outputBasePath: 'public/audio/landhar-v2',
    text: [
      'It begins with the work.',
      'Every commission is held to one uncompromising standard.',
      'Every detail considered. Every finish resolved.',
      'That commitment has always been there.',
      'Now, the standard comes into view.',
      'Landhar Homes.',
      'Custom homes, commissioned across Greater Sydney.',
    ].join('\n'),
  },
  'magazine-v2': {
    voiceId: 'IKne3meq5aSn9XLyUdCD', // Charlie
    filename: 'magazine-v2.mp3',
    outputBasePath: 'public/audio/magazine-v2',
    text: [
      'It begins with the work.',
      'Every commission is held to one uncompromising standard.',
      'Every detail considered. Every finish resolved.',
      'That commitment has always been there.',
      'Now, the standard comes into view.',
      'Landhar Homes.',
      'Custom homes, commissioned across Greater Sydney.',
    ].join('\n'),
  },
  'slowburn-v2': {
    voiceId: 'JBFqnCBsd6RMkjVDRZzb', // George — warm British, editorial gravitas
    filename: 'slowburn-v2.mp3',
    outputBasePath: 'public/audio/slowburn-v2',
    text: [
      'It begins with the work.',
      'Every commission is held to one uncompromising standard.',
      'Every detail considered. Every finish resolved.',
      'That commitment has always been there.',
      'Now, the standard comes into view.',
      'Landhar Homes.',
      'Custom homes, commissioned across Greater Sydney.',
    ].join('\n'),
  },
};

// ── ElevenLabs TTS ────────────────────────────────────────────────────────────
async function generateTTS(
  text: string,
  voiceId: string,
  outputPath: string,
): Promise<void> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error('ELEVENLABS_API_KEY not set in .env');

  console.log(`[tts-generator] Calling ElevenLabs (voice: ${voiceId})...`);
  console.log(`[tts-generator] Text preview: "${text.slice(0, 80)}..."`);

  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability:        0.75, // consistent, not too robotic
          similarity_boost: 0.75, // faithful to voice character
          style:            0.0,  // no style exaggeration — pure documentary
          use_speaker_boost: true,
        },
      }),
    },
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`ElevenLabs error ${res.status}: ${err}`);
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, buffer);
}

// ── ElevenLabs TTS with Word-Level Timestamps ─────────────────────────────────
interface ElevenLabsAlignment {
  characters: string[];
  character_start_times_seconds: number[];
  character_end_times_seconds: number[];
}

interface TimestampWord {
  word: string;
  startSec: number;
  endSec: number;
  startFrame: number;
  endFrame: number;
}

interface TimestampFile {
  duration: number;
  durationFrames: number;
  words: TimestampWord[];
}

const FPS = 30;

/**
 * Build word-level timestamps by joining character-level alignment data.
 * Splits on spaces; each run of non-space characters is a word.
 */
function buildWordTimestamps(alignment: ElevenLabsAlignment): TimestampWord[] {
  const { characters, character_start_times_seconds, character_end_times_seconds } = alignment;
  const words: TimestampWord[] = [];

  let wordChars: string[] = [];
  let wordStart: number | null = null;
  let wordEnd: number = 0;

  for (let i = 0; i < characters.length; i++) {
    const ch = characters[i];
    const startSec = character_start_times_seconds[i];
    const endSec   = character_end_times_seconds[i];

    if (ch === ' ' || ch === '\n') {
      // Flush current word
      if (wordChars.length > 0 && wordStart !== null) {
        words.push({
          word:       wordChars.join(''),
          startSec:   wordStart,
          endSec:     wordEnd,
          startFrame: Math.round(wordStart * FPS),
          endFrame:   Math.round(wordEnd   * FPS),
        });
        wordChars = [];
        wordStart = null;
      }
    } else {
      if (wordStart === null) wordStart = startSec;
      wordChars.push(ch);
      wordEnd = endSec;
    }
  }

  // Flush final word
  if (wordChars.length > 0 && wordStart !== null) {
    words.push({
      word:       wordChars.join(''),
      startSec:   wordStart,
      endSec:     wordEnd,
      startFrame: Math.round(wordStart * FPS),
      endFrame:   Math.round(wordEnd   * FPS),
    });
  }

  return words;
}

/**
 * Generate TTS with word-level timestamps via ElevenLabs.
 * Saves {outputBasePath}.mp3 and {outputBasePath}.timestamps.json.
 */
async function generateTTSWithTimestamps(
  text: string,
  voiceId: string,
  outputBasePath: string,
): Promise<{ wordCount: number; duration: number }> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error('ELEVENLABS_API_KEY not set in .env');

  const absBase = path.isAbsolute(outputBasePath)
    ? outputBasePath
    : path.join(process.cwd(), outputBasePath);

  console.log(`[tts-generator] Calling ElevenLabs with timestamps (voice: ${voiceId})...`);
  console.log(`[tts-generator] Text preview: "${text.slice(0, 80)}..."`);

  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        with_timestamps: true,
        voice_settings: {
          stability:         0.75,
          similarity_boost:  0.75,
          style:             0.0,
          use_speaker_boost: true,
        },
      }),
    },
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`ElevenLabs timestamps error ${res.status}: ${err}`);
  }

  const json = await res.json() as {
    audio_base64: string;
    alignment: ElevenLabsAlignment;
  };

  // 1. Save MP3
  const mp3Path = `${absBase}.mp3`;
  fs.mkdirSync(path.dirname(mp3Path), { recursive: true });
  const audioBuffer = Buffer.from(json.audio_base64, 'base64');
  fs.writeFileSync(mp3Path, audioBuffer);
  console.log(`[tts-generator] ✓ Audio saved: ${mp3Path} (${(audioBuffer.length / 1024).toFixed(0)} KB)`);

  // 2. Build word timestamps
  const words = buildWordTimestamps(json.alignment);
  const duration = words.length > 0 ? words[words.length - 1].endSec : 0;
  const durationFrames = Math.round(duration * FPS);

  const timestampData: TimestampFile = { duration, durationFrames, words };

  // 3. Save timestamps JSON
  const tsPath = `${absBase}.timestamps.json`;
  fs.writeFileSync(tsPath, JSON.stringify(timestampData, null, 2));
  console.log(`[tts-generator] ✓ Timestamps saved: ${tsPath} (${words.length} words, ${duration.toFixed(2)}s)`);

  return { wordCount: words.length, duration };
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  const target = process.argv[2] ?? 'landhar';
  const script = SCRIPTS[target];

  if (!script) {
    console.error(`Unknown target "${target}". Available: ${Object.keys(SCRIPTS).join(', ')}`);
    process.exit(1);
  }

  // Allow voice override via env
  const voiceId = process.env.VOICE_ID ?? script.voiceId;

  console.log('\n[Ruflo tts-generator] Generating narration...');
  console.log(`  Target : ${target}`);
  console.log(`  Voice  : ${voiceId}`);

  try {
    // v2 targets use the timestamps endpoint
    if (script.outputBasePath) {
      const basePath = path.join(process.cwd(), script.outputBasePath);
      console.log(`  Output : ${script.outputBasePath}.mp3 + .timestamps.json\n`);

      const { wordCount, duration } = await generateTTSWithTimestamps(
        script.text,
        voiceId,
        basePath,
      );

      console.log(`\n[timing-validator] ✓ Audio + timestamps generated:`);
      console.log(`  File     : ${script.outputBasePath}.mp3`);
      console.log(`  Stamps   : ${script.outputBasePath}.timestamps.json`);
      console.log(`  Words    : ${wordCount}`);
      console.log(`  Duration : ${duration.toFixed(2)}s\n`);
    } else {
      // Legacy targets — plain MP3 only
      const outPath = path.join(process.cwd(), 'public', 'audio', script.filename);
      console.log(`  Output : public/audio/${script.filename}\n`);

      await generateTTS(script.text, voiceId, outPath);

      const size = (fs.statSync(outPath).size / 1024).toFixed(0);
      console.log(`\n[timing-validator] ✓ Audio generated:`);
      console.log(`  File  : public/audio/${script.filename}`);
      console.log(`  Size  : ${size} KB`);
      console.log(`\n[timing-validator] Next steps:`);

      if (target === 'landhar') {
        console.log('  1. Open src/compositions/LandharLaunchTeaser.tsx');
        console.log("  2. Find the Audio comment near the bottom and uncomment:");
        console.log("     <Audio src={staticFile('audio/landhar-narration.mp3')} startFrom={10} />");
        console.log('  3. Remotion Studio hot-reloads and plays the narration.\n');
      } else {
        console.log(`  Remotion Studio hot-reloads. Open ${target} composition and press Play.\n`);
      }
    }
  } catch (err) {
    console.error('\n[tts-generator] Error:', (err as Error).message);
    process.exit(1);
  }
}

main();
