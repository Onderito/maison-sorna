"use client";

import { useRef } from "react";
import { SplitText } from "gsap/SplitText";
import { gsap, useGSAP } from "./gsap";
import { ScrollTrigger } from "./scroll-trigger";
import { appendEditorialTextReveal } from "./create-editorial-text-reveal";

gsap.registerPlugin(SplitText);

type AfterPageReveal = (callback: () => void) => () => void;

export function useHeroTextReveal(afterPageReveal?: AfterPageReveal) {
  const contentRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  const finishRef = useRef<(() => void) | null>(null);

  useGSAP(() => {
    const content = contentRef.current;
    const section = content?.closest("section");
    const title = content?.querySelector<HTMLElement>("[data-hero-title]");
    if (!content || !section || !title) return;

    const media = gsap.matchMedia();
    media.add({
      motion: "(prefers-reduced-motion: no-preference)",
      reduced: "(prefers-reduced-motion: reduce)",
    }, (context) => {
      if (context.conditions?.reduced || started.current) {
        started.current = true;
        delete content.dataset.heroPending;
        return;
      }

      const copy = content.querySelector<HTMLElement>("[data-hero-copy]");
      const monogram = content.querySelector<HTMLElement>("[data-hero-monogram]");
      const actions = Array.from(content.querySelectorAll<HTMLElement>("[data-hero-action]"));
      const details = [...(monogram ? [monogram] : []), ...actions];
      const fixedTitle = title.querySelector<HTMLElement>("[data-hero-title-line]");
      const fixedCopy = copy?.querySelector<HTMLElement>("[data-hero-copy-line]");
      const fixedLines = fixedTitle && fixedCopy ? [fixedTitle, fixedCopy] : [];
      let trigger: ScrollTrigger | undefined;
      let cancelStart: (() => void) | undefined;
      let frame = 0;
      let generation = 0;
      const stopObserving = () => {
        generation++;
        window.cancelAnimationFrame(frame);
        trigger?.kill();
        cancelStart?.();
        trigger = undefined;
        cancelStart = undefined;
      };

      const buildEntrance = (self: Pick<SplitText, "lines" | "words">) => {
        stopObserving();
        if (started.current) {
          // A font or width change settles the composition being read.
          finishRef.current = null;
          gsap.set([...fixedLines, ...details], { clearProps: "opacity,transform" });
          return;
        }

        const titleLines = fixedTitle && fixedCopy ? [fixedTitle] : self.lines.filter(line => title.contains(line));
        // The homepage's fixed masks include accent space. Move the whole
        // line beyond that space so no dots or letter fragments peek out.
        gsap.set(titleLines, { yPercent: fixedLines.length ? 150 : 115 });
        if (fixedTitle && fixedCopy) gsap.set(fixedCopy, { yPercent: 150 });
        gsap.set(details, { opacity: 0, y: 8 });
        const entrance = gsap.timeline({
          paused: true,
          defaults: { ease: "power2.out" },
          onStart: () => { started.current = true; },
          onComplete: () => {
            // Keep measured line masks to preserve the centered composition.
            gsap.set([...fixedLines, ...self.lines, ...self.words, ...details], { clearProps: "transform,opacity" });
          },
        }).addLabel("monogramme", 0)
          .addLabel("titre", 0.14)
          .to(titleLines, { yPercent: 0, duration: 0.8, stagger: 0.08 }, "titre")
          .addLabel("sous-titre", 0.44)
          .addLabel("invitation", 0.68);

        if (monogram) entrance.to(monogram, { opacity: 1, y: 0, duration: 0.3 }, "monogramme");
        if (fixedTitle && fixedCopy) {
          entrance.to(fixedCopy, { yPercent: 0, duration: 0.8 }, "sous-titre");
        } else if (copy) {
          entrance.add(appendEditorialTextReveal(gsap.timeline(),
            self.lines.filter(line => copy.contains(line)),
            self.words.filter(word => copy.contains(word))), "sous-titre");
        }
        if (actions.length) entrance.to(actions, {
          opacity: 1, y: 0, duration: 0.25, stagger: 0.06,
        }, "invitation");

        const finish = () => {
          started.current = true;
          stopObserving();
          entrance.progress(1).pause();
        };
        finishRef.current = finish;
        const begin = () => {
          const currentGeneration = generation;
          const queue = () => {
            if (currentGeneration !== generation) return;
            frame = window.requestAnimationFrame(() => { entrance.play(); });
          };
          // Use the final font metrics, and leave a cancellable frame for
          // Strict Mode's setup/cleanup cycle before starting the passage.
          if (document.fonts.status === "loading") void document.fonts.ready.then(queue);
          else queue();
        };
        let requested = false;
        const play = () => {
          if (requested || started.current) return;
          requested = true;
          if (section.getBoundingClientRect().bottom <= 0) finish();
          else if (afterPageReveal) cancelStart = afterPageReveal(begin);
          else begin();
        };
        const catchUp = () => {
          if (section.getBoundingClientRect().top <= window.innerHeight * 0.8) play();
        };
        trigger = ScrollTrigger.create({
          trigger: section, start: "top 80%", once: true,
          onEnter: play, onEnterBack: play, onRefresh: catchUp,
        });
        delete content.dataset.heroPending;
        catchUp();
        return entrance;
      };
      let active = true;
      let split: SplitText | undefined;
      if (fixedLines.length) {
        // Keep the homepage's React markup intact. Its single-word title and
        // short copy need no splitting or responsive reconstruction.
        const prepare = () => {
          if (active) context.add(() => { buildEntrance({ lines: [], words: [] }); });
        };
        if (document.fonts.status === "loading") void document.fonts.ready.then(prepare);
        else prepare();
      } else {
        split = SplitText.create([title, ...(copy ? [copy] : [])], {
          type: "lines,words", mask: "lines", autoSplit: true, deepSlice: true, aria: "none",
          linesClass: "hero-text-line", wordsClass: "hero-text-word",
          onRevert: stopObserving,
          onSplit: buildEntrance,
        });
      }

      return () => {
        active = false;
        stopObserving();
        finishRef.current = null;
        split?.revert();
      };
    }, content);
    return () => { media.revert(); };
  }, { scope: contentRef });

  return {
    contentRef,
    revealImmediately: () => {
      started.current = true;
      finishRef.current?.();
      if (contentRef.current) delete contentRef.current.dataset.heroPending;
    },
  };
}
