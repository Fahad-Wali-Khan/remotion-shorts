// Usage: npm run check:voice -- videos/<file>.json
// Checks every scene's `voice` text BEFORE paying for audio, so pauses and pronunciation come out natural.
// Errors block `npm run voice`; warnings are only advice.
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const MAX_CHARS = 2500; // Sarvam per-request limit
const MAX_WORDS_PER_SENTENCE = 20;

/** Returns { errors: string[], warnings: string[] } for one narration string. */
export function checkVoice(text) {
  const errors = [];
  const warnings = [];
  const t = (text ?? "").trim();

  if (!t) return { errors: ["voice text is empty"], warnings };
  if ([...t].length > MAX_CHARS) errors.push(`longer than ${MAX_CHARS} characters, split the scene`);

  if (!/[ऀ-ॿ]/.test(t)) {
    errors.push("no Devanagari (Hindi) letters. Romanized Hinglish is read badly, write the narration in Devanagari");
  }
  if (/[A-Za-z]/.test(t)) {
    errors.push("contains English letters. Write English words in Devanagari (e.g. UPI -> यूपीआई, EMI -> ईएमआई)");
  }
  if (/[0-9]/.test(t)) {
    errors.push("contains digits. Write numbers as words (e.g. 5.54% -> पाँच दशमलव पाँच चार परसेंट)");
  }
  if (/[₹$%&+=/@#*_~<>|\\]/.test(t)) {
    errors.push("contains symbols (₹ % & + = / @ #). Spell them out in words (रुपये, परसेंट, और)");
  }
  if (/\.{2,}|…/.test(t)) {
    warnings.push("ellipsis (...) gives an unpredictable pause, use a comma or full stop");
  }
  if (!/[।.?!]$/.test(t)) {
    errors.push("must end with a full stop (।), ? or ! so the voice lands the sentence properly");
  }

  const sentences = t.split(/(?<=[।.?!])\s+/).filter(Boolean);
  for (const s of sentences) {
    const words = s.split(/\s+/).filter(Boolean).length;
    if (words > MAX_WORDS_PER_SENTENCE) {
      warnings.push(`long sentence (${words} words), split it for natural breathing: "${s.slice(0, 40)}..."`);
    } else if (words > 12 && !/[,;]/.test(s)) {
      warnings.push(`no comma in a ${words}-word sentence, add commas where a speaker would pause: "${s.slice(0, 40)}..."`);
    }
  }
  return { errors, warnings };
}

/** Checks all scenes of a script object. Prints findings, returns number of errors. */
export function checkScript(script, { quiet = false } = {}) {
  let errorCount = 0;
  let checked = 0;
  for (const [i, scene] of script.scenes.entries()) {
    if (!scene.voice) continue;
    checked++;
    const { errors, warnings } = checkVoice(scene.voice);
    errorCount += errors.length;
    if (!quiet) {
      for (const e of errors) console.log(`  ERROR   scene ${i + 1}: ${e}`);
      for (const w of warnings) console.log(`  warning scene ${i + 1}: ${w}`);
    }
  }
  if (!quiet) {
    console.log(
      checked === 0
        ? "No scene has a `voice` text."
        : errorCount === 0
          ? `Voice check passed (${checked} scenes).`
          : `Voice check failed: ${errorCount} error(s).`,
    );
  }
  return errorCount;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const file = process.argv[2];
  if (!file) {
    console.error("Usage: npm run check:voice -- videos/<file>.json");
    process.exit(1);
  }
  const data = JSON.parse(readFileSync(file, "utf8"));
  process.exit(checkScript(data.script ?? data) === 0 ? 0 : 1);
}
