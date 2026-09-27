import { calendarGroups } from '../data/calendar.js';
import './calendar.css';

export function calendar() {
  return `<div class="calendar-page">
    <header class="calendar-heading">
      <p class="calendar-eyebrow">AWTC / SEASON 6</p>
      <h1>AWTC S6 <span>赛历</span></h1>
      <p class="calendar-subtitle">AWTC SEASON 6 CALENDAR</p>
    </header>
    ${calendarGroups.map(group => `<section class="calendar-group" aria-labelledby="calendar-${group.id}">
      <h2 class="calendar-group-title" id="calendar-${group.id}">${group.title}</h2>
      <div class="calendar-grid">${group.rounds.map(item => `<article class="calendar-card" aria-labelledby="calendar-round-${item.round}">
        <p class="calendar-round">ROUND ${String(item.round).padStart(2, '0')}</p>
        <h3 id="calendar-round-${item.round}">${item.cn}</h3>
        <p class="calendar-english" lang="en">${item.en}</p>
        <p class="calendar-format">${item.format}</p>
        <div class="calendar-track-area" aria-hidden="true">${item.trackMap ? `<span class="calendar-track" style="--track-map: url('${item.trackMap}')"></span>` : ''}</div>
      </article>`).join('')}</div>
    </section>`).join('')}
  </div>`;
}
