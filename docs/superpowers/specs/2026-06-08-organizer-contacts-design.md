# Organizer Contacts Section — Design Spec

**Date:** 2026-06-08  
**Feature:** Add organizer contacts block to the wedding invitation page

---

## Summary

Add a new full `<section id="organizer">` between `#rsvp` and `<footer>`, styled consistently with existing sections. Pure typographic approach — no card background, no avatar, no graphic elements beyond the existing ornamental divider pattern.

---

## Placement

Between `#rsvp` and `<footer>` in `index.html`.

---

## Content

| Element | Content |
|---|---|
| `section-title` | Контакты организатора |
| Section subtitle | *(none)* |
| Intro paragraph | Если вы планируете подготовить для нас сюрприз или у вас появятся организационные вопросы в день торжества, вы можете обратиться к нашему свадебному организатору. |
| Ornamental rule | thin gradient divider, 40px wide |
| Name | Ника |
| Phone | +7 (968) 664 02 12 |
| Closing line | Не стесняйтесь обращаться за помощью — Ника с радостью подскажет и поможет всё организовать. |

---

## Typography & Visual Style

All elements centered. No card/panel background — pure whitespace rhythm.

- **Section title** — `.section-title` (existing class). Cormorant Garamond 600, with existing gradient underline rule via `::after`.
- **Intro paragraph** — Cormorant Garamond italic, `clamp(1.05rem, 2.8vw, 1.22rem)`, `var(--text-soft)`, max-width ~520px, `line-height: 1.7`.
- **Ornamental rule** — `<span>` with `display:block`, `width:40px`, `height:1px`, `background: linear-gradient(90deg, transparent, var(--accent-deep), transparent)`, `margin: 2rem auto`.
- **Name "Ника"** — Italianno script (`var(--font-script)`), `clamp(2.4rem, 6vw, 3.2rem)`, `var(--accent-deep)`. Same feel as `.footer__sign`.
- **Phone number** — Nunito weight 300, `clamp(1.1rem, 3vw, 1.3rem)`, `var(--gold)`, `letter-spacing: 0.18em`. Wrapped in `<a href="tel:+79686640212">` for tappability.
- **Closing line** — Cormorant Garamond italic, `clamp(0.95rem, 2.5vw, 1.1rem)`, `var(--text-soft)`, max-width ~480px.

---

## Animation

All content elements carry `.js-reveal` — picked up by the existing `gsap.utils.toArray('.js-reveal')` loop in `main.js`. No new JS needed.

---

## CSS

New BEM block `.organizer` added to `src/styles/main.css`. Padding matches `.gifts` (`clamp(2.5rem, 8vw, 5rem) 1.5rem`). Inner container `max-width: 600px`, `margin: 0 auto`, `text-align: center`.

---

## Files Changed

| File | Change |
|---|---|
| `index.html` | Add `<section id="organizer">` between `#rsvp` and `<footer>` |
| `src/styles/main.css` | Add `.organizer` block styles |

No changes to `main.js` — `.js-reveal` is already wired up globally.
