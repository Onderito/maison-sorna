"use client";

import { useRef } from "react";
import { SplitText } from "gsap/SplitText";
import { gsap, useGSAP } from "./gsap";
import { ScrollTrigger } from "./scroll-trigger";

gsap.registerPlugin(SplitText);

export function useTeaCollectionEntrance() {
  const sectionRef = useRef<HTMLElement>(null);
  const seenCards = useRef(new Set<HTMLElement>());
  const seenHeading = useRef(false);
  const entrances = useRef<gsap.core.Timeline[]>([]);
  const cardEntrances = useRef(new Map<HTMLElement, gsap.core.Timeline[]>());
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
      const splits: SplitText[] = [];
      entrances.current = [];
      cardEntrances.current.clear();
      triggers.current = [];
      const innerElements = cards.flatMap((card) => Array.from(card.querySelectorAll<HTMLElement>("[data-collection-reveal]")));
      if (context.conditions?.reduced) {
        gsap.set([eyebrow, title, introduction, ...cards, ...innerElements], { clearProps: "transform,opacity" });
        seenHeading.current = true;
        cards.forEach((card) => seenCards.current.add(card));
        return;
      }

      // A context rebuild can restore an interrupted tween's hidden snapshot.
      // Completed elements stay visible; unfinished entrances are built again.
      const completedCards = cards.filter((card) => seenCards.current.has(card));
      if (completedCards.length) gsap.set([...completedCards, ...completedCards.flatMap((card) => Array.from(card.querySelectorAll<HTMLElement>("[data-collection-reveal]")))], { clearProps: "transform,opacity" });
      if (seenHeading.current) gsap.set([eyebrow, title, introduction], { clearProps: "transform,opacity" });

      // Group any cards sharing a row before writing transforms. On desktop
      // each large card now has its own entrance as it reaches the viewport.
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
          onComplete: () => { seenHeading.current = true; },
          scrollTrigger: { trigger: header, start: "top 80%", once: true },
        })
          .fromTo(eyebrow, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.4 }, 0)
          .fromTo(title, { yPercent: 110 }, { yPercent: 0, duration: 0.8 }, 0.04)
          .fromTo(introduction, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4 }, 0.18);
        entrances.current.push(headingEntrance);
        if (headingEntrance.scrollTrigger) triggers.current.push(headingEntrance.scrollTrigger);
      }

      rows.forEach((row) => {
        gsap.set(row, { opacity: 0, y: 24 });
        // Copy gets line masks; the price/action row only fades, so it is
        // readable as soon as the card's text starts.
        gsap.set(row.flatMap((card) => Array.from(card.querySelectorAll<HTMLElement>("[data-collection-reveal]")).slice(-1)), { opacity: 0 });
        const entrance = gsap.timeline({
          paused: true,
          onComplete: () => { row.forEach((card) => { if (!card.querySelector("[data-collection-copy]")) seenCards.current.add(card); }); },
        }).to(row, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.065,
          ease: "power2.out",
          clearProps: "transform,opacity",
        });
        row.forEach((card) => cardEntrances.current.set(card, [entrance]));
        // Text waits for its own viewport threshold: the large photograph can
        // enter long before the copy at the bottom of the card is visible.
        row.forEach((card) => {
          const copy = card.querySelector<HTMLElement>("[data-collection-copy]");
          const fields = Array.from(card.querySelectorAll<HTMLElement>("[data-collection-reveal]"));
          if (!copy || !fields.length) return;
          let textStarted = false;
          let textEntrance: gsap.core.Timeline | null = null;
          const bottom = fields.at(-1)!;
          const split = SplitText.create(fields.slice(0, -1), {
            type: "lines", mask: "lines", autoSplit: true, deepSlice: true, aria: "none",
            onSplit: (self) => {
              if (textStarted || seenCards.current.has(card)) {
                // Reflow during reading settles the passage instead of replaying it.
                seenCards.current.add(card);
                queueMicrotask(() => {
                  if (self.isSplit) self.revert();
                  gsap.set(fields, { clearProps: "transform,opacity" });
                });
                return;
              }
              gsap.set(self.lines, { yPercent: 110 });
              const previous = textEntrance;
              textEntrance = gsap.timeline({
                paused: true,
                onComplete: () => {
                  seenCards.current.add(card);
                  queueMicrotask(() => {
                    if (self.isSplit) self.revert();
                    // SplitText reverts its returned timeline too, including
                    // the price row's initial hidden opacity. Clear it AFTER.
                    gsap.set(fields, { clearProps: "transform,opacity" });
                  });
                },
              }).to(self.lines, {
                yPercent: 0, duration: 0.5, stagger: 0.05, ease: "power2.out",
              }).to(bottom, {
                opacity: 1, duration: 0.3, ease: "power2.out", clearProps: "opacity",
              }, 0);
              if (previous) {
                entrances.current = entrances.current.filter((timeline) => timeline !== previous);
                cardEntrances.current.set(card, cardEntrances.current.get(card)!.filter((timeline) => timeline !== previous));
              }
              entrances.current.push(textEntrance);
              cardEntrances.current.get(card)?.push(textEntrance);
              return textEntrance;
            },
          });
          splits.push(split);
          const revealText = () => {
            if (textStarted) return;
            textStarted = true;
            textEntrance?.play();
          };
          const revealReachedText = (trigger: ScrollTrigger) => {
            if (trigger.scroll() >= trigger.start) revealText();
          };
          const textTrigger = ScrollTrigger.create({
            trigger: copy, start: "top 92%", once: true,
            onEnter: revealText, onEnterBack: revealText, onRefresh: revealReachedText,
          });
          revealReachedText(textTrigger);
          triggers.current.push(textTrigger);
        });
        entrances.current.push(entrance);
        let started = false;
        const revealRow = () => {
          if (started || row.every((card) => seenCards.current.has(card))) return;
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
      return () => { splits.forEach((split) => split.revert()); };
    }, section);

    return () => {
      media.revert();
      entrances.current = [];
      triggers.current = [];
    };
  }, { scope: sectionRef });

  function revealImmediately(card?: HTMLElement) {
    // Settle only the activated card before the shared-image dialog measures it.
    // Later products retain their scroll entrance when the sheet is closed.
    if (card) {
      seenCards.current.add(card);
      cardEntrances.current.get(card)?.forEach((entrance) => entrance.delay(0).progress(1).pause());
      return;
    }
    seenHeading.current = true;
    sectionRef.current?.querySelectorAll<HTMLElement>("[data-collection-card]").forEach((item) => seenCards.current.add(item));
    entrances.current.forEach((entrance) => entrance.delay(0).progress(1).pause());
    triggers.current.forEach((trigger) => trigger.kill(false));
  }

  return { sectionRef, revealImmediately };
}
