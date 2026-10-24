// Wipes everything that belongs to individual videos: videos/*.json, public/media/*, out/*.
// The theme, template code and .env are never touched.
import { copyFileSync, existsSync, readdirSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

copyFileSync("scripts/script.blank.txt", "src/script.ts");

for (const dir of ["videos", "public/media", "out"]) {
  if (!existsSync(dir)) continue;
  for (const f of readdirSync(dir)) {
    if (f === ".gitkeep") continue;
    rmSync(join(dir, f), { recursive: true, force: true });
  }
}
execFileSync("node", ["scripts/sync-videos.mjs"], { stdio: "inherit" });
console.log("Reset done: videos/, public/media/ and out/ cleared.");
