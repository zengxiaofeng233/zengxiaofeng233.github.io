import { calendarGroups } from '../data/calendar.js';
import { calendarRaceEvents, findNextRace } from '../data/next-race.js';
import './calendar.css';

const pad = n => String(n).padStart(2, '0');

export function calendar() {
  return `<div class="calendar-page">
    <header class="calendar-heading">
      <p class="calendar-eyebrow">AWTC / SEASON 6</p>
      <h1>AWTC S6 <span>赛历</span></h1>
      <div class="calendar-subtitle">
        <p>AWTC SEASON 6 CALENDAR</p>
        <div class="calendar-countdown" aria-label="下一场比赛倒计时">
          <p class="calendar-countdown-label">下一场比赛 · 北京时间</p>
          <dl class="calendar-stats" role="timer" aria-label="距离开赛">
            <div><dt>天</dt><dd data-countdown="days">00</dd></div>
            <div><dt>时</dt><dd data-countdown="hours">00</dd></div>
            <div><dt>分</dt><dd data-countdown="minutes">00</dd></div>
            <div><dt>秒</dt><dd data-countdown="seconds">00</dd></div>
          </dl>
          <p class="calendar-countdown-ended" hidden>本赛季已结束</p>
        </div>
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

export function initCalendarCountdown(root) {
  const block = root.querySelector('.calendar-countdown');
  if (!block) return null;
  const events = calendarRaceEvents();
  const label = block.querySelector('.calendar-countdown-label');
  const timer = block.querySelector('[role="timer"]');
  const ended = block.querySelector('.calendar-countdown-ended');
  const digits = ['days', 'hours', 'minutes', 'seconds'].map(key => block.querySelector(`[data-countdown="${key}"]`));
  function update() {
    const now = Date.now();
    const event = findNextRace(events, now);
    label.hidden = timer.hidden = !event;
    ended.hidden = Boolean(event);
    if (!event) return;
    const seconds = Math.ceil((Date.parse(event.startAt) - now) / 1000);
    const values = [Math.floor(seconds / 86400), Math.floor(seconds / 3600) % 24, Math.floor(seconds / 60) % 60, seconds % 60];
    digits.forEach((digit, index) => { digit.textContent = pad(values[index]); });
  }
  update();
  const interval = window.setInterval(update, 1000);
  document.addEventListener('visibilitychange', update);
  return { destroy() {
    window.clearInterval(interval);
    document.removeEventListener('visibilitychange', update);
  } };
}
