import { expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/app/lib/shopify/customers", () => ({
  CUSTOMER_AUTH_COOKIES: { accessToken: "access", refreshToken: "refresh", idToken: "identity" },
  getCustomerAccountConfiguration: () => ({ shopDomain: "shop.example", siteUrl: new URL("https://example.com") }),
  getCustomerOpenIdConfiguration: async () => ({ end_session_endpoint: "https://identity.example/logout" }),
}));
import { GET } from "./route";

it("signs out through Shopify and deletes only authentication cookies", async () => {
  const response = await GET(new NextRequest("https://example.com/api/auth/shopify/logout", { headers: { cookie: "identity=test-token; cartId=kept-cart" } }));
  expect(response.headers.get("location")).toContain("https://identity.example/logout");
  expect(response.cookies.getAll().map((cookie) => cookie.name)).toEqual(["access", "refresh", "identity"]);
  expect(response.cookies.getAll().every((cookie) => cookie.maxAge === 0)).toBe(true);
  expect(response.cookies.get("cartId")).toBeUndefined();
});
