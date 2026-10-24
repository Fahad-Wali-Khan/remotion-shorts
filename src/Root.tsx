import { Composition } from "remotion";
import { Short } from "./Short";
import { script } from "./script";
import { videos as generated } from "./videos.generated";
import type { ShortScript } from "./types";

const FPS = 30;

// "Short" = blank template. Every videos/<slug>.json also appears here (see scripts/sync-videos.mjs).
const videos: { id: string; script: ShortScript }[] = [{ id: "Short", script }, ...generated];

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {videos.map((v) => (
        <Composition
          key={v.id}
          id={v.id}
          component={Short}
          width={1080}
          height={1920}
          fps={FPS}
          defaultProps={{ script: v.script }}
          // Length follows the script automatically.
          calculateMetadata={({ props }) => ({
            durationInFrames: Math.max(
              1,
              props.script.scenes.reduce((sum, s) => sum + Math.round(s.seconds * FPS), 0),
            ),
          })}
        />
      ))}
    </>
  );
};
