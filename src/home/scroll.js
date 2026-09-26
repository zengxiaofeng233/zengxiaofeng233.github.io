// Native document scrolling owns the timeline. No wheel/touch interception.
const clamp = value => Math.max(0, Math.min(1, value));
export function initScroll(root, pointer) {
  const heroChapter = root.querySelector('.hero-chapter');
  const hero = root.querySelector('.home-hero');
  const garage = root.querySelector('.garage-chapter');
  const viewport = root.querySelector('.garage-viewport');
  const rail = root.querySelector('.garage-rail');
  const figures = [...root.querySelectorAll('.garage-car')];
  const counter = root.querySelector('.garage-counter');
  const brand = root.querySelector('.brand-statement');
  const path = root.querySelector('.site-track path');
  const natural = matchMedia('(max-width: 760px), (prefers-reduced-motion: reduce)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const controller = new AbortController();
  const options = { passive: true, signal: controller.signal };
  let metrics = null, raf = 0, lastY = scrollY, lastTime = performance.now(), speed = 0;
  let dirty = true, selected = -1;
  const schedule = () => { if (!raf && !document.hidden) raf = requestAnimationFrame(update); };

  function measure() {
    const top = element => element.getBoundingClientRect().top + scrollY;
    const centers = figures.map(el => el.offsetLeft + el.offsetWidth / 2);
    metrics = {
      heroTop: top(heroChapter), heroRange: Math.max(1,heroChapter.offsetHeight-hero.offsetHeight),
      garageTop: top(garage), garageRange: Math.max(1,garage.offsetHeight-viewport.offsetHeight),
      centers, railStart: viewport.clientWidth/2-centers[0], travel: centers.at(-1)-centers[0],
      viewportWidth: viewport.clientWidth,
      brandTop: top(brand), brandHeight: brand.offsetHeight,
      rootTop: top(root), rootHeight: root.offsetHeight,
    };
    dirty = false;
  }
  function update(now) {
    raf = 0;
    if (dirty) measure();
    const y = scrollY;
    const delta = y-lastY;
    const dt = Math.max(16,now-lastTime);
    const targetSpeed = reduced.matches ? 0 : Math.min(1,Math.abs(delta)/dt/2);
    speed += (targetSpeed-speed)*.22;
    lastY=y; lastTime=now;
    const opening = reduced.matches ? 0 : clamp((y-metrics.heroTop)/metrics.heroRange);
    hero.style.setProperty('--open',opening.toFixed(4));
    pointer.state.scrollOpen = opening > .035;
    pointer.schedule();

    if (natural.matches) {
      rail.style.removeProperty('transform');
      figures.forEach(el => { el.style.removeProperty('opacity'); el.style.removeProperty('transform'); });
    } else {
      const p=clamp((y-metrics.garageTop)/metrics.garageRange);
      const shift=metrics.railStart-p*metrics.travel;
      rail.style.transform=`translate3d(${shift.toFixed(2)}px,0,0)`;
      let nearest=0, closest=Infinity;
      figures.forEach((el,i)=>{
        const distance=Math.abs(metrics.centers[i]+shift-metrics.viewportWidth/2);
        const focus=1-clamp(distance/(metrics.viewportWidth*.78));
        el.style.opacity=(.6+.4*focus).toFixed(3);
        el.style.transform=`scale(${(.96+.04*focus).toFixed(4)})`;
        if(distance<closest){closest=distance;nearest=i;}
      });
      if(nearest!==selected){selected=nearest;counter.textContent=`${String(nearest+1).padStart(2,'0')} / 05`;}
    }
    viewport.style.setProperty('--speed',speed.toFixed(3));
    const align=reduced.matches?1:clamp((y+innerHeight-metrics.brandTop)/(innerHeight*.72));
    brand.style.setProperty('--align',align.toFixed(4));
    const progress=clamp((y-metrics.rootTop+innerHeight)/(metrics.rootHeight || 1));
    path.style.strokeDashoffset=String(1-progress);
    if(speed>.004) schedule();
  }
  window.addEventListener('scroll',schedule,options);
  window.addEventListener('resize',()=>{dirty=true;schedule();},options);
  window.addEventListener('awtc:home-ready',()=>{dirty=true;schedule();},options);
  natural.addEventListener('change',()=>{dirty=true;schedule();},{signal:controller.signal});
  reduced.addEventListener('change',()=>{dirty=true;schedule();},{signal:controller.signal});
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){cancelAnimationFrame(raf);raf=0;}else{dirty=true;schedule();}
  },{signal:controller.signal});
  const observer=new ResizeObserver(()=>{dirty=true;schedule();});
  observer.observe(root);observer.observe(viewport);
  schedule();
  return {destroy(){controller.abort();observer.disconnect();cancelAnimationFrame(raf);}};
}
