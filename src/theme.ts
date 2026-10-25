import { bodyFont, headingFont } from "./fonts";

// THEME — your channel's look. Edit once, applies to every video.
// This file is part of the template and is committed to git.

export const theme = {
  brand: {
    name: "Herapheri Finance",
    handle: "@herapherifinance", // watermark shown bottom-left; set "" to hide
    // Put your logo in public/brand/ and set e.g. "brand/logo.png". "" = no logo.
    logo: "",
  },

  colors: {
    bgFrom: "#0b132b",
    bgMid: "#1c2541",
    bgTo: "#0a3d2e",
    text: "#ffffff",
    accent: "#7CFFB2", // sub text, progress bar
    accent2: "#FFD25A", // big numbers / highlights
    danger: "#FF6B6B",
    overlay: "rgba(0,0,0,0.45)", // dark layer over background media so text stays readable
  },

  fonts: {
    heading: headingFont, // Montserrat (src/fonts.ts)
    body: bodyFont, // Poppins
  },

  sizes: {
    headline: 88,
    sub: 52,
    bigText: 150,
  },

  // Keeps text clear of the YouTube Shorts UI (title, buttons) — in pixels on a 1080x1920 canvas.
  safeArea: { top: 140, bottom: 260, side: 70 },

  motion: {
    fadeFrames: 8, // fade-out at end of each scene
  },

  showProgressBar: true,

  // Word-by-word captions synced to the narration (timings from `npm run captions`).
  captions: {
    enabled: true,
    maxWords: 3, // words on screen at once
    fontSize: 78,
    color: "#ffffff",
    highlight: "#FFD25A", // the word being spoken
  },

  // Background music for every video (a script can override with "music" or turn it off with "music": "none").
  music: {
    src: "music/chill-lofi.ogg", // CC0, see public/music/CREDITS.md
    volume: 0.16, // while nobody speaks
    duckTo: 0.05, // while the narrator speaks
  },
} as const;
