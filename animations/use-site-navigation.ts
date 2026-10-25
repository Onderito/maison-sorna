"use client";

import { useRef, useState } from "react";
import { CustomEase } from "gsap/CustomEase";
import { gsap, useGSAP } from "./gsap";

gsap.registerPlugin(CustomEase);

type NavigationState = { docked: boolean; surface: boolean; hidden: boolean };

export function useSiteNavigation(overlay: boolean, pathname: string, hydrated: boolean) {
  const headerRef = useRef<HTMLElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const surfaceRef = useRef<HTMLSpanElement>(null);
  const [state, setState] = useState<NavigationState>({ docked: !overlay, surface: false, hidden: false });

  useGSAP((_, contextSafe) => {
    const header = headerRef.current;
    const bar = barRef.current;
    const surfaceElement = surfaceRef.current;
    if (!header || !bar || !surfaceElement || !contextSafe) return;

    const ease = CustomEase.create("", "0.2,-0.03,0.52,0.99");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let previousY = Math.max(0, window.scrollY);
    let direction = 0;
    let accumulated = 0;
    let hidden = false;
    let frame = 0;
    let previousState: NavigationState | null = null;

    gsap.set(surfaceElement, { x: 0, xPercent: -50 });

    const update = contextSafe((immediate = false) => {
      const maxY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const y = Math.min(maxY, Math.max(0, window.scrollY));
      const delta = y - previousY;
      const nextDirection = Math.sign(delta);
      if (nextDirection && nextDirection !== direction) {
        direction = nextDirection;
        accumulated = 0;
      }
      accumulated += Math.abs(delta);
      if (y <= 48) hidden = false;
      else if (accumulated >= 24) hidden = direction > 0;
      if (header.contains(document.activeElement)) hidden = false;
      previousY = y;

      const docked = !overlay || y > 48;
      const surface = pathname !== "/panier" && (overlay ? y >= Math.max(48, window.innerHeight - 88) : y > 48);
      const next = { docked, surface, hidden };
      const duration = !previousState || immediate || reduced.matches ? 0 : 0.3;
      const options = { duration, ease, overwrite: "auto" as const };

      if (!previousState || previousState.hidden !== hidden || immediate) {
        gsap.to(header, { yPercent: hidden ? -100 : 0, y: hidden ? -48 : 0, ...options });
      }
      if (!previousState || previousState.docked !== docked || immediate) {
        gsap.to(bar, { y: docked ? 0 : Math.min(40, Math.max(16, window.innerHeight * 0.03)), ...options });
      }
      if (!previousState || previousState.surface !== surface || previousState.hidden !== hidden || immediate) {
        // Fade the beige surface in with the returning bar, rather than having
        // an already opaque background arrive from above the viewport.
        const visibleSurface = surface && !hidden;
        gsap.to(surfaceElement, { opacity: visibleSurface ? 1 : 0, y: visibleSurface ? 0 : -8, ...options });
      }

      previousState = next;
      setState((current) => current.docked === docked && current.surface === surface && current.hidden === hidden
        ? current : next);
    });

    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        update();
      });
    };
    const updateImmediately = () => update(true);
    const onFocus = () => update(document.activeElement?.matches(":focus-visible") ?? false);

    update(true);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", updateImmediately);
    reduced.addEventListener("change", updateImmediately);
    header.addEventListener("focusin", onFocus);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", updateImmediately);
      reduced.removeEventListener("change", updateImmediately);
      header.removeEventListener("focusin", onFocus);
    };
  }, { scope: headerRef, dependencies: [overlay, pathname, hydrated], revertOnUpdate: true });

  return { headerRef, barRef, surfaceRef, state };
}
