const fallbackCover =
  'data:image/svg+xml;charset=UTF-8,' +
  encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540">
  <rect width="960" height="540" fill="#121414"/>
  <path d="M0 420C160 350 280 430 420 372C560 314 690 230 960 286V540H0Z" fill="#1e2020"/>
  <circle cx="720" cy="170" r="82" fill="#00f0ff" opacity=".12"/>
  <text x="48" y="470" fill="#98a7a8" font-family="sans-serif" font-size="32">暂无封面</text>
</svg>`)

export function setFallbackCover(event: Event) {
  const image = event.currentTarget
  if (!(image instanceof HTMLImageElement)) return
  if (image.src === fallbackCover) return
  image.src = fallbackCover
}
