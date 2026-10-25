import TeaCardProduct from "./tea-card-product";
import type { TeaCardEntry } from "./tea-card-data";
import styles from "./tea-card.module.css";

export default function TeaCard({ entry }: { entry: TeaCardEntry }) {
  return (
    <section
      id={entry.handle}
      data-cru={entry.handle}
      className={styles.section}
      aria-labelledby={`tea-${entry.handle}-title`}
    >
      <TeaCardProduct entry={entry} />
    </section>
  );
}
