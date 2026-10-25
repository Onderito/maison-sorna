"use client";

import { useRef } from "react";
import { useLenis } from "lenis/react";
import { gsap, useGSAP } from "./gsap";
import { ScrollTrigger } from "./scroll-trigger";

function updateScrollTriggers() {
  ScrollTrigger.update();
}

export function useScrollImageIntroduction() {
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const photographRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const shadeRef = useRef<HTMLDivElement>(null);

  // Lenis already owns its RAF. Subscribe without adding a second scroll loop.
  useLenis(updateScrollTriggers);

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
    }, (context) => {
      if (context.conditions?.reducedMotion) return;

      const travel = () => Math.max(1, section.offsetHeight - viewport.clientHeight);
      const position = (progress: number) => `top+=${travel() * progress} top`;

      ScrollTrigger.create({
        trigger: viewport,
        start: "top top",
        end: () => `+=${travel()}`,
        pin: true,
        // The section already reserves the complete scroll distance.
        pinSpacing: false,
      });

      // One scroll playhead keeps the image, mask and copy in sequence.
      const scene = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section,
          start: "top 40%",
          end: () => position(0.95),
          scrub: 0.4,
          invalidateOnRefresh: true,
        },
      });

      if (context.conditions?.mobile) {
        // Preserve the existing crop without stretching the photograph.
        const inset = (horizontal: string) => {
          const vertical = Math.max(0, viewport.clientHeight / 2 - window.innerWidth * 0.2375);
          return `inset(${vertical}px ${horizontal} ${vertical}px ${horizontal})`;
        };
        scene
          .fromTo(photograph,
            { clipPath: () => inset("12%") },
            { clipPath: () => inset("0%"), duration: 0.55 * 0.35 },
            0,
          )
          .to(photograph, { clipPath: "inset(0px 0% 0px 0%)", duration: 0.55 * 0.65 });
      } else {
        scene.fromTo(photograph, { scale: 0.26 }, { scale: 1, duration: 0.55 }, 0);
      }

      scene
        .fromTo(shade, { opacity: 0 }, { opacity: 0.25, duration: 0.23 }, 0.32)
        .fromTo(heading,
          { yPercent: 125 },
          { yPercent: 0, duration: 0.3, ease: "power2.out" },
          0.58,
        )
        .fromTo(copy,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.28, ease: "power2.out" },
          0.72,
        );
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
