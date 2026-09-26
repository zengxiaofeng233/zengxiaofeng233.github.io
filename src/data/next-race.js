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
export const nextRaceConfig = { enabled: false, event: null };
