import { Composition } from "remotion";
import { Short } from "./Short";
import { script } from "./script";

const FPS = 30;

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Short"
      component={Short}
      width={1080}
      height={1920}
      fps={FPS}
      defaultProps={{ script }}
      // Length follows the script automatically.
      calculateMetadata={({ props }) => ({
        durationInFrames: Math.max(
          1,
          props.script.scenes.reduce((sum, s) => sum + Math.round(s.seconds * FPS), 0),
        ),
      })}
    />
  );
};
