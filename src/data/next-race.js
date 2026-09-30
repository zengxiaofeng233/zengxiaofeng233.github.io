import { calendarGroups, calendarTiming } from './calendar.js';

/**
 * @typedef {Object} NextRace
 * @property {string} id
 * @property {string} eventName
 * @property {string} circuitName
 * @property {string=} circuitSvg
 * @property {string=} circuitImage
 * @property {string} startAt ISO 8601 including UTC offset; sole future countdown source.
 * @property {string} timezone IANA timezone for display.
 * @property {number=} round
 * @property {string=} series
 * @property {string=} location
 */
/** @type {{enabled: boolean, event: NextRace|null}} */
export const nextRaceConfig = { enabled: true, event: null };

// Derive both daily starts from the same dates and maps used by the calendar page.
export function calendarRaceEvents() {
  return calendarGroups.flatMap(group => group.rounds.flatMap(item =>
    item.date.split('～').map((date, day) => ({
      id: `${group.id}-${item.round}-${day + 1}`,
      eventName: `ROUND ${String(item.round).padStart(2, '0')} · DAY ${day + 1}`,
      circuitName: item.cn,
      circuitImage: item.trackMap,
      startAt: `${calendarTiming.year}-${date.replace('.', '-')}T${calendarTiming.time}:00${calendarTiming.offset}`,
      timezone: calendarTiming.timezone,
      round: item.round,
    }))
  )).sort((a, b) => Date.parse(a.startAt) - Date.parse(b.startAt));
}

export function findNextRace(events, now = Date.now()) {
  return events.find(event => Date.parse(event.startAt) > now) ?? null;
}
