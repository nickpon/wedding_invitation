import gsap from 'gsap';

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Same motion as einvite.ru/soul click animation. */
export function initEnvelopeIntro(onOpen) {
  const intro = document.querySelector('#envelope-intro');
  const sealBtn = document.querySelector('#envelope-seal');
  if (!intro || !sealBtn) {
    onOpen?.();
    return;
  }

  if (prefersReduced) {
    intro.remove();
    document.body.classList.remove('intro-locked');
    onOpen?.();
    return;
  }

  document.body.classList.add('intro-locked');

  let opening = false;
  const art = intro.querySelector('.envelope-art');
  const shiftX = () => Math.min(110, art.offsetWidth * 0.34);
  const shiftY = () => Math.min(170, art.offsetHeight * 0.35);

  const openEnvelope = () => {
    if (opening) return;
    opening = true;
    sealBtn.disabled = true;

    const tl = gsap.timeline({
      onComplete: () => {
        intro.remove();
        document.body.classList.remove('intro-locked');
        onOpen?.();
      },
    });

    const x = shiftX();
    const y = shiftY();

    tl.to('.envelope-art__seal', {
        scale: 0.92,
        opacity: 0,
        duration: 0.28,
        ease: 'power2.in',
      }, 0.1)

      .to(
        '.envelope-art__side--left',
        { x: -x, opacity: 0, duration: 1.8, ease: 'power2.in' },
        0.05
      )
      .to(
        '.envelope-art__side--right',
        { x, opacity: 0, duration: 1.8, ease: 'power2.in' },
        0.05
      )
      .to(
        '.envelope-art__flap--top',
        { y: -y, opacity: 0, duration: 1.2, ease: 'power2.in' },
        0.05
      )
      .to(
        '.envelope-art__flap--bottom',
        { y, opacity: 0, duration: 1.2, ease: 'power2.in' },
        0.05
      )

      .to('.envelope-art__heading', { y: -14, opacity: 0, duration: 0.55, ease: 'power2.in' }, 0.2)
      .to('.envelope-art__footer', { y: 14, opacity: 0, duration: 0.55, ease: 'power2.in' }, 0.2)
      .to(intro, { opacity: 0, duration: 0.45, ease: 'power1.in' }, 0.85);
  };

  sealBtn.addEventListener('click', openEnvelope);
}
