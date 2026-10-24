import type { ShortScript } from "./types";

// SCRIPT — the ONLY file you edit per video. Reset it after rendering.
// Drop images/videos into public/media/ and reference them as "media/<file>".
// Video length = sum of all scene `seconds`.

export const script: ShortScript = {
  // voiceover: "media/voiceover.mp3",
  // music: "media/music.mp3",
  // musicVolume: 0.15,
  scenes: [
    {
      seconds: 4,
      headline: "Your hook goes here",
      sub: "Supporting line",
    },
    {
      seconds: 5,
      headline: "Main point",
      bigText: "₹0",
      // media: { type: "image", src: "media/example.png", mode: "card" },
    },
    {
      seconds: 3,
      headline: "Call to action",
      sub: "Follow for more",
    },
  ],
};
