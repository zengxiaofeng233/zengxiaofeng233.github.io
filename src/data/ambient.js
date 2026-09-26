// The hero's environment layer, in two parts.
//
// FLOW LINES are the background air: a handful of long contours that cross the
// whole hero and pass behind the wordmark. They are barely there on purpose.
//
// AMBIENT GRAPHICS carry the composition and come in three tiers rather than as
// an even sprinkle: a few large shapes hold the frame, medium shapes set the
// rhythm, small marks only add detail. Tier drives both the size band and the
// parallax depth, so `lg` barely moves and `sm` moves most.
//
// Positions are percentages of the hero box; sizes are px at --as = 1 (see
// .home-hero in home.css), so the whole layer scales with the viewport.
//
// Two bands are kept clear. The middle belongs to the wordmark, so nothing sits
// between roughly y 22% and 78% except at the far left and right margins. The
// top right belongs to the menu, which is positioned in fixed px rather than
// percentages — so anything that would land there is held left of x 70% or
// pushed below y 22%, where the launch row can never reach it.

export const DEPTH_SHIFT = { 1: 3, 2: 7, 3: 12 }; // px of travel at full parallax
export const TIER_DEPTH = { lg: 1, md: 2, sm: 3 };

// Contour paths for the `arc` shapes, in a loose 100x100 space. They are
// stretched to their box, so they never need re-authoring.
export const ARCS = {
  a: 'M0 78 C 20 40, 44 12, 74 30 S 96 70, 100 52',
  b: 'M0 22 C 24 60, 48 84, 76 62 S 96 26, 100 44',
  c: 'M0 50 C 18 50, 34 24, 56 38 S 84 76, 100 58',
};

// Drawn as one stretched SVG so a line can sweep the full width in a single
// path. `viewBox` maps 0..100 across the hero and 0..100 down it.
const trajectory = 'M-8 35H12Q18 35 18 27V21Q18 13 25 13H69Q79 13 79 26V33Q79 41 88 41H108M-8 57H17Q24 57 24 67V71Q24 82 34 82H70Q80 82 80 69V64Q80 57 91 57H108';
export const flowLines = [0, 1.4, 2.8, 4.2].map((offset, index) => ({
  id: `flow-${index}`, d: trajectory, offset, tint: 'pink', opacity: .075,
}));
export const ambientItems = [
  // -- large: composition -----------------------------------------------------
  { id: 'arc-lg-a', tier: 'lg', shape: 'arc', variant: 'a', x: 2, y: 6, w: 480, h: 190, rot: -6, opacity: 0.075,
    near: { reach: 200, push: 6, spin: 2 } },
  { id: 'arc-lg-b', tier: 'lg', shape: 'arc', variant: 'b', x: 62, y: 82, w: 520, h: 200, rot: 4, opacity: 0.065 },
  { id: 'block-lg', tier: 'lg', shape: 'block', x: 91, y: 34, w: 520, h: 230, rot: 0, opacity: 0.06 },

  // -- medium: rhythm ---------------------------------------------------------
  { id: 'rule-md', tier: 'md', shape: 'line', x: 6, y: 20, w: 240, h: 1, rot: 0, opacity: 0.13 },
  { id: 'hatch-md', tier: 'md', shape: 'slash', x: 74, y: 21, w: 150, h: 56, rot: 0, opacity: 0.11,
    near: { reach: 190, push: 9, spin: 3 } },
  { id: 'grid-md', tier: 'md', shape: 'dots', x: 10, y: 84, w: 130, h: 54, rot: 0, opacity: 0.10 },
  { id: 'slice-md', tier: 'md', shape: 'slice', x: 46, y: 88, w: 200, h: 26, rot: 0, opacity: 0.10,
    near: { reach: 190, push: 12, spin: 0 } },

  // -- small: detail ----------------------------------------------------------
  { id: 'wedge-sm-a', tier: 'sm', shape: 'triangle', x: 26, y: 12, w: 26, h: 22, rot: 0, opacity: 0.16,
    near: { reach: 190, push: 11, spin: 4 } },
  { id: 'corner-sm-a', tier: 'sm', shape: 'corner', x: 4, y: 82, w: 24, h: 24, rot: 0, opacity: 0.14 },
  { id: 'dots-sm-a', tier: 'sm', shape: 'dots', x: 58, y: 90, w: 60, h: 26, rot: 0, opacity: 0.15 },
  { id: 'wedge-sm-b', tier: 'sm', shape: 'triangle', x: 80, y: 90, w: 22, h: 19, rot: 14, opacity: 0.15 },
  { id: 'corner-sm-b', tier: 'sm', shape: 'corner', x: 93, y: 60, w: 22, h: 22, rot: 0, opacity: 0.13,
    near: { reach: 190, push: 8, spin: 5 } },
];
