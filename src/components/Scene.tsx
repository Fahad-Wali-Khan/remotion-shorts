import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { sfx, sfxMaxSeconds, type SfxName } from "../sfx";
import { EmojiText } from "./Emoji";
import { VisualView } from "./Visuals";
import { theme } from "../theme";
import type { Media, SceneConfig } from "../types";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const MediaLayer: React.FC<{ media: Media; style?: React.CSSProperties }> = ({
  media,
  style,
}) => {
  const { fps } = useVideoConfig();
  const common: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: media.fit ?? "cover",
    ...style,
  };
  if (media.type === "image") {
    return <Img src={staticFile(media.src)} style={common} />;
  }
  return (
    <OffthreadVideo
      src={staticFile(media.src)}
      startFrom={Math.round((media.startFromSeconds ?? 0) * fps)}
      muted={!media.withAudio}
      style={common}
    />
  );
};

/** Replaces every number in `text` with its value at `progress` (0..1), keeping decimals and Indian commas. */
const countUp = (text: string, progress: number) =>
  text.replace(/\d[\d,]*(\.\d+)?/g, (match) => {
    const decimals = match.split(".")[1]?.length ?? 0;
    const value = parseFloat(match.replace(/,/g, "")) * progress;
    const formatted = value.toLocaleString("en-IN", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    return match.includes(",") ? formatted : formatted.replace(/,/g, "");
  });

/** Headline that pops in word by word, with a growing underline. */
const Headline: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors, fonts, sizes } = theme;
  const words = text.split(" ");
  const underline = spring({ frame: frame - words.length * 2 - 4, fps, config: { damping: 15 } });
  return (
    <div>
      <div
        style={{
          fontFamily: fonts.heading,
          fontSize: sizes.headline,
          fontWeight: 900,
          color: colors.text,
          lineHeight: 1.1,
        }}
      >
        {words.map((w, i) => {
          const p = spring({ frame: frame - i * 2, fps, config: { damping: 11, stiffness: 160 } });
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                marginRight: "0.25em",
                opacity: Math.min(1, p * 1.5),
                transform: `translateY(${(1 - p) * 50}px) scale(${0.6 + 0.4 * p})`,
              }}
            >
              <EmojiText text={w} />
            </span>
          );
        })}
      </div>
      <div
        style={{
          margin: "22px auto 0",
          height: 10,
          width: 180 * underline,
          borderRadius: 5,
          background: `linear-gradient(90deg, ${colors.accent}, ${colors.accent2})`,
        }}
      />
    </div>
  );
};

/** The big number / word in the middle: entrance animation, then a gentle pulse and glow. */
const BigText: React.FC<{ text: string; anim: NonNullable<SceneConfig["bigTextAnim"]> }> = ({
  text,
  anim,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors, fonts, sizes } = theme;
  const start = 6; // let the headline land first

  let shown = text;
  let scale = 1;
  let opacity = 1;
  let rotate = 0;
  if (anim === "count") {
    const p = interpolate(frame, [start, start + 28], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
    shown = countUp(text, p);
    scale = 0.5 + 0.5 * spring({ frame: frame - start, fps, config: { damping: 10 } });
    opacity = interpolate(frame, [start, start + 4], [0, 1], clamp);
  } else if (anim === "slam") {
    const p = spring({ frame: frame - start, fps, config: { damping: 14, stiffness: 300, mass: 0.6 } });
    scale = 2.6 - 1.6 * p;
    opacity = interpolate(frame, [start, start + 3], [0, 1], clamp);
    rotate = (1 - p) * -8;
  } else if (anim === "type") {
    const chars = [...text];
    const n = Math.floor(interpolate(frame, [start, start + chars.length * 1.5], [0, chars.length], clamp));
    shown = chars.slice(0, n).join("");
  } else {
    scale = spring({ frame: frame - start, fps, config: { damping: 9, stiffness: 140 } });
  }

  // after the entrance: breathe + glow
  const settled = frame - start - 25;
  const breathe = settled > 0 ? 1 + 0.025 * Math.sin(settled / 9) : 1;
  const glow = settled > 0 ? 18 + 14 * (0.5 + 0.5 * Math.sin(settled / 9)) : 18;

  return (
    <div
      style={{
        fontFamily: fonts.heading,
        fontSize: sizes.bigText,
        fontWeight: 900,
        lineHeight: 1.15,
        color: colors.accent2,
        opacity,
        transform: `scale(${scale * breathe}) rotate(${rotate}deg)`,
        textShadow: `0 0 ${glow}px ${colors.accent2}88, 0 8px 0 rgba(0,0,0,0.35)`,
      }}
    >
      <EmojiText text={shown} />
      {anim === "type" && shown.length < text.length ? <span style={{ opacity: 0.6 }}>|</span> : null}
    </div>
  );
};

/** A logo / small picture that pops in with a spin and then floats gently. */
const Sticker: React.FC<{ media: Media }> = ({ media }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - 2, fps, config: { damping: 10, stiffness: 120 } });
  const float = Math.sin(frame / 14) * 10;
  return (
    <div
      style={{
        width: 300,
        height: 300,
        margin: "0 auto 30px",
        transform: `translateY(${float}px) scale(${p}) rotate(${(1 - p) * -180}deg)`,
        filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.5))",
      }}
    >
      <MediaLayer media={{ ...media, fit: media.fit ?? "contain" }} />
    </div>
  );
};

