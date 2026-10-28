"use client";

import { useRef } from "react";
import { SplitText } from "gsap/SplitText";
import { gsap, useGSAP } from "./gsap";
import { ScrollTrigger } from "./scroll-trigger";
import { appendEditorialTextReveal } from "./create-editorial-text-reveal";

gsap.registerPlugin(SplitText);

export function useFaqEntrance() {
  const sectionRef = useRef<HTMLElement>(null);
  const finished = useRef(false);
  const entrance = useRef<gsap.core.Timeline | null>(null);
  const triggerRef = useRef<ScrollTrigger | null>(null);

  useGSAP(() => {
    const section = sectionRef.current;
    if (!section) return;
    const media = gsap.matchMedia();
    media.add({
      motion: "(prefers-reduced-motion: no-preference)",
      reduced: "(prefers-reduced-motion: reduce)",
    }, (context) => {
      if (context.conditions?.reduced || finished.current) {
        finished.current = true;
        delete section.dataset.faqPending;
        return;
      }
      const title = section.querySelector("[data-faq-title]");
      const introduction = section.querySelector("[data-faq-introduction]");
      const photograph = section.querySelector("[data-faq-photograph]");
      const items = Array.from(section.querySelectorAll("[data-faq-item]"));
      const contact = section.querySelector("[data-faq-contact]");
      if (!title || !introduction || !photograph || !items.length || !contact) {
        delete section.dataset.faqPending;
        return;
      }
      const targets = [title, introduction, photograph, ...items, contact];
      gsap.set([photograph, ...items, contact], { autoAlpha: 0, y: 8 });
      let started = false;
      const split = SplitText.create([title, introduction], {
        type: "lines,words", mask: "lines", autoSplit: true, deepSlice: true, aria: "none",
        onSplit: (self) => {
          if (started || finished.current) {
            // A reflow during reading finishes the reveal instead of replaying it.
            finished.current = true;
            gsap.set(targets, { clearProps: "transform,opacity,visibility" });
            queueMicrotask(() => {
              if (self.isSplit) self.revert();
              gsap.set(targets, { clearProps: "transform,opacity,visibility" });
            });
            return;
          }
          const titleReveal = appendEditorialTextReveal(gsap.timeline(),
            self.lines.filter((line) => title.contains(line)),
            self.words.filter((word) => title.contains(word)));
          const copyReveal = appendEditorialTextReveal(gsap.timeline(),
            self.lines.filter((line) => introduction.contains(line)),
            self.words.filter((word) => introduction.contains(word)));
          const timeline = gsap.timeline({
            paused: true,
            defaults: { autoAlpha: 1, y: 0, ease: "power2.out" },
            onComplete: () => {
              finished.current = true;
              queueMicrotask(() => {
                if (self.isSplit) self.revert();
                gsap.set(targets, { clearProps: "transform,opacity,visibility" });
              });
            },
          })
            // Ordered starts with overlap: never wait for a whole passage
            // to finish before the next part of the composition can appear.
            .addLabel("titre", 0)
            .add(titleReveal, "titre")
            .addLabel("description", 0.18)
            .add(copyReveal, "description")
            .addLabel("image", 0.38)
            .to(photograph, { duration: 0.3 }, "image")
            .addLabel("questions", 0.58)
            .to(items, { duration: 0.25, stagger: 0.055 }, "questions")
            .addLabel("contact", 0.95)
            .to(contact, { duration: 0.2 }, "contact");
          entrance.current = timeline;
          // The measured line masks now hide the text until its own phase.
          delete section.dataset.faqPending;
          return timeline;
        },
      });
      const start = () => {
        if (started || finished.current) return;
        started = true;
        entrance.current?.play();
      };
      const startIfReached = () => {
        if (section.getBoundingClientRect().top <= window.innerHeight * 0.75) start();
      };
      triggerRef.current = ScrollTrigger.create({
        trigger: section, start: "top 75%", once: true,
        onEnter: start, onRefresh: startIfReached,
      });
      startIfReached();
      return () => {
        triggerRef.current?.kill();
        triggerRef.current = null;
        entrance.current = null;
        if (!finished.current) section.dataset.faqPending = "";
        split.revert();
      };
    }, section);
    return () => { media.revert(); };
  }, { scope: sectionRef });

  function revealImmediately() {
    finished.current = true;
    entrance.current?.progress(1).pause();
    triggerRef.current?.kill();
    if (sectionRef.current) delete sectionRef.current.dataset.faqPending;
  }

  return { sectionRef, revealImmediately };
}
