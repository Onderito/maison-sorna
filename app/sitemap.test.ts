import { afterEach, expect, it, vi } from "vitest";
import sitemap from "./sitemap";
import robots from "./robots";

vi.mock("./lib/shopify", () => ({ shopifyFetch: vi.fn() }));
import { shopifyFetch } from "./lib/shopify";
const fetchCatalog = vi.mocked(shopifyFetch);

afterEach(() => { vi.unstubAllEnvs(); vi.clearAllMocks(); });

it("ne publie pas de sitemap avant le lancement", async () => {
  vi.stubEnv("SEO_INDEXABLE", "false");
  expect(await sitemap()).toEqual([]);
  expect(fetchCatalog).not.toHaveBeenCalled();
  expect(robots().sitemap).toBeUndefined();
  expect(robots().rules).toEqual({ userAgent: "*", allow: "/", disallow: ["/api/"] });
});

it("inclut toutes les pages publiques et pagine les produits Shopify", async () => {
  vi.stubEnv("NEXT_SITE_URL", "https://example.com");
  vi.stubEnv("SEO_INDEXABLE", "true");
  vi.stubEnv("VERCEL_ENV", "production");
  fetchCatalog.mockResolvedValueOnce({ data: { products: {
    nodes: [{ handle: "the-blanc", updatedAt: "2026-01-01T00:00:00Z" }],
    pageInfo: { hasNextPage: true, endCursor: "next" },
  } } }).mockResolvedValueOnce({ data: { products: {
    nodes: [{ handle: "the-noir", updatedAt: "2026-02-01T00:00:00Z" }],
    pageInfo: { hasNextPage: false, endCursor: "last" },
  } } });
  const entries = await sitemap();
  expect(entries.map((entry) => entry.url)).toEqual([
    "https://example.com/", "https://example.com/infuser", "https://example.com/appliquer",
    "https://example.com/ressentir", "https://example.com/recevoir",
    "https://example.com/produits/the-blanc", "https://example.com/produits/the-noir",
  ]);
  expect(fetchCatalog.mock.calls[1][1]).toEqual({ after: "next" });
  expect(entries[5].lastModified).toBe("2026-01-01T00:00:00Z");
  expect(robots().sitemap).toBe("https://example.com/sitemap.xml");
});

it("signale une erreur de catalogue au lieu de publier un sitemap incomplet", async () => {
  vi.stubEnv("NEXT_SITE_URL", "https://example.com");
  vi.stubEnv("SEO_INDEXABLE", "true");
  vi.stubEnv("VERCEL_ENV", "production");
  fetchCatalog.mockResolvedValueOnce({ data: { products: null } });
  await expect(sitemap()).rejects.toThrow("catalogue invalide");
});
