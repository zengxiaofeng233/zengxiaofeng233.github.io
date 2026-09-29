// The route change, staged rather than instantaneous.
//
// Every navigation is covered by a paper wipe with a pink leading edge that
// runs the width of the screen, left to right. The outgoing view is swapped
// while it is hidden, so the new page is never caught half-built, and the wipe
// itself carries the move: it reads as the page being rolled on, the same
// gesture the loader uses when it hands over to the hero.
//
// This is a deliberate DOM overlay rather than the View Transitions API. A view
// transition snapshots both views and cannot animate the overlay above them,
// and it would also freeze the hero's pointer loop for the length of the swap.
// A plain element is a fraction of the cost and behaves the same everywhere.

// ENTER and EXIT set the wipe's pace; HOLD is the read.
//
// The hold has to outlast the destination label's own entrance — it enters on a
// 120ms delay over 260ms (see .wipe-label in transition.css) and so lands at
// 380ms, well after the panel stops moving at ENTER. A hold shorter than that
// leaves the label legible for a few frames only, which is what made the
// transition feel like a flicker rather than a page being announced.
const ENTER = 300;   // wipe covers the screen
const HOLD = 620;    // panel at rest: the view is swapped and the label is read
const EXIT = 460;    // wipe leaves, new view settling underneath

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

function overlay() {
  const node = document.createElement('div');
  node.className = 'route-wipe';
  node.setAttribute('aria-hidden', 'true');
  node.innerHTML = '<i class="wipe-edge"></i><i class="wipe-panel"></i><span class="wipe-label"><b></b><span></span></span>';
  return node;
}

// `label` is { title, meta } for the page being moved to. The wipe carries it
// so the transition says where you are going, not just that something happened.
//
// It mounts inside #home rather than on <body>: that is where the paper/ink/
// accent tokens live, and the header is a positioned sibling it has to cover.
export function createTransition(root = document.body) {
  const node = overlay();
  root.append(node);
  const titleEl = node.querySelector('.wipe-label b');
  const metaEl = node.querySelector('.wipe-label > span');
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  let busy = false;
  let queued = null;

  // While the wipe is off-screen its transform parks it far to the left; the
  // layer never intercepts a pointer because it is only visible mid-run.
  async function run(swap, label) {
    if (busy) { queued = { swap, label }; return; }
    if (reduced()) { swap(); return; }
    busy = true;
    titleEl.textContent = label?.title ?? '';
    metaEl.textContent = label?.meta ?? '';
    node.classList.add('is-running');
    node.classList.remove('is-leaving');

    await sleep(ENTER);
    swap();
    await sleep(HOLD);

    node.classList.add('is-leaving');
    await sleep(EXIT);
    node.classList.remove('is-running', 'is-leaving');
    busy = false;

    if (queued) { const next = queued; queued = null; void run(next.swap, next.label); }
  }

  return { run };
}
