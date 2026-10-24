# Shorts template (Remotion)

Vertical 1080x1920 video template. Theme is permanent; script and media are per video.

| What | Where | Committed? |
|---|---|---|
| Look & feel (colors, fonts, sizes, watermark, safe area) | `src/theme.ts` | yes |
| Logo / permanent brand assets | `public/brand/` | yes |
| Scene layout code | `src/components/Scene.tsx`, `src/Short.tsx` | yes |
| **This video's script** | `src/script.ts` | reset after render |
| **This video's images/videos/audio** | `public/media/` | never (git-ignored) |
| Rendered videos | `out/` | never (git-ignored) |

## Daily workflow
1. Drop images/videos/audio into `public/media/`.
2. Edit `src/script.ts` (scenes, text, `media: { type, src: "media/file.png", mode }`).
3. Preview: `npm run dev` -> pick **Short**.
4. Render: `npm run render` (writes `out/short.mp4`).
5. Clean up: `npm run reset` (restores `src/script.ts` from `scripts/script.blank.txt`, empties `public/media/` and `out/`).

Length is automatic: the sum of every scene's `seconds`.

## Scene options (`src/types.ts`)
`headline`, `sub`, `bigText`, and `media` (image or video; `mode: "background"` fills the screen, `"card"` shows a rounded picture in the middle). Top-level `voiceover`, `music`, `musicVolume` are optional.

## Changing the theme
Edit `src/theme.ts` and commit it. Put your logo in `public/brand/` and set `brand.logo`.
