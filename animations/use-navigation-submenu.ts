"use client";

import { useRef, useState } from "react";
import { CustomEase } from "gsap/CustomEase";
import { gsap, useGSAP } from "./gsap";

gsap.registerPlugin(CustomEase);

export function useNavigationSubmenu() {
  const groupRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const [expanded, setExpanded] = useState(false);

  useGSAP((_, contextSafe) => {
    const group = groupRef.current;
    const panel = panelRef.current;
    const toggle = toggleRef.current;
    if (!group || !panel || !toggle || !contextSafe) return;

    const hover = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktop = window.matchMedia("(min-width: 768px)");
    const ease = CustomEase.create("", "0.2,-0.03,0.52,0.99");
    let open = false;
    let closeTimer = 0;
    gsap.set(panel, { autoAlpha: 0, y: -6 });

    const update = contextSafe((next: boolean, immediate = false) => {
      window.clearTimeout(closeTimer);
      open = next;
      panel.inert = !next;
      setExpanded(next);
      gsap.to(panel, {
        autoAlpha: next ? 1 : 0,
        y: next || reduced.matches ? 0 : -6,
        duration: immediate || reduced.matches ? 0 : next ? 0.22 : 0.16,
        ease,
        overwrite: "auto",
      });
    });
    const enter = (event: PointerEvent) => {
      if (hover.matches && event.pointerType === "mouse") update(true);
    };
    const leave = () => {
      if (!group.contains(document.activeElement)) {
        closeTimer = window.setTimeout(() => update(false), 100);
      }
    };
    const focus = (event: FocusEvent) => {
      if (event.target instanceof HTMLElement && event.target.matches(":focus-visible") &&
          !group.contains(event.relatedTarget as Node | null)) update(true, true);
    };
    const blur = (event: FocusEvent) => {
      if (!group.contains(event.relatedTarget as Node | null)) update(false, true);
    };
    const click = (event: MouseEvent) => update(
      hover.matches && event.detail > 0 ? true : !open,
      toggle.matches(":focus-visible"),
    );
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && open) {
        event.preventDefault();
        event.stopPropagation();
        toggle.focus({ preventScroll: true });
        update(false, true);
      }
      if (event.key === "ArrowDown" && event.target === toggle) {
        event.preventDefault();
        update(true, true);
        panel.querySelector<HTMLAnchorElement>("a")?.focus();
      }
    };
    const outside = (event: PointerEvent) => {
      if (!group.contains(event.target as Node)) update(false);
    };
    const navigate = (event: MouseEvent) => {
      if ((event.target as Element).closest("a")) update(false, true);
    };
    const reset = () => { if (open) update(false, true); };

    group.addEventListener("pointerenter", enter);
    group.addEventListener("pointerleave", leave);
    group.addEventListener("focusin", focus);
    group.addEventListener("focusout", blur);
    group.addEventListener("keydown", keydown);
    group.addEventListener("click", navigate);
    toggle.addEventListener("click", click);
    document.addEventListener("pointerdown", outside);
    window.addEventListener("scroll", reset, { passive: true });
    desktop.addEventListener("change", reset);
    reduced.addEventListener("change", reset);
    return () => {
      window.clearTimeout(closeTimer);
      group.removeEventListener("pointerenter", enter);
      group.removeEventListener("pointerleave", leave);
      group.removeEventListener("focusin", focus);
      group.removeEventListener("focusout", blur);
      group.removeEventListener("keydown", keydown);
      group.removeEventListener("click", navigate);
      toggle.removeEventListener("click", click);
      document.removeEventListener("pointerdown", outside);
      window.removeEventListener("scroll", reset);
      desktop.removeEventListener("change", reset);
      reduced.removeEventListener("change", reset);
    };
  }, { scope: groupRef });

  return { groupRef, panelRef, toggleRef, expanded };
}
