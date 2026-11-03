import type { ShopifyCartLine } from "@/app/lib/shopify-types";

export const CART_PRODUCT_LIMIT = 2;
export const CART_PRODUCT_LIMIT_MESSAGE = "Deux sachets maximum du même produit par panier, tous formats confondus.";

type ProductLine = Pick<ShopifyCartLine, "id" | "quantity" | "merchandise">;

export function getProductCartQuantity(lines: readonly ProductLine[], handle: string, excludeLineId?: string) {
  return lines.reduce((total, line) => total + (
    line.id !== excludeLineId && line.merchandise.product.handle === handle ? line.quantity : 0
  ), 0);
}

export function exceedsCartProductLimit(lines: readonly ProductLine[]) {
  return lines.some((line) => getProductCartQuantity(lines, line.merchandise.product.handle) > CART_PRODUCT_LIMIT);
}
