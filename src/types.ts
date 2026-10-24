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
};

export type ShortScript = {
  /** Optional narration/music in /public, e.g. "media/voiceover.mp3" */
  voiceover?: string;
  music?: string;
  musicVolume?: number;
  scenes: SceneConfig[];
};
