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
        if (event.target.matches(":focus-visible")) revealImmediately();
      }}
      onPointerDownCapture={(event) => {
        if (event.target instanceof Element && event.target.closest("[data-collection-card]")) revealImmediately();
      }}
    >
      {children}
    </section>
  );
}
