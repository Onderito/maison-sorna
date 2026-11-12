"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { useScrollImageIntroduction, type IntroductionOpening } from "@/animations/use-scroll-image-introduction";
import styles from "./scroll-image-introduction.module.css";

type ScrollImageIntroductionProps = {
  id: string;
  imageSrc: string;
  children: ReactNode;
  pace?: "default" | "relaxed";
  opening?: IntroductionOpening;
};

export default function ScrollImageIntroduction({ id, imageSrc, children, pace = "default", opening = "grand" }: ScrollImageIntroductionProps) {
  const { sectionRef, viewportRef, photographRef, titleRef, shadeRef } = useScrollImageIntroduction(pace === "relaxed" ? 0.6 : 0.4, opening);

  return (
    <section ref={sectionRef} id={id} data-pace={pace} className={styles.introduction} aria-labelledby={`${id}-title`}>
      <div ref={viewportRef} className={styles.introductionViewport}>
        <div ref={photographRef} className={styles.introductionMedia} aria-hidden="true">
          <div data-introduction-image className={styles.introductionImage}>
            <Image
              src={imageSrc}
              alt=""
              fill
              sizes="100vw"
              className="object-cover"
            />
          </div>
          <span className="image-grain-overlay" />
          <div ref={shadeRef} className={styles.introductionShade} />
        </div>
        <div ref={titleRef} className={styles.introductionTitle}>
          {children}
        </div>
      </div>
    </section>
  );
}
