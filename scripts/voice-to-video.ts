/**
 * voice-to-video.ts — OpenLess + OpenRouter + Remotion pipeline
 *
 * Flow:
 *   1. OpenLess: hold hotkey → speak → release → polished text at cursor
 *   2. Copy that text (Cmd+A, Cmd+C)
 *   3. This watcher detects new clipboard text
 *   4. Sends to OpenRouter (claude-sonnet-4-6) for video script formatting
 *   5. Writes polished script → src/data/script.json
 *   6. Remotion Studio hot-reloads and shows the updated text in compositions
 *
 * Usage:
 *   npm run voice-watch
 *   npm run voice-watch:silent   (skips the Ruflo agent banner)
 */

import { execSync } from 'child_process';
import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';
import { buildVoiceInputSwarmConfig, logSwarmInit } from '../src/lib/ruflo';

// ─── Args ─────────────────────────────────────────────────────────────────────

const SILENT = process.argv.includes('--silent');

// ─── Ruflo swarm init ─────────────────────────────────────────────────────────

const { agents } = buildVoiceInputSwarmConfig('openless → openrouter → remotion pipeline');

if (!SILENT) {
  logSwarmInit(agents, 'openless → openrouter → remotion pipeline');
  console.log('');
}

// ─── Script output path ───────────────────────────────────────────────────────

const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const SCRIPT_PATH = path.join(DATA_DIR, 'script.json');

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function looksLikeCode(text: string): boolean {
  const markers = [
    '{', '}', 'import ', 'export ', 'function ', 'const ', 'let ', 'var ',
    '=>', '()', 'return ', 'class ', '/>', '<div', '<span',
    '#!/', '```', 'npm ', 'git ', 'cd ', 'curl ',
  ];
  return markers.some((m) => text.includes(m));
}

async function askConfirm(question: string): Promise<boolean> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      const a = answer.trim().toLowerCase();
      resolve(a === '' || a === 'y' || a === 'yes');
    });
  });
}

// ─── OpenRouter polish ────────────────────────────────────────────────────────

async function polishWithOpenRouter(raw: string): Promise<{
  headline: string;
  subheadline: string;
  lines: string[];
  cta: string;
}> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY not set in .env');

  console.log('[script-formatter] Polishing with OpenRouter (claude-sonnet-4-6)...');

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://github.com/weedappcreator/remotion-studio',
    },
    body: JSON.stringify({
      model: 'anthropic/claude-sonnet-4-6',
      messages: [
        {
          role: 'system',
          content: `You are a video script editor. The user spoke a rough script using OpenLess voice input.
Format it as JSON for a Remotion video composition. Return ONLY valid JSON, no markdown.

Schema:
{
  "headline": "short punchy headline, max 5 words",
  "subheadline": "one sentence elaboration, max 20 words",
  "lines": ["line1 for kinetic text", "line2", "line3", "line4"],
  "cta": "call to action button text, max 4 words"
}

Rules:
- headline: bold, impactful, present tense
- lines: 2-4 short phrases for kinetic typography animation
- Remove all filler words: um, uh, like, so, basically
- Warm, confident, professional tone`,
        },
        { role: 'user', content: raw },
      ],
      max_tokens: 300,
      temperature: 0.3,
    }),
  });

  if (!res.ok) throw new Error(`OpenRouter error: ${res.status} ${await res.text()}`);
  const data = await res.json() as { choices: { message: { content: string } }[] };
  const content = data.choices[0]?.message?.content?.trim() ?? '{}';

  // Strip markdown code fences if present
  const cleaned = content.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
  return JSON.parse(cleaned);
}

// ─── Write to src/data/script.json ───────────────────────────────────────────

function saveScript(script: object): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(SCRIPT_PATH, JSON.stringify(script, null, 2));
  console.log(`[script-formatter] Saved → src/data/script.json`);
}

// ─── Handle new clipboard text ────────────────────────────────────────────────

async function handleNewScript(raw: string): Promise<void> {
  const preview = raw.length > 100 ? raw.slice(0, 100) + '…' : raw;
  const wordCount = raw.split(/\s+/).filter(Boolean).length;

  console.log('\n─────────────────────────────────────────────────────');
  console.log('[voice-researcher] New voice input detected:');
  console.log(`  "${preview}"`);
  console.log(`  Words: ${wordCount}`);
  console.log('─────────────────────────────────────────────────────');

  const confirmed = await askConfirm('[Ruflo] Format with OpenRouter → push to Remotion? [Y/n]: ');

  if (!confirmed) {
    console.log('[voice-researcher] Skipped.\n');
    return;
  }

  try {
    const script = await polishWithOpenRouter(raw);

    console.log('\n[script-formatter] Formatted script:');
    console.log(`  Headline    : ${script.headline}`);
    console.log(`  Subheadline : ${script.subheadline}`);
    console.log(`  Lines       : ${script.lines.join(' / ')}`);
    console.log(`  CTA         : ${script.cta}`);

    saveScript({ ...script, raw, updatedAt: new Date().toISOString() });

    console.log('\n[timing-validator] Remotion Studio will hot-reload automatically.');
    console.log('  Open: http://localhost:3001 → KineticTypography or WebsitePromo');
    console.log('─────────────────────────────────────────────────────\n');
  } catch (err: unknown) {
    console.error('[script-formatter] Error:', (err as Error).message);
  }
}

// ─── Clipboard watcher loop ───────────────────────────────────────────────────

let lastClip = '';

async function watchClipboard(): Promise<void> {
  console.log('[voice-to-video] Ready. Pipeline: OpenLess → OpenRouter → Remotion');
  console.log('[voice-to-video] Hold OpenLess hotkey → speak → release → Cmd+A Cmd+C → confirm here.');
  console.log('[voice-to-video] Ctrl+C to stop.\n');

  while (true) {
    try {
      const current = execSync('pbpaste').toString().trim();
      if (current !== lastClip && current.length > 20 && !looksLikeCode(current)) {
        lastClip = current;
        await handleNewScript(current);
      }
    } catch {
      // clipboard empty or binary — ignore
    }
    await sleep(500);
  }
}

watchClipboard().catch((err) => {
  console.error('[voice-to-video] Fatal:', err);
  process.exit(1);
});
