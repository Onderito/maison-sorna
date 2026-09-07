"use server";

import { revalidatePath } from "next/cache";
import { shopifyFetch } from "@/app/lib/shopify";
import {
  getCartDetails,
  removeCartLinesMutation,
  updateCartLinesMutation,
} from "@/app/lib/shopify/cart";
import type { CartLineActionResult } from "@/app/lib/shopify-types";

type CartLinePayload = {
  cart: { id: string; totalQuantity: number } | null;
  userErrors: { message: string }[];
  warnings: { message: string }[];
};

async function mutateCartLine(
  lineId: string,
  quantity: number | null,
): Promise<CartLineActionResult> {
  if (
    typeof lineId !== "string" ||
    !/^gid:\/\/shopify\/CartLine\/[^\s]+$/.test(lineId)
  ) {
    return { status: "error", message: "Cet article n’est pas valide." };
  }

  let result: CartLineActionResult;

  try {
    // Le panier vient du cookie serveur ; le navigateur fournit seulement la ligne.
    const cart = await getCartDetails();

    if (!cart) {
      result = { status: "error", message: "Votre panier a expiré ou est vide. Ajoutez à nouveau vos articles." };
    } else if (!cart.lines.some((line) => line.id === lineId)) {
      result = { status: "error", message: "Cet article n’est plus dans votre panier." };
    } else {
      const isRemoval = quantity === null;
      const field = isRemoval ? "cartLinesRemove" : "cartLinesUpdate";
      const response: { data?: Partial<Record<typeof field, CartLinePayload>> } =
        await shopifyFetch(
          isRemoval ? removeCartLinesMutation : updateCartLinesMutation,
          isRemoval
            ? { cartId: cart.id, lineId }
            : { cartId: cart.id, lineId, quantity },
          { cache: "no-store" },
        );
      const payload = response.data?.[field];

      if (
        !payload ||
        !Array.isArray(payload.userErrors) ||
        !Array.isArray(payload.warnings)
      ) {
        throw new Error("La réponse de modification du panier est invalide.");
      }

      if (payload.userErrors.length > 0) {
        result = { status: "error", message: payload.userErrors.map((error) => error.message).join(" ") };
      } else {
        if (
          !payload.cart ||
          payload.cart.id !== cart.id ||
          !Number.isInteger(payload.cart.totalQuantity) ||
          payload.cart.totalQuantity < 0
        ) {
          throw new Error("Shopify n’a pas confirmé la modification du panier.");
        }

        result = payload.warnings.length > 0
          ? { status: "warning", message: payload.warnings.map((warning) => warning.message).join(" ") }
          : { status: "success", message: isRemoval ? "Article supprimé du panier." : "Quantité mise à jour." };
      }
    }
  } catch {
    console.error("Échec de la modification d’une ligne du panier Shopify.");
    result = { status: "error", message: "La modification n’a pas pu être confirmée. Vérifiez le panier avant de réessayer." };
  }

  // Recharge les lignes et les montants depuis Shopify, y compris après un refus.
  revalidatePath("/panier");
  return result;
}

export async function updateCartLine(
  lineId: string,
  quantity: number,
): Promise<CartLineActionResult> {
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 2_147_483_647) {
    return { status: "error", message: "La quantité doit être un entier supérieur ou égal à 1." };
  }

  return mutateCartLine(lineId, quantity);
}

export async function removeCartLine(lineId: string): Promise<CartLineActionResult> {
  return mutateCartLine(lineId, null);
}
