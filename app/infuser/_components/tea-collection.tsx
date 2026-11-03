import Image from "next/image";
import Link from "next/link";
import { getProduct } from "@/app/lib/shopify/products";
import { getTeaCardEntry, teaEditions } from "../tea-editions";
import { getTeaCollectionDescription } from "@/app/lib/shopify/tea-description";
import ProductDialog from "@/components/product-dialog";
import TeaCardDetails from "./tea-card-details";
import TeaCollectionStatement from "./tea-collection-statement";
import TeaCollectionEntrance from "./tea-collection-entrance";
import styles from "./tea-collection.module.css";

export default async function TeaCollection() {
  const entries = await Promise.all(teaEditions.map(async (edition) => {
    try {
      return { edition, product: await getProduct(edition.handle), failed: false };
    } catch {
      console.error(`Impossible de charger le cru ${edition.handle} depuis Shopify.`);
      return { edition, product: null, failed: true };
    }
  }));

  return (
    <TeaCollectionEntrance>
      <div className={styles.layout}>
      <aside className={styles.sidebar}>
      <header data-collection-header className={styles.header}>
        <p data-collection-eyebrow className={styles.eyebrow}>La collection</p>
        <h2 id="collection-title"><span className={styles.titleMask}><span data-collection-title>À chacun<br />son sommet</span></span></h2>
        <p data-collection-introduction>Cinq crus, cinq façons de découvrir la feuille.</p>
      </header>
      <nav aria-label="Les cinq crus" className={styles.navigation}>
        {entries.map(({ edition, product }, index) => (
          <a key={edition.handle} href={`#collection-${edition.handle}`} data-collection-nav>
            <span className={styles.navNumber} aria-hidden="true">{["I", "II", "III", "IV", "V"][index]}</span>
            <span className={styles.navCopy}>
              <span>{product?.title ?? edition.title}</span>
              <span className={styles.navFamily}>{(product ? getTeaCardEntry(product)?.teaType : null) || edition.family}</span>
            </span>
            <span className={styles.navArrow} aria-hidden="true">→</span>
          </a>
        ))}
      </nav>
      </aside>
      <ul className={styles.collection}>
        {entries.map(({ edition, product, failed }, index) => {
          const isSignature = edition.handle === "sourcil-dor";
          const teaEntry = product ? getTeaCardEntry(product) : null;
          const photograph = teaEntry?.photograph ?? edition.photograph;
          const photographAlt = teaEntry?.photographAlt ?? edition.photographAlt;
          const variants = product?.variants.nodes ?? [];
          const available = variants.filter((variant) => variant.availableForSale);
          const prices = (available.length ? available : variants).map((variant) => variant.price);
          const minimum = prices.reduce<(typeof prices)[number] | null>((current, price) =>
            !current || Number(price.amount) < Number(current.amount) ? price : current, null);
          const price = minimum ? new Intl.NumberFormat("fr-FR", {
            style: "currency", currency: minimum.currencyCode, maximumFractionDigits: 2, minimumFractionDigits: 0,
          }).format(Number(minimum.amount)) : null;
          const description = getTeaCollectionDescription(teaEntry?.sections ?? []);
          const contents = <>
            <span className={styles.number} aria-hidden="true">{teaEntry?.cuvee ?? ["I", "II", "III", "IV", "V"][index]}</span>
            {isSignature && <span className={styles.signatureLabel}>Notre thé signature</span>}
            <div className={styles.artwork} data-product-artwork>
              <Image src={photograph} alt={photographAlt} fill sizes="(min-width: 1024px) 48vw, 100vw" className={styles.botanical} />
            </div>
            <div className={styles.copy} data-collection-copy>
              <h3 className={styles.textMask}><span data-collection-reveal>{product?.title ?? edition.title}</span></h3>
              {description && <p className={`${styles.description} ${styles.textMask}`}><span data-collection-reveal>{description}</span></p>}
              <div className={styles.textMask}><div className={styles.bottom} data-collection-reveal>
                {price && <p className={styles.price}>{available.length ? "À partir de" : "Épuisé ·"} <span>{price}</span></p>}
                <span className={styles.discover}>{product ? "Découvrir ce cru" : failed ? "Indisponible pour le moment" : "Présentation à venir"}{product && <span aria-hidden="true">↗</span>}</span>
              </div></div>
            </div>
          </>;
          return <li key={edition.handle} id={`collection-${edition.handle}`} data-collection-card data-signature={isSignature || undefined}>
            {product && teaEntry ? (
              <ProductDialog href={`/produits/${product.handle}`} title={product.title} trigger={contents} triggerClassName={styles.card} image={
                <Image src={photograph} alt={photographAlt} fill loading="eager" sizes="(min-width: 768px) 50vw, 100vw" className="object-contain" />
              }>
                <TeaCardDetails entry={teaEntry} presentation="dialog" />
              </ProductDialog>
            ) : product ? <Link href={`/produits/${product.handle}`} className={styles.card}>{contents}</Link> : <article className={`${styles.card} ${styles.preview}`}>{contents}</article>}
          </li>;
        })}
      </ul>
      </div>
      <TeaCollectionStatement className={styles.ending}>
        <p className={styles.statement}>Nous choisissons chaque thé pour ce qu’il a de singulier. Une origine, une récolte, un caractère que les gestes viennent révéler.</p>
        <p className={styles.statementSignature}>SÖRNA</p>
      </TeaCollectionStatement>
    </TeaCollectionEntrance>
  );
}
