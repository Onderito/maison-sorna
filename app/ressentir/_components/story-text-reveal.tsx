"use client";

import type { ReactNode } from "react";
import { useStoryTextReveal } from "@/animations/use-story-text-reveal";

export default function StoryTextReveal({ children }: { children: ReactNode }) {
  const { textRef } = useStoryTextReveal();
  return (
    <div ref={textRef} className="mx-auto flex w-full max-w-[1407px] flex-col items-center gap-6 md:gap-8">
      {children}
    </div>
  );
}
