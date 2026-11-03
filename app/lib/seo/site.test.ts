import { afterEach, describe, expect, it, vi } from "vitest";
import { getSiteUrl, isIndexable, pageMetadata } from "./site";
import { serializeJsonLd } from "./product";

afterEach(() => vi.unstubAllEnvs());

function environment(indexable: string, deployment = "production") {
  vi.stubEnv("NEXT_SITE_URL", "https://example.com");
  vi.stubEnv("SEO_INDEXABLE", indexable);
  vi.stubEnv("VERCEL_ENV", deployment);
}

describe("contrôle du lancement SEO", () => {
  it("reste en noindex sans activation explicite", () => {
    environment("");
    expect(isIndexable()).toBe(false);
  });
  it("ne permet jamais d’indexer une preview même si le réglage est activé", () => {
    environment("true", "preview");
    expect(isIndexable()).toBe(false);
  });
  it("autorise le domaine HTTPS de production après lancement", () => {
    environment("true");
    expect(isIndexable()).toBe(true);
  });
  it("refuse un lancement sans domaine configuré", () => {
    environment("true");
    vi.stubEnv("NEXT_SITE_URL", "");
    expect(getSiteUrl).toThrow("NEXT_SITE_URL");
  });
  it("ne permet pas d’indexer localhost", () => {
    environment("true");
    vi.stubEnv("NEXT_SITE_URL", "http://localhost:3000");
    expect(isIndexable()).toBe(false);
  });
  it("refuse les chemins dans le domaine de référence", () => {
    environment("false");
    vi.stubEnv("NEXT_SITE_URL", "https://example.com/boutique");
    expect(getSiteUrl).toThrow();
  });
  it("produit les URL canoniques et de partage sur le même domaine", () => {
    environment("true");
    const metadata = pageMetadata("/infuser", "Thés", "Description");
    expect(metadata.alternates?.canonical).toBe("https://example.com/infuser");
    expect(metadata.openGraph?.url).toBe("https://example.com/infuser");
  });
});

it("empêche une description Shopify de fermer le script JSON-LD", () => {
  const text = '</script><script>alert(1)</script>';
  const serialized = serializeJsonLd({ description: text });
  expect(serialized).not.toContain("<");
  expect(JSON.parse(serialized).description).toBe(text);
});
