export type Media = {
  type: "image" | "video";
  /** Path inside /public, e.g. "media/chart.png" or "media/clip.mp4" */
  src: string;
  /**
   * "background": fills the whole screen behind the text (dimmed by theme overlay)
   * "card": shown as a rounded picture/clip in the middle of the scene
   * "sticker": a logo/small picture that spins in above the bigText (e.g. a company logo)
   */
  mode?: "background" | "card" | "sticker";
  /** cover = fill & crop, contain = show whole thing. Default: cover */
  fit?: "cover" | "contain";
  /** Videos only: start playing from this many seconds into the file. */
  startFromSeconds?: number;
  /** Videos only: keep original audio. Default false (muted). */
  withAudio?: boolean;
};

/** A sound effect from src/sfx.ts placed inside a scene. */
export type SceneSfx = {
  /** Name from the catalog in src/sfx.ts, e.g. "whoosh", "pop-in", "coin" */
  name: string;
  /** Seconds after the scene starts. Default 0. */
  at?: number;
  /** 0 to 1. Default 0.4 (keeps the narration clearly on top). */
  volume?: number;
};

type Tone = "danger" | "growth" | "gold";

/** Animated explainer diagram shown in the middle of a scene instead of bigText (src/components/Visuals.tsx). */
export type Visual =
  | { type: "flow"; from: string; fromLabel?: string; to: string; toLabel?: string; item?: string; tag?: string }
  | { type: "meter"; from: number; to: number; min?: number; max?: number; suffix?: string; label?: string; note?: string; tone?: Tone }
  | { type: "stamps"; items: string[]; stamp: string; tone?: Tone }
  | { type: "balloon"; emoji?: string; label?: string; mode?: "deflate" | "inflate"; stamp?: string }
  | { type: "bars"; label?: string; tone?: Tone }
  | { type: "list"; items: string[]; fontSize?: number }
  | { type: "cta"; buttons?: { emoji: string; label: string }[]; done?: string };

export type SceneConfig = {
  /** How long this scene lasts. Total video length = sum of all scenes. */
  seconds: number;
  headline?: string;
  sub?: string;
  /** Large highlighted text/number in the middle (e.g. "₹1.7 Cr"). */
  bigText?: string;
  /**
   * How bigText appears. Default: "count" if it contains a number (numbers count up from 0), else "pop".
   * "slam" = drops in hard with a shake, "type" = typewriter, "pop" = bouncy zoom.
   */
  bigTextAnim?: "count" | "slam" | "pop" | "type";
  /** Extra punch when the scene starts: "shake" = screen shake, "flash" = white flash. */
  emphasis?: "shake" | "flash";
  /** Animated diagram in the middle of the scene (replaces bigText). */
  visual?: Visual;
  /** Small print at the bottom of the scene, e.g. a disclaimer. */
  note?: string;
  media?: Media;
  /** Narration text for this scene (use Devanagari for Hindi). `npm run voice` turns it into audio and sets `seconds`. */
  voice?: string;
  /** Caption text shown word by word (Roman Hinglish, same punctuation as `voice`). Defaults to `voice`. */
  caption?: string;
  /** Word timings, filled in by `npm run captions` (seconds from scene start). */
  captions?: { text: string; start: number; end: number }[];
  /** When the narrator is speaking, filled in by `npm run captions`. Used to duck the music. */
  speech?: [number, number][];
  /** Narration clip in /public — filled in by `npm run voice`. */
  audio?: string;
  /** Fingerprint of the narration that produced `audio` (voice text + speaker + pace). Lets `npm run voice` skip unchanged scenes. */
  voiceKey?: string;
  /** Sound effects for this scene (see src/sfx.ts for names). */
  sfx?: SceneSfx[];
};

export type ThumbnailConfig = {
  /** Small sticker at the top, e.g. "BREAKING", "EMI ALERT", "SAVE THIS". */
  tag?: string;
  /** One big emoji above the text. */
  emoji?: string;
  /** A logo from /public shown instead of the emoji, e.g. "media/jio-logo.png". */
  logo?: string;
  /** The huge gold words (keep it to 1 to 3 short words, e.g. "₹1.48 LAKH"). */
  highlight: string;
  /** White line under it (6 words max works best). */
  title?: string;
  /** Optional background photo from /public (dimmed behind the text), e.g. "media/gold.jpg". */
  image?: string;
};

export type YoutubeConfig = {
  /** Under 70 characters, keyword first, curiosity second. */
  title: string;
  /** First 1 to 2 sentences matter most for search: put the main keywords there. */
  description: string;
  bullets?: string[];
  /** 3 hashtags max, must include #Shorts (added automatically if missing). */
  hashtags?: string[];
  /** Search keywords, 500 characters in total at most. */
  tags?: string[];
  pinnedComment?: string;
  category?: string;
};

export type ShortScript = {
  /** Text for out/<slug>-upload.txt (title, description, tags...). Not shown in the video. */
  youtube?: YoutubeConfig;
  /** YouTube thumbnail (1080x1920). Rendered by `npm run render:video` to out/<slug>-thumbnail.png */
  thumbnail?: ThumbnailConfig;
  /** Optional narration/music in /public, e.g. "media/voiceover.mp3" */
  voiceover?: string;
  /** Background music in /public. Default: theme.music.src. "none" = no music. */
  music?: string;
  musicVolume?: number;
  scenes: SceneConfig[];
};
