import type { ShopifyProduct } from "@/app/lib/shopify-types";
import { getSiteUrl } from "./site";

export function productStructuredData(product: ShopifyProduct) {
  const url = new URL(`/produits/${encodeURIComponent(product.handle)}`, getSiteUrl()).href;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    url,
    ...(product.featuredImage ? { image: [product.featuredImage.url] } : {}),
    offers: product.variants.nodes.map((variant) => ({
      "@type": "Offer",
      name: variant.title,
      url,
      price: variant.price.amount,
      priceCurrency: variant.price.currencyCode,
      availability: variant.availableForSale ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    })),
  };
}

// Shopify content must never be able to close the JSON-LD script element.
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
