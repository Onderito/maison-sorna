"use client";

import Image from "next/image";
import { useId, useState, useTransition } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useRouter } from "next/navigation";
import { addToCart } from "@/app/actions/cart";
import type { AddToCartResult } from "@/app/lib/shopify-types";
import styles from "./tea-card.module.css";
import type { TeaCardEntry } from "./tea-card-data";
import { contentEntrance, useTeaCardEntrance } from "./tea-card-entrance";

export default function TeaCardDetails({ entry }: { entry: TeaCardEntry }) {
  const { product, handle } = entry;
  const { controls: entrance } = useTeaCardEntrance();
  const reducedMotion = useReducedMotion();
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
    <div className={styles.panel}>
      <div className={styles.card}>
        <header className={styles.heading}>
          <motion.h2 id={`tea-${handle}-title`} initial="entranceHidden" animate={entrance} variants={contentEntrance}>{entry.title}</motion.h2>
          <Image src="/figma/infuser/product/title-rule.svg" alt="" width={155} height={1} className={styles.titleRule} />
          <motion.p className={styles.label} initial="entranceHidden" animate={entrance} variants={contentEntrance}>Lot n°</motion.p>
          <motion.p className={styles.number} initial="entranceHidden" animate={entrance} variants={contentEntrance}>{entry.lot}</motion.p>
        </header>
        <div className={styles.detailRow}>
          <motion.div className={styles.cell} initial="entranceHidden" animate={entrance} variants={contentEntrance}>
            <p className={styles.label}>Type de thé</p>
            <p className={styles.serifValue}>{entry.teaType}</p>
          </motion.div>
          <motion.div className={styles.cell} initial="entranceHidden" animate={entrance} variants={contentEntrance}>
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
          </motion.div>
          <span className={styles.rowRule} aria-hidden="true" />
          <span className={styles.detailDivider} aria-hidden="true" />
        </div>
        <div className={styles.detailRow}>
          <motion.div className={styles.cell} initial="entranceHidden" animate={entrance} variants={contentEntrance}>
            <p className={styles.label}>Origine</p>
            <p className={styles.serifValue}>{entry.origin}</p>
          </motion.div>
          <motion.div className={styles.cell} initial="entranceHidden" animate={entrance} variants={contentEntrance}>
            <p className={styles.label}>Millésime</p>
            <p className={styles.number}>{entry.vintage}</p>
          </motion.div>
          <span className={styles.rowRule} aria-hidden="true" />
          <span className={styles.detailDivider} aria-hidden="true" />
        </div>
        <div className={styles.landscape}>
          <motion.div className={`${styles.landscapeCrop} image-grain`} initial="entranceHidden" animate={entrance} variants={contentEntrance}>
            <Image src="/figma/infuser/product/wuyi.png" alt="Illustration des montagnes Wuyi à l’encre." width={1254} height={1254} quality={95} loading="eager" sizes="(max-width: 1024px) calc(100vw - 40px), 40vw" className={styles.landscapeImage} />
          </motion.div>
          <span className={styles.landscapeRule} aria-hidden="true" />
        </div>
        <div className={styles.priceRow}>
          <motion.div className={styles.cell} initial="entranceHidden" animate={entrance} variants={contentEntrance}>
            <p className={styles.label}>Récolte</p>
            <p className={styles.number}>{entry.harvest}</p>
          </motion.div>
          <motion.div className={styles.cell} initial="entranceHidden" animate={entrance} variants={contentEntrance}>
            <p className={styles.label}>Prix</p>
            <p className={styles.price} aria-live="polite">{price}</p>
          </motion.div>
          <span className={styles.bottomRule} aria-hidden="true" />
          <span className={styles.priceDivider} aria-hidden="true" />
        </div>
        <div className={styles.region}>
          <motion.p initial="entranceHidden" animate={entrance} variants={contentEntrance}>{entry.region}</motion.p>
          <span className={styles.bottomRule} aria-hidden="true" />
        </div>
      </div>
      <motion.div className={styles.purchase} initial="entranceHidden" animate={entrance} variants={contentEntrance}>
        <motion.button type="button" className={styles.addButton} whileHover={!pending && selected?.availableForSale ? { opacity: 0.85 } : undefined} whileTap={!reducedMotion && !pending && selected?.availableForSale ? { scale: 0.96 } : undefined} transition={{ duration: reducedMotion ? 0 : 0.15 }} onClick={handleAdd} disabled={pending || !selected?.availableForSale} aria-busy={pending}>
          <span>{pending ? "Ajout en cours…" : selected?.availableForSale ? "Ajouter au panier" : "Indisponible"}</span>
          {!pending && selected?.availableForSale && <span aria-hidden="true">→</span>}
        </motion.button>
      </motion.div>
      <div className={styles.feedback} role="status" aria-atomic="true">
        {(feedback?.handle === handle ? feedback.message : null) ?? (!product ? "Ce cru est momentanément indisponible." : "")}
      </div>
    </div>
  );
}
