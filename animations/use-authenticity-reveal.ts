"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "./gsap";
import { ScrollTrigger } from "./scroll-trigger";

export function useAuthenticityReveal() {
  const sectionRef = useRef<HTMLElement>(null);
  const revealed = useRef(new Set<HTMLElement>());
  const entrances = useRef<gsap.core.Timeline[]>([]);

  useGSAP(() => {
    const section = sectionRef.current;
    const heading = section?.querySelector<HTMLElement>("[data-proof-title]");
    const introduction = section?.querySelector<HTMLElement>("[data-proof-introduction]");
    const track = section?.querySelector<HTMLElement>("[data-proof-track]");
    if (!section || !heading || !introduction || !track) return;
    const copy = Array.from(track.querySelectorAll<HTMLElement>("[data-proof-copy]"));
    const photographs = Array.from(track.querySelectorAll<HTMLElement>("[data-proof-photo]"));
    const elements = [heading, introduction, ...copy, ...photographs];

    const media = gsap.matchMedia();
    media.add({
      desktop: "(min-width: 768px)",
      mobile: "(max-width: 767px)",
      reduced: "(prefers-reduced-motion: reduce)",
    }, (context) => {
      entrances.current = [];
      if (context.conditions?.reduced) {
        elements.forEach((element) => revealed.current.add(element));
        return;
      }
      const desktop = Boolean(context.conditions?.desktop);
      const header = gsap.timeline({
        defaults: { ease: "power2.out" },
        scrollTrigger: { trigger: section, start: desktop ? "top 65%" : "top 80%", once: true },
      });
      entrances.current.push(header);
      if (!revealed.current.has(heading)) header.fromTo(heading, { yPercent: 125 }, {
        yPercent: 0, duration: 0.9, clearProps: "transform",
        onStart: () => { revealed.current.add(heading); },
      }, 0);
      if (!revealed.current.has(introduction)) header.fromTo(introduction, { opacity: 0, y: 12 }, {
        opacity: 1, y: 0, duration: 0.75, clearProps: "opacity,transform",
        onStart: () => { revealed.current.add(introduction); },
      }, 0.3);

      const cards = desktop ? header : gsap.timeline({
        defaults: { ease: "power2.out" },
        scrollTrigger: { trigger: track, start: "top 82%", once: true },
      });
      if (!desktop) entrances.current.push(cards);
      const start = desktop ? 0.65 : 0;
      copy.forEach((element, index) => {
        if (revealed.current.has(element)) return;
        cards.fromTo(element, { opacity: 0, y: 12 }, {
          opacity: 1, y: 0, duration: 0.75, clearProps: "opacity,transform",
          onStart: () => { revealed.current.add(element); },
        }, start + (desktop ? index * 0.12 : 0));
      });
      photographs.forEach((element, index) => {
        if (revealed.current.has(element)) return;
        cards.fromTo(element, { clipPath: "inset(0% 100% 0% 0%)" }, {
          clipPath: "inset(0% 0% 0% 0%)", duration: 1.3, clearProps: "clipPath",
          onStart: () => { revealed.current.add(element); },
        }, start + 0.3 + (desktop ? index * 0.12 : 0));
      });
    }, section);

    let active = true;
    if (document.fonts.status === "loading") {
      void document.fonts.ready.then(() => { if (active) ScrollTrigger.refresh(); });
    }
    return () => {
      active = false;
      media.revert();
      entrances.current = [];
    };
  }, { scope: sectionRef });

  function revealImmediately() {
    sectionRef.current?.querySelectorAll<HTMLElement>(
      "[data-proof-title], [data-proof-introduction], [data-proof-copy], [data-proof-photo]",
    ).forEach((element) => revealed.current.add(element));
    // Keyboard navigation and swiping never wait for the editorial entrance.
    entrances.current.forEach((timeline) => {
      timeline.progress(1).pause();
      timeline.scrollTrigger?.kill(false);
    });
  }

  return { sectionRef, revealImmediately };
}
