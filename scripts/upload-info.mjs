// Usage: npm run upload-info -- <slug>      (also runs automatically inside `npm run render:video`)
// Writes out/<slug>-upload.txt: everything to paste into YouTube Studio for this Short.
// Content comes from the `youtube` block of videos/<slug>.json:
//   { "title", "description", "bullets": [], "hashtags": [], "tags": [], "pinnedComment", "category" }
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

// Channel-wide text. The handle is read from src/theme.ts.
const handle = readFileSync("src/theme.ts", "utf8").match(/handle:\s*"([^"]*)"/)?.[1] ?? "";
const CTA = `Roz aise hi paise ki baat ke liye ${handle} ko follow karein 🔔`;
const DISCLAIMER =
  "Disclaimer: Yeh video sirf educational jaankari ke liye hai, financial advice nahi. Invest karne se pehle apna research karein ya SEBI-registered advisor se salaah lein.";

export function buildUploadInfo(slug, script) {
  const y = script.youtube;
  if (!y) return null;
  const warnings = [];

  const title = y.title.trim();
  if ([...title].length > 70) warnings.push(`Title is ${[...title].length} characters; keep it at 70 or less so it isn't cut off.`);

  const hashtags = (y.hashtags ?? []).map((h) => (h.startsWith("#") ? h : `#${h}`));
  if (!hashtags.some((h) => h.toLowerCase() === "#shorts")) hashtags.push("#Shorts");
  if (hashtags.length > 3) warnings.push(`${hashtags.length} hashtags; 3 is the sweet spot (YouTube shows the first 3 above the title, more looks spammy).`);

  const tags = [...new Set((y.tags ?? []).map((t) => t.trim().toLowerCase()).filter(Boolean))];
  const tagLine = tags.join(", ");
  if (tagLine.length > 500) warnings.push(`Tags are ${tagLine.length} characters; YouTube allows 500 at most.`);

  const description = [
    y.description.trim(),
    y.bullets?.length ? "\n" + y.bullets.map((b) => `• ${b}`).join("\n") : "",
    "\n" + CTA,
    "\n" + DISCLAIMER,
    "\n" + hashtags.join(" "),
  ]
    .join("\n")
    .replace(/\n{3,}/g, "\n\n");

  const durationSec = script.scenes.reduce((s, x) => s + x.seconds, 0);
  if (durationSec > 180) warnings.push(`Video is ${Math.round(durationSec)}s; Shorts must be 3 minutes or shorter.`);

  const text = `YOUTUBE UPLOAD INFO: ${slug}
(video: ${slug}.mp4 | thumbnail: ${slug}-thumbnail.png)
${warnings.length ? "\nWARNINGS\n" + warnings.map((w) => "- " + w).join("\n") + "\n" : ""}
=== TITLE ===
${title}

=== DESCRIPTION ===
${description}

=== TAGS (paste into "Tags" under Show more) ===
${tagLine}

=== PINNED COMMENT (post it right after publishing, then pin it) ===
${y.pinnedComment ?? ""}

=== SETTINGS ===
- Audience: No, it's not made for kids
- Category: ${y.category ?? "Education"}
- Video language: Hindi
- Visibility: Public (post when your audience is online, evenings 6 to 9 pm IST work well for finance)
- Subtitles: add Hindi captions if you can (most Shorts are watched on mute)
- Thumbnail: ${slug}-thumbnail.png (check in YouTube Studio whether your Shorts allow a custom thumbnail)
`;
  return { text, warnings };
}

if (process.argv[1]?.endsWith("upload-info.mjs")) {
  const slug = process.argv[2]?.replace(/\.json$/, "");
  if (!slug || !existsSync(`videos/${slug}.json`)) {
    console.error("Usage: npm run upload-info -- <slug>");
    process.exit(1);
  }
  const script = JSON.parse(readFileSync(`videos/${slug}.json`, "utf8")).script;
  const info = buildUploadInfo(slug, script);
  if (!info) {
    console.error(`videos/${slug}.json has no "youtube" block.`);
    process.exit(1);
  }
  mkdirSync("out", { recursive: true });
  writeFileSync(`out/${slug}-upload.txt`, "﻿" + info.text.replace(/\n/g, "\r\n"), "utf8");
  console.log(`Wrote out/${slug}-upload.txt${info.warnings.length ? `  (${info.warnings.length} warning(s), see top of file)` : ""}`);
}
