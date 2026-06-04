// Lightweight pastel fireworks on a fixed canvas overlay.
// Bursts auto-clear once all particles fade out.

const PALETTE = ['#f4c2d7', '#e79bb8', '#d4af87', '#f7e0a8', '#c9b6e4', '#ffffff'];

export function createFireworks(canvas) {
  const ctx = canvas.getContext('2d');
  let particles = [];
  let rafId = null;
  let dpr = 1;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
  }

  window.addEventListener('resize', resize);
  resize();

  function spawnBurst(x, y) {
    const count = 46;
    const color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.2;
      const speed = 2 + Math.random() * 4.5;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        decay: 0.012 + Math.random() * 0.018,
        size: 1.5 + Math.random() * 2.5,
        color: Math.random() > 0.5 ? color : PALETTE[Math.floor(Math.random() * PALETTE.length)],
      });
    }
  }

  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      p.vy += 0.04; // gravity
      p.vx *= 0.985;
      p.vy *= 0.985;
      p.x += p.vx * dpr;
      p.y += p.vy * dpr;
      p.life -= p.decay;

      if (p.life > 0) {
        ctx.globalAlpha = Math.max(p.life, 0);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * dpr, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    ctx.globalAlpha = 1;
    particles = particles.filter((p) => p.life > 0);

    if (particles.length > 0) {
      rafId = requestAnimationFrame(tick);
    } else {
      cancelAnimationFrame(rafId);
      rafId = null;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  function play() {
    const cx = canvas.width / 2;
    const cy = canvas.height * 0.34;
    spawnBurst(cx, cy);
    setTimeout(() => spawnBurst(cx - canvas.width * 0.2, cy - canvas.height * 0.08), 220);
    setTimeout(() => spawnBurst(cx + canvas.width * 0.2, cy - canvas.height * 0.05), 420);
    if (!rafId) tick();
  }

  return { play };
}
