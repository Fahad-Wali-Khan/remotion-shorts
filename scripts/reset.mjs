// Restores the blank script and clears per-video media and renders.
import { copyFileSync, existsSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";

copyFileSync("scripts/script.blank.txt", "src/script.ts");

for (const dir of ["public/media", "out"]) {
  if (!existsSync(dir)) continue;
  for (const f of readdirSync(dir)) {
    if (f === ".gitkeep") continue;
    rmSync(join(dir, f), { recursive: true, force: true });
  }
}
console.log("Reset done: blank script restored, public/media and out cleared.");
