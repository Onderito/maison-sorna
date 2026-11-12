"use client";

import type { ReactNode } from "react";
import { useReceptionMotion } from "@/animations/use-reception-motion";

export default function ReceptionMotion({ children, className }: { children: ReactNode; className: string }) {
  const { pageRef, revealForFocus } = useReceptionMotion();
  return <main ref={pageRef} className={className} data-reception-pending=""
    onFocusCapture={event => {
      if (event.target.matches(":focus-visible")) revealForFocus(event.target);
    }}>
    {children}
    <noscript><style>{`[data-reception-pending] [data-reception-text], [data-reception-pending] [data-reception-detail] { visibility: visible !important; } [data-reception-pending] [data-reception-panel] { opacity: 1 !important; } [data-reception-pending] [data-reception-photo] { transform: none !important; }`}</style></noscript>
  </main>;
}
