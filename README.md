# Свадьба Коли и Поли — wedding invitation site

A single-page, Russian-language wedding invitation for **Коля & Поля**, marrying on **8 августа 2026** at банкетный зал «Кедр» (UspenSKY) in the Odintsovo district just outside Moscow.

The page is a small, hand-crafted experience rather than a generic template. It is built with vanilla ES modules, bundled by Vite, and animated with GSAP. There is no framework, no test runner, and no linter.

---

## What the page does

When a guest opens the site:

1. **Envelope intro.** The body is scroll-locked and a stylised envelope sits centred on screen with a dusty-rose wax seal labelled *открыть здесь* ("open here"). Clicking the seal plays an open-envelope animation and unlocks the page.
2. **Hero / champagne scene.** A pinned, scroll-scrubbed scene shows two SVG champagne flutes that tilt toward each other as the guest scrolls. When the glasses meet, a splash of liquid and a burst of fireworks fire once. The main title (*Свадьба Коли и Поли*) and a stamped 08 · 08 · 2026 datemark fade in behind them.
3. **Программа дня** — the day's timeline (welcome, ceremony, banquet).
4. **Место торжества** — venue address, travel notes, and an embedded Yandex map with a "build route" link.
5. **Дресс-код** — a polite dress-code note plus a swatch palette (chocolate, warm beige, olive, honey sand, dusty rose, slate-blue).
6. **О подарках** — a soft message about gifts.
7. **RSVP form.** Guests confirm attendance, whether they need a transfer from Moscow, drink preferences, main course, allergies, and a wishes/comments field. The form posts to a Google Apps Script Web App which appends a row to a Google Sheet.
8. **Контакты организатора** — phone and Telegram link for the wedding organiser.
9. A short footer signoff.

The page respects `prefers-reduced-motion`: both the envelope intro and the scroll-driven hero scene short-circuit to their finished state.

All content is in Russian.

---

## Tech stack

- **Vite 6** — dev server and production bundler.
- **Vanilla ES modules** — no framework.
- **GSAP 3** with the `ScrollTrigger` plugin — envelope intro, hero pinning/scrubbing, reveal animations.
- **HTML `<canvas>`** — the fireworks burst.
- **Google Apps Script** — RSVP backend that appends submissions to a Google Sheet.
- **ImageMagick** (only for `npm run prepare:envelope`) — recolours the wax-seal PNG into a dusty-rose tonal ramp.

No tests, no linter, no TypeScript.

---

## Project layout

```
.
├── index.html                       # All page markup and section anchors
├── vite.config.js                   # host:true, port 5173, assetsInlineLimit:0
├── public/
│   └── assets/envelope/             # Envelope SVGs + recoloured wax seal (committed)
├── scripts/
│   ├── envelope-sources/            # Raw envelope SVGs + black-and-white wax PNG
│   ├── prepare-envelope-assets.mjs  # Re-generates public/assets/envelope/
│   └── google-apps-script/Code.gs   # RSVP backend (paste into Apps Script)
└── src/
    ├── main.js                      # Entry point — renders content, wires animations
    ├── animations/
    │   ├── envelopeIntro.js         # Click-to-open seal, body lock/unlock
    │   ├── heroScene.js             # Pinned, scrubbed champagne flute scene
    │   ├── splash.js                # Liquid splash when the glasses meet
    │   └── fireworks.js             # Canvas fireworks burst
    ├── components/glasses.svg.js    # Raw SVG markup for the two flutes
    ├── content/
    │   ├── schedule.js              # Editable timeline items
    │   └── dressCode.js             # Palette swatches (hex + tint)
    ├── config/rsvp.js               # Reads VITE_RSVP_SCRIPT_URL from env
    ├── rsvp/form.js                 # Form rendering, validation, POST to Sheets
    └── styles/main.css              # All page styling (~1.2k lines)
```

A few architectural details worth knowing before editing:

