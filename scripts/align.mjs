// Usage: npm run captions -- videos/<file>.json      (also runs automatically after `npm run voice` and before rendering)
// Free, offline word timing for captions + music ducking. No transcription needed: we already know the exact text.
//  1. ffmpeg finds the pauses in each scene's narration audio -> speech segments.
//  2. The caption text is split into phrases at punctuation; phrase boundaries snap to the nearest pause.
//  3. Inside a phrase, words share the time by length.
// Writes per scene: `speech` [[start, end], ...] and `captions` [{ text, start, end }, ...] (seconds from scene start).
import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const SILENCE_DB = "-35dB";
const MIN_PAUSE = 0.15; // seconds

function analyse(path) {
  // ffmpeg reports pauses on stderr
  const run = spawnSync(
    "npx",
    ["remotion", "ffmpeg", "-hide_banner", "-i", path, "-af", `silencedetect=noise=${SILENCE_DB}:d=${MIN_PAUSE}`, "-f", "null", "-"],
    { shell: true, encoding: "utf8" },
  );
  const log = `${run.stdout}${run.stderr}`;
  const duration = Number(
    execFileSync("npx", ["remotion", "ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path], {
      shell: true,
      encoding: "utf8",
    }).trim().split(/\s+/).pop(),
  );
  const starts = [...log.matchAll(/silence_start: ([\d.]+)/g)].map((m) => Number(m[1]));
  const ends = [...log.matchAll(/silence_end: ([\d.]+)/g)].map((m) => Number(m[1]));
  const silences = starts.map((s, i) => [s, ends[i] ?? duration]);

  // speech = everything that is not silence
  const speech = [];
  let t = 0;
  for (const [s, e] of silences) {
    if (s - t > 0.05) speech.push([t, s]);
    t = e;
  }
  if (duration - t > 0.05) speech.push([t, duration]);
  return { duration, speech };
}

// numbers are spoken as several words ("30,213" -> "tees hazaar do sau terah"), so they get more time
const weight = (w) => (/\d/.test(w) ? [...w].length * 2.5 : [...w].length) + 2;

/** Word timings for `text` given the speech segments of its audio. */
export function alignWords(text, speech) {
  const phrases = text
    .split(/(?<=[,।.?!;:])\s+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => p.split(/\s+/));
  if (!speech.length || !phrases.length) return [];

  const speechStart = speech[0][0];
  const speechEnd = speech[speech.length - 1][1];
  const gaps = speech.slice(1).map((seg, i) => [speech[i][1], seg[0]]); // pauses between speech segments

  // expected phrase boundaries by text length, then snap each to the nearest unused pause (keeping order)
  const totals = phrases.map((p) => p.reduce((s, w) => s + weight(w), 0));
  const all = totals.reduce((a, b) => a + b, 0);
  const bounds = [speechStart];
  let acc = 0;
  let gapFrom = 0;
  for (let i = 0; i < phrases.length - 1; i++) {
    acc += totals[i];
    const expected = speechStart + (acc / all) * (speechEnd - speechStart);
    let best = -1;
    for (let g = gapFrom; g < gaps.length; g++) {
      const mid = (gaps[g][0] + gaps[g][1]) / 2;
      if (Math.abs(mid - expected) < 0.9 && (best < 0 || Math.abs(mid - expected) < Math.abs((gaps[best][0] + gaps[best][1]) / 2 - expected))) best = g;
    }
    if (best >= 0) {
      bounds.push(gaps[best]); // [phrase end, next phrase start]
      gapFrom = best + 1;
    } else {
      bounds.push([expected, expected]);
    }
  }
  bounds.push(speechEnd);

  const words = [];
  for (let i = 0; i < phrases.length; i++) {
    const start = i === 0 ? bounds[0] : bounds[i][1];
    const end = i === phrases.length - 1 ? bounds[bounds.length - 1] : bounds[i + 1][0];
    let t = start;
    for (const w of phrases[i]) {
      const d = ((end - start) * weight(w)) / totals[i];
      words.push({ text: w, start: Math.round(t * 100) / 100, end: Math.round((t + d) * 100) / 100 });
      t += d;
    }
  }
  return words;
}

/** Adds `speech` and `captions` to every scene that has audio. Returns number of scenes processed. */
export function alignScript(script) {
  let n = 0;
  for (const scene of script.scenes) {
    if (!scene.audio || !existsSync(join("public", scene.audio))) continue;
    const { speech } = analyse(join("public", scene.audio));
    scene.speech = speech.map(([s, e]) => [Math.round(s * 100) / 100, Math.round(e * 100) / 100]);
    scene.captions = alignWords(scene.caption ?? scene.voice ?? "", speech);
    n++;
  }
  return n;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const file = process.argv[2];
  if (!file) {
    console.error("Usage: npm run captions -- videos/<file>.json");
    process.exit(1);
  }
  const data = JSON.parse(readFileSync(file, "utf8"));
  const n = alignScript(data.script ?? data);
  writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
  console.log(`Captions + speech timing updated for ${n} scene(s).`);
}
