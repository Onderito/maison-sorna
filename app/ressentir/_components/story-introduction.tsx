import { Fragment, type ReactNode } from "react";
import ScrollImageIntroduction from "@/components/scroll-image-introduction";

type StoryIntroductionProps = {
  id: string;
  title: string | string[];
  subtitle: ReactNode;
  imageSrc: string;
  multiline?: boolean;
  wideTitle?: boolean;
};

export default function StoryIntroduction({ id, title, subtitle, imageSrc, multiline = false, wideTitle = false }: StoryIntroductionProps) {
  const lines = Array.isArray(title) ? title : [title];
  return (
    <ScrollImageIntroduction id={id} imageSrc={imageSrc} pace="relaxed">
      <h2
        id={`${id}-title`}
        aria-label={lines.join(" ")}
        className={`mx-auto max-w-[1407px] font-display ${wideTitle ? "text-[clamp(1rem,7.8vw,8rem)]" : "text-[length:var(--section-title-mobile-media)]"} font-normal text-balance md:whitespace-nowrap uppercase ${multiline ? `${wideTitle ? "" : "md:text-[clamp(2rem,10vw,11rem)]"} leading-[0.98]` : "md:text-[80px] lg:text-[112px] xl:text-[144px] 2xl:text-[160px] min-[1800px]:text-[176px] leading-[normal]"}`}
      >
        <span data-introduction-heading-mask>
          <span data-introduction-heading aria-hidden="true">
            {lines.map((line, index) => (
              <Fragment key={line}>{index > 0 && <br />}{line}</Fragment>
            ))}
          </span>
        </span>
      </h2>
      <p data-introduction-copy className="mx-auto mt-6 max-w-[36em] px-4 font-sans text-[16px] md:mt-8 md:text-[18px] lg:text-[20px] leading-[1.4] font-normal">
        {subtitle}
      </p>
    </ScrollImageIntroduction>
  );
}
