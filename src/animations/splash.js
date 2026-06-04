import gsap from 'gsap';

// Spawns champagne droplets radiating from the contact point of the two glasses.
// Droplets are appended to the #splash element and removed after the animation.
export function playSplash(splashEl) {
  const count = 26;
  const drops = [];

  for (let i = 0; i < count; i++) {
    const drop = document.createElement('span');
    drop.className = 'splash__drop';
    const size = gsap.utils.random(3, 8);
    drop.style.width = `${size}px`;
    drop.style.height = `${size}px`;
    splashEl.appendChild(drop);
    drops.push(drop);
  }

  const tl = gsap.timeline({
    onComplete: () => drops.forEach((d) => d.remove()),
  });

  drops.forEach((drop) => {
    const angle = gsap.utils.random(-Math.PI, 0); // upward / sideways arc
    const distance = gsap.utils.random(40, 150);
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;

    tl.fromTo(
      drop,
      { x: 0, y: 0, opacity: 1, scale: gsap.utils.random(0.6, 1.2) },
      {
        x: dx,
        y: dy,
        opacity: 0,
        scale: 0.2,
        duration: gsap.utils.random(0.6, 1.1),
        ease: 'power2.out',
      },
      0
    );

    // gravity drop after the burst
    tl.to(
      drop,
      { y: `+=${gsap.utils.random(30, 80)}`, duration: 0.5, ease: 'power1.in' },
      0.2
    );
  });

  return tl;
}
