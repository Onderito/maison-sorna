"use client";

import type { ComponentPropsWithoutRef } from "react";
import { useOriginChapterReveal } from "@/animations/use-origin-chapter-reveal";

export default function OriginChapterReveal(props: ComponentPropsWithoutRef<"section">) {
  const { sectionRef } = useOriginChapterReveal();
  return <section {...props} ref={sectionRef} />;
}
