"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { removeCartLine, updateCartLine } from "@/app/actions/cart-lines";
import type { CartLineActionResult, CartView, ShopifyMoney } from "@/app/lib/shopify-types";

function formatMoney(money: ShopifyMoney) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: money.currencyCode,
  }).format(Number(money.amount));
}

export default function CartContents({ cart }: { cart: CartView | null }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<CartLineActionResult | null>(null);
  const hasUnavailableLine = cart?.lines.some(
    (line) => !line.merchandise.availableForSale,
  ) ?? false;

  function changeLine(lineId: string, quantity: number | null) {
    if (isPending) return;
    setFeedback(null);

    startTransition(async () => {
      try {
        const result = quantity === null
          ? await removeCartLine(lineId)
          : await updateCartLine(lineId, quantity);
        setFeedback(quantity === null && result.status === "success" ? null : result);
      } catch {
        setFeedback({ status: "error", message: "La réponse n’a pas pu être confirmée. Vérifiez votre connexion et le contenu du panier." });
        router.refresh();
      }
    });
  }

  return (
    <div>
      <div role="status" aria-atomic="true" className="min-h-6 text-xs tracking-[0.12em] uppercase opacity-60">
        {isPending ? "Mise à jour du panier…" : feedback?.message}
      </div>
      {!cart || cart.totalQuantity === 0 ? (
        <div className="py-10 md:py-16">
          <p className="max-w-xl font-display text-[clamp(2rem,5vw,4.5rem)] leading-none tracking-[-0.035em]">Votre panier est vide.</p>
          <Link href="/" className="mt-8 inline-flex min-h-11 items-center border-b border-current text-xs tracking-[0.14em] uppercase transition-opacity hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current active:opacity-50 motion-reduce:transition-none">
            Retour à l’accueil
          </Link>
        </div>
      ) : (
        <div className="grid items-start gap-14 lg:grid-cols-[minmax(0,1.65fr)_minmax(18rem,0.7fr)] lg:gap-20">
          <section aria-label="Articles du panier">
            <p className="mb-6 text-xs tracking-[0.16em] uppercase opacity-60">
              {cart.totalQuantity} {cart.totalQuantity > 1 ? "articles" : "article"}
            </p>
            <ul className="divide-y divide-foreground/15">
              {cart.lines.map((line) => {
                const variant = line.merchandise;
                const image = variant.image ?? variant.product.featuredImage;
                const label = `${variant.product.title}${variant.title === "Default Title" ? "" : ` — ${variant.title}`}`;
                const { minimum, maximum, increment } = variant.quantityRule;
                const canDecrease = line.quantity - increment >= minimum;
                const canIncrease =
                  variant.availableForSale &&
                  (maximum === null || line.quantity + increment <= maximum);

                return (
                  <li key={line.id} className="flex gap-4 py-6 first:pt-0 sm:gap-6">
                    {image && (
                      <div className="image-grain relative size-20 shrink-0 overflow-hidden rounded-md sm:size-28">
                        <Image
                          src={image.url}
                          alt={image.altText ?? variant.product.title}
                          fill
                          sizes="(max-width: 640px) 80px, 112px"
                          className="object-cover outline -outline-offset-1 outline-black/10"
                        />
                      </div>
                    )}
                    <div className="min-w-0 flex-1 space-y-2">
                      <h2 className="font-display text-2xl tracking-[-0.02em] md:text-3xl">
                        <Link href={`/produits/${encodeURIComponent(variant.product.handle)}`} className="hover:underline focus-visible:outline-2 focus-visible:outline-offset-4">
                          {variant.product.title}
                        </Link>
                      </h2>
                      {variant.title !== "Default Title" && <p className="text-sm">Format : {variant.title}</p>}
                      {!variant.availableForSale && (
                        <p className="text-sm" role="alert">
                          Cet article est actuellement indisponible. Supprimez-le du panier pour continuer.
                        </p>
                      )}
                      {(minimum > 1 || increment > 1 || maximum !== null) && (
                        <p className="text-xs">
                          Quantité : minimum {minimum}, par {increment}
                          {maximum !== null ? `, maximum ${maximum}` : ""}.
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-3">
                        <div role="group" aria-label={`Quantité : ${label}`} className="inline-flex items-center rounded-lg border border-foreground/25">
                          <button
                            type="button"
                            onClick={() => changeLine(line.id, line.quantity - increment)}
                            disabled={isPending || !canDecrease}
                            aria-label={`Diminuer la quantité : ${label}`}
                            className="size-11 cursor-pointer rounded-l-lg transition-[background-color,transform] duration-150 hover:bg-foreground/5 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-35 disabled:active:scale-100 motion-reduce:transform-none motion-reduce:transition-none"
                          >
                            −
                          </button>
                          <span className="min-w-10 px-2 text-center text-sm tabular-nums">{line.quantity}</span>
                          <button
                            type="button"
                            onClick={() => changeLine(line.id, line.quantity + increment)}
                            disabled={isPending || !canIncrease}
                            aria-label={`Augmenter la quantité : ${label}`}
                            className="size-11 cursor-pointer rounded-r-lg transition-[background-color,transform] duration-150 hover:bg-foreground/5 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-35 disabled:active:scale-100 motion-reduce:transform-none motion-reduce:transition-none"
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => changeLine(line.id, null)}
                          disabled={isPending}
                          aria-label={`Supprimer ${label}`}
                          className="min-h-11 cursor-pointer px-1 text-sm underline underline-offset-4 transition-opacity duration-150 hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground disabled:cursor-not-allowed disabled:opacity-35 motion-reduce:transition-none"
                        >
                          Supprimer
                        </button>
                      </div>
                      <p className="text-sm tabular-nums">Prix unitaire : {formatMoney(line.cost.amountPerQuantity)}</p>
                      <p className="font-display text-xl tabular-nums">{formatMoney(line.cost.totalAmount)}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          <section aria-labelledby="cart-summary-title" className="space-y-6 border-t border-current pt-6 lg:sticky lg:top-8">
            <p className="text-xs tracking-[0.16em] uppercase opacity-60">Commande</p>
            <h2 id="cart-summary-title" className="font-display text-4xl tracking-[-0.03em]">Récapitulatif</h2>
            <dl>
              <div className="flex flex-wrap justify-between gap-3">
                <dt>{cart.cost.subtotalAmountEstimated ? "Sous-total estimé" : "Sous-total"}</dt>
                <dd className="font-medium tabular-nums">{formatMoney(cart.cost.subtotalAmount)}</dd>
              </div>
            </dl>
            <p className="text-sm leading-relaxed">Les frais de livraison et le montant final seront confirmés au paiement.</p>
            {hasUnavailableLine && (
              <p className="text-sm" role="alert">
                Retirez les articles indisponibles avant de passer au paiement.
              </p>
            )}
            <a
              href="/api/checkout"
              aria-disabled={isPending || hasUnavailableLine}
              tabIndex={isPending || hasUnavailableLine ? -1 : undefined}
              onClick={(event) => {
                if (isPending || hasUnavailableLine) event.preventDefault();
              }}
              className="flex min-h-14 w-full items-center justify-center bg-button px-6 py-4 text-center text-xs tracking-[0.14em] uppercase text-text-on-dark transition-[opacity,transform] duration-150 hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground active:scale-[0.96] aria-disabled:pointer-events-none aria-disabled:opacity-50 motion-reduce:transform-none motion-reduce:transition-none"
            >
              Passer au paiement
            </a>
          </section>
        </div>
      )}
    </div>
  );
}
