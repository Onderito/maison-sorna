"use client";

import { useLenis } from "lenis/react";
import { useEffect, type ReactNode } from "react";
import { useTeaCollectionEntrance } from "@/animations/use-tea-collection-entrance";
import styles from "./tea-collection.module.css";

export default function TeaCollectionEntrance({ children }: { children: ReactNode }) {
  const lenis = useLenis();
  const { sectionRef, revealImmediately } = useTeaCollectionEntrance();
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const links = Array.from(section.querySelectorAll<HTMLAnchorElement>("[data-collection-nav]"));
    const cards = Array.from(section.querySelectorAll<HTMLElement>("[data-collection-card]"));
    let frame = 0;
    let activeHash = "";
    const update = () => {
      const marker = innerHeight * 0.3;
      const current = cards.reduce<HTMLElement | undefined>((selected, card) =>
        card.getBoundingClientRect().top <= marker ? card : selected, cards[0]);
      if (!current || activeHash === `#${current.id}`) return;
      activeHash = `#${current.id}`;
      links.forEach((link) => {
        if (link.hash === activeHash) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    };
    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => { frame = 0; update(); });
    };
    // Recompute the visible chapter after every scroll, including anchor jumps
    // that skip intermediate intersection callbacks on these large cards.
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [sectionRef, children]);

  return (
    <section
      ref={sectionRef}
      id="les-cuvees"
      className={styles.section}
      aria-labelledby="collection-title"
      onClick={(event) => {
        if (!(event.target instanceof Element)) return;
        const link = event.target.closest<HTMLAnchorElement>("[data-collection-nav]");
        if (!link || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey || event.button !== 0) return;
        const card = document.getElementById(link.hash.slice(1));
        if (!card) return;
        event.preventDefault();
        // Lenis also handles document-level anchor clicks; keep this local
        // offset from being replaced by the global scroll padding a second time.
        event.stopPropagation();
        const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
        const transform = getComputedStyle(card).transform;
        const entranceY = transform === "none" ? 0 : new DOMMatrixReadOnly(transform).m42;
        const top = Math.max(0, scrollY + card.getBoundingClientRect().top - entranceY - 24);
        history.replaceState(history.state, "", link.hash);
        if (lenis) lenis.scrollTo(top, { immediate: reduced });
        else window.scrollTo({ top, behavior: reduced ? "instant" : "smooth" });
      }}
      onFocusCapture={(event) => {
        // Next.js focuses the section itself after hash navigation. Only
        // finish the entrance when a product receives keyboard focus.
        if (event.target.matches(":focus-visible") && event.target.closest("[data-collection-card]")) revealImmediately(event.target.closest<HTMLElement>("[data-collection-card]") ?? undefined);
      }}
      onPointerDownCapture={(event) => {
        if (event.target instanceof Element && event.target.closest("[data-collection-card]")) revealImmediately(event.target.closest<HTMLElement>("[data-collection-card]") ?? undefined);
      }}
    >
      {children}
    </section>
  );
}
