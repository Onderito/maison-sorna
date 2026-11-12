"use server";

import { isCartExpired } from "@/app/lib/shopify/session-lifetime";

import { getCartDetails } from "@/app/lib/shopify/cart";
import { isShopifyCartId } from "@/app/lib/shopify/cart-id";
import { getVariantProductHandle } from "@/app/lib/shopify/products";
import { CART_PRODUCT_LIMIT, CART_PRODUCT_LIMIT_MESSAGE, getProductCartQuantity } from "@/app/lib/shopify/cart-product-limit";

import {
  createCartMutation,
  shopifyFetch,
  addToCartMutation,
  getCartQuery,
} from "@/app/lib/shopify";
import {
  getCartErrorMessage,
  getCartWarningMessage,
} from "@/app/lib/shopify/cart-feedback";
import {
  SHOPIFY_CART_COOKIE,
  SHOPIFY_CART_MAX_AGE,
} from "@/app/lib/shopify/cart";
import { cookies } from "next/headers";
import type {
  AddToCartResult,
  ShopifyCart,
  ShopifyCartMutationPayload,
} from "@/app/lib/shopify-types";

async function saveCartId(cartId: string) {
  const cookieStore = await cookies();

  cookieStore.set(SHOPIFY_CART_COOKIE, cartId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SHOPIFY_CART_MAX_AGE,
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

  return cookieStore.get(SHOPIFY_CART_COOKIE)?.value;
}

export async function addToCart(
  variantId: string,
  quantity: number,
): Promise<AddToCartResult> {
  if (
    typeof variantId !== "string" ||
    !/^gid:\/\/shopify\/ProductVariant\/\d+$/.test(variantId)
  ) {
    return { status: "error", message: "Choisissez un format valide avant de l’ajouter." };
  }
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 2_147_483_647) {
    return { status: "error", message: "La quantité choisie n’est pas valide." };
  }

  try {
    // Un panier absent ou expiré est remplacé lors de cet ajout.
    if (quantity > CART_PRODUCT_LIMIT) return { status: "error", message: CART_PRODUCT_LIMIT_MESSAGE };
    const [existingCart, handle] = await Promise.all([getCartDetails(), getVariantProductHandle(variantId)]);
    if (!handle) return { status: "error", message: "Ce produit n’est plus disponible." };
    if (getProductCartQuantity(existingCart?.lines ?? [], handle) + quantity > CART_PRODUCT_LIMIT) {
      return { status: "error", message: CART_PRODUCT_LIMIT_MESSAGE };
    }
    const cart = existingCart ?? (await createCart());
    const response = await shopifyFetch(
      addToCartMutation,
      { cartId: cart.id, merchandiseId: variantId, quantity },
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
        message: getCartErrorMessage(payload.userErrors),
      };
    }

    const updatedCart = requireCart(payload.cart);

    // Concurrent adds (several tabs) can each be confirmed by Shopify while
    // only some are kept: never announce an addition the cart does not show.
    if (updatedCart.totalQuantity < (existingCart?.totalQuantity ?? 0) + quantity) {
      return {
        status: "warning",
        message: "Votre panier a été modifié en parallèle. Vérifiez son contenu.",
        totalQuantity: updatedCart.totalQuantity,
      };
    }

    if (payload.warnings.length > 0) {
      return {
        status: "warning",
        message: getCartWarningMessage(payload.warnings),
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
      message: "Impossible d’ajouter cet article pour le moment. Réessayez dans un instant.",
    };
  }
}

export async function getCart(): Promise<ShopifyCart | null> {
  const cartId = await getCartId();

  if (!isShopifyCartId(cartId)) {
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

  if (response.data.cart === null || isCartExpired(response.data.cart.createdAt)) return null;
  return requireCart(response.data.cart);
}
