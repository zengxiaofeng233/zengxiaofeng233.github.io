import { nextRaceConfig, calendarRaceEvents, findNextRace } from '../data/next-race.js';

function renderNextRace(event) {
  const widget = document.createElement('section');
  widget.className = 'next-race';
  widget.setAttribute('aria-label', '下一场比赛');
  widget.innerHTML = `<div class="next-race-map"><img alt="" width="112" height="88"></div>
    <div class="next-race-info"><p class="next-race-eyebrow">NEXT RACE <span></span></p>
    <h2 class="next-race-name"></h2><time class="next-race-time"></time>
    <p class="next-race-zone">北京时间 · GMT+8</p>
    <p class="next-race-countdown" role="timer" aria-label="距离开赛"></p></div>`;
  const map = widget.querySelector('img');
  if (event.circuitImage || event.circuitSvg) map.src = event.circuitImage || event.circuitSvg;
  else widget.querySelector('.next-race-map').hidden = true;
  widget.querySelector('.next-race-eyebrow span').textContent = event.eventName;
  widget.querySelector('h2').textContent = event.circuitName;
  const time = widget.querySelector('time');
  time.dateTime = event.startAt;
  time.textContent = new Intl.DateTimeFormat('zh-CN', {
    timeZone: event.timezone, month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).format(new Date(event.startAt));
  return widget;
}

export function mountNextRaceSlot(hero, data = nextRaceConfig.event, render = renderNextRace) {
  const slot = hero.querySelector('.next-race-slot');
  if (!slot) return null;
  slot.hidden = true;
  if (!nextRaceConfig.enabled || typeof render !== 'function') return null;
  const events = data ? [data] : calendarRaceEvents();
  let activeId;
  let timer;
  function update() {
    const now = Date.now();
    const event = findNextRace(events, now);
    if (event?.id !== activeId || slot.hidden) {
      activeId = event?.id;
      if (event) {
        const widget = render(event);
        if (!(widget instanceof HTMLElement)) return;
        slot.replaceChildren(widget);
      } else {
        const ended = document.createElement('p');
        ended.className = 'next-race-ended';
        ended.textContent = '本赛季已结束';
        slot.replaceChildren(ended);
      }
      slot.hidden = false;
    }
    const countdown = slot.querySelector('.next-race-countdown');
    if (event && countdown) {
      const seconds = Math.ceil((Date.parse(event.startAt) - now) / 1000);
      const pad = value => String(value).padStart(2, '0');
      countdown.textContent = `${pad(Math.floor(seconds / 86400))}天 ${pad(Math.floor(seconds / 3600) % 24)}时 ${pad(Math.floor(seconds / 60) % 60)}分 ${pad(seconds % 60)}秒`;
    }
  }
  update();
  timer = window.setInterval(update, 1000);
  document.addEventListener('visibilitychange', update);
  return { destroy: () => {
    window.clearInterval(timer);
    document.removeEventListener('visibilitychange', update);
    slot.hidden = true;
    slot.replaceChildren();
  } };
}
