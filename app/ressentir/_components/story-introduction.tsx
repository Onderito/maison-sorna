import Image from "next/image";
import { Fragment, type ReactNode } from "react";
import StoryTextReveal from "./story-text-reveal";

type StoryIntroductionProps = {
  id: string;
  title: string | string[];
  subtitle: ReactNode;
  multiline?: boolean;
};

export default function StoryIntroduction({ id, title, subtitle, multiline = false }: StoryIntroductionProps) {
  const lines = Array.isArray(title) ? title : [title];
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
      <StoryTextReveal>
        <div className="max-w-full overflow-hidden pb-[0.12em] -mb-[0.12em]">
          <h2
            data-story-heading
            id={`${id}-title`}
            aria-label={lines.join(" ")}
            className={`font-display text-[length:var(--section-title-mobile-media)] font-normal text-balance md:whitespace-nowrap uppercase ${multiline ? "md:text-[clamp(2rem,10vw,11rem)] leading-[0.98]" : "md:h-[0.977em] md:text-[clamp(3rem,12.73vw,13.75rem)] leading-[normal]"}`}
          >
            <span aria-hidden="true">
              {lines.map((line, lineIndex) => (
                <Fragment key={line}>
                  {lineIndex > 0 && <br />}
                  {line.split(" ").map((word, wordIndex) => (
                    <Fragment key={`${word}-${wordIndex}`}>
                      {wordIndex > 0 && " "}
                      <span className="inline-block overflow-clip align-bottom px-[0.04em] py-[0.14em] -mx-[0.04em] -my-[0.14em]">
                        <span data-story-word className="inline-block">{word}</span>
                      </span>
                    </Fragment>
                  ))}
                </Fragment>
              ))}
            </span>
          </h2>
        </div>
        <p data-story-copy className="max-w-[36em] font-sans text-[16px] md:text-[18px] lg:text-[20px] leading-[1.4] font-normal uppercase">
          {subtitle}
        </p>
      </StoryTextReveal>
    </section>
  );
}
