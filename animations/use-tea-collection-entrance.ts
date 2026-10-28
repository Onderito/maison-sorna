"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "./gsap";
import { ScrollTrigger } from "./scroll-trigger";

export function useTeaCollectionEntrance() {
  const sectionRef = useRef<HTMLElement>(null);
  const seenCards = useRef(new Set<HTMLElement>());
  const seenHeading = useRef(false);
  const entrances = useRef<gsap.core.Timeline[]>([]);
  const triggers = useRef<ScrollTrigger[]>([]);

  useGSAP(() => {
    const section = sectionRef.current;
    if (!section) return;
    const header = section.querySelector<HTMLElement>("[data-collection-header]");
    const eyebrow = section.querySelector<HTMLElement>("[data-collection-eyebrow]");
    const title = section.querySelector<HTMLElement>("[data-collection-title]");
    const introduction = section.querySelector<HTMLElement>("[data-collection-introduction]");
    const cards = Array.from(section.querySelectorAll<HTMLElement>("[data-collection-card]"));
    if (!header || !eyebrow || !title || !introduction || !cards.length) return;

    const media = gsap.matchMedia();
    media.add({
      mobile: "(max-width: 599px)",
      tablet: "(min-width: 600px) and (max-width: 1199px)",
      desktop: "(min-width: 1200px)",
      reduced: "(prefers-reduced-motion: reduce)",
    }, (context) => {
      entrances.current = [];
      triggers.current = [];
      if (context.conditions?.reduced) {
        seenHeading.current = true;
        cards.forEach((card) => seenCards.current.add(card));
        return;
      }

      // Read the complete grid before writing any animation styles. Keep row
      // grouping in step with the existing 5 / 3+2 / 2+2+1 responsive layout.
      const rows = new Map<number, HTMLElement[]>();
      cards.forEach((card) => {
        if (seenCards.current.has(card)) return;
        const top = card.offsetTop;
        const row = rows.get(top) ?? [];
        row.push(card);
        rows.set(top, row);
      });

      let headingEntrance: gsap.core.Timeline | null = null;
      if (!seenHeading.current) {
        headingEntrance = gsap.timeline({
          defaults: { ease: "power2.out" },
          onStart: () => { seenHeading.current = true; },
          scrollTrigger: { trigger: header, start: "top 80%", once: true },
        })
          .fromTo(eyebrow, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.35 }, 0)
          .fromTo(title, { yPercent: 110 }, { yPercent: 0, duration: 0.65 }, 0.04)
          .fromTo(introduction, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.45 }, 0.18);
        entrances.current.push(headingEntrance);
        if (headingEntrance.scrollTrigger) triggers.current.push(headingEntrance.scrollTrigger);
      }

      rows.forEach((row) => {
        gsap.set(row, { opacity: 0, y: 18 });
        const entrance = gsap.timeline({
          paused: true,
          onStart: () => { row.forEach((card) => seenCards.current.add(card)); },
        }).to(row, {
          opacity: 1,
          y: 0,
          duration: 0.65,
          stagger: 0.065,
          ease: "power2.out",
          clearProps: "transform,opacity",
        });
        entrances.current.push(entrance);
        let started = false;
        const revealRow = () => {
          if (started) return;
          started = true;
          // Products follow the heading, including when navigation lands
          // beyond the trigger before ScrollTrigger's first refresh.
          const remaining = headingEntrance ? headingEntrance.duration() - headingEntrance.time() : 0;
          entrance.delay(Math.max(0, remaining - 0.12)).play();
        };
        const revealReachedRow = (trigger: ScrollTrigger) => {
          if (trigger.scroll() >= trigger.start) revealRow();
        };
        const trigger = ScrollTrigger.create({
          trigger: row[0],
          start: "top 88%",
          once: true,
          onEnter: revealRow,
          onEnterBack: revealRow,
          // An anchor jump or restored scroll can skip the entry callback.
          // Refresh and the initial check must also reveal reached rows.
          onRefresh: revealReachedRow,
        });
        revealReachedRow(trigger);
        triggers.current.push(trigger);
      });
    }, section);

    return () => {
      media.revert();
      entrances.current = [];
      triggers.current = [];
    };
  }, { scope: sectionRef });

  function revealImmediately() {
    seenHeading.current = true;
    sectionRef.current?.querySelectorAll<HTMLElement>("[data-collection-card]").forEach((card) => seenCards.current.add(card));
    // Finish before keyboard focus or pointer activation can measure a moving
    // product image. The existing product-dialog transition keeps its origin.
    entrances.current.forEach((entrance) => entrance.delay(0).progress(1).pause());
    triggers.current.forEach((trigger) => trigger.kill(false));
  }

  return { sectionRef, revealImmediately };
}
