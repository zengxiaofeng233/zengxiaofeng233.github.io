import { nextRaceConfig } from '../data/next-race.js';

// Future renderers attach here without moving the logo, lens or hero structure.
// No UI, countdown, event data or placeholder is created in this release.
export function mountNextRaceSlot(hero, data = nextRaceConfig.event, render) {
  const slot = hero.querySelector('.next-race-slot');
  if (!slot) return null;
  slot.hidden = true;
  if (!nextRaceConfig.enabled || !data || typeof render !== 'function') return null;
  const widget = render(data);
  if (!(widget instanceof HTMLElement)) return null;
  slot.replaceChildren(widget);
  slot.hidden = false;
  return { destroy: () => { slot.hidden = true; slot.replaceChildren(); } };
}
