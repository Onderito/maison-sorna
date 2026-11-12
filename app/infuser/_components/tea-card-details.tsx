"use client";

import { CART_PRODUCT_LIMIT } from "@/app/lib/shopify/cart-product-limit";
import Image from "next/image";
import ArrowRight from "@/components/arrow-right";
import { useId, useRef, useState, useTransition } from "react";
import { useCart } from "@/components/cart-provider";
import { addToCart } from "@/app/actions/cart";
import type { AddToCartResult } from "@/app/lib/shopify-types";
import styles from "./tea-card.module.css";
import type { TeaCardEntry } from "./tea-card-data";
import TeaProductDescription, { TeaDescriptionBlocks } from "./tea-product-description";

export default function TeaCardDetails({ entry, presentation = "page" }: { entry: TeaCardEntry; presentation?: "page" | "dialog" }) {
  const { product, handle } = entry;
  const tasting = entry.sections.find((section) => /^notes de d[eé]gustation$/i.test(section.title.trim()));
  const featuredSection = tasting ?? entry.sections.find((section) => !section.title);
  const variants = product?.variants.nodes ?? [];
  const initialVariant = variants.find((variant) => variant.availableForSale) ?? variants[0];
  const [selection, setSelection] = useState({ handle, id: initialVariant?.id });
  const selected = variants.find((variant) => selection.handle === handle && variant.id === selection.id) ?? initialVariant;
  const [feedback, setFeedback] = useState<(AddToCartResult & { handle: string }) | null>(null);
  const [pending, startTransition] = useTransition();
  // Blocks clicks fired before React re-renders the disabled button.
  const adding = useRef(false);
  const { openCart } = useCart();
  const formatId = useId();
  const price = selected ? new Intl.NumberFormat("fr-FR", {
    style: "currency", currency: selected.price.currencyCode, maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(Number(selected.price.amount)) : "—";
  const reference = selected?.unitPriceMeasurement;
  const unitPrice = selected?.unitPrice && reference?.referenceUnit && reference.referenceValue > 0
    ? `${new Intl.NumberFormat("fr-FR", { style: "currency", currency: selected.unitPrice.currencyCode, maximumFractionDigits: 2 }).format(Number(selected.unitPrice.amount))}/${reference.referenceValue === 1 ? "" : reference.referenceValue}${reference.referenceUnit.toLowerCase()}`
    : null;

  function handleAdd() {
    if (!selected?.availableForSale || pending || adding.current) return;
    adding.current = true;
    const variant = selected;
    setFeedback(null);
    startTransition(async () => {
      try {
        const result = await addToCart(variant.id, variant.quantityRule.minimum);
        setFeedback(result.status === "success" ? null : { ...result, handle });
        if (result.status !== "error") await openCart(variant.id);
      } catch {
        setFeedback({ handle, status: "error", message: "Impossible d’ajouter ce cru. Réessayez dans un instant." });
      } finally {
        adding.current = false;
      }
    });
  }

  return (
    <div className={`${styles.panel} ${presentation === "dialog" ? styles.dialogPanel : ""}`}>
      <div className={styles.detailsScroll} data-lenis-prevent
        {...(presentation === "page" ? { tabIndex: 0, role: "region", "aria-label": `Informations sur ${entry.title}` } : {})}>
      <div className={styles.card}>
        <header className={styles.heading} data-product-reveal>
          <h2 id={`tea-${handle}-title`}>{entry.title}</h2>
          <Image src="/figma/infuser/product/title-rule.svg" alt="" width={155} height={1} className={styles.titleRule} />
          {entry.cuvee && <><p className={styles.label}>Cru</p><p className={styles.number}>{entry.cuvee}</p></>}
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
            <p className={styles.formatLimit}>Maximum {CART_PRODUCT_LIMIT} sachets par cru.</p>
          </div>
          <span className={styles.rowRule} aria-hidden="true" />
          <span className={styles.detailDivider} aria-hidden="true" />
        </div>
        <div className={styles.detailRow} data-product-reveal>
          <div className={styles.cell}>
            <p className={styles.label}>Origine</p>
            <p className={styles.serifValue}>{entry.origin ?? "—"}</p>
          </div>
          <div className={styles.cell}>
            <p className={styles.label}>{entry.vintage ? "Millésime" : "Oxydation"}</p>
            <p className={styles.number}>{entry.vintage ?? entry.oxidation ?? "—"}</p>
          </div>
          <span className={styles.rowRule} aria-hidden="true" />
          <span className={styles.detailDivider} aria-hidden="true" />
        </div>
        <section className={styles.tastingCell} data-product-reveal aria-label={tasting ? "Notes de dégustation" : "Présentation du cru"}>
          <h3>{tasting ? "Notes de dégustation" : "Présentation du cru"}</h3>
          <div className={styles.tastingCopy}>
            {featuredSection ? <TeaDescriptionBlocks blocks={featuredSection.blocks} /> : <p>{product?.description || entry.teaType}</p>}
          </div>
          <span className={styles.landscapeRule} aria-hidden="true" />
        </section>
        <div className={styles.priceRow} data-product-reveal>
          <div className={styles.cell}>
            <p className={styles.label}>{entry.harvest ? "Récolte" : "Torréfaction"}</p>
            <p className={`${styles.number} ${styles.harvestValue}`}>{entry.harvest?.replace(/\bde printemps\b/gi, "printemps") ?? entry.roasting ?? "—"}</p>
          </div>
          <div className={styles.cell}>
            <p className={styles.label}>Prix</p>
            <p className={styles.price} aria-live="polite">{price}</p>
            {unitPrice && <p className={styles.unitPrice}>{unitPrice}</p>}
          </div>
          <span className={styles.bottomRule} aria-hidden="true" />
          <span className={styles.priceDivider} aria-hidden="true" />
        </div>
        <div className={styles.region} data-product-reveal>
          <p>{entry.region}</p>
          <span className={styles.bottomRule} aria-hidden="true" />
        </div>
      </div>
      <TeaProductDescription sections={entry.sections.filter((section) => section !== featuredSection)} />
      </div>
      <div className={styles.purchase} data-product-reveal>
        {presentation === "dialog" && <p className={styles.purchaseSummary}><span className="sr-only">Prix du format sélectionné : </span>{price}</p>}
        <button type="button" className={styles.addButton} onClick={handleAdd} disabled={pending || !selected?.availableForSale} aria-busy={pending}>
          <span>{pending ? "Ajout en cours…" : selected?.availableForSale ? "Ajouter au panier" : "Indisponible"}</span>
          {!pending && selected?.availableForSale && <ArrowRight />}
        </button>
      </div>
      <div className={styles.feedback} role="status" aria-atomic="true">
        {(feedback?.handle === handle ? feedback.message : null) ?? (!product ? "Ce cru est momentanément indisponible." : "")}
      </div>
    </div>
  );
}
