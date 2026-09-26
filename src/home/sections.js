import { racingGarage } from './garage.js';
import { brandStatement } from './brand.js';
import { pitLane } from './footer.js';

export function sections() {
  return `${racingGarage()}${brandStatement()}${pitLane()}`;
}
