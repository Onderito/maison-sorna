import Image from "next/image";
import Link from "next/link";
import { getProduct } from "@/app/lib/shopify/products";
import { getTeaCardEntry, teaEditions } from "../tea-editions";
import ProductDialog from "@/components/product-dialog";
import TeaCardDetails from "./tea-card-details";
import styles from "./tea-collection.module.css";

export default async function TeaCollection() {
  const entries = await Promise.all(teaEditions.map(async (edition) => {
    try {
      return { edition, product: await getProduct(edition.handle), failed: false };
    } catch {
      console.error(`Impossible de charger la cuvée ${edition.handle} depuis Shopify.`);
      return { edition, product: null, failed: true };
    }
  }));

  return (
    <section id="les-cuvees" className={styles.section} aria-labelledby="collection-title">
      <header className={styles.header}>
        <p className={styles.eyebrow}>La collection</p>
        <h2 id="collection-title">À chacun son sommet</h2>
        <p>Cinq cuvées, cinq façons de découvrir la feuille.</p>
      </header>
      <ul className={styles.collection}>
        {entries.map(({ edition, product, failed }, index) => {
          const teaEntry = product ? getTeaCardEntry(product) : null;
          const variants = product?.variants.nodes ?? [];
          const available = variants.filter((variant) => variant.availableForSale);
          const prices = (available.length ? available : variants).map((variant) => variant.price);
          const minimum = prices.reduce<(typeof prices)[number] | null>((current, price) =>
            !current || Number(price.amount) < Number(current.amount) ? price : current, null);
          const price = minimum ? new Intl.NumberFormat("fr-FR", {
            style: "currency", currency: minimum.currencyCode, maximumFractionDigits: 2,
          }).format(Number(minimum.amount)) : null;
          const contents = <>
            <div className={styles.artwork} data-product-artwork>
              <span className={styles.number} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <Image src={edition.photograph} alt={edition.photographAlt} fill sizes="(min-width: 1200px) 18vw, (min-width: 600px) 30vw, 45vw" className={styles.botanical} />
              <span className={styles.family}>{edition.family}</span>
            </div>
            <div className={styles.copy}>
              <h3>{product?.title ?? edition.title}</h3>
              <p className={styles.signature}>{edition.signature}</p>
              <div className={styles.bottom}>
                {price && <p className={styles.price}>{available.length ? "À partir de" : "Épuisé ·"} {price}</p>}
                <span className={styles.discover}>{product ? "Découvrir la cuvée" : failed ? "Indisponible pour le moment" : "Présentation à venir"}{product && <span aria-hidden="true">↗</span>}</span>
              </div>
            </div>
          </>;
          return <li key={edition.handle}>
            {product && teaEntry ? (
              <ProductDialog href={`/produits/${product.handle}`} title={product.title} trigger={contents} triggerClassName={styles.card} image={
                <Image src={edition.photograph} alt={edition.photographAlt} fill loading="eager" sizes="(min-width: 768px) 50vw, 100vw" className="object-contain" />
              }>
                <TeaCardDetails entry={teaEntry} presentation="dialog" />
              </ProductDialog>
            ) : product ? <Link href={`/produits/${product.handle}`} className={styles.card}>{contents}</Link> : <article className={`${styles.card} ${styles.preview}`}>{contents}</article>}
          </li>;
        })}
      </ul>
      <Link href="#le-geste" className={styles.more}>De la feuille à la tasse <span aria-hidden="true">↓</span></Link>
    </section>
  );
}
