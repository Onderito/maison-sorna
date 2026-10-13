"use client";

import { useEffect, useRef, type ReactNode } from "react";
import styles from "./faq-section.module.css";

const entranceVisibility = 0.35;

export default function FaqEntrance({ children }: { children: ReactNode }) {
  const sectionRef = useRef<HTMLElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const revealed = useRef(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const observeEntrance = () => {
      if (revealed.current) return;
      observerRef.current?.disconnect();
      // In short landscape windows the FAQ can be taller than the viewport.
      const threshold =
        entranceVisibility *
        Math.min(
          1,
          window.innerHeight / section.getBoundingClientRect().height,
        );
      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.intersectionRatio < threshold || revealed.current) return;
          revealed.current = true;
          section.dataset.entrance = "visible";
          observerRef.current?.disconnect();
        },
        { threshold },
      );
      observerRef.current.observe(section);
    };
    const showImmediately = () => {
      if (!preference.matches) return;
      revealed.current = true;
      section.dataset.entrance = "immediate";
      observerRef.current?.disconnect();
    };

    if (preference.matches || revealed.current) {
      section.dataset.entrance = "immediate";
      revealed.current = true;
    } else {
      // SSR/no-JavaScript stays visible; only the enhanced entrance is staged.
      section.dataset.entrance = "pending";
      observeEntrance();
    }

    const resizeObserver = new ResizeObserver(observeEntrance);
    resizeObserver.observe(section);
    window.addEventListener("resize", observeEntrance);
    preference.addEventListener("change", showImmediately);
    return () => {
      observerRef.current?.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("resize", observeEntrance);
      preference.removeEventListener("change", showImmediately);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="faq"
      className={styles.section}
      aria-labelledby="faq-title"
      onFocusCapture={(event) => {
        if (!event.target.matches(":focus-visible")) return;
        revealed.current = true;
        if (sectionRef.current)
          sectionRef.current.dataset.entrance = "immediate";
        observerRef.current?.disconnect();
      }}
    >
      {children}
    </section>
  );
}
