"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import styles from "./tea-scroll-progress.module.css";

export default function TeaScrollProgress() {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLSpanElement>(null);
  const darkRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let frame = 0;
    document.documentElement.classList.add("tea-scrollbar");
    const update = () => {
      frame = 0;
      const range = document.documentElement.scrollHeight - window.innerHeight;
      const progress = range > 0 ? Math.max(0, Math.min(1, window.scrollY / range)) : 0;
      if (containerRef.current) containerRef.current.hidden = range <= 1;
      if (containerRef.current) {
        containerRef.current.setAttribute("aria-valuenow", String(Math.round(progress * 100)));
        const travel = containerRef.current.clientHeight - (thumbRef.current?.clientHeight ?? 88);
        if (thumbRef.current) thumbRef.current.style.transform = `translateY(${progress * travel}px)`;
      }
      if (darkRef.current) darkRef.current.style.opacity = String(progress);
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(document.body);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    update();
    return () => {
      document.documentElement.classList.remove("tea-scrollbar");
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.cancelAnimationFrame(frame);
    };
  }, [pathname]);

  const scrollToPointer = (clientY: number) => {
    const rail = containerRef.current;
    if (!rail) return;
    const bounds = rail.getBoundingClientRect();
    const thumbHeight = thumbRef.current?.clientHeight ?? 88;
    const progress = Math.max(0, Math.min(1, (clientY - bounds.top - thumbHeight / 2) / (bounds.height - thumbHeight)));
    window.scrollTo({ top: progress * (document.documentElement.scrollHeight - window.innerHeight), behavior: "instant" });
  };

  return (
    <div
      ref={containerRef}
      className={styles.indicator}
      role="scrollbar"
      aria-label="Défilement de la page"
      aria-controls="storefront-page"
      aria-orientation="vertical"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={0}
      tabIndex={0}
      hidden
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        scrollToPointer(event.clientY);
      }}
      onPointerMove={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) scrollToPointer(event.clientY);
      }}
      onPointerUp={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
      }}
      onKeyDown={(event) => {
        const range = document.documentElement.scrollHeight - window.innerHeight;
        const positions: Record<string, number> = {
          ArrowDown: window.scrollY + 80, ArrowUp: window.scrollY - 80,
          PageDown: window.scrollY + window.innerHeight, PageUp: window.scrollY - window.innerHeight,
          Home: 0, End: range,
        };
        if (event.key in positions) {
          event.preventDefault();
          window.scrollTo({ top: Math.max(0, Math.min(range, positions[event.key])), behavior: "instant" });
        }
      }}
    >
      <span ref={thumbRef} aria-hidden="true" className={styles.thumb}>
        <span ref={darkRef} className={styles.dark} />
      </span>
    </div>
  );
}
