// The hero's environment layer, in two parts.
//
// FLOW LINES are the background air: a handful of long contours that cross the
// whole hero and pass behind the wordmark, with three deliberate contrast levels.
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

export const DEPTH_SHIFT = { 1: 2, 2: 4, 3: 5 }; // leave room for proximity + scroll
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
  id: `flow-${index}`, d: trajectory, offset, tint: 'pink', opacity: [.28, .18, .11, .08][index],
}));
export const ambientItems = [
  // -- large: composition -----------------------------------------------------
  { id: 'arc-lg-a', tier: 'lg', shape: 'arc', variant: 'a', x: 2, y: 9, w: 430, h: 160, rot: -6, opacity: 0.25,
    near: { reach: 200, push: 4, spin: 2 } },
  { id: 'arc-lg-b', tier: 'lg', shape: 'arc', variant: 'b', x: 68, y: 77, w: 420, h: 160, rot: 4, opacity: 0.24 },
  { id: 'block-lg', tier: 'lg', shape: 'corner', x: 86, y: 37, w: 160, h: 105, rot: 0, opacity: 0.16 },

  // -- medium: rhythm ---------------------------------------------------------
  { id: 'rule-md', tier: 'md', shape: 'line', x: 6, y: 23, w: 180, h: 1, rot: 0, opacity: 0.18 },
  { id: 'hatch-md', tier: 'md', shape: 'slash', x: 87, y: 32, w: 110, h: 35, rot: 0, opacity: 0.18,
    near: { reach: 190, push: 5, spin: 2 } },
  { id: 'grid-md', tier: 'md', shape: 'dots', x: 7, y: 81, w: 130, h: 54, rot: 0, opacity: 0.18 },
  { id: 'slice-md', tier: 'md', shape: 'line', x: 75, y: 87, w: 120, h: 1, rot: 0, opacity: 0.16,
    near: { reach: 190, push: 5, spin: 0 } },

  // -- small: detail ----------------------------------------------------------
  { id: 'wedge-sm-a', tier: 'sm', shape: 'triangle', x: 22, y: 19, w: 26, h: 22, rot: 0, opacity: 0.18,
    near: { reach: 190, push: 5, spin: 2 } },
  { id: 'corner-sm-a', tier: 'sm', shape: 'corner', x: 5, y: 79, w: 24, h: 24, rot: 0, opacity: 0.12 },
  { id: 'dots-sm-a', tier: 'sm', shape: 'dots', x: 18, y: 87, w: 60, h: 26, rot: 0, opacity: 0.10 },
  { id: 'wedge-sm-b', tier: 'sm', shape: 'triangle', x: 85, y: 85, w: 22, h: 19, rot: 14, opacity: 0.20 },
  { id: 'corner-sm-b', tier: 'sm', shape: 'corner', x: 90, y: 48, w: 22, h: 22, rot: 0, opacity: 0.11,
    near: { reach: 190, push: 5, spin: 2 } },
];
