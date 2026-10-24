// Usage: npm run render:video -- <slug>     (slug = file name in videos/ without .json)
// Renders out/<slug>.mp4. Refuses to render if a scene has narration text but no audio yet.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

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

execFileSync("node", ["scripts/sync-videos.mjs"], { stdio: "inherit" });
const port = 3100 + Math.floor(Math.random() * 800); // keeps clear of a running Studio on :3000
execFileSync("npx", ["remotion", "render", slug.replace(/[^a-zA-Z0-9-]/g, "-"), `out/${slug}.mp4`, `--port=${port}`], {
  stdio: "inherit",
  shell: true,
});
console.log(`\nDone: out/${slug}.mp4`);
