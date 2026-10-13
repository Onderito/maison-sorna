# 001 — Coordonner l’animation de l’accordéon FAQ

- **Status**: DONE
- **Commit**: 6ab5175
- **Severity**: MEDIUM
- **Category**: Interruptibility, physicality, cohesion
- **Estimated scope**: 2 files

## Problem

`/Users/onderulas/maison-sorna/components/faq-section.module.css:63` combines `flex: 1` with `min-height: min-content`. Answer height is animated, but the minimum-size constraint changes which rows share the remaining space. Glyph replacements at line 118 shrink to `scale(0.25)` with a different curve than the answer. These are code findings; subjective smoothness must be checked in a hydrated browser.

```css
.item { flex: 1; min-height: min-content; }
.minus { opacity: 0; transform: scale(0.25); }
.answer { transition: height 240ms cubic-bezier(0.23, 1, 0.32, 1); }
```

## Target

- Use `flex: 1 0 auto; min-height: 0` so measured answer height contributes directly to each row’s basis.
- Define local `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)` and `--faq-toggle-duration: 200ms` on `.section`. No shared global easing tokens exist.
- Keep interruptible CSS height transitions, the existing ResizeObserver, and one exclusive open ID.
- Replace the two glyphs in `/Users/onderulas/maison-sorna/components/faq-accordion.tsx:46` with two decorative 12px × 1px lines. The vertical bar rotates from 90deg to 0deg and fades out over 200ms with `--ease-out`.
- Answer text moves from `translateY(4px)` to `translateY(0)` over 200ms; opacity uses 160ms on opening and 120ms on closing, without delays.
- Add a pointer-events-none row background pseudo-element, brown at 4% alpha, animated only through opacity over 160ms ease. Hover is restricted to `(hover: hover) and (pointer: fine)`; press and visible focus provide feedback on all inputs.
- Reduced motion: height and bar rotation change immediately, text and background retain a 120ms opacity transition, no translation.

## Repo conventions to follow

`faq-accordion.tsx:37` uses a real button with aria-expanded/aria-controls, and its stretched `::after` makes the entire card clickable. Preserve it. Closed answer regions remain aria-hidden and inert. The section stays one viewport tall with existing short-screen exceptions.

## Steps

1. Update the indicator spans; keep every answer and question unchanged.
2. Apply the local tokens, flexible basis, synchronized answer transitions, and decorative bar rules to faq-section.module.css.
3. Add gated hover, active, visible-focus, and reduced-motion rules.

## Boundaries

Do not change the Le geste section, Shopify, page backgrounds, FAQ copy, disabled contact button, exclusive selection, or click coverage. No dependencies.

## Verification

- `npx eslint components/faq-accordion.tsx` and `npx tsc --noEmit` pass.
- Build with `npm run build -- --webpack`.
- In a hydrated browser switch across every question, click the answer text and card edges, then click rapidly during expansion; motion must retarget without resetting.
- Check 375×812 and 320×640; all five rows and the contact button stay inside the FAQ.
- Focus a question and use Enter/Space; focus stays visible. Closed answers are inert. Check reduced motion on a real browser/device.
- **Done when**: exclusive opening and all-card clicks remain functional, answer height and rows move together, glyphs no longer shrink, and the above checks pass or concrete testing limitations are recorded.

## Verification result

Implemented through the separately invoked animate skill. ESLint, TypeScript, production webpack build and diff checks pass. Hydrated production preview verifies all five exclusive states, inert closed regions, answer-text and card-edge clicks, rapid switching, Enter and Space. The full FAQ remains inside 375×812 and 320×640 layouts without horizontal overflow. Reduced-motion rules are implemented; the browser tool exposes no preference-emulation capability, so real-device preference testing remains a feel check. The development preview did not hydrate; production verification succeeded without changing unrelated development setup.
