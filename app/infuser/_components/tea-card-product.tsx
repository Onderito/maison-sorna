"use client";

import Image from "next/image";
import { motion } from "motion/react";
import type { TeaCardEntry } from "./tea-card-data";
import TeaCardDetails from "./tea-card-details";
import { photoEntrance, photoZoomEntrance, useTeaCardEntrance } from "./tea-card-entrance";
import styles from "./tea-card.module.css";

export default function TeaCardProduct({ entry }: { entry: TeaCardEntry }) {
  const { controls: entrance } = useTeaCardEntrance();

  return (
    <>
      <motion.div
        className={`${styles.photograph} image-grain`}
        initial="entranceHidden"
        animate={entrance}
        variants={photoEntrance}
      >
        <motion.div
          className={styles.photographMedia}
          initial="entranceHidden"
          animate={entrance}
          variants={photoZoomEntrance}
        >
          <Image
            src={entry.photograph}
            alt={entry.photographAlt}
            fill
            quality={95}
            loading="eager"
            sizes="(max-width: 1024px) calc(100vw - 40px), 60vw"
            className={entry.photographFit === "contain" ? "object-contain p-6 md:p-12" : "object-cover"}
          />
        </motion.div>
      </motion.div>
      <TeaCardDetails entry={entry} />
    </>
  );
}
