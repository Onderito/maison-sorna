import TeaCardProduct from "./tea-card-product";
import type { TeaCardEntry } from "./tea-card-data";
import TeaCardEntrance from "./tea-card-entrance";
import styles from "./tea-card.module.css";

export default function TeaCard({ entry }: { entry: TeaCardEntry }) {
  return (
    <TeaCardEntrance id={entry.handle} className={styles.section}>
      <TeaCardProduct entry={entry} />
    </TeaCardEntrance>
  );
}
