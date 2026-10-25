"use client";

import type { ReactNode } from "react";
import { useFaqEntrance } from "@/animations/use-faq-entrance";
import styles from "./faq-section.module.css";

export default function FaqEntrance({ children }: { children: ReactNode }) {
  const { sectionRef, revealImmediately } = useFaqEntrance();

  return (
    <section
      ref={sectionRef}
      id="faq"
      className={styles.section}
      aria-labelledby="faq-title"
      onFocusCapture={(event) => {
        if (!event.target.matches(":focus-visible")) return;
        revealImmediately();
      }}
    >
      {children}
    </section>
  );
}
