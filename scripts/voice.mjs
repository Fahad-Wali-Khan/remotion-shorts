// Usage: npm run voice -- videos/my-video.json [--speaker=ashutosh] [--pace=1.1] [--pad=0.3] [--force] [--engine=sarvam|edge]
//
// Generates narration FIRST, so the visuals can follow the audio:
//  - runs the voice check (scripts/check-voice.mjs) and stops on errors, so you never pay for a bad take
//  - for every scene with a `voice` text: generates audio into public/media/voice/ and sets scene.seconds = clip length + pad
//  - CACHED: a scene whose voice text/speaker/pace is unchanged is skipped, so each line is billed only once.
//    Edit headlines, numbers, media, even scene `seconds` freely, only changing `voice` text re-bills that one scene.
//
// Engines:
//   sarvam (default when SARVAM_API_KEY is in .env) - realistic Hindi, paid per character
//   edge   - free, needs Python + `pip install edge-tts` (--voice=hi-IN-MadhurNeural --rate=+25%)
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { checkScript } from "./check-voice.mjs";

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith("--"));
const opt = (name, fallback) =>
  args.find((a) => a.startsWith(`--${name}=`))?.split("=")[1] ?? fallback;
if (!file || !file.endsWith(".json")) {
  console.error("Usage: npm run voice -- videos/<file>.json [--speaker=ashutosh] [--pace=1.1] [--force]");
  process.exit(1);
}

const envKey = existsSync(".env")
  ? readFileSync(".env", "utf8").match(/^SARVAM_API_KEY=(.+)$/m)?.[1].trim()
  : undefined;
const sarvamKey = process.env.SARVAM_API_KEY ?? envKey;
const engine = opt("engine", sarvamKey ? "sarvam" : "edge");
if (engine === "sarvam" && !sarvamKey) {
  console.error("SARVAM_API_KEY missing. Put it in .env (git-ignored) or use --engine=edge.");
  process.exit(1);
}
const speaker = opt("speaker", "ashutosh"); // Sarvam voice, default chosen after comparing voices
const pace = Number(opt("pace", "1.1")); // Sarvam speed, 1.0 = normal
const edgeVoice = opt("voice", "hi-IN-MadhurNeural");
const rate = opt("rate", "+25%");
const pad = Number(opt("pad", "0.3")); // silence after each clip, seconds
const name = basename(file, ".json");

const data = JSON.parse(readFileSync(file, "utf8"));
const script = data.script ?? data;

if (checkScript(script) !== 0 && !args.includes("--force")) {
  console.error("Fix the voice text above first (no audio was generated, nothing was billed). Use --force to override.");
  process.exit(1);
}

mkdirSync("public/media/voice", { recursive: true });

const duration = (path) =>
  Number(
    execFileSync(
      "npx",
      ["remotion", "ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
      { shell: true, encoding: "utf8" },
    ).trim().split(/\s+/).pop(),
  );

const keyFor = (text) =>
  createHash("sha1")
    .update([engine, engine === "sarvam" ? `${speaker}|${pace}` : `${edgeVoice}|${rate}`, text].join("\n"))
    .digest("hex")
    .slice(0, 12);

async function synth(text, base, i) {
  if (engine === "sarvam") {
    const out = `${base}.wav`;
    const res = await fetch("https://api.sarvam.ai/text-to-speech", {
      method: "POST",
      headers: { "api-subscription-key": sarvamKey, "Content-Type": "application/json" },
      body: JSON.stringify({ text, target_language_code: "hi-IN", model: "bulbul:v3", speaker, pace }),
    });
    const json = await res.json();
    if (!res.ok || !json.audios?.[0]) {
      throw new Error(`Sarvam error (scene ${i + 1}): ${JSON.stringify(json.error ?? json)}`);
    }
    writeFileSync(out, Buffer.from(json.audios[0], "base64"));
    return out;
  }
  const out = `${base}.mp3`;
  const txt = join(tmpdir(), `voice-${name}-${i}.txt`);
  writeFileSync(txt, text, "utf8");
  execFileSync(
    "python",
    ["-m", "edge_tts", "--voice", edgeVoice, `--rate=${rate}`, "--file", txt, "--write-media", out],
    { stdio: "ignore" },
  );
  return out;
}

let billed = 0;
let cached = 0;
for (const [i, scene] of script.scenes.entries()) {
  if (!scene.voice) continue;
  const key = keyFor(scene.voice);
  const have = scene.audio && existsSync(join("public", scene.audio));

  if (have && scene.voiceKey === key && !args.includes("--regenerate")) {
    cached++;
    const secs = duration(join("public", scene.audio));
    const tooShort = scene.seconds < secs + 0.05;
    console.log(`scene ${i + 1}: cached (${secs.toFixed(1)}s audio, scene ${scene.seconds}s)${tooShort ? "  WARNING: scene is shorter than its audio, narration will be cut off" : ""}`);
    continue;
  }

  const out = await synth(scene.voice, `public/media/voice/${name}-${i + 1}`, i);
  billed += [...scene.voice].length;
  const secs = duration(out);
  scene.audio = out.replace("public/", "");
  scene.voiceKey = key;
  scene.seconds = Math.round((secs + pad) * 10) / 10;
  console.log(`scene ${i + 1}: generated ${secs.toFixed(1)}s -> scene ${scene.seconds}s`);
  writeFileSync(file, JSON.stringify(data, null, 2) + "\n"); // save progress after every paid call
}

const total = script.scenes.reduce((s, x) => s + x.seconds, 0);
console.log(`Done (${engine}/${engine === "sarvam" ? speaker : edgeVoice}). Billed ${billed} characters, ${cached} scene(s) reused from cache. Video length: ${total.toFixed(1)}s`);
