import Image from "next/image";
import type { ReactNode } from "react";
import SeamlessBackgroundVideo from "@/components/seamless-background-video";
import SiteNavigation from "@/components/site-navigation";

const defaultVideoSrc =
  "https://cdn.midjourney.com/video/5f955f2a-036c-41d6-8d47-66293ad99aca/1.mp4";

type UniversHeroProps = {
  title?: ReactNode;
  id?: string;
  /** Replaces the default video with a custom background element. */
  children?: ReactNode;
  className?: string;
  scrollTarget?: string;
  videoFadeDuration?: number;
  videoSrc?: string;
};

export function UniversHero({
  title = "La maison",
  id = "la-maison",
  children,
  className = "",
  scrollTarget = "#ressentir",
  videoFadeDuration = 1.2,
  videoSrc = defaultVideoSrc,
}: UniversHeroProps) {
  return (
    <section
      id={id}
      className={`relative isolate min-h-[100svh] overflow-hidden bg-[#18150f] text-text-on-dark ${className}`}
      aria-labelledby={`${id}-title`}
    >
      <div
        className="absolute inset-0 -z-20 overflow-hidden [&>*]:size-full [&_video]:object-cover"
        aria-hidden="true"
      >
        {children ?? (
          <SeamlessBackgroundVideo
            fadeDuration={videoFadeDuration}
            src={videoSrc}
          />
        )}
      </div>

      <SiteNavigation overlay tone="light" />

      <div className="absolute inset-0 z-10 flex items-center justify-center px-4 pt-14 text-center md:px-11 md:pt-0">
        <div className="flex w-full max-w-[1640px] flex-col items-center gap-7 md:gap-10">
          <div className="flex w-full flex-col items-center gap-3 md:gap-4">
            <div className="relative h-[clamp(5.75rem,11.9vh,8.375rem)] w-[clamp(4.5rem,6.02vw,6.5rem)] shrink-0 overflow-hidden">
              <Image
                src="/figma/hero/monogram.png"
                alt=""
                width={104}
                height={156}
                priority
                className="absolute -top-[5.97%] left-0 h-[116.42%] w-full max-w-none"
              />
            </div>

            <h1
              id={`${id}-title`}
              className="w-full font-display text-[clamp(3.5rem,11.57vw,12.5rem)] leading-[0.85] font-normal tracking-[-0.04em] whitespace-nowrap uppercase"
            >
              {title}
            </h1>
          </div>

          <p className="font-sans text-sm leading-normal text-pretty md:text-xl">
            Grand cru Botannique
          </p>
        </div>
      </div>

      <a
        href={scrollTarget}
        className="absolute bottom-[clamp(1.25rem,2.8vh,1.9375rem)] left-1/2 z-20 flex h-11 w-16 -translate-x-1/2 items-center justify-center transition-transform duration-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current active:scale-[0.96] motion-reduce:transition-none"
        aria-label="Découvrir la suite"
      >
        <Image
          src="/figma/hero/scroll-indicator.svg"
          alt=""
          width={64}
          height={45}
          className="h-[45px] w-16"
        />
      </a>
    </section>
  );
}

export default UniversHero;
