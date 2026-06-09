// Single-line / graphic-designer style champagne flutes.
// The outline is drawn with one clean, even stroke weight (line-art look),
// the bowl is filled with stylised yellow champagne, and the liquid lives in
// its own group so the animation layer can keep its surface horizontal while
// the glass tilts for the toast.
//
// Structure (per glass):
//   <g clip-path>            -> clips liquid to the bowl interior
//     <g class="liquid-rot"> -> counter-rotated to keep the surface level
//       <g class="liquid">   -> translated to raise / lower the level
//         <rect> fill + <rect> glossy surface line
//   <g> outline (rim, bowl, stem, base) + decorative fizz

function fizzInside(side) {
  const dots =
    side === 'left'
      ? [
          [92, 168, 2.2], [104, 150, 1.6], [88, 138, 1.9], [100, 122, 1.4],
          [96, 186, 1.7], [108, 132, 1.3], [84, 158, 1.5], [102, 178, 1.2],
          [90, 145, 1.8], [106, 162, 1.4], [94, 128, 1.1],
        ]
      : [
          [108, 170, 2.1], [96, 152, 1.6], [112, 140, 1.8], [100, 124, 1.4],
          [104, 188, 1.7], [92, 134, 1.3], [116, 160, 1.5], [98, 180, 1.2],
          [110, 147, 1.8], [94, 164, 1.4], [106, 130, 1.1],
        ];
  return dots
    .map(([cx, cy, r]) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#ffffff" opacity="0.55"/>`)
    .join('');
}

function fizzAbove(side) {
  const dots =
    side === 'left'
      ? [
          [112, 20, 5], [134, 6, 3.4], [98, 6, 3], [126, 30, 2.6],
          [118, 14, 2.2], [140, 24, 2.8], [106, 28, 2], [132, 4, 2.5], [90, 18, 2.3],
          [122, 36, 1.8],
        ]
      : [
          [88, 20, 5], [66, 6, 3.4], [102, 6, 3], [74, 30, 2.6],
          [82, 14, 2.2], [60, 24, 2.8], [94, 28, 2], [68, 4, 2.5], [110, 18, 2.3],
          [78, 36, 1.8],
        ];
  return dots
    .map(
      ([cx, cy, r]) =>
        `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#6b5560" stroke-width="2"/>`
    )
    .join('');
}

export function glassSvg(side) {
  const clip = `bowlclip-${side}`;
  const grad = `champ-${side}`;
  return `
  <svg viewBox="0 0 200 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Бокал шампанского">
    <defs>
      <linearGradient id="${grad}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#f8e9a6"/>
        <stop offset="55%" stop-color="#f1d878"/>
        <stop offset="100%" stop-color="#e6c258"/>
      </linearGradient>
      <clipPath id="${clip}">
        <path d="M51,46 C55,120 87,206 100,212 C113,206 145,120 149,46 Z"/>
      </clipPath>
    </defs>

    <!-- whole glass tilts as one group; the liquid counter-rotates inside it -->
    <g class="tilt">
      <!-- champagne (surface kept horizontal by the counter-rotation layer) -->
      <g clip-path="url(#${clip})">
        <g class="liquid-rot">
          <g class="liquid">
            <rect x="-160" y="150" width="520" height="470" fill="url(#${grad})"/>
            <rect x="-160" y="150" width="520" height="2.6" fill="#fffad8" opacity="0.7"/>
          </g>
        </g>
      </g>

      <!-- bubbles drifting inside the bowl -->
      <g class="fizz-inside">${fizzInside(side)}</g>

      <!-- line-art outline -->
      <g fill="none" stroke="#6b5560" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <!-- rim -->
        <path d="M48,44 C50,32 150,32 152,46 C152,58 48,58 50,44"/>
        <!-- bowl sides -->
        <path d="M49,47 C53,120 86,205 100,214"/>
        <path d="M151,47 C147,120 114,205 100,214"/>
        <!-- stem -->
        <path d="M100,214 L100,300"/>
        <!-- base -->
        <path d="M61,308 C61,299 139,299 139,308 C139,317 61,317 63,308"/>
      </g>

      <!-- rising bubbles above the rim -->
      <g class="fizz-above">${fizzAbove(side)}</g>
    </g>
  </svg>`;
}
