# Shorts template (Remotion)

Vertical 1080x1920 video template with Hindi AI narration. Theme is permanent; scripts, media and audio are per video.

## Daily flow (with Claude Code)
1. Paste your script in the chat (or use `/short`). Claude writes `videos/<slug>.json`, rewrites the narration so the AI voice sounds natural, checks it, and generates the audio **once**.
2. Open http://localhost:3000 (`npm run dev`) and pick your video in the left sidebar.
3. Ask for changes in chat (text, visuals, your images/videos in `public/media/`). The audio is reused, so changes are free.
4. Say "generate the video" -> `out/<slug>.mp4`.
5. `npm run reset` clears everything per-video when you're done.

## Commands
| Command | What it does |
|---|---|
| `npm run dev` | Studio at http://localhost:3000 (lists every `videos/*.json`) |
| `npm run check:voice -- videos/x.json` | Checks narration text for a natural AI voice (free) |
| `npm run voice -- videos/x.json` | Generates narration (Sarvam, speaker `ashutosh`), sets scene lengths from the audio. Cached per scene |
| `npm run render:video -- x` | Renders `out/x.mp4` |
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
| `src/theme.ts` (look & feel), `public/brand/` (logo), template code, `scripts/`, `CLAUDE.md` | `.env`, `videos/*`, `public/media/*`, `out/*`, `src/videos.generated.ts` |

## Narration rules (enforced by `check:voice`)
Devanagari only, English words spelled in Devanagari, numbers/symbols as words, short sentences ending with `।` `?` `!`, commas for pauses.

## Scene fields (`src/types.ts`)
`seconds`, `headline`, `sub`, `bigText`, `media` (`image`/`video`, `mode: background|card`), `voice`, plus generated `audio` and `voiceKey`.
Top-level `music` and `musicVolume` are optional.
