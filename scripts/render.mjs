// Usage: npm run render:video -- <slug>     (slug = file name in videos/ without .json)
// Renders out/<slug>.mp4 and, if the script has a `thumbnail` block, out/<slug>-thumbnail.png. Refuses to render if a scene has narration text but no audio yet.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { buildUploadInfo } from "./upload-info.mjs";
import { alignScript } from "./align.mjs";

const slug = process.argv[2]?.replace(/\.json$/, "").replace(/^videos[\\/]/, "");
const available = existsSync("videos") ? readdirSync("videos").filter((f) => f.endsWith(".json")).map((f) => f.replace(/\.json$/, "")) : [];
if (!slug || !available.includes(slug)) {
  console.error(`Usage: npm run render:video -- <slug>\nAvailable: ${available.join(", ") || "(none)"}`);
  process.exit(1);
}

const script = JSON.parse(readFileSync(`videos/${slug}.json`, "utf8")).script;
const missing = script.scenes.flatMap((s, i) => (s.voice && !(s.audio && existsSync(join("public", s.audio))) ? [i + 1] : []));
if (missing.length) {
  console.error(`Scene(s) ${missing.join(", ")} have narration text but no audio. Run: npm run voice -- videos/${slug}.json`);
  process.exit(1);
}

// refresh caption timings (picks up any edited caption text), free and offline
alignScript(script);
writeFileSync(`videos/${slug}.json`, JSON.stringify({ script }, null, 2) + "\n");
execFileSync("node", ["scripts/sync-videos.mjs"], { stdio: "inherit" });
const port = 3100 + Math.floor(Math.random() * 800); // keeps clear of a running Studio on :3000
execFileSync("npx", ["remotion", "render", slug.replace(/[^a-zA-Z0-9-]/g, "-"), `out/${slug}.mp4`, `--port=${port}`], {
  stdio: "inherit",
  shell: true,
});
const id = slug.replace(/[^a-zA-Z0-9-]/g, "-");
if (script.thumbnail) {
  execFileSync("npx", ["remotion", "still", `${id}-thumb`, `out/${slug}-thumbnail.png`, `--port=${port + 1}`], {
    stdio: "inherit",
    shell: true,
  });
}
const info = buildUploadInfo(slug, script);
if (info) {
  writeFileSync(`out/${slug}-upload.txt`, "﻿" + info.text.replace(/\n/g, "\r\n"), "utf8");
  info.warnings.forEach((w) => console.warn("WARNING: " + w));
} else {
  console.warn('No "youtube" block in the script, so no upload text file was written.');
}
console.log(`\nDone: out/${slug}.mp4${script.thumbnail ? ` and out/${slug}-thumbnail.png` : ""}${info ? ` and out/${slug}-upload.txt` : ""}`);
