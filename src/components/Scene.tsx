import React from "react";
import {
  AbsoluteFill,
  Img,
  OffthreadVideo,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { theme } from "../theme";
import type { Media, SceneConfig } from "../types";

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

export const Scene: React.FC<{ scene: SceneConfig }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const { colors, fonts, sizes, safeArea, motion } = theme;

  const pop = spring({ frame, fps, config: { damping: 12 } });
  const fadeOut = interpolate(
    frame,
    [durationInFrames - motion.fadeFrames, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const subOpacity = interpolate(frame, [10, 22], [0, 1], {
    extrapolateRight: "clamp",
  });

  const media = scene.media;
  const isBackground = media && (media.mode ?? "card") === "background";
  const isCard = media && !isBackground;

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      {media && isBackground ? (
        <>
          <AbsoluteFill>
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
          paddingBottom: safeArea.bottom,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {scene.headline ? (
          <div
            style={{
              fontFamily: fonts.heading,
              fontSize: sizes.headline,
              fontWeight: 900,
              color: colors.text,
              lineHeight: 1.1,
              transform: `scale(${0.7 + 0.3 * pop})`,
            }}
          >
            {scene.headline}
          </div>
        ) : null}

        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 0,
            padding: "30px 0",
          }}
        >
          {isCard && media ? (
            <div
              style={{
                width: "100%",
                height: "100%",
                borderRadius: 36,
                overflow: "hidden",
                boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
                transform: `scale(${pop})`,
              }}
            >
              <MediaLayer media={media} />
            </div>
          ) : scene.bigText ? (
            <div
              style={{
                fontFamily: fonts.heading,
                fontSize: sizes.bigText,
                fontWeight: 900,
                color: colors.accent2,
                transform: `scale(${pop})`,
              }}
            >
              {scene.bigText}
            </div>
          ) : null}
        </div>

        {scene.sub ? (
          <div
            style={{
              fontSize: sizes.sub,
              color: colors.accent,
              opacity: subOpacity,
              lineHeight: 1.3,
            }}
          >
            {scene.sub}
          </div>
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
