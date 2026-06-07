import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { playSplash } from './splash.js';
import { createFireworks } from './fireworks.js';

gsap.registerPlugin(ScrollTrigger);

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// How far each glass leans in for the toast.
const TILT = 10;
// Visible gap between inner rim tips at the toast (px).
const RIM_GAP = 14;

export function initHeroScene() {
  const hero = document.querySelector('#hero');
  const glassLeft = document.querySelector('#glass-left');
  const glassRight = document.querySelector('#glass-right');
  const splashEl = document.querySelector('#splash');
  const title = document.querySelector('#hero-title');
  const scrollHint = document.querySelector('#scroll-hint');
  const canvas = document.querySelector('#fireworks-canvas');

  const tiltL = glassLeft.querySelector('.tilt');
  const tiltR = glassRight.querySelector('.tilt');
  const liquidRotL = glassLeft.querySelector('.liquid-rot');
  const liquidRotR = glassRight.querySelector('.liquid-rot');
  const liquidL = glassLeft.querySelector('.liquid');
  const liquidR = glassRight.querySelector('.liquid');

  const fireworks = createFireworks(canvas);

  // The div only positions the glass; the tilt + liquid counter-rotation are
  // applied as native SVG transforms (explicit rotation centre) so the pivot is
  // always the foot of the flute and the champagne surface stays perfectly level.
  gsap.set([glassLeft, glassRight], { xPercent: -50, yPercent: -50, opacity: 0 });

  const applyTilt = (deg) => {
    tiltL.setAttribute('transform', `rotate(${deg} 100 308)`);
    tiltR.setAttribute('transform', `rotate(${-deg} 100 308)`);
    liquidRotL.setAttribute('transform', `rotate(${-deg} 100 308)`);
    liquidRotR.setAttribute('transform', `rotate(${deg} 100 308)`);
  };
  const applyLevel = (dy) => {
    liquidL.setAttribute('transform', `translate(0 ${dy})`);
    liquidR.setAttribute('transform', `translate(0 ${dy})`);
  };

  function collide() {
    playSplash(splashEl);
    fireworks.play();
  }

  // Reduced motion: show the finished scene, no scrubbing.
  if (prefersReduced) {
    gsap.set([glassLeft, glassRight], { opacity: 0 });
    gsap.set(title, { opacity: 1 });
    gsap.set(scrollHint, { opacity: 0 });
    return { playIntro: () => {} };
  }

  // Start near the edges (fully visible). Stop when rims nearly touch — never
  // overlap (overlap was clipping outlines and looked like missing glass).
  const startGap = () => window.innerWidth / 2 - glassLeft.offsetWidth * 0.58;
  const endGap = () => {
    const w = glassLeft.offsetWidth;
    const tiltRad = (TILT * Math.PI) / 180;
    // Bowl half-width (~42% of render width) + small gap so rims nearly touch.
    return w * 0.5 * Math.cos(tiltRad) + RIM_GAP / 2;
  };

  // Single eased driver for the approach: position, tilt and level together.
  const toast = { t: 0 };
  const applyToast = () => {
    const sg = startGap();
    const eg = endGap();
    const gap = sg + (eg - sg) * toast.t;
    gsap.set(glassLeft, { x: -gap });
    gsap.set(glassRight, { x: gap });
    applyTilt(TILT * toast.t);
    applyLevel(-40);
  };

  let fired = false;
  let heroScrollTrigger;

  gsap.set(title, { opacity: 0, scale: 0.92, y: 26 });
  gsap.set(scrollHint, { opacity: 1 });

  const resetHeroScene = () => {
    toast.t = 0;
    fired = false;
    applyToast();
    gsap.set(title, { opacity: 0, scale: 0.92, y: 26 });
    gsap.set(scrollHint, { opacity: 1 });
    if (heroScrollTrigger) {
      heroScrollTrigger.scroll(0);
      heroScrollTrigger.animation?.progress(0);
    }
    ScrollTrigger.update();
  };

  const tl = gsap.timeline({
    scrollTrigger: {
      id: 'hero-scene',
      trigger: hero,
      start: 'top top',
      end: '+=240%',
      pin: '.hero-stage',
      scrub: 0.8,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        // One-shot clink the moment the rims meet; resettable when scrubbing up.
        if (self.progress > 0.52 && !fired) {
          fired = true;
          collide();
        } else if (self.progress < 0.42) {
          fired = false;
        }
      },
    },
  });

  tl.to(scrollHint, { opacity: 0, ease: 'none', duration: 0.05 }, 0)
    .to(toast, { t: 1, ease: 'power2.inOut', duration: 0.5, onUpdate: applyToast }, 0)
    .to([glassLeft, glassRight], { opacity: 0, ease: 'power1.out', duration: 0.16 }, 0.66)
    .fromTo(
      title,
      { opacity: 0, scale: 0.92, y: 26 },
      { opacity: 1, scale: 1, y: 0, ease: 'power2.out', duration: 0.24 },
      0.74
    );

  ScrollTrigger.refresh();
  heroScrollTrigger = ScrollTrigger.getById('hero-scene');
  resetHeroScene();

  return {
    playIntro() {
      requestAnimationFrame(() => {
        window.scrollTo(0, 0);
        gsap.set([glassLeft, glassRight], { opacity: 1 });
        resetHeroScene();
        ScrollTrigger.refresh();
      });
    },
  };
}
