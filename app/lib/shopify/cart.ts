import "server-only";

import { cookies } from "next/headers";
import { shopifyFetch } from "@/app/lib/shopify";
import type {
  ShopifyCart,
  ShopifyCartDetails,
  ShopifyCartLine,
  ShopifyCartMutationPayload,
  ShopifyMoney,
} from "@/app/lib/shopify-types";

export const SHOPIFY_CART_COOKIE = "cartId";
export const SHOPIFY_CART_MAX_AGE = 30 * 24 * 60 * 60;

const getCartDetailsQuery = `
  query GetCartDetails($cartId: ID!, $after: String) {
    cart(id: $cartId) {
      id
      checkoutUrl
      totalQuantity
      cost {
        subtotalAmount { amount currencyCode }
        subtotalAmountEstimated
      }
      lines(first: 100, after: $after) {
        nodes {
          id
          quantity
          cost {
            amountPerQuantity { amount currencyCode }
            totalAmount { amount currencyCode }
          }
          merchandise {
            ... on ProductVariant {
              id
              title
              availableForSale
              quantityRule {
                minimum
                maximum
                increment
              }
              image { url altText width height }
              product {
                title
                handle
                featuredImage { url altText width height }
              }
            }
          }
        }
        pageInfo { hasNextPage endCursor }
      }
    }
  }
`;

export const updateCartLinesMutation = `
  mutation UpdateCartLine($cartId: ID!, $lineId: ID!, $quantity: Int!) {
    cartLinesUpdate(cartId: $cartId, lines: [{ id: $lineId, quantity: $quantity }]) {
      cart { id totalQuantity }
      userErrors { code field message }
      warnings { code message target }
    }
  }
`;

export const removeCartLinesMutation = `
  mutation RemoveCartLine($cartId: ID!, $lineId: ID!) {
    cartLinesRemove(cartId: $cartId, lineIds: [$lineId]) {
      cart { id totalQuantity }
      userErrors { code field message }
      warnings { code message target }
    }
  }
`;

const updateCartBuyerIdentityMutation = `
  mutation UpdateCartBuyerIdentity($cartId: ID!, $customerAccessToken: String!) {
    cartBuyerIdentityUpdate(
      cartId: $cartId
      buyerIdentity: { customerAccessToken: $customerAccessToken }
    ) {
      cart { id checkoutUrl totalQuantity }
      userErrors { code field message }
      warnings { code message target }
    }
  }
`;

type CartPage = Omit<ShopifyCartDetails, "lines"> & {
  lines: {
    nodes: ShopifyCartLine[];
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
  };
};

function isMoney(money: ShopifyMoney | undefined) {
  return (
    typeof money?.amount === "string" &&
    money.amount.trim() !== "" &&
    Number.isFinite(Number(money.amount)) &&
    typeof money.currencyCode === "string" &&
    /^[A-Z]{3}$/.test(money.currencyCode)
  );
}

function isQuantityRule(
  rule: ShopifyCartLine["merchandise"]["quantityRule"] | undefined,
) {
  return (
    !!rule &&
    Number.isInteger(rule.minimum) &&
    rule.minimum >= 1 &&
    Number.isInteger(rule.increment) &&
    rule.increment >= 1 &&
    (rule.maximum === null ||
      (Number.isInteger(rule.maximum) && rule.maximum >= rule.minimum))
  );
}

function isHttpsUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}

function validateCart(cart: CartPage) {
  if (
    !cart ||
    typeof cart.id !== "string" ||
    typeof cart.checkoutUrl !== "string" ||
    !isHttpsUrl(cart.checkoutUrl) ||
    !Number.isInteger(cart.totalQuantity) ||
    cart.totalQuantity < 0 ||
    !isMoney(cart.cost?.subtotalAmount) ||
    typeof cart.cost?.subtotalAmountEstimated !== "boolean" ||
    !Array.isArray(cart.lines?.nodes) ||
    typeof cart.lines.pageInfo?.hasNextPage !== "boolean"
  ) {
    throw new Error("Les données du panier Shopify sont incomplètes.");
  }

  for (const line of cart.lines.nodes) {
    if (
      !line ||
      typeof line.id !== "string" ||
      !Number.isInteger(line.quantity) ||
      line.quantity < 1 ||
      !isMoney(line.cost?.amountPerQuantity) ||
      !isMoney(line.cost?.totalAmount) ||
      typeof line.merchandise?.id !== "string" ||
      typeof line.merchandise.title !== "string" ||
      typeof line.merchandise.availableForSale !== "boolean" ||
      !isQuantityRule(line.merchandise.quantityRule) ||
      typeof line.merchandise.product?.title !== "string" ||
      typeof line.merchandise.product.handle !== "string"
    ) {
      throw new Error("Une ligne du panier Shopify est incomplète.");
    }
  }
}

function requireBasicCart(cart: ShopifyCart | null | undefined) {
  if (
    !cart ||
    typeof cart.id !== "string" ||
    typeof cart.checkoutUrl !== "string" ||
    !isHttpsUrl(cart.checkoutUrl) ||
    !Number.isInteger(cart.totalQuantity) ||
    cart.totalQuantity < 0
  ) {
    throw new Error("Shopify a renvoyé un panier invalide.");
  }

  return cart;
}

export async function associateCustomerWithCart({
  cartId,
  customerAccessToken,
  buyerIp,
}: {
  cartId: string;
  customerAccessToken: string;
  buyerIp?: string;
}) {
  if (!/^gid:\/\/shopify\/Cart\/[^\s]+$/.test(cartId) || !customerAccessToken) {
    throw new Error("Les informations d’association du panier sont invalides.");
  }

  const response = await shopifyFetch(
    updateCartBuyerIdentityMutation,
    { cartId, customerAccessToken },
    { cache: "no-store", buyerIp },
  );
  const payload: ShopifyCartMutationPayload | undefined =
    response.data?.cartBuyerIdentityUpdate;

  if (
    !payload ||
    !Array.isArray(payload.userErrors) ||
    !Array.isArray(payload.warnings)
  ) {
    throw new Error("La réponse d’association du panier est invalide.");
  }
  if (payload.userErrors.length > 0) {
    throw new Error("Shopify a refusé d’associer le client au panier.", {
      cause: payload.userErrors,
    });
  }

  return requireBasicCart(payload.cart);
}

export async function getCartDetails(): Promise<ShopifyCartDetails | null> {
  const cookieStore = await cookies();
  const cartId = cookieStore.get(SHOPIFY_CART_COOKIE)?.value;

  if (!cartId || !/^gid:\/\/shopify\/Cart\/[^\s]+$/.test(cartId)) {
    return null;
  }

  const lines: ShopifyCartLine[] = [];
  const cursors = new Set<string>();
  let after: string | null = null;

  // Shopify pagine les lignes : on lit la suite si le panier dépasse une page.
  while (true) {
    const response: { data?: { cart?: CartPage | null } } = await shopifyFetch(
      getCartDetailsQuery,
      { cartId, after },
      { cache: "no-store" },
    );
    const cart = response.data?.cart;

    if (cart === null) return null;
    if (!cart) throw new Error("Shopify n’a pas renvoyé le panier attendu.");

    validateCart(cart);
    lines.push(...cart.lines.nodes);

    if (!cart.lines.pageInfo.hasNextPage) {
      return { ...cart, lines };
    }

    const nextCursor = cart.lines.pageInfo.endCursor;
    if (typeof nextCursor !== "string" || !nextCursor || cursors.has(nextCursor)) {
      throw new Error("La pagination du panier Shopify est invalide.");
    }
    cursors.add(nextCursor);
    after = nextCursor;
  }
}
