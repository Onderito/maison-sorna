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

export async function getVariantProductHandle(variantId: string): Promise<string | null> {
  const response = await shopifyFetch(`
    query VariantProduct($id: ID!) {
      node(id: $id) {
        ... on ProductVariant { product { handle } }
      }
    }
  `, { id: variantId }, { cache: "no-store" });
  if (!response.data || !("node" in response.data)) {
    throw new Error("Shopify n’a pas renvoyé la variante attendue.");
  }
  if (response.data.node === null) return null;
  const handle: unknown = response.data.node?.product?.handle;
  if (typeof handle !== "string" || !handle) throw new Error("La variante Shopify est invalide.");
  return handle;
}
