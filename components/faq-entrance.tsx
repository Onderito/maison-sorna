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
      data-faq-pending=""
      className={styles.section}
      aria-labelledby="faq-title"
      onFocusCapture={(event) => {
        if (!event.target.matches(":focus-visible")) return;
        revealImmediately();
      }}
    >
      <noscript><style>{`#faq[data-faq-pending] [data-faq-title], #faq[data-faq-pending] [data-faq-introduction], #faq[data-faq-pending] [data-faq-photograph], #faq[data-faq-pending] [data-faq-item], #faq[data-faq-pending] [data-faq-contact] { visibility: visible; }`}</style></noscript>
      {children}
    </section>
  );
}
