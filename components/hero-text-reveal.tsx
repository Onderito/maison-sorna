"use client";

import type { ReactNode } from "react";
import { useHeroTextReveal } from "@/animations/use-hero-text-reveal";
import { useAfterPageReveal } from "./page-transition";
import styles from "./hero-text-reveal.module.css";

export default function HeroTextReveal({ children }: { children: ReactNode }) {
  const afterPageReveal = useAfterPageReveal();
  const { contentRef, revealImmediately } = useHeroTextReveal(afterPageReveal);
  return <div ref={contentRef} className={styles.reveal} data-hero-pending=""
    onFocusCapture={event => {
      if (event.target.matches(":focus-visible")) revealImmediately();
    }}>
    {children}
    <noscript><style>{`[data-hero-pending] [data-hero-title], [data-hero-pending] [data-hero-copy], [data-hero-pending] [data-hero-monogram] { visibility: visible !important; } [data-hero-pending] [data-hero-action] { opacity: 1 !important; }`}</style></noscript>
  </div>;
}
