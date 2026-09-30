import { teams, freeDrivers, driverLevels } from '../data/drivers-teams.js';
import './drivers-teams.css';

const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

// Choose readable type while retaining the source spreadsheet's background.
function ink(color) {
  const rgb = color.slice(1).match(/../g).map(part => {
    const value = parseInt(part, 16) / 255;
    return value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4;
  });
  return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722 > .179 ? '#141418' : '#ffffff';
}

function roster(drivers) {
  return `<table class="roster-table"><thead><tr><th scope="col">车手</th><th scope="col">DRIVER</th><th scope="col">级别</th></tr></thead>
    <tbody>${drivers.map(driver => {
      const color = driverLevels[driver.level]?.color ?? '#FFFFFF';
      return `<tr><th scope="row">${escape(driver.cn)}${driver.leader ? '<span class="roster-leader">领队</span>' : ''}</th><td lang="en">${escape(driver.en)}</td><td><span class="roster-level" style="--level-color:${escape(color)};--level-ink:${ink(color)}">${escape(driver.level)}</span></td></tr>`;
    }).join('')}</tbody></table>`;
}

export function driversTeams() {
  const total = teams.reduce((sum, team) => sum + team.drivers.length, freeDrivers.length);
  return `<div class="drivers-page">
    <header class="drivers-heading">
      <p class="drivers-eyebrow">AWTC / SEASON 6</p>
      <h1>DRIVERS <span>&</span> TEAMS</h1>
      <div class="drivers-subtitle"><p>车手与车队</p><p>${teams.length} 支车队 <span>/</span> ${total} 位车手</p></div>
    </header>
    <section aria-labelledby="teams-title">
      <h2 class="roster-section-title" id="teams-title">车队阵容 <small>TEAMS</small></h2>
      <div class="teams-grid">${teams.map(team => `<article class="team-card" aria-labelledby="team-${escape(team.id)}">
        <header class="team-card-heading" style="--team-color:${escape(team.color)};--team-ink:${ink(team.color)}">
          <div class="team-card-meta"><span>AWTC S6</span><span>${team.drivers.length} DRIVERS</span></div>
          <h3 id="team-${escape(team.id)}">${escape(team.name)}</h3>
          <span class="team-monogram" aria-hidden="true">${escape(team.shortName)}</span>
          <span class="team-short-name">${escape(team.shortName)}</span>
        </header>
        <div class="team-card-roster">${roster(team.drivers)}</div>
      </article>`).join('')}</div>
    </section>
    <section class="free-drivers" aria-labelledby="free-title">
      <h2 class="roster-section-title" id="free-title">自由车手 <small>INDEPENDENT DRIVERS / ${freeDrivers.length}</small></h2>
      <div class="free-roster">${roster(freeDrivers)}</div>
    </section>
  </div>`;
}
