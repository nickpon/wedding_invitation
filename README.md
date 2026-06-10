# Свадьба Коли и Поли — wedding invitation site

A single-page, Russian-language wedding invitation for **Коля & Поля** (8 августа 2026).

Vanilla ES modules, bundled by Vite, animated with GSAP + ScrollTrigger. No framework, no tests, no linter.

## Tech stack

- **Vite 6** — dev server and production bundler.
- **GSAP 3** with `ScrollTrigger` — envelope intro, pinned/scrubbed hero scene, reveal animations.
- **HTML `<canvas>`** — fireworks burst.
- **Google Apps Script** — RSVP backend (appends rows to a Google Sheet).

Respects `prefers-reduced-motion` — both the envelope intro and the hero scrub short-circuit to their finished state. All content is in Russian.

## Local development

Requires Node.js 18+ and npm.

```bash
npm install
npm run dev
```

Vite serves on `http://localhost:5173` (LAN-accessible).

Create a `.env` file with the Apps Script Web App URL so the RSVP form works:

```env
VITE_RSVP_SCRIPT_URL=https://script.google.com/macros/s/XXXXXXXXXXXX/exec
```

### Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Vite dev server. |
| `npm run build` | Production build to `dist/`. |
| `npm run preview` | Serve the built `dist/` locally. |
| `npm run prepare:envelope` | Regenerate `public/assets/envelope/` from sources. Requires ImageMagick. |

## RSVP backend

The form POSTs JSON to a Google Apps Script Web App. To wire up a fresh Sheet:

1. Create a Google Sheet, open **Extensions → Apps Script**, paste `scripts/google-apps-script/Code.gs`.
2. Run `createSheetHeader` once and grant permissions.
3. **Deploy → New deployment → Web app**, *Execute as: Me*, *Who has access: Anyone*.
4. Copy the URL into `.env` as `VITE_RSVP_SCRIPT_URL` and rebuild.

The form sends `Content-Type: text/plain;charset=utf-8` on purpose — anything else triggers a CORS preflight that Apps Script doesn't handle.

## Deployment

`npm run build` produces a static site in `dist/`. Upload the contents of `dist/` to any static host (Netlify, Vercel, Cloudflare Pages, S3+CloudFront, nginx, GitHub Pages).

`VITE_RSVP_SCRIPT_URL` is inlined at build time — set it in the build environment and rebuild whenever it changes.

For HTTP caching, serve hashed assets in `dist/assets/` with a long `Cache-Control: immutable` and `index.html` with `Cache-Control: no-cache`.

## Licence

Private project. No licence granted.
