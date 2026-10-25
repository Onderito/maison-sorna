"use client";

import Image from "next/image";
import { useId, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addToCart } from "@/app/actions/cart";
import type { AddToCartResult } from "@/app/lib/shopify-types";
import styles from "./tea-card.module.css";
import type { TeaCardEntry } from "./tea-card-data";

export default function TeaCardDetails({ entry, presentation = "page" }: { entry: TeaCardEntry; presentation?: "page" | "dialog" }) {
  const { product, handle } = entry;
  const variants = product?.variants.nodes ?? [];
  const initialVariant = variants.find((variant) => variant.availableForSale) ?? variants[0];
  const [selection, setSelection] = useState({ handle, id: initialVariant?.id });
  const selected = variants.find((variant) => selection.handle === handle && variant.id === selection.id) ?? initialVariant;
  const [feedback, setFeedback] = useState<(AddToCartResult & { handle: string }) | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const formatId = useId();
  const price = selected ? new Intl.NumberFormat("fr-FR", {
    style: "currency", currency: selected.price.currencyCode, maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(Number(selected.price.amount)) : "—";

  function handleAdd() {
    if (!selected?.availableForSale || pending) return;
    const variant = selected;
    setFeedback(null);
    startTransition(async () => {
      try {
        const result = await addToCart(variant.id, variant.quantityRule.minimum);
        setFeedback({ ...result, handle });
        if (result.status !== "error") router.refresh();
      } catch {
        setFeedback({ handle, status: "error", message: "Impossible d’ajouter ce cru. Réessaie dans un instant." });
      }
    });
  }

  return (
    <div className={`${styles.panel} ${presentation === "dialog" ? styles.dialogPanel : ""}`}>
      <div className={styles.card}>
        <header className={styles.heading} data-product-reveal>
          <h2 id={`tea-${handle}-title`}>{entry.title}</h2>
          <Image src="/figma/infuser/product/title-rule.svg" alt="" width={155} height={1} className={styles.titleRule} />
          <p className={styles.label}>Lot n°</p>
          <p className={styles.number}>{entry.lot}</p>
        </header>
        <div className={styles.detailRow} data-product-reveal>
          <div className={styles.cell}>
            <p className={styles.label}>Type de thé</p>
            <p className={styles.serifValue}>{entry.teaType}</p>
          </div>
          <div className={styles.cell}>
            <p id={formatId} className={styles.label}>Format</p>
            {variants.length > 1 ? (
              <div className={styles.formatButtons} role="group" aria-labelledby={formatId}>
                {variants.map((variant) => (
                  <button
                    key={variant.id}
                    type="button"
                    className={styles.formatButton}
                    aria-pressed={selected?.id === variant.id}
                    data-available={variant.availableForSale}
                    disabled={pending}
                    onClick={() => {
                      setSelection({ handle, id: variant.id });
                      setFeedback(null);
                    }}
                  >
                    <span>{variant.title}</span>
                    {!variant.availableForSale && <span className={styles.formatAvailability}>Épuisé</span>}
                  </button>
                ))}
              </div>
            ) : <p className={styles.number}>{selected ? selected.title === "Default Title" ? "Format unique" : selected.title : "—"}</p>}
          </div>
          <span className={styles.rowRule} aria-hidden="true" />
          <span className={styles.detailDivider} aria-hidden="true" />
        </div>
        <div className={styles.detailRow} data-product-reveal>
          <div className={styles.cell}>
            <p className={styles.label}>Origine</p>
            <p className={styles.serifValue}>{entry.origin}</p>
          </div>
          <div className={styles.cell}>
            <p className={styles.label}>Millésime</p>
            <p className={styles.number}>{entry.vintage}</p>
          </div>
          <span className={styles.rowRule} aria-hidden="true" />
          <span className={styles.detailDivider} aria-hidden="true" />
        </div>
        <div className={styles.landscape} data-product-reveal>
          <div className={`${styles.landscapeCrop} image-grain`}>
            <Image src="/figma/infuser/product/wuyi.png" alt="Illustration des montagnes Wuyi à l’encre." width={1254} height={1254} quality={95} loading="eager" sizes="(max-width: 1024px) calc(100vw - 40px), 40vw" className={styles.landscapeImage} />
          </div>
          <span className={styles.landscapeRule} aria-hidden="true" />
        </div>
        <div className={styles.priceRow} data-product-reveal>
          <div className={styles.cell}>
            <p className={styles.label}>Récolte</p>
            <p className={styles.number}>{entry.harvest}</p>
          </div>
          <div className={styles.cell}>
            <p className={styles.label}>Prix</p>
            <p className={styles.price} aria-live="polite">{price}</p>
          </div>
          <span className={styles.bottomRule} aria-hidden="true" />
          <span className={styles.priceDivider} aria-hidden="true" />
        </div>
        <div className={styles.region} data-product-reveal>
          <p>{entry.region}</p>
          <span className={styles.bottomRule} aria-hidden="true" />
        </div>
      </div>
      <div className={styles.purchase} data-product-reveal>
        <button type="button" className={styles.addButton} onClick={handleAdd} disabled={pending || !selected?.availableForSale} aria-busy={pending}>
          <span>{pending ? "Ajout en cours…" : selected?.availableForSale ? "Ajouter au panier" : "Indisponible"}</span>
          {!pending && selected?.availableForSale && <span aria-hidden="true">→</span>}
        </button>
      </div>
      <div className={styles.feedback} role="status" aria-atomic="true">
        {(feedback?.handle === handle ? feedback.message : null) ?? (!product ? "Ce cru est momentanément indisponible." : "")}
      </div>
    </div>
  );
}
