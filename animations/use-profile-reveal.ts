"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "./gsap";
import { ScrollTrigger } from "./scroll-trigger";

export function useProfileReveal() {
  const profileRef = useRef<HTMLElement>(null);
  const revealed = useRef(new Set<HTMLElement>());

  useGSAP(() => {
    const profile = profileRef.current;
    if (!profile) return;
    const portrait = profile.querySelector<HTMLElement>("[data-profile-portrait]");
    const name = profile.querySelector<HTMLElement>("[data-profile-name]");
    const biography = profile.querySelector<HTMLElement>("[data-profile-biography]");
    const paragraphs = Array.from(profile.querySelectorAll<HTMLElement>("[data-profile-paragraph]"));
    const role = profile.querySelector<HTMLElement>("[data-profile-role]");
    const editorial = profile.querySelector<HTMLElement>("[data-profile-editorial]");
    if (!portrait || !name || !biography) return;

    const media = gsap.matchMedia();
    media.add({
      desktop: "(min-width: 768px)",
      mobile: "(max-width: 767px)",
      editorial: "(min-width: 1024px)",
      reduced: "(prefers-reduced-motion: reduce)",
    }, (context) => {
      if (context.conditions?.reduced) {
        [portrait, name, ...paragraphs, role, editorial].forEach((element) => {
          if (element) revealed.current.add(element);
        });
        return;
      }
      const desktop = Boolean(context.conditions?.desktop);
      const lastCopy = role ?? paragraphs.at(-1) ?? name;
      const copyHeight = lastCopy.getBoundingClientRect().bottom - biography.getBoundingClientRect().top;
      const compactBiography = desktop && copyHeight <= window.innerHeight * 0.85;

      function revealImage(image: HTMLElement) {
        if (revealed.current.has(image)) return;
        gsap.timeline({
          scrollTrigger: { trigger: image, start: "top 78%", once: true },
        }).fromTo(image, { opacity: 0, y: 18 }, {
          opacity: 1, y: 0, duration: 1.3, ease: "power2.out", clearProps: "opacity,transform",
          onStart: () => { revealed.current.add(image); },
        });
      }
      revealImage(portrait);
      if (editorial && context.conditions?.editorial) revealImage(editorial);

      const heading = gsap.timeline({
        defaults: { ease: "power2.out" },
        scrollTrigger: { trigger: biography, start: desktop ? "top 75%" : "top 82%", once: true },
      });
      if (!revealed.current.has(name)) heading.fromTo(name, { yPercent: 125 }, {
        yPercent: 0, duration: 0.9, clearProps: "transform",
        onStart: () => { revealed.current.add(name); },
      }, desktop ? 0.35 : 0);

      // Keep the copy still once revealed. On small screens or long biographies,
      // each paragraph waits for its own reading area rather than a global timer.
      const copy = [...paragraphs, ...(role ? [role] : [])];
      copy.forEach((element, index) => {
        if (revealed.current.has(element)) return;
        const timeline = compactBiography ? heading : gsap.timeline({
          defaults: { ease: "power2.out" },
          scrollTrigger: { trigger: element, start: "top 82%", once: true },
        });
        timeline.fromTo(element, { opacity: 0, y: 12 }, {
          opacity: 1, y: 0, duration: element === role ? 0.6 : 0.8, clearProps: "opacity,transform",
          onStart: () => { revealed.current.add(element); },
        }, desktop ? 0.7 + index * 0.2 : 0.24 + index * 0.12);
      });
    }, profile);

    let active = true;
    if (document.fonts.status === "loading") {
      void document.fonts.ready.then(() => { if (active) ScrollTrigger.refresh(); });
    }
    return () => {
      active = false;
      media.revert();
    };
  }, { scope: profileRef });

  return { profileRef };
}
