import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { theme } from "./theme";
import type { ThumbnailConfig } from "./types";

const W = 1080;

export const Thumbnail: React.FC<{ thumbnail: ThumbnailConfig }> = ({ thumbnail }) => {
  const { colors, fonts, brand } = theme;
  const { tag, emoji, logo, highlight, title, image } = thumbnail;

  // Fit the highlight on one line using rough per-character widths (in em) for this bold font.
  const em = [...highlight.toUpperCase()].reduce((sum, ch) => {
    if (ch === " ") return sum + 0.3;
    if (".,:!|'".includes(ch)) return sum + 0.32;
    if (/[0-9₹]/.test(ch)) return sum + 0.64;
    return sum + 0.8;
  }, 0);
  const hlSize = Math.min(300, Math.floor(930 / Math.max(em, 2)));
  const outline = "0 0 0 #000";
  const heavyShadow = `0 10px 0 rgba(0,0,0,0.55), 0 0 40px rgba(0,0,0,0.6), ${outline}`;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, ${colors.bgFrom}, ${colors.bgMid} 55%, ${colors.bgTo})`,
        fontFamily: fonts.heading,
        overflow: "hidden",
      }}
    >
      {image ? (
        <>
          <Img src={staticFile(image)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(5,10,25,0.75), rgba(5,10,25,0.55) 50%, rgba(5,10,25,0.85))" }} />
        </>
      ) : null}

      {/* glow behind the emoji */}
      <div
        style={{
          position: "absolute",
          left: W / 2 - 520,
          top: 380,
          width: 1040,
          height: 1040,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${colors.accent2}55 0%, ${colors.accent2}00 65%)`,
        }}
      />
      {/* diagonal accent bands */}
      <div style={{ position: "absolute", left: -200, top: 1180, width: 1600, height: 110, background: colors.accent, opacity: 0.9, transform: "rotate(-8deg)" }} />
      <div style={{ position: "absolute", left: -200, top: 1310, width: 1600, height: 40, background: colors.accent2, opacity: 0.9, transform: "rotate(-8deg)" }} />

      {/* top: channel + tag */}
      <div style={{ position: "absolute", top: 120, left: 70, right: 70, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 40, whiteSpace: "nowrap", fontWeight: 800, color: colors.text, background: "rgba(0,0,0,0.45)", padding: "14px 26px", borderRadius: 60, border: `3px solid ${colors.accent}` }}>
          {brand.handle || brand.name}
        </div>
        {tag ? (
          <div style={{ fontSize: 46, whiteSpace: "nowrap", fontWeight: 900, color: "#fff", background: colors.danger, padding: "14px 30px", borderRadius: 18, transform: "rotate(4deg)", boxShadow: "0 8px 0 rgba(0,0,0,0.4)", letterSpacing: 2 }}>
            {tag.toUpperCase()}
          </div>
        ) : null}
      </div>

      {logo ? (
        <Img
          src={staticFile(logo)}
          style={{ position: "absolute", top: 330, left: W / 2 - 210, width: 420, height: 420, objectFit: "contain", filter: "drop-shadow(0 25px 40px rgba(0,0,0,0.6))" }}
        />
      ) : emoji ? (
        <div style={{ position: "absolute", top: 330, width: "100%", textAlign: "center", fontSize: 420, lineHeight: 1, filter: "drop-shadow(0 25px 40px rgba(0,0,0,0.6))" }}>
          {emoji}
        </div>
      ) : null}

      {/* the hook */}
      <div style={{ position: "absolute", top: 860, width: "100%", textAlign: "center", padding: "0 40px" }}>
        <div
          style={{
            fontSize: hlSize,
            fontWeight: 900,
            lineHeight: 1.05,
            color: colors.accent2,
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            textShadow: heavyShadow,
            WebkitTextStroke: "10px #000",
            paintOrder: "stroke fill",
          }}
        >
          {highlight}
        </div>
      </div>

      {title ? (
        <div
          style={{
            position: "absolute",
            top: 1420,
            width: "100%",
            textAlign: "center",
            padding: "0 70px",
            fontSize: 108,
            fontWeight: 900,
            lineHeight: 1.12,
            color: colors.text,
            textTransform: "uppercase",
            textShadow: heavyShadow,
            WebkitTextStroke: "8px #000",
            paintOrder: "stroke fill",
          }}
        >
          {title}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
