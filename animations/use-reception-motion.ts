"use client";

import { useRef } from "react";
import { SplitText } from "gsap/SplitText";
import { gsap, useGSAP } from "./gsap";
import { ScrollTrigger } from "./scroll-trigger";
import { appendEditorialTextReveal } from "./create-editorial-text-reveal";

gsap.registerPlugin(SplitText);

export function useReceptionMotion() {
  const pageRef = useRef<HTMLElement>(null);
  const revealed = useRef(new Set<HTMLElement>());
  const finishers = useRef(new Map<HTMLElement, () => void>());

  useGSAP(() => {
    const page = pageRef.current;
    if (!page) return;
    const media = gsap.matchMedia();

    media.add({
      desktop: "(min-width: 768px)",
      mobile: "(max-width: 767px)",
      reduced: "(prefers-reduced-motion: reduce)",
      short: "(max-height: 650px)",
    }, (context) => {
      const text = Array.from(page.querySelectorAll<HTMLElement>("[data-reception-text]"));
      const details = Array.from(page.querySelectorAll<HTMLElement>("[data-reception-detail], [data-reception-panel]"));
      const photographs = Array.from(page.querySelectorAll<HTMLElement>("[data-reception-photo]"));
      const targets = [...text, ...details, ...photographs];

      if (context.conditions?.reduced) {
        targets.forEach(element => revealed.current.add(element));
        delete page.dataset.receptionPending;
        return;
      }

      const splits: SplitText[] = [];
      const triggers = new Set<ScrollTrigger>();

      // Entry is local to each passage, including direct anchor arrivals.
      function observe(block: HTMLElement, entrance: gsap.core.Timeline, threshold = 0.82) {
        let started = false;
        const finish = () => {
          started = true;
          revealed.current.add(block);
          entrance.progress(1).pause();
        };
        finishers.current.set(block, finish);
        const play = () => {
          if (started) return;
          started = true;
          if (block.getBoundingClientRect().bottom <= 0) finish();
          else entrance.play();
        };
        const catchUp = () => {
          if (block.getBoundingClientRect().top <= window.innerHeight * threshold) play();
        };
        const trigger = ScrollTrigger.create({
          trigger: block, start: `top ${threshold * 100}%`, once: true,
          onEnter: play, onRefresh: catchUp,
        });
        triggers.add(trigger);
        catchUp();
        return () => {
          trigger.kill();
          triggers.delete(trigger);
          finishers.current.delete(block);
        };
      }

      text.forEach(block => {
        if (revealed.current.has(block) || !block.getClientRects().length) return;
        let stopObserving: (() => void) | undefined;
        splits.push(SplitText.create(block, {
          type: "lines,words", mask: "lines", autoSplit: true, deepSlice: true, aria: "none",
          linesClass: "reception-text-line", wordsClass: "reception-text-word",
          onRevert: () => { stopObserving?.(); },
          onSplit: split => {
            stopObserving?.();
            // Font/width changes finish a passage already being read.
            if (revealed.current.has(block)) return;
            const entrance = appendEditorialTextReveal(gsap.timeline({
              paused: true,
              onStart: () => { revealed.current.add(block); },
              onComplete: () => {
                // Retain the measured lines so text-pretty cannot shift the layout.
                gsap.set(split.words, { clearProps: "transform" });
              },
            }), split.lines, split.words);
            stopObserving = observe(block, entrance);
            return entrance;
          },
        }));
      });

      details.forEach(block => {
        if (revealed.current.has(block)) return;
        const panel = block.hasAttribute("data-reception-panel");
        // Opacity keeps interactive controls keyboard-accessible during entry.
        gsap.set(block, { opacity: 0, y: panel ? 40 : 12, ...(panel ? { scale: 0.94 } : {}) });
        const entrance = gsap.timeline({
          paused: true,
          onStart: () => { revealed.current.add(block); },
        }).to(block, {
          opacity: 1, y: 0, ...(panel ? { scale: 1 } : {}), duration: panel ? 0.3 : 0.25, ease: "power2.out",
          clearProps: "opacity,transform",
        });
        observe(block, entrance, panel ? 0.7 : 0.82);
      });

      photographs.forEach(viewport => {
        if (!revealed.current.has(viewport)) {
          const founders = viewport.dataset.receptionPhoto === "founders";
          gsap.set(viewport, { scale: founders ? 0.68 : 0.92 });
          const entrance = gsap.timeline({
            paused: true,
            onStart: () => { revealed.current.add(viewport); },
          }).to(viewport, {
            scale: 1, duration: founders ? 0.9 : 0.6,
            ease: "power2.out", clearProps: "transform",
          });
          observe(viewport, entrance);
        }

        const image = viewport.querySelector<HTMLElement>("[data-reception-parallax]");
        const track = viewport.closest<HTMLElement>("[data-reception-photo-track]");
        if (!image || !track || context.conditions?.short) return;
        const travel = context.conditions?.desktop ? 8 : 4;
        // Only the photograph drifts; the sticky frame and its caption stay put.
        // Overscan covers both edges for the full translation range.
        gsap.fromTo(image, { scale: 1 + (travel + 2) / 50, yPercent: travel }, {
          yPercent: -travel, ease: "none",
          scrollTrigger: {
            trigger: track, start: "top bottom", end: "bottom top",
            scrub: 0.45, invalidateOnRefresh: true,
          },
        });
      });

      delete page.dataset.receptionPending;
      return () => {
        splits.forEach(split => split.revert());
        triggers.forEach(trigger => trigger.kill());
        finishers.current.clear();
      };
    }, page);

    let active = true;
    if (document.fonts.status === "loading") {
      void document.fonts.ready.then(() => { if (active) ScrollTrigger.refresh(); });
    }
    return () => {
      active = false;
      media.revert();
    };
  }, { scope: pageRef });

  function revealForFocus(target: HTMLElement) {
    const section = target.closest("section");
    if (!section) return;
    finishers.current.forEach((finish, block) => {
      if (section.contains(block)) finish();
    });
  }

  return { pageRef, revealForFocus };
}
