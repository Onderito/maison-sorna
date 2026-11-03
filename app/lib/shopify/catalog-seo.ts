import { shopifyFetch } from "../shopify";

type ProductEntry = { handle: string; updatedAt: string };
type ProductConnection = { nodes: ProductEntry[]; pageInfo: { hasNextPage: boolean; endCursor: string | null } };

export async function getSitemapProducts(): Promise<ProductEntry[]> {
  const products: ProductEntry[] = [];
  let after: string | null = null;
  do {
    const response = await shopifyFetch(`
      query SitemapProducts($after: String) {
        products(first: 100, after: $after) {
          nodes { handle updatedAt }
          pageInfo { hasNextPage endCursor }
        }
      }
    `, { after }, { next: { revalidate: 3600, tags: ["products"] } });
    const connection: ProductConnection | undefined = response.data?.products;
    if (!connection || !Array.isArray(connection.nodes) || !connection.pageInfo ||
      typeof connection.pageInfo.hasNextPage !== "boolean" ||
      connection.nodes.some((product) => typeof product.handle !== "string" || !product.handle || !Number.isFinite(Date.parse(product.updatedAt)))) {
      throw new Error("Shopify a renvoyé un catalogue invalide pour le sitemap.");
    }
    products.push(...connection.nodes);
    if (!connection.pageInfo.hasNextPage) break;
    const cursor = connection.pageInfo.endCursor;
    if (!cursor || cursor === after) throw new Error("Pagination Shopify invalide pour le sitemap.");
    after = cursor;
  } while (after);
  return products;
}
