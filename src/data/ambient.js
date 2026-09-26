// Ambient graphics: the Season 6 geometric vocabulary, used sparingly.
//
// Positions are percentages of the hero box; sizes are px at --as = 1 (see
// .home-hero in home.css), so the whole layer scales with the viewport.
//
// Two bands are kept clear. The middle belongs to the wordmark, so nothing sits
// between roughly y 22% and 78% except at the far left and right margins. The top
// right belongs to the menu, which is positioned in fixed px rather than
// percentages — so the items that would land there are held left of x 70% or
// below y 25%, where the launch row can never reach them.
//
// `depth` is the parallax tier — 1 barely moves, 3 moves most. It is also the
// cheap way to drive them: one CSS variable per tier moves every item in it.
// `group` ties an item to a racing programme so the active car can light it up.
// `near` marks an item that also reacts to the cursor's own distance.
// `sm: false` drops an item on phones, where the same sixteen shapes in a 375px
// column would read as clutter rather than as breathing room.

export const DEPTH_SHIFT = { 1: 3, 2: 7, 3: 12 }; // px of travel at full parallax

export const ambientItems = [
  // -- top band ---------------------------------------------------------------
  { id: 'contour-a', shape: 'arc', variant: 0, group: 'f1', depth: 1, x: 7, y: 9, w: 220, h: 84, rot: -8, opacity: 0.13 },
  { id: 'wedge-a', shape: 'triangle', group: 'f1', depth: 3, x: 30, y: 11, w: 30, h: 26, rot: 0, opacity: 0.16,
    near: { reach: 190, push: 11, spin: 5 } },
  { id: 'grid-a', shape: 'dots', group: 'fe', depth: 2, x: 38, y: 9, w: 96, h: 40, rot: 0, opacity: 0.15,
    near: { reach: 190, push: 7, spin: 0 } },
  { id: 'hatch-a', shape: 'slash', group: 'gt3', depth: 3, x: 91, y: 31, w: 110, h: 46, rot: 0, opacity: 0.14,
    near: { reach: 190, push: 13, spin: 4 } },
  { id: 'rule-a', shape: 'line', group: 'neutral', depth: 2, x: 44, y: 22, w: 130, h: 1, rot: 0, opacity: 0.16 },

  // -- bottom band ------------------------------------------------------------
  { id: 'contour-b', shape: 'arc', variant: 1, group: 'fe', depth: 1, x: 76, y: 82, w: 260, h: 96, rot: 5, opacity: 0.12 },
  { id: 'wedge-b', sm: false, shape: 'triangle', group: 'neutral', depth: 2, x: 61, y: 84, w: 26, h: 22, rot: 12, opacity: 0.15,
    near: { reach: 190, push: 8, spin: 6 } },
  { id: 'grid-b', sm: false, shape: 'dots', group: 'neutral', depth: 1, x: 15, y: 87, w: 84, h: 36, rot: 0, opacity: 0.11 },
  { id: 'hatch-b', shape: 'slash', group: 'neutral', depth: 2, x: 33, y: 89, w: 96, h: 40, rot: 0, opacity: 0.13,
    near: { reach: 190, push: 9, spin: 3 } },
  { id: 'rule-b', shape: 'line', group: 'gt3', depth: 3, x: 45, y: 81, w: 150, h: 1, rot: 0, opacity: 0.18,
    near: { reach: 190, push: 12, spin: 0 } },
  { id: 'corner-a', shape: 'corner', group: 'neutral', depth: 2, x: 4, y: 80, w: 26, h: 26, rot: 0, opacity: 0.15 },

  // -- margins ----------------------------------------------------------------
  { id: 'contour-c', shape: 'arc', variant: 2, group: 'gt3', depth: 2, x: 2, y: 40, w: 150, h: 70, rot: -14, opacity: 0.14,
    near: { reach: 190, push: 10, spin: 7 } },
  { id: 'block-a', sm: false, shape: 'block', group: 'f1', depth: 3, x: 90, y: 44, w: 74, h: 40, rot: 0, opacity: 0.12 },
  { id: 'corner-b', sm: false, shape: 'corner', group: 'gt3', depth: 1, x: 92, y: 66, w: 24, h: 24, rot: 0, opacity: 0.14 },
  { id: 'contour-d', sm: false, shape: 'arc', variant: 0, group: 'neutral', depth: 1, x: 84, y: 24, w: 170, h: 64, rot: 18, opacity: 0.11 },
  { id: 'block-b', sm: false, shape: 'block', group: 'fe', depth: 2, x: 8, y: 68, w: 62, h: 34, rot: 0, opacity: 0.12 },
];
