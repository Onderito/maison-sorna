import { getProductQuery, shopifyFetch } from "@/app/lib/shopify";
import type { ShopifyProduct } from "@/app/lib/shopify-types";

export async function getProduct(handle: string): Promise<ShopifyProduct | null> {
  const response = await shopifyFetch(getProductQuery, { handle }, {
    next: { revalidate: 60, tags: ["products", `product:${handle}`] },
  });
  const product: ShopifyProduct | null | undefined = response.data?.product;
  if (product === null) return null;
  if (!product || typeof product.title !== "string" || !Array.isArray(product.variants?.nodes)) {
    throw new Error("Shopify a renvoyé une fiche produit invalide.");
  }
  return product;
}
