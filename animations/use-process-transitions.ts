"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "./gsap";
import { ScrollTrigger } from "./scroll-trigger";

export function useProcessTransitions() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const container = containerRef.current;
    if (!container) return;
    const panels = Array.from(container.querySelectorAll<HTMLElement>("[data-process-panel]"));
    if (panels.length < 2) return;

    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference) and (min-height: 651px)", () => {
      // Each panel keeps its place in document flow. Earlier panels stay pinned
      // until the last one reaches the top, matching the original sticky stack.
      panels.slice(0, -1).forEach((panel) => {
        ScrollTrigger.create({
          trigger: panel,
          start: "top top",
          endTrigger: container,
          // Use the panel's 100svh height, including mobile browser chrome.
          end: () => `bottom ${panel.offsetHeight}px`,
          pin: true,
          pinSpacing: false,
        });
      });

      panels.slice(0, -1).forEach((panel, index) => {
        const shade = panel.querySelector<HTMLElement>("[data-process-shade]");
        if (!shade) return;

        gsap.fromTo(shade, { opacity: 0 }, {
          opacity: 0.12,
          ease: "none",
          scrollTrigger: {
            trigger: panels[index + 1],
            start: "top bottom",
            end: "top top",
            scrub: 0.2,
            invalidateOnRefresh: true,
          },
        });
      });
    }, container);

    return () => media.revert();
  }, { scope: containerRef });

  return containerRef;
}