- `main.js` initialises the hero scene **before** the envelope intro and passes `hero.playIntro` as the seal-click callback. The glasses start with `opacity: 0` and only appear once the envelope opens.
- Browser scroll restoration is forced to `manual` (both in an inline `<script>` in `index.html` and in `main.js`) so a reload mid-page cannot skip the pinned hero scene.
- The glass tilt and the champagne surface use **native SVG `transform="rotate(deg cx cy)"`** rather than GSAP/CSS transforms, so the pivot anchors to the foot of the flute and the liquid surface stays level. Don't swap these for CSS rotations.

---

## Local development

### Prerequisites

- **Node.js 18+** and **npm**.
- A modern browser (Chrome, Safari, Firefox).
- ImageMagick's `magick` CLI **only** if you intend to regenerate envelope assets (`npm run prepare:envelope`). Day-to-day editing does not require it — the generated assets are committed under `public/assets/envelope/`.

### Install and run

```bash
git clone https://github.com/nickpon/wedding_invitation.git
cd wedding_invitation
npm install
```

Create a `.env` file in the project root with your Google Apps Script Web App URL:

```env
VITE_RSVP_SCRIPT_URL=https://script.google.com/macros/s/XXXXXXXXXXXX/exec
```

If `VITE_RSVP_SCRIPT_URL` is empty, the page still loads but the RSVP form shows a visible error on submit instead of silently failing. You can develop the rest of the page without setting it.

Start the dev server:

```bash
npm run dev
```

Vite serves on `http://localhost:5173`. `server.host: true` means the same URL is reachable from other devices on your LAN (handy for previewing on a phone).

### Available scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Vite dev server on port 5173, accessible on LAN. |
| `npm run build` | Production build to `dist/`. `assetsInlineLimit: 0` keeps envelope assets as separate files instead of inlining them. |
| `npm run preview` | Serve the built `dist/` locally (for sanity-checking before deploy). |
| `npm run prepare:envelope` | Regenerate `public/assets/envelope/` from `scripts/envelope-sources/`. Requires ImageMagick (`magick`) on `PATH`. The output is committed; only re-run when the source SVGs or wax PNG change. |

There are no tests or lint configs. Verify changes by running `npm run dev` and exercising the page.

---

## Editing content

Most copy lives in `index.html` and can be edited directly. Two pieces of structured content are JS modules:

- **`src/content/schedule.js`** — array of timeline items (`time`, `event`, optional `note`).
- **`src/content/dressCode.js`** — palette swatches as `{ name, hex, tint }`. The `tint` is consumed as a CSS custom property and used for the soft halo behind each swatch.

The two champagne flutes are raw SVG returned by `src/components/glasses.svg.js`. Sizes, stem proportions, and starting tilt angles live there.

The RSVP form's drink and meal options live at the top of `src/rsvp/form.js`.

---

## RSVP backend — Google Apps Script

The form POSTs JSON to a Google Apps Script Web App. To wire up a fresh Sheet:

1. Create a Google Sheet (e.g. *Свадьба — ответы гостей*).
2. **Extensions → Apps Script**, paste the contents of `scripts/google-apps-script/Code.gs`, and save.
3. From the Apps Script editor, run **`createSheetHeader`** once. Google will ask for permissions — allow.
4. **Deploy → New deployment → Web app**:
   - *Execute as:* **Me**.
   - *Who has access:* **Anyone**.
5. Copy the resulting Web App URL and paste it into `.env` as `VITE_RSVP_SCRIPT_URL=...`.
6. Rebuild: `npm run build`.

If you upgrade an existing deployment that predates the *Трансфер* column, run `addTransferColumn` once instead of `createSheetHeader` — it adds the new header without wiping existing rows.

**Important CORS detail.** The form sends `Content-Type: text/plain;charset=utf-8` on purpose: any other content type triggers a CORS preflight, which Apps Script Web Apps don't handle. Don't "fix" this to `application/json`.

---

## Building for production

```bash
npm run build
```

The output is a fully static site in `dist/`:

```
dist/
├── index.html
└── assets/                # Hashed JS/CSS + envelope artwork
```

