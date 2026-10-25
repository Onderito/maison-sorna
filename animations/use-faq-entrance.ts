"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "./gsap";
import "./scroll-trigger";

export function useFaqEntrance() {
  const sectionRef = useRef<HTMLElement>(null);
  const revealed = useRef(false);
  const entrance = useRef<gsap.core.Timeline | null>(null);

  useGSAP(() => {
    const section = sectionRef.current;
    if (!section) return;
    const media = gsap.matchMedia();
    media.add({
      motion: "(prefers-reduced-motion: no-preference)",
      reduced: "(prefers-reduced-motion: reduce)",
    }, (context) => {
      if (context.conditions?.reduced) {
        revealed.current = true;
        return;
      }
      if (revealed.current) return;

      const title = section.querySelector("[data-faq-title]");
      const introduction = section.querySelector("[data-faq-introduction]");
      const photograph = section.querySelector("[data-faq-photograph]");
      const accordion = section.querySelector("[data-faq-accordion]");
      const items = section.querySelectorAll("[data-faq-item]");
      const contact = section.querySelector("[data-faq-contact]");
      if (!title || !introduction || !photograph || !accordion || !contact) return;

      const from = { opacity: 0, y: 8 };
      const to = { opacity: 1, y: 0 };
      entrance.current = gsap.timeline({
        defaults: { duration: 0.4, ease: "power2.out" },
        onStart: () => { revealed.current = true; },
        scrollTrigger: {
          trigger: section,
          start: "top 75%",
          once: true,
        },
      })
        .fromTo(title, from, to, 0)
        .fromTo(introduction, from, to, 0.07)
        // Reveal the image horizontally without changing its layout or crop.
        .fromTo(photograph,
          { clipPath: "inset(0% 100% 0% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 0.85, ease: "power2.inOut" },
        )
        .addLabel("responses")
        .fromTo(accordion, { opacity: 0 }, { opacity: 1, duration: 0.3 }, "responses")
        .fromTo(items, from, { ...to, stagger: 0.055 }, "responses")
        .fromTo(contact, from, to, "responses+=0.43");
    }, section);

    return () => {
      media.revert();
      entrance.current = null;
    };
  }, { scope: sectionRef });

  function revealImmediately() {
    revealed.current = true;
    entrance.current?.progress(1);
    entrance.current?.scrollTrigger?.disable(false);
  }

  return { sectionRef, revealImmediately };
}
