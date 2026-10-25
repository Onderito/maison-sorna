"use client";

import type { ReactNode } from "react";
import { useProcessTransitions } from "@/animations/use-process-transitions";

export default function ProcessTransitions({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}) {
  const containerRef = useProcessTransitions();

  return <div ref={containerRef} className={className}>{children}</div>;
}
