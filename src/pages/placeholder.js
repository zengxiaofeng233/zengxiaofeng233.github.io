// Holders for the four routes the menu points at, until each page is designed.
// They exist so navigation lands somewhere real rather than 404ing.

function shell(title, blurb) {
  return `<div class="page-shell">
    <h1 class="page-title">${title}</h1>
    <p class="page-blurb">${blurb}</p>
    <a class="page-back" href="/">返回主页 <span aria-hidden="true">←</span></a>
  </div>`;
}

export const placeholder = page => shell(page.title, page.blurb);
export const notFound = () => shell('404', '这个页面不存在。');
