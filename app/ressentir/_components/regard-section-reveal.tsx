"use client";

import type { ComponentPropsWithoutRef } from "react";
import { useRegardSectionReveal } from "@/animations/use-regard-section-reveal";

export default function RegardSectionReveal(props: ComponentPropsWithoutRef<"section">) {
  const { sectionRef } = useRegardSectionReveal();
  return <section {...props} ref={sectionRef} />;
}
