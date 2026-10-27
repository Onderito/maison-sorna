"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "./gsap";
import { ScrollTrigger } from "./scroll-trigger";

export function useScrollImageIntroduction() {
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
        id: "geste-pin",
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
          id: "geste-scene",
          trigger: section,
          start: "top 40%",
          endTrigger: firstPanel ?? section,
          end: firstPanel ? "top top" : "bottom bottom",
          scrub: 0.4,
          invalidateOnRefresh: true,
        },
      });

      if (context.conditions?.mobile) {
        const inset = (horizontal: string) => {
          const vertical = Math.max(0, viewport.clientHeight / 2 - window.innerWidth * 0.2375);
          // Keep the browser's two-value serialization: top/bottom stay paired.
          // Mixing that computed shorthand with a four-value target made GSAP
          // treat the missing bottom value as zero when phase two started.
          return `inset(${vertical}px ${horizontal})`;
        };
        scene
          .fromTo(photograph, { clipPath: () => inset("12%") },
            { clipPath: () => inset("0%"), duration: 0.69 * 0.35 }, 0)
          .fromTo(photograph, { clipPath: () => inset("0%") },
            { clipPath: "inset(0px 0%)", duration: 0.69 * 0.65, immediateRender: false });
      } else {
        scene.fromTo(photograph, { scale: 0.26 }, { scale: 1, duration: 0.69 }, 0);
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
          { yPercent: 0, duration: 0.38, ease: "power2.out" }, "titre")
        .fromTo(copy, { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.33, ease: "power2.out" }, 0.67)
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
  }, { scope: sectionRef });

  return { sectionRef, viewportRef, photographRef, titleRef, shadeRef };
}
