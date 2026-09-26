export function brandStatement() {
  return `<section class="brand-statement" id="brand" aria-label="ANIMATE WORLD TOUR CHAMPIONSHIPS"><h1>${['ANIMATE','WORLD','TOUR','CHAMPIONSHIPS'].map((word,index)=>`<span class="brand-word word-${index}" style="--direction:${index % 2 ? -1 : 1}">${word}</span>`).join('')}</h1></section>`;
}
