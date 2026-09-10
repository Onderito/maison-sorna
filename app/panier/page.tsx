import type { Metadata } from "next";
import { getCartDetails } from "@/app/lib/shopify/cart";
import CartContents from "@/components/cart-contents";

export const metadata: Metadata = { title: "Panier | Maison Sörna" };

export default async function CartPage({
  searchParams,
}: {
  searchParams: Promise<{ erreur?: string }>;
}) {
  const { erreur } = await searchParams;
  const cart = await getCartDetails();

  return (
    <main className="mx-auto w-[calc(100%-2rem)] max-w-[1569px] border-t border-current/20 py-14 md:w-[90.8%] md:py-24">
      <p className="text-xs tracking-[0.18em] uppercase">Maison Sörna</p>
      <h1 className="mt-10 text-balance font-display text-[clamp(4rem,10vw,10rem)] leading-[0.8] tracking-[-0.05em]">Votre panier</h1>
      {erreur === "checkout" && (
        <p className="mt-10 max-w-xl border-l border-current pl-4 text-sm leading-6" role="alert">
          Le paiement n’a pas pu être préparé. Veuillez réessayer dans un instant.
        </p>
      )}
      <div className="mt-14 border-t border-current/20 pt-8 md:mt-20 md:pt-12"><CartContents
        cart={cart ? {
          lines: cart.lines,
          cost: cart.cost,
          totalQuantity: cart.totalQuantity,
        } : null}
      /></div>
    </main>
  );
}