/** Word-by-word captions: a few words at a time, the spoken word highlighted. */
const Captions: React.FC<{ words: NonNullable<SceneConfig["captions"]> }> = ({ words }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { captions, fonts } = theme;
  const t = frame / fps;

  // group into chunks of up to maxWords, breaking after punctuation
  const chunks: (typeof words)[] = [];
  let cur: typeof words = [];
  for (const w of words) {
    cur.push(w);
    if (cur.length >= captions.maxWords || /[,.!?।;:]$/.test(w.text)) {
      chunks.push(cur);
      cur = [];
    }
  }
  if (cur.length) chunks.push(cur);

  const idx = chunks.findIndex((c, i) => t >= c[0].start && t < (chunks[i + 1]?.[0].start ?? c[c.length - 1].end + 0.6));
  if (idx < 0) return null;
  const chunk = chunks[idx];
  const pop = spring({ frame: frame - Math.round(chunk[0].start * fps), fps, config: { damping: 12, stiffness: 200 } });

  return (
    <div
      style={{
        fontFamily: fonts.heading,
        fontSize: captions.fontSize,
        fontWeight: 900,
        lineHeight: 1.15,
        textTransform: "uppercase",
        transform: `scale(${0.8 + 0.2 * pop})`,
        opacity: pop,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        columnGap: "0.5em",
      }}
    >
      {chunk.map((w, i) => {
        const active = t >= w.start && t < (chunk[i + 1]?.start ?? w.end + 0.6);
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              color: active ? captions.highlight : captions.color,
              transform: `scale(${active ? 1.08 : 1})`,
              WebkitTextStroke: "8px #000",
              paintOrder: "stroke fill",
              textShadow: "0 6px 0 rgba(0,0,0,0.45)",
            }}
          >
            {w.text.replace(/[,.।;:]$/, "")}
          </span>
        );
      })}
    </div>
  );
};

