"use client";

import { useRef, type ReactNode } from "react";
import { SplitText } from "gsap/SplitText";
import { gsap, useGSAP } from "@/animations/gsap";
import { ScrollTrigger } from "@/animations/scroll-trigger";

gsap.registerPlugin(SplitText);

export default function TeaCollectionStatement({ children, className }: {
  children: ReactNode;
  className: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const revealed = useRef(false);

  useGSAP(() => {
    const container = containerRef.current;
    if (!container) return;
    const fields = Array.from(container.querySelectorAll<HTMLElement>("p"));
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      if (revealed.current) return;
      const indents = fields.map((field) => getComputedStyle(field).textIndent);
      let started = false;
      let entrance: gsap.core.Tween | null = null;
      const split = SplitText.create(fields, {
        type: "lines", mask: "lines", autoSplit: true, deepSlice: true, aria: "none",
        onSplit: (self) => {
          // SplitText's nested blocks inherit text-indent. Keep it only on
          // each paragraph's first line, so splitting and reverting agree.
          self.masks.forEach((mask) => { mask.style.textIndent = "0"; });
          self.lines.forEach((line) => { line.style.textIndent = "0"; });
          fields.forEach((field, index) => {
            const firstLine = self.lines.find((line) => field.contains(line));
            if (firstLine) firstLine.style.textIndent = indents[index];
          });
          // A reflow after reading starts must not hide or replay the text.
          if (started || revealed.current) {
            revealed.current = true;
            queueMicrotask(() => { if (self.isSplit) self.revert(); });
            return;
          }
          entrance = gsap.fromTo(self.lines, { yPercent: 110 }, {
            yPercent: 0,
            duration: 0.3,
            stagger: 0.06,
            ease: "power3.out",
            paused: true,
            onComplete: () => {
              revealed.current = true;
              queueMicrotask(() => { if (self.isSplit) self.revert(); });
            },
          });
          return entrance;
        },
      });
      const reveal = () => {
        if (started) return;
        started = true;
        entrance?.play();
      };
      const revealReached = (trigger: ScrollTrigger) => {
        if (trigger.scroll() >= trigger.start) reveal();
      };
      const trigger = ScrollTrigger.create({
        trigger: container, start: "top 85%", once: true,
        onEnter: reveal, onEnterBack: reveal, onRefresh: revealReached,
      });
      revealReached(trigger);
      return () => { trigger.kill(); split.revert(); };
    });
    return () => media.revert();
  }, { scope: containerRef });

  return <div ref={containerRef} className={className}>{children}</div>;
}
