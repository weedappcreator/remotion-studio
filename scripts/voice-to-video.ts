/**
 * voice-to-video.ts — OpenLess clipboard watcher
 *
 * Polls the macOS clipboard every 500ms for new text that looks like a
 * video script (polished by OpenLess). When detected, asks for confirmation
 * and then auto-generates a Resemble AI voiceover + prints Remotion frame info.
 *
 * Usage:
 *   npm run voice-watch
 *   npm run voice-watch:silent   (skips the Ruflo agent banner)
 */

import { execSync } from 'child_process';
import * as readline from 'readline';
import 'dotenv/config';
import { generateVoiceover } from '../src/lib/voiceover';
import { buildVoiceInputSwarmConfig, logSwarmInit } from '../src/lib/ruflo';

// ─── Args ─────────────────────────────────────────────────────────────────────

const SILENT = process.argv.includes('--silent');

// ─── Ruflo swarm init ─────────────────────────────────────────────────────────

const { agents, task } = { ...buildVoiceInputSwarmConfig('voice-to-video clipboard watcher integration'), task: 'voice-to-video clipboard watcher integration' };

if (!SILENT) {
  logSwarmInit(agents, 'voice-to-video clipboard watcher integration');
  console.log('');
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Returns true if the clipboard text looks like code rather than a script.
 * Checks for common code syntax markers.
 */
function looksLikeCode(text: string): boolean {
  const codeMarkers = [
    '{', '}', 'import ', 'export ', 'function ', 'const ', 'let ', 'var ',
    '=>', '()', '[];', 'return ', 'class ', '/>',  '<div', '<span',
    '#!/', '```', 'npm ', 'git ', 'cd ', 'curl ', 'http://', 'https://',
    '.ts', '.js', '.json', '.md',
  ];
  return codeMarkers.some((marker) => text.includes(marker));
}

/**
 * Prompt the user for a yes/no answer. Returns true for yes (default).
 */
async function askConfirm(question: string): Promise<boolean> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      const normalized = answer.trim().toLowerCase();
      // Default to yes on empty input or 'y'
      resolve(normalized === '' || normalized === 'y' || normalized === 'yes');
    });
  });
}

/**
 * Handle a newly detected script from the clipboard.
 */
async function handleNewScript(script: string): Promise<void> {
  const preview = script.length > 100 ? script.slice(0, 100) + '…' : script;
  const wordCount = script.split(/\s+/).filter(Boolean).length;

  console.log('\n─────────────────────────────────────────────────────');
  console.log('[voice-researcher] New script detected from clipboard:');
  console.log(`  "${preview}"`);
  console.log(`  Words: ${wordCount}`);
  console.log('─────────────────────────────────────────────────────');

  const confirmed = await askConfirm('[Ruflo voice-researcher] Detected script — use as voiceover? [Y/n]: ');

  if (!confirmed) {
    console.log('[voice-researcher] Skipped. Watching for next script...\n');
    return;
  }

  console.log('\n[tts-generator] Calling Resemble AI...');

  try {
    const result = await generateVoiceover(script, 'voiceover');

    console.log('\n[timing-validator] Voiceover generated successfully:');
    console.log(`  Audio path : public/${result.audioPath}`);
    console.log(`  Duration   : ${result.durationSecs.toFixed(2)}s`);
    console.log(`  Frames     : ${result.durationFrames} (at 30fps)`);
    console.log(`  Word count : ${wordCount}`);
    console.log('');
    console.log('[timing-validator] Next step:');
    console.log(`  Update VoiceoverPromo durationInFrames={${result.durationFrames}} in src/Root.tsx`);
    console.log('  Then run: npm run studio');
    console.log('─────────────────────────────────────────────────────\n');
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[tts-generator] Error: ${message}`);
    console.error('Check RESEMBLE_API_KEY, RESEMBLE_PROJECT_UUID, RESEMBLE_VOICE_UUID in .env\n');
  }
}

// ─── Main clipboard watcher loop ──────────────────────────────────────────────

let lastClip = '';

async function watchClipboard(): Promise<void> {
  console.log('[voice-to-video] Watching clipboard for voice scripts...');
  console.log('[voice-to-video] Hold your OpenLess hotkey → speak → release → confirm here.');
  console.log('[voice-to-video] Press Ctrl+C to stop.\n');

  while (true) {
    try {
      const current = execSync('pbpaste').toString().trim();

      if (
        current !== lastClip &&
        current.length > 20 &&
        !looksLikeCode(current)
      ) {
        lastClip = current;
        await handleNewScript(current);
      }
    } catch {
      // pbpaste can occasionally fail if clipboard is empty or binary — ignore
    }

    await sleep(500);
  }
}

watchClipboard().catch((err) => {
  console.error('[voice-to-video] Fatal error:', err);
  process.exit(1);
});
