import type { MetadataRoute } from "next";
import { getSiteUrl, isIndexable } from "./lib/seo/site";
import { getSitemapProducts } from "./lib/shopify/catalog-seo";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!isIndexable()) return [];
  const base = getSiteUrl();
  const products = await getSitemapProducts();
  return [
    ...["/", "/infuser", "/appliquer", "/ressentir", "/recevoir"].map((path) => ({ url: new URL(path, base).href })),
    ...products.map((product) => ({ url: new URL(`/produits/${encodeURIComponent(product.handle)}`, base).href, lastModified: product.updatedAt })),
  ];
}
