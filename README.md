# Shorts template (Remotion)

Vertical 1080x1920 video template with Hindi AI narration. Theme is permanent; scripts, media and audio are per video.

## Daily flow (with Claude Code)
1. Paste your script in the chat (or use `/short`). Claude writes `videos/<slug>.json`, rewrites the narration so the AI voice sounds natural, checks it, and generates the audio **once**.
2. Open http://localhost:3000 (`npm run dev`) and pick your video in the left sidebar.
3. Ask for changes in chat (text, visuals, your images/videos in `public/media/`). The audio is reused, so changes are free.
4. Say "generate the video" -> the video, thumbnail and YouTube upload text (see below).
5. `npm run reset` clears everything per-video when you're done.

## What you get for every video
`npm run render:video -- <slug>` writes three files into `out/`:

| File | Use |
|---|---|
| `<slug>.mp4` | The Short (1080x1920, Hindi narration, sound effects, `@herapherifinance` watermark) |
| `<slug>-thumbnail.png` | Thumbnail (emoji, huge gold hook text, red tag sticker, channel handle) |
| `<slug>-upload.txt` | Everything for the YouTube upload form: title (max 70 chars), description (keywords first, bullets, follow line, disclaimer, 3 hashtags incl. `#Shorts`), tags (max 500 chars), pinned comment, settings checklist. Warns if a limit is exceeded |

These come from the `thumbnail` and `youtube` blocks in `videos/<slug>.json`. Claude writes both blocks for every new script (rules in `CLAUDE.md`).
Keywords follow common YouTube SEO advice (keyword-first title, 2 to 3 hashtags, engagement question), they are **not** verified against live trends: check them in YouTube search suggestions or vidIQ before posting.
Facts in descriptions come only from your script, so verify numbers before publishing.

## Sound effects
45 free CC0 sounds are bundled in `public/sfx/` (list in `src/sfx.ts`, sources in `public/sfx/CREDITS.md`).
Put them in a scene with `"sfx": [{ "name": "coin", "at": 0.5, "volume": 0.4 }]` (`at` = seconds into the scene).
Effects cost nothing to change, the narration audio is untouched.

## Commands
| Command | What it does |
|---|---|
| `npm run dev` | Studio at http://localhost:3000 (lists every `videos/*.json`) |
| `npm run check:voice -- videos/x.json` | Checks narration text for a natural AI voice (free) |
| `npm run voice -- videos/x.json` | Generates narration (Sarvam, speaker `ashutosh`), sets scene lengths from the audio. Cached per scene |
| `npm run render:video -- x` | Renders `out/x.mp4`, the thumbnail `out/x-thumbnail.png` and the upload text `out/x-upload.txt` (title, description, tags, hashtags, pinned comment) |
| `npm run upload-info -- x` | Rewrites only `out/x-upload.txt` (instant, no render) |
| `npm run reset` | Deletes `videos/*`, `public/media/*`, `out/*` |

## Setup on a new machine
```
git clone https://github.com/Fahad-Wali-Khan/remotion-shorts.git && cd remotion-shorts
npm install
echo SARVAM_API_KEY=your_key > .env      # git-ignored
```
Python + `pip install edge-tts` is only needed for the free fallback voice (`--engine=edge`).

## What's committed vs not
| Committed | Never committed |
|---|---|
| `src/theme.ts` (look, channel name and handle), `public/brand/` (logo), `public/sfx/` (sound effects), template code, `scripts/`, `CLAUDE.md` | `.env`, `videos/*`, `public/media/*`, `out/*`, `src/videos.generated.ts` |

## Narration rules (enforced by `check:voice`)
Devanagari only, English words spelled in Devanagari, numbers/symbols as words, short sentences ending with `।` `?` `!`, commas for pauses.

## Scene fields (`src/types.ts`)
Per video: a `youtube` block (title, description, bullets, hashtags, tags, pinnedComment, category), a `thumbnail` block (`tag`, `emoji`, `highlight`, `title`, optional `image`) and `sfx` per scene (names in `src/sfx.ts`).
Scene fields: `seconds`, `headline`, `sub`, `bigText`, `media` (`image`/`video`, `mode: background|card`), `voice`, plus generated `audio` and `voiceKey`.
Top-level `music` and `musicVolume` are optional.
