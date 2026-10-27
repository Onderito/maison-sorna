"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "./gsap";
import { ScrollTrigger } from "./scroll-trigger";

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

      function reveal(timeline: gsap.core.Timeline, element: HTMLElement, at: number) {
        if (revealed.current.has(element)) return;
        const shared = { onStart: () => { revealed.current.add(element); } };
        if (element === heading) {
          timeline.fromTo(element, { yPercent: 125 }, {
            ...shared, yPercent: 0, duration: 0.9, clearProps: "transform",
          }, at);
        } else if (element === photograph) {
          timeline.fromTo(element, { clipPath: "inset(0% 100% 0% 0%)" }, {
            ...shared, clipPath: "inset(0% 0% 0% 0%)", duration: 1.3, clearProps: "clipPath",
          }, at);
        } else {
          timeline.fromTo(element, { opacity: 0, y: 12 }, {
            ...shared, opacity: 1, y: 0, duration: 0.75, clearProps: "opacity,transform",
          }, at);
        }
      }

      if (context.conditions?.desktop) {
        // One composition, with room between starts and a gentle overlap.
        const timeline = gsap.timeline({
          defaults: { ease: "power2.out" },
          scrollTrigger: { trigger: section, start: "top 65%", once: true },
        });
        reveal(timeline, heading, 0);
        reveal(timeline, introduction, 0.3);
        reveal(timeline, photograph, 0.65);
        notes.forEach((note, index) => reveal(timeline, note, 1.3 + index * 0.16));
      } else {
        // Mobile uses a taller natural layout. Never spend an entrance on
        // an image or paragraph that is still below the viewport.
        const header = gsap.timeline({
          defaults: { ease: "power2.out" },
          scrollTrigger: { trigger: heading.parentElement, start: "top 80%", once: true },
        });
        reveal(header, heading, 0);
        reveal(header, introduction, 0.3);
        [photograph, ...notes].forEach((element) => {
          if (revealed.current.has(element)) return;
          const entrance = gsap.timeline({
            defaults: { ease: "power2.out" },
            scrollTrigger: { trigger: element, start: "top 82%", once: true },
          });
          reveal(entrance, element, 0);
        });
      }
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
