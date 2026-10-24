# Shorts video template: workflow for Claude

Vertical 1080x1920 YouTube Shorts in Remotion. The theme is permanent; each video is one JSON file.
The user pastes a script, you build the video, the user reviews it in Studio (http://localhost:3000),
asks for changes, and finally asks you to render.

## When the user pastes a script

1. **Pick a slug** (`gold-rush`, `rbi-emi`). Create `videos/<slug>.json`:
   `{ "script": { "scenes": [ { "seconds": 5, "headline": "...", "sub": "...", "bigText": "...", "voice": "..." } ] } }`
   Split the script into scenes of one idea each (about 3 to 12 seconds of speech). `seconds` is a
   placeholder, the voice step overwrites it from the real audio.
2. **Write each scene's `voice` for the AI voice** (this is what makes it sound natural):
   - Devanagari Hindi only. English words in Devanagari (UPI -> यूपीआई, EMI -> ईएमआई).
   - No digits or symbols. Numbers, rupees and percent in words (5.54% -> पाँच दशमलव पाँच चार परसेंट, ₹ -> रुपये).
   - Short sentences, max about 20 words, each ending with `।` `?` or `!`. Commas where a speaker would breathe.
   - No `...`. One to three sentences per scene. Keep the user's meaning and tone.
   On-screen text (`headline`, `sub`, `bigText`) stays short and can be Roman Hinglish with digits and ₹.
3. **Check, then generate audio ONCE:**
   ```
   npm run check:voice -- videos/<slug>.json    # fix every ERROR first
   npm run voice -- videos/<slug>.json          # default voice: Sarvam "ashutosh" (needs SARVAM_API_KEY in .env)
   ```
   `voice` re-runs the check itself and sets each scene's `seconds` from the audio length.
   It is cached: unchanged `voice` text is never billed again. Never edit a scene's `voice` after this
   unless the user asks for different narration (that re-bills only that scene). Add `--force` only if the user insists on skipping the check.
4. **Show it:** make sure Studio is running (`npm run dev`, port 3000; do not start a second one), run
   `npm run video:sync`, and tell the user to open the `<slug>` entry in the left sidebar.
5. **Iterate on request:** edit only the visuals in `videos/<slug>.json` (headline, sub, bigText, `media`,
   `seconds`, colors in `src/theme.ts`). Never make a scene shorter than its audio (voice warns about it).
   Images/videos the user provides go in `public/media/` and are referenced as `media/<file>`
   (`media: { type: "image"|"video", src, mode: "background"|"card" }`).
6. **Render only when the user says to:** `npm run render:video -- <slug>` -> `out/<slug>.mp4`.
7. **Cleanup only when the user says to:** `npm run reset` (wipes `videos/`, `public/media/`, `out/`).

## Rules
- Theme/branding lives in `src/theme.ts` (permanent, committed). Per-video files (`videos/*`, `public/media/*`, `out/`) and `.env` are git-ignored: never commit or push them, never print the API key.
- Commit/push only when the user asks, and only template files (scripts/, src/, README, CLAUDE.md, package.json).
- If Studio shows nothing new, `npm run video:sync` regenerates `src/videos.generated.ts` (git-ignored).
- Free fallback voice: `--engine=edge` (needs `pip install edge-tts`), lower quality.
