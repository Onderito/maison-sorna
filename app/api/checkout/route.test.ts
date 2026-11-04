import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/app/lib/shopify/customers", () => ({
  CUSTOMER_AUTH_COOKIES: { accessToken: "access", refreshToken: "refresh", idToken: "identity" },
  getCustomerSessionExpiresAt: vi.fn(), refreshCustomerAccessToken: vi.fn(),
}));
vi.mock("@/app/lib/shopify/cart", () => ({ associateCustomerWithCart: vi.fn(), getCartDetails: vi.fn(), SHOPIFY_CART_COOKIE: "cartId" }));
vi.mock("@/app/lib/shopify/cart-product-limit", () => ({ exceedsCartProductLimit: () => false }));
vi.mock("@/app/lib/shopify/session-lifetime", async () => await import("../../lib/shopify/session-lifetime"));
import { getCustomerSessionExpiresAt, refreshCustomerAccessToken } from "@/app/lib/shopify/customers";
import { associateCustomerWithCart, getCartDetails } from "@/app/lib/shopify/cart";
import { GET } from "./route";

const now = Date.parse("2026-11-04T00:00:00Z");
const checkoutUrl = "https://checkout.example/cart";
const request = () => new NextRequest("https://example.com/api/checkout", { headers: { cookie: "refresh=private-test-token; cartId=kept-cart" } });
beforeEach(() => {
  vi.clearAllMocks(); vi.useFakeTimers(); vi.setSystemTime(now);
  vi.mocked(getCartDetails).mockResolvedValue({ id: "cart", checkoutUrl, totalQuantity: 1, lines: [], cost: { subtotalAmount: { amount: "28", currencyCode: "EUR" }, subtotalAmountEstimated: false } });
});
afterEach(() => vi.useRealTimers());

it("keeps the cart and permits guest checkout after session expiry", async () => {
  const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.mocked(getCustomerSessionExpiresAt).mockResolvedValue(null);
  const response = await GET(request());
  expect(response.headers.get("location")).toBe(checkoutUrl);
  expect(refreshCustomerAccessToken).not.toHaveBeenCalled();
  expect(associateCustomerWithCart).not.toHaveBeenCalled();
  expect(response.cookies.get("cartId")).toBeUndefined();
  expect(response.cookies.get("refresh")?.maxAge).toBe(0);
  warning.mockRestore();
});

it("uses the remaining session lifetime when checkout refreshes the customer token", async () => {
  vi.mocked(getCustomerSessionExpiresAt).mockResolvedValue(now + 60_000);
  vi.mocked(refreshCustomerAccessToken).mockResolvedValue({ accessToken: "new-access", refreshToken: "new-refresh", expiresIn: 3600 });
  vi.mocked(associateCustomerWithCart).mockResolvedValue({ id: "cart", checkoutUrl, totalQuantity: 1 });
  const response = await GET(request());
  expect(response.cookies.get("access")?.maxAge).toBe(60);
  expect(response.cookies.get("refresh")?.maxAge).toBe(60);
  // Reaching checkout is not evidence of payment: don't lose the selection.
  expect(response.cookies.get("cartId")).toBeUndefined();
});

it("clears an unusable cart identifier when Shopify no longer returns the cart", async () => {
  vi.mocked(getCartDetails).mockResolvedValue(null);
  const response = await GET(request());
  expect(response.cookies.get("cartId")?.maxAge).toBe(0);
  expect(response.headers.get("location")).toContain("/panier?erreur=checkout");
});
