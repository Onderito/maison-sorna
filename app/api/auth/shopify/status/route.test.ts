import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/app/lib/shopify/customers", () => ({
  CUSTOMER_AUTH_COOKIES: { accessToken: "access", refreshToken: "refresh", idToken: "identity" },
  getCustomerProfile: vi.fn(), getCustomerSessionExpiresAt: vi.fn(), refreshCustomerAccessToken: vi.fn(),
}));
vi.mock("@/app/lib/shopify/session-lifetime", async () => await import("../../../../lib/shopify/session-lifetime"));
import { getCustomerProfile, getCustomerSessionExpiresAt, refreshCustomerAccessToken } from "@/app/lib/shopify/customers";
import { GET } from "./route";

const now = Date.parse("2026-11-04T00:00:00Z");
beforeEach(() => {
  vi.clearAllMocks(); vi.useFakeTimers(); vi.setSystemTime(now);
});
afterEach(() => vi.useRealTimers());
const request = () => new NextRequest("https://example.com/api/auth/shopify/status", { headers: { cookie: "refresh=private-test-token; cartId=kept-cart" } });

it("clears expired authentication without touching the cart or refreshing tokens", async () => {
  vi.mocked(getCustomerSessionExpiresAt).mockResolvedValue(null);
  const response = await GET(request());
  expect(await response.json()).toEqual({ authenticated: false, refreshed: false });
  expect(response.cookies.getAll().map((cookie) => cookie.name)).toEqual(["access", "refresh", "identity"]);
  expect(response.cookies.getAll().every((cookie) => cookie.maxAge === 0)).toBe(true);
  expect(getCustomerProfile).not.toHaveBeenCalled();
  expect(refreshCustomerAccessToken).not.toHaveBeenCalled();
});

it("caps both refreshed cookies at the original deadline", async () => {
  vi.mocked(getCustomerSessionExpiresAt).mockResolvedValue(now + 120_000);
  vi.mocked(getCustomerProfile).mockResolvedValue(null);
  vi.mocked(refreshCustomerAccessToken).mockResolvedValue({ accessToken: "new-access", refreshToken: "new-refresh", expiresIn: 3600 });
  const response = await GET(request());
  expect(response.cookies.get("access")?.maxAge).toBe(120);
  expect(response.cookies.get("refresh")?.maxAge).toBe(120);
  expect((await response.json()).expiresAt).toBe(now + 120_000);
});

it("does not persist a token if the 7-day deadline passes during renewal", async () => {
  vi.mocked(getCustomerSessionExpiresAt).mockResolvedValue(now + 1000);
  vi.mocked(getCustomerProfile).mockResolvedValue(null);
  vi.mocked(refreshCustomerAccessToken).mockImplementation(async () => {
    vi.setSystemTime(now + 2000);
    return { accessToken: "new-access", expiresIn: 3600 };
  });
  const response = await GET(request());
  expect((await response.json()).authenticated).toBe(false);
  expect(response.cookies.get("access")?.maxAge).toBe(0);
});
