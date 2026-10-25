import { Lottie, type LottieAnimationData } from "@remotion/lottie";
import React, { useEffect, useState } from "react";
import { cancelRender, continueRender, delayRender, staticFile } from "remotion";
import { animatedEmoji } from "../emoji.generated";

const cache = new Map<string, Promise<LottieAnimationData>>();
const load = (src: string) => {
  if (!cache.has(src)) cache.set(src, fetch(staticFile(src)).then((r) => r.json()));
  return cache.get(src)!;
};

/** One animated emoji (Google Noto, CC BY 4.0), sized like text. */
const AnimatedEmoji: React.FC<{ src: string; size: string }> = ({ src, size }) => {
  const [data, setData] = useState<LottieAnimationData | null>(null);
  const [handle] = useState(() => delayRender(`Loading animated emoji ${src}`));
  useEffect(() => {
    load(src)
      .then((json) => {
        setData(json);
        continueRender(handle);
      })
      .catch((err) => cancelRender(err));
  }, [src, handle]);
  return (
    <span style={{ display: "inline-block", width: size, height: size, verticalAlign: "-0.18em" }}>
      {data ? <Lottie animationData={data} loop style={{ width: "100%", height: "100%" }} /> : null}
    </span>
  );
};

const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });

/** Text where every emoji that has an animated version (see scripts/fetch-emoji.mjs) plays as an animation. */
export const EmojiText: React.FC<{ text: string }> = ({ text }) => {
  const parts: React.ReactNode[] = [];
  let buffer = "";
  for (const { segment } of segmenter.segment(text)) {
    const src = animatedEmoji[segment];
    if (src) {
      if (buffer) parts.push(buffer);
      buffer = "";
      parts.push(<AnimatedEmoji key={parts.length} src={src} size="1.15em" />);
    } else {
      buffer += segment;
    }
  }
  if (buffer) parts.push(buffer);
  return <>{parts}</>;
};