export const Scene: React.FC<{ scene: SceneConfig; index?: number }> = ({ scene, index = 0 }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const { colors, fonts, sizes, safeArea, motion } = theme;

  // scene enters from alternating sides, slowly pushes in, then fades/zooms out
  // The first scene must look complete on frame 0 (it is what people see before deciding to swipe):
  // no slide-in, no flash, and its animations get a head start. Audio and captions are not shifted.
  const intro = index === 0 ? 40 : 0; // 40 frames: count-ups and pops have finished
  const enter = index === 0 ? 1 : spring({ frame, fps, config: { damping: 16, stiffness: 120 } });
  const side = index % 2 === 0 ? 1 : -1;
  const exit = interpolate(frame, [durationInFrames - motion.fadeFrames, durationInFrames], [0, 1], clamp);
  const push = interpolate(frame, [0, durationInFrames], [1, 1.05]);
  const shaking = scene.emphasis === "shake" || (scene.bigTextAnim === "slam" && frame > 10);
  const shake = shaking ? Math.sin(frame * 2.3) * interpolate(frame, [0, 24], [26, 0], clamp) : 0;
  const flash = scene.emphasis === "flash" && index > 0 ? interpolate(frame, [0, 10], [0.85, 0], clamp) : 0;

  const subIn = spring({ frame: frame - 12 + intro, fps, config: { damping: 14 } });
  const mediaPop = spring({ frame: frame - 4 + intro, fps, config: { damping: 12 } });

  const media = scene.media;
  const mode = media?.mode ?? "card";
  const anim = scene.bigTextAnim ?? (scene.bigText && /\d/.test(scene.bigText) ? "count" : "pop");

  return (
    <AbsoluteFill style={{ opacity: 1 - exit }}>
      {scene.audio ? <Audio src={staticFile(scene.audio)} /> : null}
      {(scene.sfx ?? []).map((fx, i) => {
        if (!(fx.name in sfx)) {
          throw new Error(`Unknown sound effect "${fx.name}". See src/sfx.ts for available names.`);
        }
        const name = fx.name as SfxName;
        const max = sfxMaxSeconds[name];
        return (
          <Sequence key={i} from={Math.round((fx.at ?? 0) * fps)} layout="none">
            <Audio
              src={staticFile(sfx[name])}
              volume={fx.volume ?? 0.4}
              trimAfter={max ? Math.round(max * fps) : undefined}
            />
          </Sequence>
        );
      })}
      {media && mode === "background" ? (
        <>
          <AbsoluteFill style={{ transform: `scale(${push * 1.05})` }}>
            <MediaLayer media={media} />
          </AbsoluteFill>
          <AbsoluteFill style={{ background: colors.overlay }} />
        </>
      ) : null}

      <AbsoluteFill
        style={{
          fontFamily: fonts.body,
          textAlign: "center",
          paddingLeft: safeArea.side,
          paddingRight: safeArea.side,
          paddingTop: safeArea.top,
          paddingBottom: safeArea.bottom + (scene.note ? 60 : 0), // room for the small print
          display: "flex",
          flexDirection: "column",
          opacity: Math.min(1, enter * 1.4),
          transform: `translateX(${(1 - enter) * 140 * side + shake}px) translateY(${shake * 0.4}px) scale(${push * (1 + exit * 0.08)})`,
        }}
      >
        <Sequence from={-intro} layout="none">
          {scene.headline ? <Headline text={scene.headline} /> : null}
        </Sequence>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 0,
            padding: "30px 0",
          }}
        >
          {media && mode === "card" ? (
            <div
              style={{
                width: "100%",
                height: "100%",
                borderRadius: 36,
                overflow: "hidden",
                boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
                transform: `scale(${mediaPop}) rotate(${(1 - mediaPop) * 6 * side}deg)`,
              }}
            >
              <MediaLayer media={media} />
            </div>
          ) : (
            <Sequence from={-intro} layout="none">
              {media && mode === "sticker" ? <Sticker media={media} /> : null}
              {scene.visual ? (
                <VisualView visual={scene.visual} />
              ) : scene.bigText ? (
                <BigText text={scene.bigText} anim={anim} />
              ) : null}
            </Sequence>
          )}
        </div>

        {theme.captions.enabled && scene.captions?.length ? (
          <div style={{ height: 230, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Captions words={scene.captions} />
          </div>
        ) : null}

        {scene.sub ? (
          <div
            style={{
              fontSize: sizes.sub,
              color: colors.accent,
              opacity: subIn,
              transform: `translateY(${(1 - subIn) * 40}px)`,
              lineHeight: 1.3,
            }}
          >
            {scene.sub}
          </div>
        ) : null}
      </AbsoluteFill>
      {scene.note ? (
        <div
          style={{
            position: "absolute",
            left: safeArea.side,
            right: safeArea.side,
            bottom: safeArea.bottom - 50,
            textAlign: "center",
            fontFamily: fonts.body,
            fontSize: 28,
            color: colors.text,
            opacity: 0.75 * subIn,
          }}
        >
          {scene.note}
        </div>
      ) : null}
      {flash > 0 ? <AbsoluteFill style={{ background: "#fff", opacity: flash }} /> : null}
    </AbsoluteFill>
  );
};