Sanity-check it locally with `npm run preview` before uploading.

Vite inlines `import.meta.env.VITE_RSVP_SCRIPT_URL` at **build time**. If you change the Apps Script URL, you must rebuild — there is no runtime config.

---

## Deployment

The build output is a plain static site. Anything that serves static files works. The page is small (a single HTML file plus hashed JS/CSS and a handful of small assets), so any of the options below are appropriate.

### Option A — Static host (Netlify, Vercel, Cloudflare Pages)

1. Push the repo to GitHub (already done if you cloned from `nickpon/wedding_invitation`).
2. In the host's dashboard, create a new project pointing at this repo.
3. Settings:
   - **Build command:** `npm run build`
   - **Output / publish directory:** `dist`
   - **Node version:** 18 or newer
4. Add an environment variable named **`VITE_RSVP_SCRIPT_URL`** with your Apps Script Web App URL. Trigger a redeploy after setting it — Vite only reads it at build time.
5. Point your domain at the host and you're done. The default `dist/` build assumes the site is served from the domain root.

### Option B — GitHub Pages

1. Add an Actions workflow (e.g. `.github/workflows/pages.yml`) that runs `npm ci && npm run build` with `VITE_RSVP_SCRIPT_URL` exposed as a repo secret, then uploads `dist/` as the Pages artifact.
2. In **Settings → Pages**, switch the source to *GitHub Actions*.
3. If you serve the site from a project page (e.g. `username.github.io/wedding_invitation/`) rather than a custom domain root, set `base: '/wedding_invitation/'` in `vite.config.js` so asset URLs resolve correctly.

### Option C — Plain VPS (nginx, Caddy, Apache)

1. On your laptop, build with the production env var set:

   ```bash
   VITE_RSVP_SCRIPT_URL='https://script.google.com/macros/s/.../exec' npm run build
   ```

2. Copy `dist/` to the server:

   ```bash
   rsync -avz --delete dist/ user@server:/var/www/wedding/
   ```

3. Minimal nginx server block:

   ```nginx
   server {
     listen 80;
     server_name your-domain.example;
     root /var/www/wedding;
     index index.html;

     # Single-page site — fall back to index.html for unknown paths.
     location / {
       try_files $uri $uri/ /index.html;
     }

     # Cache hashed assets aggressively; never cache the entry HTML.
     location /assets/ {
       access_log off;
       expires 1y;
       add_header Cache-Control "public, immutable";
     }
     location = /index.html {
       add_header Cache-Control "no-cache";
     }
   }
   ```

4. Add HTTPS with Certbot or use Caddy, which handles certificates automatically.

### Option D — Object storage (S3 + CloudFront, etc.)

Upload `dist/` to a public bucket, point a CDN at it, and make sure the bucket / distribution serves `index.html` for the root and 404 paths.

### Pre-deploy checklist

- [ ] `VITE_RSVP_SCRIPT_URL` is set in the build environment, and rebuilt after any change.
- [ ] The Apps Script is deployed as a **Web app**, *Execute as: Me*, *Who has access: Anyone*.
- [ ] A test submission appears in the sheet (`npm run preview` is enough for this — the form hits the real Apps Script URL).
- [ ] HTTPS is enabled at the host — the Yandex Maps iframe and the Google Apps Script call both require a secure origin.
- [ ] The page renders correctly on a real phone (the envelope intro and hero scrub are the parts most likely to surprise on mobile).

---

## Accessibility and reduced motion

- Both the envelope intro and the hero scroll scene check `prefers-reduced-motion: reduce` and skip directly to the finished state with no scrubbing.
- The wax seal is a real `<button>` with an `aria-label`, so it is reachable by keyboard and screen readers.
- All decorative SVG (envelope flaps, glasses, fireworks canvas, ornaments) is `aria-hidden`.
- The Yandex map iframe carries a descriptive `title`.

---

## Licence

Private project. No licence granted. Please don't re-publish the artwork, copy, or photographs.
