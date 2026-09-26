// Single source of truth for the main navigation. Header, menu and router all
// read from here, so a route only ever changes in one place.
//
// The four sub-pages currently render the placeholder shell — they exist so the
// menu navigates somewhere real instead of 404ing on GitHub Pages. Replace the
// `blurb` (or the view itself, see src/pages/) once each page is designed.

export const registerPage = { id: 'register', href: '/register', title: 'SEASON 6', blurb: '报名通道即将开放。' };

export const navItems = [
  { id: 'home', href: '/', label: 'HOME' },
  { id: 'calendar', href: '/calendar', label: 'CALENDAR', title: 'CALENDAR', blurb: '赛季分站与赛历。' },
  { id: 'drivers', href: '/drivers-teams', label: 'DRIVERS & TEAMS', title: 'DRIVERS & TEAMS', blurb: '车手与车队名单。' },
  { id: 'partners', href: '/partners', label: 'PARTNERS', title: 'PARTNERS', blurb: '合作伙伴与赞助商。' },
  { id: 'history', href: '/history', label: 'HISTORY', title: 'HISTORY / AWAY EVENTS', blurb: '历史赛事与外站记录。' },
];

const pages = [...navItems, registerPage];

// '' and '/index.html' both mean the homepage — GitHub Pages serves the latter
// for a directory request.
export function currentPath() {
  const path = location.pathname.replace(/index\.html$/, '');
  return path === '' ? '/' : path;
}

export const pageFor = path => pages.find(item => item.href === path);
