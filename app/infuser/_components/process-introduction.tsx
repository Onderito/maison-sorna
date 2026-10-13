"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import styles from "./plant-process.module.css";

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const timelineLength = 1000;

export default function ProcessIntroduction() {
  const sectionRef = useRef<HTMLElement>(null);
  const photographRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const shadeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Let supporting browsers drive the reveal directly, even before hydration finishes.
    if (CSS.supports("animation-timeline", "view()") && CSS.supports("animation-range", "entry 75% contain 85%")) return;

    const section = sectionRef.current;
    const photograph = photographRef.current;
    const title = titleRef.current;
    const shade = shadeRef.current;
    if (!section || !photograph || !title || !shade) return;

    const expansionKeyframes = () => {
      const appearance = getComputedStyle(photograph);
      const wideInset = appearance.getPropertyValue("--geste-wide-inset").trim();
      const frames: Keyframe[] = [
        {
          offset: 0,
          transform: `scale(${appearance.getPropertyValue("--geste-start-scale").trim()})`,
          clipPath: `inset(${appearance.getPropertyValue("--geste-start-inset").trim()})`,
        },
        { offset: 1, transform: "scale(1)", clipPath: "inset(0%)" },
      ];
      if (wideInset) frames.splice(1, 0, { offset: 0.35, transform: "scale(1)", clipPath: `inset(${wideInset})` });
      return frames;
    };
    const expansion = photograph.animate(
      expansionKeyframes(),
      { duration: timelineLength, fill: "both", easing: "linear" },
    );
    const reveal = title.animate(
      [{ opacity: 0, transform: "translateY(16px)" }, { opacity: 1, transform: "translateY(0px)" }],
      { duration: timelineLength, fill: "both", easing: "cubic-bezier(0.23, 1, 0.32, 1)" },
    );
    const dimming = shade.animate(
      [{ opacity: 0 }, { opacity: 0.25 }],
      { duration: timelineLength, fill: "both", easing: "linear" },
    );
    const animations = [expansion, reveal, dimming];
    animations.forEach((animation) => animation.pause());

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let previousProgress = -1;

    const update = () => {
      frame = 0;
      const { top, height } = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const pinnedTravel = Math.max(1, height - viewportHeight);
      const progress = reducedMotion.matches
        ? 1
        : clamp((viewportHeight * 0.25 - top) / (viewportHeight * 0.25 + pinnedTravel * 0.85));
      if (progress === previousProgress) return;
      previousProgress = progress;

      // These paused browser timelines follow position, never elapsed time or React state.
      expansion.currentTime = progress * timelineLength;
      reveal.currentTime = (reducedMotion.matches ? 1 : clamp((-top / pinnedTravel - 0.55) / 0.25)) * timelineLength;
      dimming.currentTime = (reducedMotion.matches ? 1 : clamp((-top / pinnedTravel - 0.45) / 0.35)) * timelineLength;
    };

    const scheduleUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    const updateLayout = () => {
      if (expansion.effect instanceof KeyframeEffect) expansion.effect.setKeyframes(expansionKeyframes());
      previousProgress = -1;
      scheduleUpdate();
    };

    update();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", updateLayout);
    reducedMotion.addEventListener("change", scheduleUpdate);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", updateLayout);
      reducedMotion.removeEventListener("change", scheduleUpdate);
      animations.forEach((animation) => animation.cancel());
    };
  }, []);

  return (
    <header ref={sectionRef} id="le-geste" className={styles.introduction} aria-labelledby="le-geste-title">
      <div className={styles.introductionViewport}>
        <div ref={photographRef} className={styles.introductionMedia} aria-hidden="true">
          <Image
            src="/figma/infuser/process/04.webp"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
          <span className="image-grain-overlay" />
          <div ref={shadeRef} className={styles.introductionShade} />
        </div>
        <div ref={titleRef} className={styles.introductionTitle}>
          <h2 id="le-geste-title" className="w-full font-display text-[clamp(3.5rem,11.57vw,12.5rem)] leading-[0.85] font-normal tracking-[-0.04em] whitespace-nowrap uppercase">
            Le geste
          </h2>
        </div>
      </div>
    </header>
  );
}
