"use client";

import { useRef } from "react";
import { CustomEase } from "gsap/CustomEase";
import { SplitText } from "gsap/SplitText";
import { gsap, useGSAP } from "./gsap";
import { ScrollTrigger } from "./scroll-trigger";
import { appendEditorialTextReveal } from "./create-editorial-text-reveal";

gsap.registerPlugin(CustomEase, SplitText);
const storyEase = CustomEase.create("story-text-reveal", "0.431,0.012,0.519,1.122");

export function useStoryTextReveal() {
  const textRef = useRef<HTMLDivElement>(null);
  const headingStarted = useRef(false);
  const copyStarted = useRef(false);
  useGSAP(() => {
    const text = textRef.current;
    const section = text?.closest("section");
    const heading = text?.querySelector<HTMLElement>("[data-story-heading]");
    const copy = text?.querySelector<HTMLElement>("[data-story-copy]");
    const words = heading?.querySelectorAll<HTMLElement>("[data-story-word]");
    if (!text || !section || !heading || !copy || !words?.length) return;

    const media = gsap.matchMedia();
    media.add({
      motion: "(prefers-reduced-motion: no-preference)",
      reduced: "(prefers-reduced-motion: reduce)",
    }, (context) => {
      if (context.conditions?.reduced) {
        headingStarted.current = true;
        copyStarted.current = true;
        return;
      }
      if (copyStarted.current) return;
      const split = SplitText.create(copy, {
        type: "lines,words",
        mask: "lines",
        autoSplit: true,
        deepSlice: true,
        aria: "none",
        onSplit: (self) => {
          if (copyStarted.current) return;
          const sequence = gsap.timeline({
            scrollTrigger: {
              trigger: section,
              start: "top 35%",
              once: true,
            },
          });
          if (!headingStarted.current) {
            sequence.fromTo(words,
              { yPercent: 125 },
              {
                yPercent: 0, duration: 0.8, stagger: 0.08, ease: storyEase,
                clearProps: "transform",
                onStart: () => { headingStarted.current = true; },
              },
              0,
            );
          }
          // Preserve the measured lines after entry: reverting here lets
          // text-pretty reflow the paragraph and shifts the centered title.
          // autoSplit still rebuilds visible lines on font/width changes.
          const copyReveal = appendEditorialTextReveal(gsap.timeline({
            onStart: () => { copyStarted.current = true; },
            onComplete: () => { gsap.set(self.words, { clearProps: "transform" }); },
          }), self.lines, self.words);
          sequence.addLabel("paragraphe", 0.2).add(copyReveal, "paragraphe");
          return sequence;
        },
      });
      return () => { split.revert(); };
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
