"use client";

import { useRef } from "react";
import { CustomEase } from "gsap/CustomEase";
import { gsap, useGSAP } from "./gsap";
import { ScrollTrigger } from "./scroll-trigger";

gsap.registerPlugin(CustomEase);
const storyEase = CustomEase.create("story-text-reveal", "0.431,0.012,0.519,1.122");

export function useStoryTextReveal() {
  const textRef = useRef<HTMLDivElement>(null);
  const revealed = useRef(false);
  useGSAP(() => {
    const text = textRef.current;
    const section = text?.closest("section");
    const heading = text?.querySelector<HTMLElement>("[data-story-heading]");
    const copy = text?.querySelector<HTMLElement>("[data-story-copy]");
    const words = heading?.querySelectorAll<HTMLElement>("[data-story-word]");
    if (!text || !section || !heading || !copy || !words?.length) return;

    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      if (revealed.current) return;
      gsap.timeline({
        onStart: () => { revealed.current = true; },
        scrollTrigger: {
          trigger: section,
          start: "top 35%",
          once: true,
        },
      })
        .fromTo(words,
          { yPercent: 125 },
          { yPercent: 0, duration: 0.8, stagger: 0.08, ease: storyEase, clearProps: "transform" },
          0,
        )
        .fromTo(copy,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.28, ease: storyEase, clearProps: "opacity,transform" },
          0.14,
        );
    }, text);

    let active = true;
    if (document.fonts.status === "loading") {
      void document.fonts.ready.then(() => { if (active) ScrollTrigger.refresh(); });
    }
    return () => {
      active = false;
      media.revert();
    };
  }, { scope: textRef });

  return { textRef };
}
