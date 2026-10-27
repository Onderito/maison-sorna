"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "./gsap";
import { ScrollTrigger } from "./scroll-trigger";

export function useOriginChapterReveal() {
  const sectionRef = useRef<HTMLElement>(null);
  const revealed = useRef(new Set<HTMLElement>());

  useGSAP(() => {
    const section = sectionRef.current;
    if (!section) return;

    const media = gsap.matchMedia();
    media.add({
      desktop: "(min-width: 768px)",
      mobile: "(max-width: 767px)",
      reduced: "(prefers-reduced-motion: reduce)",
    }, (context) => {
      if (context.conditions?.reduced) {
        section.querySelectorAll<HTMLElement>("[data-origin-header], [data-origin-copy], [data-origin-photo]")
          .forEach((element) => revealed.current.add(element));
        return;
      }

      // Read the editorial order before applying any animation styles.
      const blocks = Array.from(section.querySelectorAll<HTMLElement>(
        "[data-origin-header], [data-origin-copy], [data-origin-photo]",
      )).filter((block) => !revealed.current.has(block))
        .map((block) => ({ block, top: block.getBoundingClientRect().top }))
        .sort((a, b) => a.top - b.top);
      let nextEntranceAt = 0;

      blocks.forEach(({ block }) => {
        const isHeader = block.hasAttribute("data-origin-header");
        const isPhoto = block.hasAttribute("data-origin-photo");
        const entrance = gsap.timeline({ paused: true, defaults: { ease: "power2.out" } });

        if (isHeader) {
          const characters = block.querySelectorAll<HTMLElement>("[data-origin-character]");
          const details = block.querySelectorAll<HTMLElement>("[data-origin-heading-detail]");
          entrance
            .fromTo(details, { opacity: 0, y: 12 }, {
              opacity: 1, y: 0, duration: 0.8, clearProps: "opacity,transform",
            }, 0)
            .fromTo(characters, { yPercent: 120 }, {
              yPercent: 0, duration: 1, stagger: 0.055, clearProps: "transform",
            }, 0.12);
        } else if (isPhoto) {
          entrance.fromTo(block, { clipPath: "inset(0% 100% 0% 0%)" }, {
            clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, clearProps: "clipPath",
          });
        } else {
          entrance.fromTo(block, { opacity: 0, y: 12 }, {
            opacity: 1, y: 0, duration: 0.8, clearProps: "opacity,transform",
          });
        }

        ScrollTrigger.create({
          trigger: block,
          start: "top 82%",
          once: true,
          onEnter: () => {
            revealed.current.add(block);
            // Space nearby entrances while retaining overlap. Bound the wait
            // so fast scrolling never builds a long queue of hidden content.
            const now = performance.now() / 1000;
            const delay = Math.min(0.65, Math.max(0, nextEntranceAt - now));
            if (block.getBoundingClientRect().bottom <= 0) {
              entrance.progress(1).pause();
              return;
            }
            entrance.delay(delay).play();
            nextEntranceAt = now + delay + (isHeader ? 0.65 : 0.32);
          },
        });
      });
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
