"use client";

import type { ReactNode } from "react";
import { useTeaCollectionEntrance } from "@/animations/use-tea-collection-entrance";
import styles from "./tea-collection.module.css";

export default function TeaCollectionEntrance({ children }: { children: ReactNode }) {
  const { sectionRef, revealImmediately } = useTeaCollectionEntrance();
  return (
    <section
      ref={sectionRef}
      id="les-cuvees"
      className={styles.section}
      aria-labelledby="collection-title"
      onFocusCapture={(event) => {
        // Next.js focuses the section itself after hash navigation. Only
        // finish the entrance when a product receives keyboard focus.
        if (event.target.matches(":focus-visible") && event.target.closest("[data-collection-card]")) revealImmediately();
      }}
      onPointerDownCapture={(event) => {
        if (event.target instanceof Element && event.target.closest("[data-collection-card]")) revealImmediately();
      }}
    >
      {children}
    </section>
  );
}
