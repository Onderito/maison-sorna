import Image from "next/image";
import type { TeaCardEntry } from "./tea-card-data";
import TeaCardDetails from "./tea-card-details";
import styles from "./tea-card.module.css";

export default function TeaCardProduct({ entry }: { entry: TeaCardEntry }) {
  return (
    <>
      <div className={`${styles.photograph} image-grain`}>
        <div className={styles.photographMedia}>
          <Image
            src={entry.photograph}
            alt={entry.photographAlt}
            fill
            quality={95}
            loading="eager"
            sizes="(max-width: 1024px) calc(100vw - 40px), 60vw"
            className={entry.photographFit === "contain" ? "object-contain p-6 md:p-12" : "object-cover"}
          />
        </div>
      </div>
      <TeaCardDetails entry={entry} />
    </>
  );
}
