import Image from "next/image";
import type { ReactNode } from "react";

type StoryIntroductionProps = {
  id: string;
  title: ReactNode;
  subtitle: ReactNode;
  multiline?: boolean;
};

export default function StoryIntroduction({ id, title, subtitle, multiline = false }: StoryIntroductionProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="relative isolate flex min-h-[100svh] items-center justify-center overflow-hidden bg-[#40200c] px-5 py-24 text-center text-[#F5F2EB] md:px-11"
    >
      <Image
        src="/figma/ressentir/origines.png"
        alt=""
        fill
        sizes="100vw"
        className="-z-10 object-cover"
      />
      <div className="mx-auto flex w-full max-w-[1407px] flex-col items-center gap-6 md:gap-8">
        <h2
          id={`${id}-title`}
          className={`font-display text-[length:var(--section-title-mobile-media)] font-normal text-balance md:whitespace-nowrap uppercase ${multiline ? "md:text-[clamp(2rem,10vw,11rem)] leading-[0.98]" : "md:h-[0.977em] md:text-[clamp(3rem,12.73vw,13.75rem)] leading-[normal]"}`}
        >
          {title}
        </h2>
        <p className="max-w-[36em] font-sans text-[clamp(0.75rem,1.16vw,1.25rem)] leading-[1.4] font-normal uppercase">
          {subtitle}
        </p>
      </div>
    </section>
  );
}
