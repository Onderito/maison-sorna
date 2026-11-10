"use client";

import { CART_PRODUCT_LIMIT, CART_PRODUCT_LIMIT_MESSAGE, getProductCartQuantity, exceedsCartProductLimit } from "@/app/lib/shopify/cart-product-limit";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { removeCartLine, updateCartLine } from "@/app/actions/cart-lines";
import { useCartDrawer } from "@/animations/use-cart-drawer";
import type { CartLineActionResult, CartView, ShopifyMoney } from "@/app/lib/shopify-types";
import styles from "./cart-drawer.module.css";

function money(value: ShopifyMoney) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: value.currencyCode, minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(Number(value.amount));
}

type Props = {
  cart: CartView | null;
  isOpen: boolean;
  loading: boolean;
  error: string | null;
  addedVariant?: string;
  onClosed: () => void;
  refreshCart: () => Promise<void>;
};

export default function CartDrawer({ cart, isOpen, loading, error, addedVariant, onClosed, refreshCart }: Props) {
  const { dialogRef, sheetRef, closeButtonRef, close, onClosed: restore } = useCartDrawer(isOpen);
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<CartLineActionResult | null>(null);
  const mutation = useRef(false);
  const highlighted = useRef<string | null>(null);
  const count = cart?.totalQuantity ?? 0;
  const unavailable = cart?.lines.some((line) => !line.merchandise.availableForSale) ?? false;
  const overLimit = exceedsCartProductLimit(cart?.lines ?? []);
  const busy = pending || loading;

  useEffect(() => {
    if (!isOpen || !addedVariant) { highlighted.current = null; return; }
    if (loading) return;
    const addedLine = cart?.lines.find((line) => line.merchandise.id === addedVariant);
    if (!addedLine) return;
    const stamp = `${addedVariant}:${addedLine.quantity}`;
    if (highlighted.current === stamp) return;
    highlighted.current = stamp;
    const line = dialogRef.current?.querySelector<HTMLElement>("[data-added='true']");
    if (!line) return;
    // Scroll only the list vertically. scrollIntoView can horizontally scroll
    // the modal to its off-screen sheet and cancel the visible entrance.
    const list = line.closest<HTMLElement>("[data-cart-lines-scroll]");
    if (list) {
      const lineBounds = line.getBoundingClientRect();
      const listBounds = list.getBoundingClientRect();
      if (lineBounds.top < listBounds.top || lineBounds.bottom > listBounds.bottom) {
        list.scrollTo({ top: list.scrollTop + lineBounds.top - listBounds.top, behavior: "instant" });
      }
    }
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const animation = line.animate([
      { opacity: 0.55, transform: reduced ? "none" : "translateY(8px)" },
      { opacity: 1, transform: "none" },
    ], { duration: reduced ? 150 : 250, easing: "cubic-bezier(0.23, 1, 0.32, 1)" });
    return () => animation.cancel();
  }, [isOpen, loading, cart, addedVariant, dialogRef]);

  function changeLine(id: string, quantity: number | null) {
    if (busy || mutation.current) return;
    mutation.current = true;
    setFeedback(null);
    startTransition(async () => {
      try {
        const result = quantity === null ? await removeCartLine(id) : await updateCartLine(id, quantity);
        setFeedback(result.status === "success" ? null : result);
      } catch {
        setFeedback({ status: "error", message: "La modification n’a pas pu être confirmée. Vérifiez votre panier avant de réessayer." });
      } finally {
        await refreshCart();
        mutation.current = false;
      }
    });
  }

  return <dialog ref={dialogRef} className={styles.dialog} aria-labelledby="cart-drawer-title" data-lenis-prevent
    onCancel={(event) => { event.preventDefault(); close(); }}
    onClose={() => { restore(); setFeedback(null); onClosed(); }}>
    <div className={styles.veil} aria-hidden="true" onClick={close} />
    <section ref={sheetRef} className={styles.sheet}>
      <header className={styles.header}>
        <div><p className={styles.eyebrow}>SÖRNA</p><h2 id="cart-drawer-title">Votre sélection <span>({count})</span></h2></div>
        <button ref={closeButtonRef} type="button" className={styles.close} onClick={close} aria-label="Fermer le panier">×</button>
      </header>
      <div className={styles.contents} data-cart-lines-scroll aria-busy={busy} data-lenis-prevent>
        <p className={styles.shipping}>{CART_PRODUCT_LIMIT_MESSAGE}</p>
        {error && <div className={styles.notice} role="alert"><p>{error}</p><button type="button" onClick={() => { void refreshCart(); }} disabled={loading}>Réessayer</button><Link href="/panier" onClick={close}>Voir la page panier</Link></div>}
        {feedback && <p className={styles.notice} role={feedback.status === "error" ? "alert" : "status"}>{feedback.message}</p>}
        {loading && !cart ? <p className={styles.loading} role="status">Chargement de votre sélection…</p> : count === 0 && !error ?
          <div className={styles.empty}><p>Votre prochaine<br />infusion commence ici.</p><button type="button" onClick={close}>Poursuivre la découverte <span aria-hidden="true">→</span></button></div> :
          <ul className={styles.lines} data-loading={busy}>
            {cart?.lines.map((line) => {
              const variant = line.merchandise;
              const image = variant.image ?? variant.product.featuredImage;
              const { minimum, maximum, increment } = variant.quantityRule;
              const label = `${variant.product.title} — ${variant.title}`;
              return <li key={line.id} className={styles.line} data-added={variant.id === addedVariant}>
                <div className={styles.thumbnail}>{image && <Image src={image.url} alt={image.altText ?? variant.product.title} fill sizes="112px" className={styles.image} />}</div>
                <div className={styles.lineCopy}>
                  <h3>{variant.product.title}</h3>
                  {variant.title !== "Default Title" && <p className={styles.format}>{variant.title}</p>}
                  {!variant.availableForSale && <p className={styles.unavailable}>Actuellement indisponible</p>}
                  <div className={styles.lineBottom}>
                    <div className={styles.quantity} role="group" aria-label={`Quantité : ${label}`}>
                      <button type="button" aria-label={`Diminuer la quantité : ${label}`} disabled={busy || line.quantity - increment < minimum} onClick={() => changeLine(line.id, line.quantity - increment)}>−</button>
                      <span aria-live="polite">{line.quantity}</span>
                      <button type="button" aria-label={`Augmenter la quantité : ${label}`} disabled={busy || !variant.availableForSale || getProductCartQuantity(cart.lines, variant.product.handle) + increment > CART_PRODUCT_LIMIT || (maximum !== null && line.quantity + increment > maximum)} onClick={() => changeLine(line.id, line.quantity + increment)}>+</button>
                    </div>
                    <p className={styles.linePrice}>{money(line.cost.totalAmount)}</p>
                  </div>
                  <button type="button" className={styles.remove} disabled={busy} onClick={() => changeLine(line.id, null)} aria-label={`Retirer ${label}`}>Retirer</button>
                </div>
              </li>;
            })}
          </ul>}
      </div>
      {count > 0 && cart && <footer className={styles.footer}>
        <div className={styles.subtotal}><span>{cart.cost.subtotalAmountEstimated ? "Sous-total estimé" : "Sous-total"}</span><span aria-live="polite">{money(cart.cost.subtotalAmount)}</span></div>
        <p className={styles.shipping}>Les frais de livraison et le montant final seront confirmés au paiement.</p>
        {overLimit && <p className={styles.unavailable}>Réduisez les quantités à deux sachets par produit pour continuer.</p>}
        {unavailable && <p className={styles.unavailable}>Retirez les articles indisponibles pour continuer.</p>}
        <a href="/api/checkout" className={styles.checkout} aria-disabled={busy || unavailable || overLimit || !!error} tabIndex={busy || unavailable || overLimit || !!error ? -1 : undefined}
          onClick={(event) => { if (busy || unavailable || overLimit || error) event.preventDefault(); }}>Passer au paiement <span aria-hidden="true">→</span></a>
        <button type="button" className={styles.continue} onClick={close}>Poursuivre la découverte</button>
      </footer>}
    </section>
  </dialog>;
}
