"use client";

import { useRef } from "react";
import { SplitText } from "gsap/SplitText";
import { gsap, useGSAP } from "./gsap";
import { ScrollTrigger } from "./scroll-trigger";
import { createEditorialTextReveal } from "./create-editorial-text-reveal";

gsap.registerPlugin(SplitText);

export function useRegardSectionReveal() {
  const sectionRef = useRef<HTMLElement>(null);
  const revealed = useRef(new Set<HTMLElement>());

  useGSAP(() => {
    const section = sectionRef.current;
    if (!section) return;
    const heading = section.querySelector<HTMLElement>("[data-regard-title]");
    const introduction = section.querySelector<HTMLElement>("[data-regard-introduction]");
    const photograph = section.querySelector<HTMLElement>("[data-regard-photo]");
    const notes = Array.from(section.querySelectorAll<HTMLElement>("[data-regard-note]"));
    if (!heading || !introduction || !photograph || !notes.length) return;

    const media = gsap.matchMedia();
    media.add({
      desktop: "(min-width: 768px)",
      mobile: "(max-width: 767px)",
      reduced: "(prefers-reduced-motion: reduce)",
    }, (context) => {
      if (context.conditions?.reduced) {
        [heading, introduction, photograph, ...notes].forEach((element) => revealed.current.add(element));
        return;
      }

      const splits: SplitText[] = [];
      const desktop = Boolean(context.conditions?.desktop);

      function revealCopy(element: HTMLElement, at: number) {
        if (revealed.current.has(element)) return;
        const targets = element.matches("p") ? [element] : Array.from(element.querySelectorAll("h3, p"));
        const triggerElement = desktop ? section : element === introduction ? heading?.parentElement : element;
        if (!triggerElement || !targets.length) return;
        const threshold = desktop ? 0.65 : element === introduction ? 0.8 : 0.82;
        splits.push(SplitText.create(targets, {
          type: "lines,words", mask: "lines", linesClass: "regard-copy-line",
          autoSplit: true, deepSlice: true, aria: "none",
          onSplit: (split) => {
            if (revealed.current.has(element)) return;
            const entrance = createEditorialTextReveal(split, () => { revealed.current.add(element); });
            let started = false;
            const reveal = () => {
              if (started) return;
              started = true;
              if (element.getBoundingClientRect().bottom <= 0) {
                revealed.current.add(element);
                entrance.progress(1).pause();
              } else {
                entrance.delay(at).play();
              }
            };
            const revealReachedCopy = () => {
              if (triggerElement.getBoundingClientRect().top <= window.innerHeight * threshold) reveal();
            };
            ScrollTrigger.create({
              trigger: triggerElement, start: `top ${threshold * 100}%`, once: true,
              animation: entrance, toggleActions: "none none none none",
              onEnter: reveal, onRefresh: revealReachedCopy,
            });
            revealReachedCopy();
            return entrance;
          },
        }));
      }

      function reveal(timeline: gsap.core.Timeline, element: HTMLElement, at: number) {
        if (revealed.current.has(element)) return;
        const shared = { onStart: () => { revealed.current.add(element); } };
        if (element === heading) {
          timeline.fromTo(element, { yPercent: 125 }, {
            ...shared, yPercent: 0, duration: 0.9, clearProps: "transform",
          }, at);
        } else if (element === photograph) {
          timeline.fromTo(element, { opacity: 0, y: 18 }, {
            ...shared, opacity: 1, y: 0, duration: 1.3, clearProps: "opacity,transform",
          }, at);
        }
      }

      if (desktop) {
        // One composition, with room between starts and a gentle overlap.
        const timeline = gsap.timeline({
          defaults: { ease: "power2.out" },
          scrollTrigger: { trigger: section, start: "top 65%", once: true },
        });
        reveal(timeline, heading, 0);
        revealCopy(introduction, 0.3);
        reveal(timeline, photograph, 0.65);
        notes.forEach((note, index) => revealCopy(note, 1.3 + index * 0.16));
      } else {
        // Mobile uses a taller natural layout. Never spend an entrance on
        // an image or paragraph that is still below the viewport.
        const header = gsap.timeline({
          defaults: { ease: "power2.out" },
          scrollTrigger: { trigger: heading.parentElement, start: "top 80%", once: true },
        });
        reveal(header, heading, 0);
        revealCopy(introduction, 0.3);
        [photograph].forEach((element) => {
          if (revealed.current.has(element)) return;
          const entrance = gsap.timeline({
            defaults: { ease: "power2.out" },
            scrollTrigger: { trigger: element, start: "top 82%", once: true },
          });
          reveal(entrance, element, 0);
        });
        notes.forEach((note) => revealCopy(note, 0));
      }
      return () => { splits.forEach((split) => split.revert()); };
    }, section);

    let active = true;
    if (document.fonts.status === "loading") {
      void document.fonts.ready.then(() => { if (active) ScrollTrigger.refresh(); });
    }
    return () => {
      active = false;
      media.revert();
    };
  }, { scope: sectionRef });

  return { sectionRef };
}
