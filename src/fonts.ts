// Google Fonts used by the theme. Loaded once; Remotion waits for them before rendering a frame.
import { loadFont as loadMontserrat } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadPoppins } from "@remotion/google-fonts/Poppins";

const montserrat = loadMontserrat("normal", { weights: ["700", "800", "900"], subsets: ["latin"] });
const poppins = loadPoppins("normal", { weights: ["400", "500", "600"], subsets: ["latin"] });

// Helvetica/Arial stay as fallbacks for glyphs the web fonts lack (e.g. ₹).
export const headingFont = `${montserrat.fontFamily}, Helvetica, Arial, sans-serif`;
export const bodyFont = `${poppins.fontFamily}, Helvetica, Arial, sans-serif`;
