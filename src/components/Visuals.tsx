// Explainer visuals: animated diagrams for the middle of a scene (instead of bigText).
// Set per scene with "visual": { "type": "flow" | "meter" | "stamps" | "balloon" | "bars" | "list", ... }
import React from "react";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";
import type { Visual } from "../types";
import { EmojiText } from "./Emoji";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const tone = (t?: "danger" | "growth" | "gold") =>
  t === "danger" ? theme.colors.danger : t === "growth" ? theme.colors.accent : theme.colors.accent2;
const label: React.CSSProperties = { fontFamily: theme.fonts.heading, fontWeight: 900, color: theme.colors.text };

/** A → B with an item flying along a glowing arc (e.g. RBI lends money to a bank). */
const Flow: React.FC<{ v: Extract<Visual, { type: "flow" }> }> = ({ v }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inA = spring({ frame, fps, config: { damping: 11 } });
  const inB = spring({ frame: frame - 8, fps, config: { damping: 11 } });
  const draw = interpolate(frame, [12, 40], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const t = ((frame - 30) % 40) / 40; // item flight loop
  const flying = frame > 30;
  // quadratic arc from (170, 560) to (770, 560) peaking at y=120
  const x = (1 - t) * (1 - t) * 170 + 2 * (1 - t) * t * 470 + t * t * 770;
  const y = (1 - t) * (1 - t) * 560 + 2 * (1 - t) * t * 60 + t * t * 560;
  const node = (emoji: string, name: string | undefined, p: number, left: number) => (
    <div style={{ position: "absolute", left: left - 150, top: 520, width: 300, textAlign: "center", transform: `scale(${p})` }}>
      <div style={{ fontSize: 210, lineHeight: 1 }}>
        <EmojiText text={emoji} />
      </div>
      {name ? <div style={{ ...label, fontSize: 60, marginTop: 10 }}>{name}</div> : null}
    </div>
  );
  return (
    <div style={{ position: "relative", width: 940, height: 860 }}>
      <svg width={940} height={860} style={{ position: "absolute", inset: 0 }}>
        <path
          d="M170 560 Q470 60 770 560"
          fill="none"
          stroke={theme.colors.accent2}
          strokeWidth={14}
          strokeLinecap="round"
          strokeDasharray="1000"
          strokeDashoffset={1000 * (1 - draw)}
          style={{ filter: `drop-shadow(0 0 18px ${theme.colors.accent2})` }}
        />
      </svg>
      {node(v.from, v.fromLabel, inA, 170)}
      {node(v.to, v.toLabel, inB, 770)}
      {flying ? (
        <div style={{ position: "absolute", left: x - 60, top: y - 60, fontSize: 110, lineHeight: 1 }}>
          <EmojiText text={v.item ?? "💸"} />
        </div>
      ) : null}
      {v.tag ? (
        <div
          style={{
            ...label,
            position: "absolute",
            left: 0,
            right: 0,
            top: 120,
            textAlign: "center",
            fontSize: 64,
            color: theme.colors.accent2,
            opacity: draw,
          }}
        >
          {v.tag}
        </div>
      ) : null}
    </div>
  );
};

/** Gauge whose needle and number move from `from` to `to`. */
const Meter: React.FC<{ v: Extract<Visual, { type: "meter" }> }> = ({ v }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = interpolate(frame, [8, 50], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const value = v.from + (v.to - v.from) * p;
  const min = v.min ?? Math.min(v.from, v.to) - 1;
  const max = v.max ?? Math.max(v.from, v.to) + 1;
  const angle = interpolate(value, [min, max], [-90, 90], clamp);
  const color = tone(v.tone);
  const pulse = frame > 50 ? 0.5 + 0.5 * Math.sin(frame / 5) : 0;
  const decimals = Math.max(String(v.from).split(".")[1]?.length ?? 0, String(v.to).split(".")[1]?.length ?? 0);
  const appear = spring({ frame, fps, config: { damping: 12 } });
  return (
    <div style={{ position: "relative", width: 800, height: 640, transform: `scale(${appear})` }}>
      <svg width={800} height={480} viewBox="0 0 800 480">
        <path d="M80 420 A320 320 0 0 1 720 420" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={56} strokeLinecap="round" />
        <path
          d="M80 420 A320 320 0 0 1 720 420"
          fill="none"
          stroke={color}
          strokeWidth={56}
          strokeLinecap="round"
          strokeDasharray="1006"
          strokeDashoffset={1006 * (1 - (angle + 90) / 180)}
          style={{ filter: `drop-shadow(0 0 ${14 + 20 * pulse}px ${color})` }}
        />
        <g transform={`rotate(${angle} 400 420)`}>
          <line x1={400} y1={420} x2={400} y2={150} stroke="#fff" strokeWidth={14} strokeLinecap="round" />
        </g>
        <circle cx={400} cy={420} r={30} fill="#fff" />
      </svg>
      <div style={{ ...label, position: "absolute", top: 450, width: "100%", textAlign: "center", fontSize: 130, color }}>
        {value.toFixed(decimals)}
        {v.suffix ?? ""}
      </div>
      {v.label ? (
        <div style={{ ...label, position: "absolute", top: 0, width: "100%", textAlign: "center", fontSize: 44, opacity: 0.85 }}>
          {v.label}
        </div>
      ) : null}
      {v.note ? (
        <div style={{ position: "absolute", top: 600, width: "100%", textAlign: "center", fontFamily: theme.fonts.body, fontSize: 30, color: theme.colors.text, opacity: 0.6 }}>
          {v.note}
        </div>
      ) : null}
    </div>
  );
};

/** Rows that appear one by one, each getting a stamp (e.g. "MEHENGA" in red, "APPROVED" in green). */
const Stamps: React.FC<{ v: Extract<Visual, { type: "stamps" }> }> = ({ v }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const color = tone(v.tone);
  const step = Math.max(12, Math.floor((durationInFrames * 0.7) / v.items.length));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 34, width: 900 }}>
      {v.items.map((item, i) => {
        const rowIn = spring({ frame: frame - i * 6, fps, config: { damping: 13 } });
        const stampAt = 10 + i * step;
        const s = spring({ frame: frame - stampAt, fps, config: { damping: 12, stiffness: 260, mass: 0.6 } });
        return (
          <div
            key={i}
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              height: 150,
              padding: "0 40px",
              borderRadius: 30,
              background: "rgba(255,255,255,0.08)",
              border: `3px solid ${frame >= stampAt ? color : "rgba(255,255,255,0.15)"}`,
              transform: `translateX(${(1 - rowIn) * -300}px)`,
              opacity: rowIn,
            }}
          >
            <div style={{ ...label, fontSize: 56 }}>
              <EmojiText text={item} />
            </div>
            {frame >= stampAt ? (
              <div
                style={{
                  ...label,
                  position: "absolute",
                  right: 30,
                  fontSize: 46,
                  color,
                  border: `6px solid ${color}`,
                  borderRadius: 14,
                  padding: "4px 18px",
                  transform: `rotate(-10deg) scale(${2.2 - 1.2 * s})`,
                  opacity: Math.min(1, s * 1.5),
                }}
              >
                {v.stamp}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

/** A big emoji balloon that deflates (or inflates) with a wobble, label on it, optional stamp at the end. */
const Balloon: React.FC<{ v: Extract<Visual, { type: "balloon" }> }> = ({ v }) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  const p = interpolate(frame, [10, durationInFrames * 0.75], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });
  const deflate = (v.mode ?? "deflate") === "deflate";
  const scale = deflate ? 1.25 - 0.8 * p : 0.45 + 0.8 * p;
  const wobble = Math.sin(frame / 3) * 6 * (deflate ? p : 1 - p);
  const drop = deflate ? p * 160 : 0;
  const stampAt = Math.floor(durationInFrames * 0.75);
  const s = spring({ frame: frame - stampAt, fps, config: { damping: 12, stiffness: 260, mass: 0.6 } });
  return (
    <div style={{ position: "relative", width: 900, height: 820, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ transform: `translateY(${drop}px) scale(${scale}) rotate(${wobble}deg)`, textAlign: "center" }}>
        <div style={{ fontSize: 420, lineHeight: 1 }}>
          <EmojiText text={v.emoji ?? "🎈"} />
        </div>
        {v.label ? (
          <div style={{ ...label, fontSize: 80, color: theme.colors.danger, WebkitTextStroke: "6px #000", paintOrder: "stroke fill" }}>
            {v.label}
          </div>
        ) : null}
      </div>
      {v.stamp && frame >= stampAt ? (
        <div
          style={{
            ...label,
            position: "absolute",
            fontSize: 96,
            color: theme.colors.accent,
            border: `8px solid ${theme.colors.accent}`,
            borderRadius: 20,
            padding: "6px 26px",
            transform: `rotate(-12deg) scale(${2.4 - 1.4 * s})`,
            opacity: Math.min(1, s * 1.5),
            background: "rgba(0,0,0,0.35)",
          }}
        >
          <EmojiText text={v.stamp} />
        </div>
      ) : null}
    </div>
  );
};

/** Bars that grow one after another, with a rising arrow (illustrative, no numbers). */
const Bars: React.FC<{ v: Extract<Visual, { type: "bars" }> }> = ({ v }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const color = tone(v.tone ?? "growth");
  const n = 6;
  const arrow = interpolate(frame, [n * 5 + 10, n * 5 + 35], [0, 1], clamp);
  return (
    <div style={{ position: "relative", width: 900, height: 820 }}>
      {v.label ? <div style={{ ...label, fontSize: 60, textAlign: "center", color }}>{v.label}</div> : null}
      <div style={{ position: "absolute", bottom: 40, left: 60, right: 60, display: "flex", alignItems: "flex-end", gap: 26, height: 600 }}>
        {Array.from({ length: n }).map((_, i) => {
          const g = spring({ frame: frame - 6 - i * 5, fps, config: { damping: 12 } });
          return (
            <div
              key={i}
              style={{
                flex: 1,
                height: (130 + i * 85) * g,
                borderRadius: "18px 18px 6px 6px",
                background: `linear-gradient(180deg, ${color}, ${color}66)`,
                boxShadow: `0 0 24px ${color}55`,
              }}
            />
          );
        })}
      </div>
      <svg width={900} height={820} style={{ position: "absolute", inset: 0 }}>
        <path
          d="M80 720 L820 170"
          stroke="#fff"
          strokeWidth={14}
          strokeLinecap="round"
          strokeDasharray="930"
          strokeDashoffset={930 * (1 - arrow)}
        />
        {arrow > 0.95 ? <path d="M820 170 l-70 8 l40 55 z" fill="#fff" /> : null}
      </svg>
    </div>
  );
};

/** Lines that slide in one after another (e.g. a disclaimer). */
const List: React.FC<{ v: Extract<Visual, { type: "list" }> }> = ({ v }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22, width: 900 }}>
      {v.items.map((item, i) => {
        const p = spring({ frame: frame - 4 - i * 5, fps, config: { damping: 14 } });
        return (
          <div
            key={i}
            style={{
              ...label,
              fontSize: v.fontSize ?? 50,
              padding: "18px 30px",
              borderRadius: 20,
              background: "rgba(255,255,255,0.08)",
              borderLeft: `10px solid ${theme.colors.accent2}`,
              textAlign: "left",
              opacity: p,
              transform: `translateX(${(1 - p) * 200}px)`,
            }}
          >
            {item}
          </div>
        );
      })}
    </div>
  );
};

