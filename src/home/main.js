import { header, initHeader } from './header.js';
import { hero } from './hero.js';
import { sections } from './sections.js';
import { initReveal } from './reveal.js';
import { transitionToHome } from './loading.js';

const home = document.querySelector('#home');
home.innerHTML = `${header()}<main>${hero()}${sections()}</main>`;
initHeader(home);
initReveal(home.querySelector('.home-hero'));
void transitionToHome(home);
