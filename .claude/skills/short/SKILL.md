---
name: short
description: Turn a pasted script into a YouTube Short in this Remotion project. Use when the user pastes a video script or says "make a short/video from this". Follows CLAUDE.md - voice-first, one audio generation, preview in Studio, render on request.
---

Follow the workflow in `CLAUDE.md` ("When the user pastes a script"), steps 1 to 4:
create `videos/<slug>.json`, write natural Devanagari `voice` text, run `npm run check:voice`,
run `npm run voice` once, then point the user at the new entry in Studio (http://localhost:3000).
Do not render until the user says so.
