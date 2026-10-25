# Shorts video template: workflow for Claude

Vertical 1080x1920 YouTube Shorts in Remotion. The theme is permanent; each video is one JSON file.
The user pastes a script, you build the video, the user reviews it in Studio (http://localhost:3000),
asks for changes, and finally asks you to render.

## When the user pastes a script

**Stock market / trading content:** follow `SEBI_COMPLIANCE.md` (no buy/sell calls or targets, historical data only with date range, mandatory spoken + on-screen disclaimer as the last scene). Flag any borderline line in the user's script and suggest a safer version before generating audio.

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
   Also write each scene's **`caption`**: the same sentence as `voice` in Roman Hinglish (digits and ₹ allowed), with the
   SAME punctuation, so caption phrases line up with the narration pauses. It is shown word by word, karaoke style.
3. **Check, then generate audio ONCE:**
   ```
   npm run check:voice -- videos/<slug>.json    # fix every ERROR first
   npm run voice -- videos/<slug>.json          # default: Sarvam Bulbul v4 Flash, "ashutosh_hi_conversational" (₹1/1K chars; needs SARVAM_API_KEY in .env). Old v3 voice: --model=bulbul:v3
   ```
   `voice` re-runs the check itself, sets each scene's `seconds` from the audio length, and then (free, offline) works out
   word timings for the captions and when the narrator speaks (used to duck the background music). After editing
   `caption` text later, `npm run captions -- videos/<slug>.json` refreshes timings (render does it automatically too).
   It is cached: unchanged `voice` text is never billed again. Never edit a scene's `voice` after this
   unless the user asks for different narration (that re-bills only that scene). Add `--force` only if the user insists on skipping the check.
4. **Show it:** make sure Studio is running (`npm run dev`, port 3000; do not start a second one), run
   `npm run video:sync`, and tell the user to open the `<slug>` entry in the left sidebar.
5. **Iterate on request:** edit only the visuals in `videos/<slug>.json` (headline, sub, bigText, `media`,
   `seconds`, colors in `src/theme.ts`). Never make a scene shorter than its audio (voice warns about it).
   Every video also needs a **thumbnail** block at the top of the script (`"thumbnail": { "tag", "emoji", "highlight", "title" }`):
   `highlight` = 1 to 3 huge gold words (the number or hook, e.g. "₹1.48 LAKH"), `title` = a curiosity line of max 6 words,
   `tag` = red sticker ("BREAKING", "EMI ALERT"), `emoji` = one emoji (avoid 🪙, it renders wrongly; avoid $ symbols, use ₹).
   Preview it in Studio as `<slug>-thumb`. Optional `image` = a photo from `public/media/` behind the text.
   Also add a **`youtube`** block (feeds `out/<slug>-upload.txt` with everything for the YouTube upload form):
   `title` (max 70 chars, main keyword first, curiosity second, e.g. "Gold ₹1.48 Lakh Cross! Ab Gold Kharidna Chahiye?"),
   `description` (first 1 to 2 sentences carry the search keywords), `bullets` (3 to 4 facts), `hashtags` (exactly 3, last one `#Shorts`),
   `tags` (12 to 15 search phrases incl. the channel name, under 500 chars), `pinnedComment` (an engagement question), `category`.
   The generator adds the follow CTA and a financial-advice disclaimer itself. Use only facts from the user's script.
   Images/videos the user provides go in `public/media/` and are referenced as `media/<file>`
   (`media: { type: "image"|"video", src, mode: "background"|"card"|"sticker" }`; `sticker` = a logo that spins in above bigText).
   A logo can also replace the thumbnail emoji: `"thumbnail": { "logo": "media/x.png" }`. If a logo has white corners, make them transparent first.
   **Animation (use it, the user wants lively videos):** every scene already slides in, headlines pop word by word and numbers in
   `bigText` count up. Per scene add punch where it fits: `"emphasis": "flash"` on a mid-video reveal (never scene 1: the first scene always starts fully visible on frame 0), `"shake"` on twists/shocks,
   `"bigTextAnim": "slam"` for dates or verdicts (no count-up), `"type"` for names/short phrases. `note` = small print (disclaimers).
   **Explainer visuals** (`"visual"` instead of `bigText`, src/components/Visuals.tsx) for concepts:
   `flow` (A → B with money flying, e.g. RBI → Bank), `meter` (gauge from→to, `tone` danger/growth, label illustrative numbers with `note`),
   `stamps` (rows like loans getting a "MEHENGA"/"APPROVED" stamp), `balloon` (inflation balloon deflating, optional end stamp),
   `bars` (growth bars + arrow, no numbers), `list` (lines sliding in; use it for the SEBI disclaimer scene).
   Emoji in `headline`/`bigText`/`visual` play as animated Noto emoji automatically when Google has one (the upload text then adds the
   required CC BY credit). Background music (`theme.music`, CC0 lofi) plays under every video and ducks under the voice;
   a script can set `"music": "media/x.mp3"`, `"musicVolume"`, or `"music": "none"`.
   `PIXABAY_API_KEY` is in `.env` for fetching free stock photos/videos (B-roll) when a video needs them; never print it.
6. **Render only when the user says to:** `npm run render:video -- <slug>` -> `out/<slug>.mp4` `out/<slug>-thumbnail.png` (1080x1920) and `out/<slug>-upload.txt`.
7. **Cleanup only when the user says to:** `npm run reset` (wipes `videos/`, `public/media/`, `out/`).

## Rules
- Theme/branding lives in `src/theme.ts` (permanent, committed). Per-video files (`videos/*`, `public/media/*`, `out/`) and `.env` are git-ignored: never commit or push them, never print the API key.
- Commit/push only when the user asks, and only template files (scripts/, src/, README, CLAUDE.md, package.json).
- If Studio shows nothing new, `npm run video:sync` regenerates `src/videos.generated.ts` (git-ignored).
- Free fallback voice: `--engine=edge` (needs `pip install edge-tts`), lower quality.
