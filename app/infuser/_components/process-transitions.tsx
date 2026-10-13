"use client";

import { useEffect, useRef, type ReactNode } from "react";

export default function ProcessTransitions({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const panels = Array.from(
      containerRef.current?.querySelectorAll<HTMLElement>("[data-process-panel]") ?? [],
    );
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    const update = () => {
      frame = 0;
      const viewportHeight = window.innerHeight;
      panels.forEach((panel, index) => {
        const next = panels[index + 1];
        const progress = next && !reducedMotion.matches
          ? Math.min(1, Math.max(0, 1 - next.getBoundingClientRect().top / viewportHeight))
          : 0;
        panel.style.setProperty("--cover-opacity", String(progress * 0.12));
      });
    };

    const scheduleUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    reducedMotion.addEventListener("change", scheduleUpdate);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      reducedMotion.removeEventListener("change", scheduleUpdate);
    };
  }, []);

  return <div ref={containerRef} className={className}>{children}</div>;
}
