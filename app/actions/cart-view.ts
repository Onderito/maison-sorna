"use server";

import { getCartDetails } from "@/app/lib/shopify/cart";
import type { CartView } from "@/app/lib/shopify-types";

export async function readCartView(): Promise<
  { status: "success"; cart: CartView | null } | { status: "error"; message: string }
> {
  try {
    const cart = await getCartDetails();
    // The private cart key and checkout URL stay on the server.
    return { status: "success", cart: cart ? {
      totalQuantity: cart.totalQuantity, cost: cart.cost, lines: cart.lines,
    } : null };
  } catch {
    console.error("Impossible de charger le contenu du panier Shopify.");
    return { status: "error", message: "Impossible de charger votre panier. Réessayez dans un instant." };
  }
}
