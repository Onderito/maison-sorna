import { describe, expect, it } from "vitest";
import { isShopifyCartId } from "./cart-id";

describe("isShopifyCartId", () => {
  it("accepts Shopify cart IDs, with or without their key", () => {
    expect(isShopifyCartId("gid://shopify/Cart/hWNJ3kEsoz3PDliVDStuQ3qI?key=3aa44f16d63333c0")).toBe(true);
    expect(isShopifyCartId("gid://shopify/Cart/c1-7a2abe82733a34e84aa472d57fb5c3c1")).toBe(true);
  });

  it("rejects values Shopify would answer with a GraphQL error", () => {
    for (const value of [
      "gid://shopify/Cart/%%%",
      "gid://shopify/Cart/a b",
      "gid://shopify/Cart/",
      "gid://shopify/Cart/abc?key=",
      "gid://shopify/Product/123",
      "nimportequoi",
      undefined,
    ]) {
      expect(isShopifyCartId(value)).toBe(false);
    }
  });
});