/** Call-to-action buttons that pop in one by one; a hand taps the last one and it flips to `done`. */
const Cta: React.FC<{ v: Extract<Visual, { type: "cta" }> }> = ({ v }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const buttons = v.buttons ?? [
    { emoji: "📤", label: "SHARE" },
    { emoji: "👍", label: "FOLLOW" },
    { emoji: "🔔", label: "SUBSCRIBE" },
  ];
  const at = (i: number) => Math.round(durationInFrames * (0.12 + i * 0.25)); // roughly when each word is spoken
  const tapAt = Math.round(durationInFrames * 0.8);
  const tapped = frame >= tapAt;
  const hand = spring({ frame: frame - (tapAt - 12), fps, config: { damping: 14 } });
  return (
    <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 40, width: 820 }}>
      {buttons.map((b, i) => {
        const p = spring({ frame: frame - at(i), fps, config: { damping: 9, stiffness: 180 } });
        const last = i === buttons.length - 1;
        const done = last && tapped;
        const press = last ? interpolate(frame, [tapAt - 2, tapAt, tapAt + 4], [1, 0.9, 1], clamp) : 1;
        const pulse = frame > at(i) + 15 && !done ? 1 + 0.03 * Math.sin((frame - at(i)) / 5) : 1;
        return (
          <div
            key={i}
            style={{
              ...label,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 26,
              height: 170,
              borderRadius: 90,
              fontSize: 72,
              color: last ? "#fff" : theme.colors.bgFrom,
              background: done ? "#5c5c5c" : last ? "#ff0033" : i === 0 ? theme.colors.accent : theme.colors.accent2,
              boxShadow: done ? "none" : `0 12px 0 rgba(0,0,0,0.35), 0 0 40px ${last ? "#ff003366" : "#ffffff22"}`,
              opacity: Math.min(1, p * 1.5),
              transform: `scale(${p * press * pulse})`,
            }}
          >
            <EmojiText text={done ? "✅" : b.emoji} />
            <span>{done ? (v.done ?? "SUBSCRIBED") : b.label}</span>
          </div>
        );
      })}
      {frame >= tapAt - 12 && frame < tapAt + 25 ? (
        <div
          style={{
            position: "absolute",
            right: 40,
            bottom: -70,
            fontSize: 150,
            transform: `translate(${(1 - hand) * 200}px, ${(1 - hand) * 200}px)`,
          }}
        >
          <EmojiText text="👆" />
        </div>
      ) : null}
    </div>
  );
};

export const VisualView: React.FC<{ visual: Visual }> = ({ visual }) => {
  switch (visual.type) {
    case "flow":
      return <Flow v={visual} />;
    case "meter":
      return <Meter v={visual} />;
    case "stamps":
      return <Stamps v={visual} />;
    case "balloon":
      return <Balloon v={visual} />;
    case "bars":
      return <Bars v={visual} />;
    case "list":
      return <List v={visual} />;
    case "cta":
      return <Cta v={visual} />;
  }
};
