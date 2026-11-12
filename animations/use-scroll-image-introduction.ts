"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "./gsap";
import { ScrollTrigger } from "./scroll-trigger";

// "grand": signature opening, reserved for a page's first act.
// "doux": calmer opening for the following chapters, same choreography.
export type IntroductionOpening = "grand" | "doux";
const openingScale = {
  grand: { desktop: 0.26, mobile: 0.76 },
  doux: { desktop: 0.72, mobile: 0.88 },
} as const;

export function useScrollImageIntroduction(scrub = 0.4, opening: IntroductionOpening = "grand") {
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const photographRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const shadeRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const section = sectionRef.current;
    const viewport = viewportRef.current;
    const photograph = photographRef.current;
    const title = titleRef.current;
    const shade = shadeRef.current;
    if (!section || !viewport || !photograph || !title || !shade) return;
    const heading = title.querySelector<HTMLElement>("[data-introduction-heading]");
    const copy = title.querySelector<HTMLElement>("[data-introduction-copy]");
    if (!heading || !copy) return;

    const media = gsap.matchMedia();
    media.add({
      desktop: "(min-width: 768px)",
      mobile: "(max-width: 767px)",
      reducedMotion: "(prefers-reduced-motion: reduce)",
      shortViewport: "(max-height: 650px)",
    }, (context) => {
      // Reading takes priority over pinning on short screens or enlarged text.
      if (context.conditions?.reducedMotion || context.conditions?.shortViewport || title.scrollHeight + 96 > viewport.clientHeight) {
        section.dataset.static = "true";
        return () => { delete section.dataset.static; };
      }

      const firstPanel = section.parentElement?.querySelector<HTMLElement>("[data-process-panel]");
      const image = photograph.querySelector<HTMLElement>("[data-introduction-image]");

      ScrollTrigger.create({
        id: `${section.id}-pin`,
        trigger: viewport,
        start: "top top",
        endTrigger: firstPanel ?? section,
        end: firstPanel ? "top top" : "bottom bottom",
        pin: true,
        pinSpacing: false,
      });

      // Timeline units describe scroll phases, not wall-clock seconds:
      // opening → overlapping text → reading hold → handoff to Récolte.
      const scene = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          id: `${section.id}-scene`,
          trigger: section,
          start: "top 40%",
          endTrigger: firstPanel ?? section,
          end: firstPanel ? "top top" : "bottom bottom",
          scrub,
          invalidateOnRefresh: true,
        },
      });

      if (context.conditions?.mobile) {
        scene.fromTo(photograph, { scale: openingScale[opening].mobile },
          { scale: 1, duration: 0.69 }, 0);
      } else {
        scene.fromTo(photograph, { scale: openingScale[opening].desktop }, { scale: 1, duration: 0.69 }, 0);
        if (image) {
          // Overscan keeps both edges covered throughout this small internal drift.
          scene.fromTo(image, { scale: 1.06, yPercent: 1 },
            { scale: 1.03, yPercent: -1, duration: 2.3 }, 0);
        }
      }

      scene
        .addLabel("titre", 0.5)
        .addLabel("lecture", 1)
        .addLabel("relais", 1.5)
        .fromTo(shade, { opacity: 0 }, { opacity: 0.25, duration: 0.35 }, 0.32)
        .fromTo(heading, { yPercent: 125 },
          { yPercent: 0, duration: 0.45, ease: "power3.out" }, "titre")
        .fromTo(copy, { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }, 0.66)
        // No text movement during the reading hold. The next opaque panel
        // naturally rises over this pinned photograph before the text leaves.
        .to(title, { opacity: 0, y: -20, duration: 0.3, ease: "power2.out" }, "relais")
          .to(shade, { opacity: 0.35, duration: 0.8 }, "relais");
    }, section);

    let active = true;
    if (document.fonts.status === "loading") {
      void document.fonts.ready.then(() => {
        if (active) ScrollTrigger.refresh();
      });
    }

    return () => {
      active = false;
      media.revert();
    };
  }, { scope: sectionRef, dependencies: [scrub, opening], revertOnUpdate: true });

  return { sectionRef, viewportRef, photographRef, titleRef, shadeRef };
}
