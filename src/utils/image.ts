const fallbackCover =
  'data:image/svg+xml;charset=UTF-8,' +
  encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800">
  <rect width="600" height="800" fill="#121414"/>
  <path d="M0 620C110 560 190 632 292 580C398 526 450 410 600 458V800H0Z" fill="#1e2020"/>
  <circle cx="430" cy="210" r="82" fill="#00f0ff" opacity=".12"/>
  <text x="48" y="720" fill="#98a7a8" font-family="sans-serif" font-size="30">暂无封面</text>
</svg>`)

export function setFallbackCover(event: Event) {
  const image = event.currentTarget
  if (!(image instanceof HTMLImageElement)) return
  if (image.src === fallbackCover) return
  image.src = fallbackCover
}
