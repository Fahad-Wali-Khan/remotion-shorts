import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Scene } from "./components/Scene";
import { theme } from "./theme";
import type { ShortScript } from "./types";

export const Short: React.FC<{ script: ShortScript }> = ({ script }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width } = useVideoConfig();
  const { colors, brand, safeArea } = theme;

  let cursor = 0;
  const timeline = script.scenes.map((scene) => {
    const from = cursor;
    const length = Math.round(scene.seconds * fps);
    cursor += length;
    return { scene, from, length };
  });

  const progress = interpolate(
    frame,
    [0, durationInFrames],
    [0, width - safeArea.side * 2],
  );

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, ${colors.bgFrom}, ${colors.bgMid} 60%, ${colors.bgTo})`,
      }}
    >
      {/* moving background: two drifting glows + floating rupee symbols */}
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          borderRadius: "50%",
          left: -300 + Math.sin(frame / 70) * 160,
          top: 200 + Math.cos(frame / 90) * 200,
          background: `radial-gradient(circle, ${colors.accent}22 0%, transparent 65%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 1000,
          height: 1000,
          borderRadius: "50%",
          right: -380 + Math.cos(frame / 80) * 180,
          top: 900 + Math.sin(frame / 60) * 220,
          background: `radial-gradient(circle, ${colors.accent2}1f 0%, transparent 65%)`,
        }}
      />
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: (i * 137 + 40) % 1040,
            top: 1920 - ((frame * (1.5 + (i % 3) * 0.8) + i * 230) % 2150),
            fontSize: 50 + (i % 3) * 30,
            fontWeight: 900,
            fontFamily: theme.fonts.heading,
            color: "rgba(255,255,255,0.06)",
            transform: `rotate(${Math.sin((frame + i * 40) / 30) * 20}deg)`,
          }}
        >
          ₹
        </div>
      ))}

      {timeline.map(({ scene, from, length }, i) => (
        <Sequence key={i} from={from} durationInFrames={length}>
          <Scene scene={scene} index={i} />
        </Sequence>
      ))}

      {script.voiceover ? <Audio src={staticFile(script.voiceover)} /> : null}
      {script.music ? (
        <Audio src={staticFile(script.music)} volume={script.musicVolume ?? 0.15} loop />
      ) : null}

      {brand.logo ? (
        <Img
          src={staticFile(brand.logo)}
          style={{ position: "absolute", top: 50, right: safeArea.side, height: 80 }}
        />
      ) : null}
      {brand.handle ? (
        <div
          style={{
            position: "absolute",
            bottom: safeArea.bottom - 90,
            left: safeArea.side,
            fontFamily: theme.fonts.body,
            fontSize: 36,
            color: colors.text,
            opacity: 0.7,
          }}
        >
          {brand.handle}
        </div>
      ) : null}
      {theme.showProgressBar ? (
        <div
          style={{
            position: "absolute",
            bottom: safeArea.bottom - 120,
            left: safeArea.side,
            height: 12,
            width: progress,
            background: colors.accent,
            borderRadius: 6,
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};
