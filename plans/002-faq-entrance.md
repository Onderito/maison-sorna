# 002 — Donner une entrée discrète à la FAQ

- **Status**: SUPERSEDED — 28 octobre 2026
- **Commit**: 6ab5175
- **Severity**: LOW
- **Category**: Missed opportunities
- **Estimated scope**: 3 files

> Remplacé par la simplification documentée dans `animations/README.md` : pas de hauteur animée, de ResizeObserver ni de refresh au clic ; image fixe et entrée courte. Ne pas réappliquer ce plan historique.

## Problem

`/Users/onderulas/maison-sorna/components/faq-section.tsx:36` renders a static section. Title, description, photograph, rows and contact currently arrive together without any entrance. For this occasional marketing section, a small stagger provides spatial continuity with the process that precedes it.

## Target

- Add `/Users/onderulas/maison-sorna/components/faq-entrance.tsx`, a small Client Component wrapping the existing Server Component children in the same labelled `section`.
- Use one IntersectionObserver when 80% of the visible section/viewport area is reached. Threshold is `0.8 * min(1, viewportHeight / sectionHeight)` so short landscape layouts can still reveal. Recompute on section or viewport resize until revealed. `data-entrance` is pending before that threshold, visible after it, immediate on keyboard focus or reduced-motion preference. Disconnect after revealing. Without JavaScript all content stays visible. The initial 15% trigger was replaced after user feedback that the entrance finished before arrival.
- Use CSS keyframes only for this one-time entrance: opacity 0→1 and translateY(8px)→0, 360ms `cubic-bezier(0.23, 1, 0.32, 1)`.
- Delays: title 0ms, introduction 50ms, photograph 100ms, rows 150/200/250/300/350ms, disabled contact 400ms. Photograph uses 600ms with the same easing. Clip overflowing photograph content, keep the grain overlay.
- Entry never blocks interactions. Keyboard focus switches to immediate visibility. No replay when scrolling back. Reduced motion uses only a short 120ms fade with no stagger/translation.

## Repo conventions to follow

Use the same client-wrapper/server-children arrangement as `/Users/onderulas/maison-sorna/app/infuser/_components/tea-card-entrance.tsx`. Reuse `--ease-out` introduced by plan 001. Keep CSS in faq-section.module.css, static content in faq-section.tsx, existing measurements/state in faq-accordion.tsx.

## Steps

1. Add the wrapper and its once-only observer and preference cleanup.
2. Replace only the section opening/closing tags in faq-section.tsx with FaqEntrance.
3. Add pending/visible/immediate and reduced-motion selectors for the listed existing classes.

## Boundaries

No layout changes, new backgrounds, parallax, continuous photo zoom, disabled-button hover, dependencies or global scroll changes. Accordion toggling must never restart entry keyframes.

## Verification

- Lint the FAQ TSX files, run TypeScript, production build and `git diff --check`.
- Enter from the process and confirm title → photo → rows with 50ms separation, no replay on re-entry, no interaction delay.
- Tab into FAQ during entry; every element becomes visible immediately.
- Check no-JavaScript/static fallback and reduced motion. Inspect desktop and mobile final alignment.
- Slow animation playback in DevTools and check that row entry transforms do not interfere with height transitions; assess touch responsiveness on a real device.
- **Done when**: animation runs once and final layout/accessibility are unchanged; any limits of the browser test environment are recorded.

## Verification result

Implemented through animate. Final production preview verifies pending before entry, visible on first entry, and visible without a replay on second entry after scrolling away. Real Tab navigation switches it to immediate. Accordion interaction preserves the entrance state. The static development fallback stays visible when hydration is unavailable. Desktop and two mobile dimensions preserve final alignment. ESLint, TypeScript, production build and diff checks pass. Reduced-motion CSS and preference-change cleanup are reviewed; actual OS-preference emulation and physical touch-device feel checks are not exposed by the browser tool.
