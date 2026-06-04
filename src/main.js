import './styles/main.css';
import { glassSvg } from './components/glasses.svg.js';
import { schedule } from './content/schedule.js';
import { initHeroScene } from './animations/heroScene.js';
import { initEnvelopeIntro } from './animations/envelopeIntro.js';
import { initRsvpForm } from './rsvp/form.js';
import { palette } from './content/dressCode.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/** Browser scroll restoration would skip the hero/glasses scene after reload. */
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

function scrollToTop() {
  window.scrollTo(0, 0);
}

scrollToTop();
window.addEventListener('pageshow', (event) => {
  if (event.persisted) scrollToTop();
});

function renderGlasses() {
  document.querySelector('#glass-left').innerHTML = glassSvg('left');
  document.querySelector('#glass-right').innerHTML = glassSvg('right');
}

function renderSchedule() {
  const list = document.querySelector('#timeline');
  list.innerHTML = schedule
    .map(
      (item) => `
      <li class="timeline__item">
        <div class="timeline__card">
          <span class="timeline__time">${item.time}</span>
          <span class="timeline__event">${item.event}</span>
          ${item.note ? `<span class="timeline__note">${item.note}</span>` : ''}
        </div>
      </li>`
    )
    .join('');
}

function animateSchedule() {
  gsap.utils.toArray('.timeline__card').forEach((card) => {
    gsap.to(card, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: card,
        start: 'top 85%',
      },
    });
  });
}

function animateReveals() {
  gsap.utils.toArray('.js-reveal').forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 28 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
        },
      }
    );
  });
}

function renderDressCode() {
  const pal = document.querySelector('#dress-palette');
  if (pal) {
    pal.innerHTML = palette
      .map(
        (c) => `
      <article class="dress-swatch">
        <div class="dress-swatch__tile" style="--swatch: ${c.hex}; --swatch-tint: ${c.tint}">
          <span class="dress-swatch__inner"></span>
        </div>
      </article>`
      )
      .join('');
  }
}

function init() {
  scrollToTop();
  renderGlasses();
  renderSchedule();
  renderDressCode();
  gsap.set('.timeline__card', { y: 24 });
  const hero = initHeroScene();
  initEnvelopeIntro(() => {
    hero.playIntro();
  });
  animateSchedule();
  animateReveals();
  initRsvpForm();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
