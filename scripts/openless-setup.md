# OpenLess Setup for Remotion Studio

## 1. Install OpenLess

Download for Intel Mac (x86_64):
https://github.com/Open-Less/openless/releases/download/v1.3.14-tauri/OpenLess_1.3.14_x64.dmg

Open the DMG → drag to /Applications → then remove the quarantine flag:

```bash
xattr -cr /Applications/OpenLess.app
```

## 2. Configure LLM for Video Script Polish

In OpenLess → Settings → Ark Endpoint, set your LLM backend.

**Option A — OpenCode (recommended, 175+ models):**
- Endpoint: `https://api.opencode.ai/v1/chat/completions`
- Model: `claude-sonnet-4-6`
- API Key: your `OPENCODE_API_KEY`

**Option B — Anthropic via OpenRouter:**
- Endpoint: `https://openrouter.ai/api/v1/chat/completions`
- Model: `anthropic/claude-sonnet-4-6`
- API Key: your `OPENROUTER_API_KEY`

**Option C — Anthropic direct:**
- Endpoint: `https://api.anthropic.com/v1/messages`
- Model: `claude-sonnet-4-6`
- API Key: your `ANTHROPIC_API_KEY`

## 3. Add a "Video Script" Custom Prompt in OpenLess

In OpenLess → Settings → Custom Mode prompt, paste:

> You are a video script editor. The user has spoken a rough voiceover script.
> Clean it up into natural, spoken-word narration.
> Keep sentences short (under 15 words each).
> Remove filler words (um, uh, like, you know).
> Maintain a warm, confident tone.
> Output ONLY the cleaned script — no labels, no bullets, no markdown.
> Maximum 3 sentences for short-form, up to 8 for long-form.

## 4. Configure Resemble AI

Add these to your `.env` in `~/remotion-studio`:

```env
RESEMBLE_API_KEY=your_key_here
RESEMBLE_PROJECT_UUID=your_project_uuid_here
RESEMBLE_VOICE_UUID=your_voice_uuid_here
```

Get these from https://app.resemble.ai → API and Projects.

## 5. Workflow

1. Open terminal in `~/remotion-studio`
2. Run: `npm run voice-watch`
3. In a second terminal: `npm run studio`
4. Hold Right Option key → speak your video script → release
5. The clipboard watcher detects the polished text automatically
6. Confirm with `Y` → Resemble AI generates audio → Remotion preview updates

## 6. Grant macOS Permissions

System Preferences → Privacy & Security:
- **Microphone** → OpenLess ✓
- **Accessibility** → OpenLess ✓ (restart OpenLess after granting)

## 7. OpenLess Modes

| Mode         | Hotkey behavior  | Best for                       |
|--------------|------------------|--------------------------------|
| `light`      | Default cleanup  | General video scripts          |
| `structured` | Bullet list      | Scene breakdowns, shot lists   |
| `raw`        | Verbatim         | Capturing exact phrasing first |

Use **light** or **custom** mode for voiceover narration.

## 8. Updating durationInFrames After Generation

After the clipboard watcher confirms audio generation, it prints:

```
Update VoiceoverPromo durationInFrames={N} in src/Root.tsx
```

Open `src/Root.tsx` and update the composition:

```tsx
<Composition
  id="VoiceoverPromo"
  durationInFrames={N}  // ← paste the printed number here
  ...
/>
```

Remotion Studio hot-reloads automatically — no restart needed.
