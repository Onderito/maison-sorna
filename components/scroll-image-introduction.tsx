"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { useScrollImageIntroduction } from "@/animations/use-scroll-image-introduction";
import styles from "./scroll-image-introduction.module.css";

type ScrollImageIntroductionProps = {
  id: string;
  imageSrc: string;
  children: ReactNode;
};

export default function ScrollImageIntroduction({ id, imageSrc, children }: ScrollImageIntroductionProps) {
  const { sectionRef, viewportRef, photographRef, titleRef, shadeRef } = useScrollImageIntroduction();

  return (
    <section ref={sectionRef} id={id} className={styles.introduction} aria-labelledby={`${id}-title`}>
      <div ref={viewportRef} className={styles.introductionViewport}>
        <div ref={photographRef} className={styles.introductionMedia} aria-hidden="true">
          <Image
            src={imageSrc}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
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
