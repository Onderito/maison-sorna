"use client";

import { useId, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addToCart } from "@/app/actions/cart";
import type { AddToCartResult, ShopifyVariant } from "@/app/lib/shopify-types";

type ProductVariantSelectorProps = {
  variants: ShopifyVariant[];
};

export default function ProductVariantSelector({
  variants,
}: ProductVariantSelectorProps) {
  const groupName = useId();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<AddToCartResult | null>(null);
  const defaultVariant =
    variants.find((variant) => variant.availableForSale) ?? variants[0];
  const [selectedVariantId, setSelectedVariantId] = useState(defaultVariant?.id);
  const selectedVariant =
    variants.find((variant) => variant.id === selectedVariantId) ?? defaultVariant;

  if (!selectedVariant) {
    return <p>Aucun format disponible pour ce produit.</p>;
  }

  function handleAddToCart() {
    if (!selectedVariant?.availableForSale || isPending) return;

    const variant = selectedVariant;
    setFeedback(null);
    startTransition(async () => {
      try {
        const result = await addToCart(variant.id, variant.quantityRule.minimum);
        setFeedback({ ...result, message: `${variant.title} : ${result.message}` });
        if (result.status !== "error") router.refresh();
      } catch {
        setFeedback({
          status: "error",
          message: "La demande n’a pas pu aboutir. Vérifie ta connexion et réessaie.",
        });
      }
    });
  }

  return (
    <div className="space-y-5">
      <fieldset disabled={isPending} className="space-y-3 disabled:opacity-60">
        <legend className="text-sm font-medium">Format</legend>
        <div className="flex flex-wrap gap-3">
          {variants.map((variant) => (
            <label
              key={variant.id}
              className="cursor-pointer transition-transform duration-150 active:scale-[0.96] motion-reduce:transform-none motion-reduce:transition-none"
            >
              <input
                type="radio"
                name={groupName}
                value={variant.id}
                checked={variant.id === selectedVariant.id}
                onChange={() => {
                  setSelectedVariantId(variant.id);
                  setFeedback(null);
                }}
                className="peer sr-only"
              />
              <span className="flex min-h-12 min-w-24 items-center justify-center rounded-lg border border-foreground/25 px-5 py-3 text-sm font-medium transition-colors duration-150 hover:border-foreground peer-checked:border-foreground peer-checked:bg-foreground peer-checked:text-background peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-foreground motion-reduce:transition-none">
                {variant.title}
                {!variant.availableForSale && (
                  <span className="ml-2 text-xs">(indisponible)</span>
                )}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <p aria-live="polite" aria-atomic="true" className="space-y-1">
        <span className="block text-2xl font-medium tabular-nums">
          {new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency: selectedVariant.price.currencyCode,
          }).format(Number(selectedVariant.price.amount))}
        </span>
        <span className="block text-sm">
          {selectedVariant.availableForSale ? "Disponible" : "Indisponible"}
        </span>
      </p>

      <button
        type="button"
        onClick={handleAddToCart}
        disabled={isPending || !selectedVariant.availableForSale}
        aria-busy={isPending}
        className="min-h-12 w-full cursor-pointer rounded-lg bg-foreground px-6 py-3 font-medium text-background transition-[opacity,transform] duration-150 hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 motion-reduce:transform-none motion-reduce:transition-none sm:w-auto"
      >
        {isPending
          ? "Ajout en cours…"
          : selectedVariant.availableForSale
            ? selectedVariant.quantityRule.minimum > 1
              ? `Ajouter ${selectedVariant.quantityRule.minimum} au panier`
              : "Ajouter au panier"
            : "Format indisponible"}
      </button>

      <div role="status" aria-atomic="true" className="min-h-6 text-sm">
        {feedback && (
          <>
            <p>{feedback.message}</p>
            {feedback.totalQuantity !== undefined && (
              <p>
                Panier : {feedback.totalQuantity}{" "}
                {feedback.totalQuantity > 1 ? "articles" : "article"}.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
