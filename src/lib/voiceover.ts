/**
 * Resemble AI Voiceover — Remotion Integration
 *
 * Generates voiceover audio via Resemble AI and writes it to the public/audio/
 * directory so Remotion can load it with staticFile().
 *
 * Usage:
 *   npx tsx scripts/generate-voiceover.ts
 *
 * Required env vars:
 *   RESEMBLE_API_KEY       — from app.resemble.ai → API
 *   RESEMBLE_PROJECT_UUID  — your project UUID
 *   RESEMBLE_VOICE_UUID    — your voice UUID
 *
 * The DirectClip API returns:
 *   - audio_content: base64-encoded WAV
 *   - audio_timestamps.graph_times: [[start, end], ...] seconds per character
 *   - duration: total duration in seconds
 */

import { Resemble } from '@resemble/node';
import fs from 'fs';
import path from 'path';

export interface WordTimestamp {
  word: string;
  start: number; // seconds
  end: number;   // seconds
}

export interface VoiceoverResult {
  audioPath: string;       // relative path for staticFile()
  durationSecs: number;
  durationFrames: number;  // at 30fps
  wordTimestamps: WordTimestamp[];
}

/**
 * Generate a voiceover audio file and return timing data for animation sync.
 *
 * @param text     - The script to synthesize
 * @param filename - Output filename (no extension), saved to public/audio/
 * @param fps      - Composition fps (default 30)
 */
export async function generateVoiceover(
  text: string,
  filename: string = 'voiceover',
  fps: number = 30,
): Promise<VoiceoverResult> {
  const apiKey = process.env.RESEMBLE_API_KEY;
  const projectUuid = process.env.RESEMBLE_PROJECT_UUID;
  const voiceUuid = process.env.RESEMBLE_VOICE_UUID;

  if (!apiKey || !projectUuid || !voiceUuid) {
    throw new Error(
      'Missing Resemble env vars: RESEMBLE_API_KEY, RESEMBLE_PROJECT_UUID, RESEMBLE_VOICE_UUID'
    );
  }

  Resemble.setApiKey(apiKey);

  console.log(`[Resemble] Synthesizing: "${text.slice(0, 60)}..."`);

  const result = await Resemble.v2.clips.createDirect({
    voice_uuid: voiceUuid,
    project_uuid: projectUuid,
    data: text,
    output_format: 'wav',
    sample_rate: 44100,
    precision: 'PCM_16',
  });

  if (!('success' in result) || !result.success) {
    const err = result as any;
    throw new Error(`Resemble API error: ${err.message ?? JSON.stringify(err)}`);
  }

  // Write audio to public/audio/
  const outDir = path.join(process.cwd(), 'public', 'audio');
  fs.mkdirSync(outDir, { recursive: true });

  const audioPath = path.join(outDir, `${filename}.wav`);
  const audioBuffer = Buffer.from(result.audio_content, 'base64');
  fs.writeFileSync(audioPath, audioBuffer);

  console.log(`[Resemble] Audio saved → public/audio/${filename}.wav (${result.duration.toFixed(2)}s)`);

  // Build word-level timestamps from character-level data
  const wordTimestamps = buildWordTimestamps(text, result.audio_timestamps);

  return {
    audioPath: `audio/${filename}.wav`,
    durationSecs: result.duration,
    durationFrames: Math.ceil(result.duration * fps),
    wordTimestamps,
  };
}

/**
 * Convert Resemble character-level timestamps to word-level timestamps.
 * graph_chars: ['H','e','l','l','o',' ','w','o','r','l','d']
 * graph_times: [[0, 0.1], [0.1, 0.18], ...]
 */
function buildWordTimestamps(
  text: string,
  timestamps: { graph_chars: string[]; graph_times: [number, number][] },
): WordTimestamp[] {
  const { graph_chars, graph_times } = timestamps;
  const words: WordTimestamp[] = [];

  let wordStart: number | null = null;
  let wordChars = '';
  let wordStartTime = 0;

  for (let i = 0; i < graph_chars.length; i++) {
    const char = graph_chars[i];
    const [start, end] = graph_times[i] ?? [0, 0];

    if (char === ' ' || char === '\n') {
      if (wordChars.length > 0) {
        words.push({ word: wordChars, start: wordStartTime, end: graph_times[i - 1]?.[1] ?? end });
        wordChars = '';
        wordStart = null;
      }
    } else {
      if (wordStart === null) {
        wordStart = i;
        wordStartTime = start;
      }
      wordChars += char;
    }
  }

  // Flush final word
  if (wordChars.length > 0) {
    const lastTime = graph_times[graph_chars.length - 1]?.[1] ?? 0;
    words.push({ word: wordChars, start: wordStartTime, end: lastTime });
  }

  return words;
}

/**
 * Convert seconds to Remotion frames.
 */
export function secsToFrames(secs: number, fps: number = 30): number {
  return Math.round(secs * fps);
}
