"use client";

import type { ComponentPropsWithoutRef } from "react";
import { useOriginChapterReveal } from "@/animations/use-origin-chapter-reveal";

export default function OriginChapterReveal(props: ComponentPropsWithoutRef<"section">) {
  const { sectionRef } = useOriginChapterReveal();
  return (
    <section {...props} ref={sectionRef} data-origin-pending="">
      <noscript><style>{`[data-origin-pending] [data-origin-copy], [data-origin-pending] [data-origin-photo] { visibility: visible; }`}</style></noscript>
      {props.children}
    </section>
  );
}
