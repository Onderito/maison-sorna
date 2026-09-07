"use server";

import {
  createCartMutation,
  shopifyFetch,
  addToCartMutation,
  getCartQuery,
} from "@/app/lib/shopify";
import { cookies } from "next/headers";
import type {
  AddToCartResult,
  ShopifyCart,
  ShopifyCartMutationPayload,
} from "@/app/lib/shopify-types";

async function saveCartId(cartId: string) {
  const cookieStore = await cookies();

  cookieStore.set("cartId", cartId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}

function requireCart(cart: ShopifyCart | null | undefined): ShopifyCart {
  if (
    !cart ||
    typeof cart.id !== "string" ||
    typeof cart.checkoutUrl !== "string" ||
    !Number.isInteger(cart.totalQuantity) ||
    cart.totalQuantity < 0
  ) {
    throw new Error("Shopify a renvoyé un panier invalide.");
  }

  return cart;
}

async function createCart(): Promise<ShopifyCart> {
  const response = await shopifyFetch(createCartMutation, {}, { cache: "no-store" });
  const payload: ShopifyCartMutationPayload | undefined = response.data?.cartCreate;

  if (!payload || !Array.isArray(payload.userErrors)) {
    throw new Error("La réponse de création du panier est invalide.");
  }

  if (payload.userErrors.length > 0) {
    throw new Error("Shopify a refusé la création du panier.");
  }

  const cart = requireCart(payload.cart);
  await saveCartId(cart.id);
  return cart;
}

async function getCartId() {
  const cookieStore = await cookies();

  return cookieStore.get("cartId")?.value;
}

export async function addToCart(variantId: string): Promise<AddToCartResult> {
  if (
    typeof variantId !== "string" ||
    !/^gid:\/\/shopify\/ProductVariant\/\d+$/.test(variantId)
  ) {
    return { status: "error", message: "Choisis un format valide avant de l’ajouter." };
  }

  try {
    // Un panier absent ou expiré est remplacé lors de cet ajout.
    const cart = (await getCart()) ?? (await createCart());
    const response = await shopifyFetch(
      addToCartMutation,
      { cartId: cart.id, merchandiseId: variantId },
      { cache: "no-store" },
    );
    const payload: ShopifyCartMutationPayload | undefined = response.data?.cartLinesAdd;

    if (
      !payload ||
      !Array.isArray(payload.userErrors) ||
      !Array.isArray(payload.warnings)
    ) {
      throw new Error("La réponse d’ajout au panier est invalide.");
    }

    if (payload.userErrors.length > 0) {
      return {
        status: "error",
        message: payload.userErrors.map((error) => error.message).join(" "),
      };
    }

    const updatedCart = requireCart(payload.cart);

    if (payload.warnings.length > 0) {
      return {
        status: "warning",
        message: payload.warnings.map((warning) => warning.message).join(" "),
        totalQuantity: updatedCart.totalQuantity,
      };
    }

    return {
      status: "success",
      message: "Article ajouté au panier.",
      totalQuantity: updatedCart.totalQuantity,
    };
  } catch {
    // Le détail des réponses peut contenir la clé privée du panier.
    console.error("Échec de la communication Shopify lors de l’ajout au panier.");
    return {
      status: "error",
      message: "Impossible d’ajouter cet article pour le moment. Réessaie dans un instant.",
    };
  }
}

export async function getCart(): Promise<ShopifyCart | null> {
  const cartId = await getCartId();

  if (!cartId || !/^gid:\/\/shopify\/Cart\/[^\s]+$/.test(cartId)) {
    return null;
  }

  const response = await shopifyFetch(
    getCartQuery,
    { cartId },
    { cache: "no-store" },
  );

  if (!response.data || !("cart" in response.data)) {
    throw new Error("La réponse Shopify ne contient pas le panier attendu.");
  }

  return response.data.cart === null ? null : requireCart(response.data.cart);
}
