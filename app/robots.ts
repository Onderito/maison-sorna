import type { MetadataRoute } from "next";
import { getSiteUrl, isIndexable } from "./lib/seo/site";

export default function robots(): MetadataRoute.Robots {
  return {
    // Public pages remain crawlable so crawlers can read their noindex tags.
    rules: { userAgent: "*", allow: "/", disallow: ["/api/"] },
    ...(isIndexable() ? { sitemap: new URL("/sitemap.xml", getSiteUrl()).href } : {}),
  };
}
