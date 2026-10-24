export type Media = {
  type: "image" | "video";
  /** Path inside /public, e.g. "media/chart.png" or "media/clip.mp4" */
  src: string;
  /**
   * "background": fills the whole screen behind the text (dimmed by theme overlay)
   * "card": shown as a rounded picture/clip in the middle of the scene
   */
  mode?: "background" | "card";
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

export type SceneConfig = {
  /** How long this scene lasts. Total video length = sum of all scenes. */
  seconds: number;
  headline?: string;
  sub?: string;
  /** Large highlighted text/number in the middle (e.g. "₹1.7 Cr"). */
  bigText?: string;
  media?: Media;
  /** Narration text for this scene (use Devanagari for Hindi). `npm run voice` turns it into audio and sets `seconds`. */
  voice?: string;
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
  music?: string;
  musicVolume?: number;
  scenes: SceneConfig[];
};
