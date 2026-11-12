import Image from "next/image";
import type { ReactNode } from "react";
import SeamlessBackgroundVideo from "@/components/seamless-background-video";
import SiteNavigation from "@/components/site-navigation";
import { TransitionLink } from "@/components/page-transition";
import HeroTextReveal from "@/components/hero-text-reveal";
import styles from "./hero-section.module.css";
import heroMedia from "@/components/hero-media.module.css";

// Previous mist-loop-v1 and wuyi-mist-loop-v2 assets remain available for comparison.
const defaultVideoSrc = "/figma/hero/wuyi-panorama-loop-v3.mp4";

type HeroSectionProps = {
  /** Replaces the default video with a custom background element. */
  children?: ReactNode;
  className?: string;
  videoFadeDuration?: number;
  videoSrc?: string;
};

export function HeroSection({
  children,
  className = "",
  videoFadeDuration = 1.2,
  videoSrc = defaultVideoSrc,
}: HeroSectionProps) {
  return (
    <section
      className={`relative isolate min-h-[100svh] overflow-hidden bg-[#211915] text-text-on-dark ${className}`}
      aria-labelledby="hero-title"
    >
      <div
        className="absolute inset-0 -z-20 overflow-hidden [&>*]:h-full [&>*]:w-full [&_video]:object-cover"
        aria-hidden="true"
      >
        {children ?? (
          <SeamlessBackgroundVideo
            className={heroMedia.home}
            fadeDuration={videoFadeDuration}
            playbackRate={videoSrc === defaultVideoSrc ? 0.75 : 1}
            seamlessLoop={videoSrc === defaultVideoSrc}
            poster={
              videoSrc === defaultVideoSrc
                ? "/figma/hero/wuyi-panorama-loop-v3-poster.jpg"
                : "/figma/hero/video-poster.jpg"
            }
            src={videoSrc}
          />
        )}
        <span className="image-grain-overlay" aria-hidden="true" />
      </div>

      <SiteNavigation overlay tone="light" />

      <HeroTextReveal>
        <div className="absolute inset-0 z-10 flex items-center justify-center px-4 pt-14 text-center md:px-11 md:pt-0">
          <div className="flex w-full max-w-[1640px] flex-col items-center gap-7 md:gap-10">
            <div className="flex w-full flex-col items-center gap-3 md:gap-4">
              <div data-hero-monogram className="relative h-[clamp(5.75rem,11.9vh,8.3125rem)] w-[clamp(4.5rem,6.02vw,6.5rem)] shrink-0 overflow-hidden">
                <Image
                  src="/logos/sorna-beige.png"
                  alt=""
                  width={330}
                  height={708}
                  priority
                  className="h-full w-full object-contain"
                />
              </div>

              <h1
                id="hero-title"
                data-hero-title
                className={`${styles.title} w-full text-balance font-display text-[length:var(--hero-title-mobile)] md:text-[clamp(3.25rem,11.57vw,12.5rem)] leading-[0.9] font-normal tracking-[-0.04em] uppercase`}
              >
                <span className={styles.textMask}><span data-hero-title-line className={styles.textLine}>SÖRNA</span></span>
              </h1>
            </div>
            <div className={styles.introduction}>
              <p data-hero-copy className={styles.copy}><span className={styles.textMask}><span data-hero-copy-line className={styles.textLine}>Des thés de terroir, des soins anhydre.</span></span></p>
              <TransitionLink href="/infuser#les-cuvees" className={styles.cta} data-hero-action>
                Découvrir les crus
              </TransitionLink>
            </div>
          </div>
        </div>
      </HeroTextReveal>
    </section>
  );
}

export default HeroSection;
