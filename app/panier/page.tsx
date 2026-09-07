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
    <main className="mx-auto w-full max-w-6xl space-y-8 px-6 py-12">
      <h1 className="text-3xl">Votre panier</h1>
      {erreur === "checkout" && (
        <p className="border-l border-current pl-4 text-sm leading-6" role="alert">
          Le paiement n’a pas pu être préparé. Veuillez réessayer dans un instant.
        </p>
      )}
      <CartContents
        cart={cart ? {
          lines: cart.lines,
          cost: cart.cost,
          totalQuantity: cart.totalQuantity,
        } : null}
      />
    </main>
  );
}
