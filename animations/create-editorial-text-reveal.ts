"use client";

import type { SplitText } from "gsap/SplitText";
import { gsap } from "./gsap";

// Shared rhythm for the Origines and Regard paragraph reveals.
export function createEditorialTextReveal(split: SplitText, onStart?: () => void) {
  const entrance = gsap.timeline({
    paused: true,
    defaults: { ease: "power2.out" },
    onStart,
    onComplete: () => {
      // Anchor navigation can finish an offscreen reveal during onSplit.
      // Let SplitText finish registering its measurements before reverting.
      queueMicrotask(() => { if (split.isSplit) split.revert(); });
    },
  });
  return appendEditorialTextReveal(entrance, split.lines, split.words);
}

// Append a masked passage to a parent sequence without reverting its siblings.
export function appendEditorialTextReveal(
  entrance: gsap.core.Timeline,
  lines: Element[],
  words: Element[],
) {
  gsap.set(words, { yPercent: 115 });
  let sentence = 0;
  lines.forEach((line, lineIndex) => {
    const lineWords = words.filter((word) => line.contains(word));
    lineWords.forEach((word, wordIndex) => {
      entrance.to(word, {
        yPercent: 0, duration: 0.8, ease: "power2.out",
      }, lineIndex * 0.08 + Math.min(wordIndex * 0.012, 0.08) + sentence * 0.08);
      if (/[.!?…][»”’"')]*$/.test(word.textContent?.trim() ?? "")) sentence++;
    });
  });
  return entrance;
}
