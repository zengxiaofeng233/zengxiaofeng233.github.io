import { calendarGroups } from '../data/calendar.js';
import './calendar.css';

const pad = n => String(n).padStart(2, '0');

export function calendar() {
  const rounds = calendarGroups.flatMap(group => group.rounds);
  const sprints = rounds.filter(item => item.hasSprint).length;
  return `<div class="calendar-page">
    <header class="calendar-heading">
      <p class="calendar-eyebrow">AWTC / SEASON 6</p>
      <h1>AWTC S6 <span>赛历</span></h1>
      <div class="calendar-subtitle">
        <p>AWTC SEASON 6 CALENDAR</p>
        <dl class="calendar-stats">
          <div><dt>ROUNDS</dt><dd>${pad(rounds.length)}</dd></div>
          <div><dt>STAGES</dt><dd>${pad(calendarGroups.length)}</dd></div>
          <div><dt>SPRINTS</dt><dd>${pad(sprints)}</dd></div>
        </dl>
      </div>
    </header>
    ${calendarGroups.map((group, g) => `<section class="calendar-group" style="--i:${g}" aria-labelledby="calendar-${group.id}">
      <h2 class="calendar-group-title" id="calendar-${group.id}">${group.title}<small>R${pad(group.rounds[0].round)} — R${pad(group.rounds.at(-1).round)}</small></h2>
      <div class="calendar-grid">${group.rounds.map((item, r) => {
        const sprint = item.hasSprint;
        const qualifying = item.shortQualifying ? '短排' : '单排';
        const format = sprint
          ? [qualifying, '冲刺', qualifying, `${item.racePercent}%`]
          : [qualifying, `${item.racePercent}%`];
        return `<article class="calendar-card${sprint ? ' is-sprint' : ''}" style="--i:${r}" aria-labelledby="calendar-round-${item.round}">
        <span class="calendar-number" aria-hidden="true">${pad(item.round)}</span>
        <p class="calendar-round">ROUND ${pad(item.round)}${sprint ? '<em>SPRINT</em>' : ''}</p>
        <h3 id="calendar-round-${item.round}">${item.cn}</h3>
        <p class="calendar-english" lang="en">${item.en}</p>
        <ul class="calendar-format" aria-label="赛制">${format.map(part => `<li>${part}</li>`).join('')}</ul>
        <div class="calendar-track-area">${item.date ? `<span class="calendar-date" aria-label="比赛日期">${item.date}</span>` : ''}${item.trackMap ? `<span class="calendar-track" aria-hidden="true" style="--track-map: url('${item.trackMap}')"></span>` : ''}</div>
      </article>`;
      }).join('')}</div>
    </section>`).join('')}
  </div>`;
}
