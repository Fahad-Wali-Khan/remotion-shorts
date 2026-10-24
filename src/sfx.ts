// Catalog of the bundled sound effects in public/sfx/ (all CC0, see public/sfx/CREDITS.md).
// Use as: staticFile(sfx.whoosh)  or  <Audio src={staticFile(sfx["pop-in"])} volume={0.5} />
// Short clips (0.1 to 1.2 s). `whoosh` and `typing` are cut automatically (see sfxMaxSeconds).

export const sfx = {
  // UI / clicks
  click: "sfx/click.ogg",
  tick: "sfx/tick.ogg",
  select: "sfx/select.ogg",
  toggle: "sfx/toggle.ogg",
  open: "sfx/open.ogg",
  close: "sfx/close.ogg",
  back: "sfx/back.ogg",
  scroll: "sfx/scroll.ogg",
  // Text / element pop-ins
  "pop-in": "sfx/pop-in.ogg",
  "pop-out": "sfx/pop-out.ogg",
  pluck: "sfx/pluck.ogg",
  drop: "sfx/drop.ogg",
  pep: "sfx/pep.ogg",
  // Transitions
  whoosh: "sfx/whoosh.wav",
  "swoosh-up": "sfx/swoosh-up.ogg",
  "swoosh-down": "sfx/swoosh-down.ogg",
  rise: "sfx/rise.ogg",
  glitch: "sfx/glitch.ogg",
  "record-scratch": "sfx/record-scratch.ogg",
  // Positive / negative
  confirm: "sfx/confirm.ogg",
  success: "sfx/success.ogg",
  bong: "sfx/bong.ogg",
  "glass-ping": "sfx/glass-ping.ogg",
  "power-up": "sfx/power-up.ogg",
  "power-up-big": "sfx/power-up-big.ogg",
  question: "sfx/question.ogg",
  error: "sfx/error.ogg",
  "error-soft": "sfx/error-soft.ogg",
  alert: "sfx/alert.ogg",
  fail: "sfx/fail.ogg",
  // Impacts
  "hit-light": "sfx/hit-light.ogg",
  "hit-heavy": "sfx/hit-heavy.ogg",
  "boom-bell": "sfx/boom-bell.ogg",
  "glass-hit": "sfx/glass-hit.ogg",
  zap: "sfx/zap.ogg",
  laser: "sfx/laser.ogg",
  // Money / finance
  coin: "sfx/coin.ogg",
  "coin-2": "sfx/coin-2.ogg",
  "coin-3": "sfx/coin-3.ogg",
  "coins-clink": "sfx/coins-clink.ogg",
  "money-stack": "sfx/money-stack.ogg",
  "money-handle": "sfx/money-handle.ogg",
  "card-slide": "sfx/card-slide.ogg",
  "card-shuffle": "sfx/card-shuffle.ogg",
  // Other
  typing: "sfx/typing.ogg",
  "camera-shutter": "sfx/camera-shutter.ogg",
} as const;

export type SfxName = keyof typeof sfx;

/** Clips that are longer than the effect you want are cut to this many seconds. */
export const sfxMaxSeconds: Partial<Record<SfxName, number>> = {
  whoosh: 0.8, // the source file holds several whooshes, we use the first
  typing: 2.5,
};
