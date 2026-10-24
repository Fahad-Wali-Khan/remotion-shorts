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
    heading: "Helvetica, Arial, sans-serif",
    body: "Helvetica, Arial, sans-serif",
    // For Google Fonts: npm i @remotion/google-fonts, then load in Short.tsx.
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
} as const;
