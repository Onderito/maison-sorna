import type { Metadata } from "next";

export function getSiteUrl(): URL {
  const configured = process.env.NEXT_SITE_URL;
  if (!configured && process.env.SEO_INDEXABLE === "true") {
    throw new Error("NEXT_SITE_URL doit être configuré avant d’activer l’indexation.");
  }
  const url = new URL(configured ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"));
  if (url.username || url.password || url.pathname !== "/" || url.search || url.hash ||
    !["https:", "http:"].includes(url.protocol)) {
    throw new Error("NEXT_SITE_URL doit être une origine publique, sans chemin ni paramètres.");
  }
  return url;
}

export function isIndexable(): boolean {
  const url = getSiteUrl();
  return process.env.SEO_INDEXABLE === "true" &&
    (!process.env.VERCEL_ENV || process.env.VERCEL_ENV === "production") &&
    url.protocol === "https:" && !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
}

export function pageMetadata(path: string, title: string, description: string, image = "/figma/infuser/hero-wuyi.png"): Metadata {
  const url = new URL(path, getSiteUrl()).href;
  return {
    title, description,
    alternates: { canonical: url },
    openGraph: { type: "website", locale: "fr_FR", siteName: "SÖRNA", title, description, url, images: [{ url: new URL(image, getSiteUrl()).href, alt: title }] },
    twitter: { card: "summary_large_image", title, description, images: [new URL(image, getSiteUrl()).href] },
  };
}
