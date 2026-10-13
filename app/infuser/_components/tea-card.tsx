import Image from "next/image";
import { getProduct } from "@/app/lib/shopify/products";
import TeaCardProduct from "./tea-card-product";
import type { TeaCardEntry } from "./tea-card-data";
import TeaCardEntrance from "./tea-card-entrance";
import styles from "./tea-card.module.css";

export default async function TeaCard() {
  const entries: TeaCardEntry[] = await Promise.all([
    {
      handle: "sourcil-dor", title: "Sourcil d’Or",
      photograph: "/figma/infuser/product/sourcil-photo.png",
      photographAlt: "Feuilles de thé dans une tasse et sa soucoupe, sous une lumière chaude.",
      teaType: "Thé\nnoir", origin: "Village\nde Tongmu", lot: "01",
      vintage: "2026", harvest: "2024", region: "Monts Wuyi\nFujian - Chine",
    },
    {
      handle: "ecorce-de-feu", title: "Écorce de Feu",
      photograph: "/figma/infuser/process/05.webp",
      photographAlt: "Feuilles de thé dans un panier de torréfaction.",
      teaType: "Oolong\nde roche", origin: "Monts Wuyi", lot: "—",
      vintage: "—", harvest: "—", region: "Monts Wuyi\nFujian - Chine",
    },
  ].map(async (entry) => {
    try { return { ...entry, product: await getProduct(entry.handle) }; }
    catch {
      console.error(`La fiche ${entry.handle} n’a pas pu être récupérée auprès de Shopify.`);
      return { ...entry, product: null };
    }
  }));

  return (
    <>
      {entries.map((entry, index) => (
        <TeaCardEntrance key={entry.handle} id={entry.handle} className={`${styles.section}${index % 2 === 1 ? ` ${styles.sectionReversed}` : ""}`}>
          <div className={styles.base} aria-hidden="true">
            <Image src="/figma/infuser/product/base.png" alt="" width={1671} height={941} quality={95} sizes="100vw" className={styles.baseImage} />
          </div>
          <Image src="/figma/infuser/product/paper.png" alt="" fill quality={95} sizes="100vw" className={styles.paperImage} />
          <TeaCardProduct entry={entry} />
        </TeaCardEntrance>
      ))}
    </>
  );
}
