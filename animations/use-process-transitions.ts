"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "./gsap";

export function useProcessTransitions() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const container = containerRef.current;
    if (!container) return;
    const panels = Array.from(container.querySelectorAll<HTMLElement>("[data-process-panel]"));
    if (panels.length < 2) return;

    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference) and (min-height: 651px)", () => {
      // Native sticky owns the stack; GSAP only shades the covered panels.
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
