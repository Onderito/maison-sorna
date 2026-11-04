import { afterEach, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/app/lib/shopify/customers", () => ({
  CUSTOMER_AUTH_COOKIES: { state: "state", nonce: "nonce", codeVerifier: "verifier", accessToken: "access", refreshToken: "refresh", idToken: "identity" },
  getCustomerAccountConfiguration: () => ({ siteUrl: new URL("https://example.com") }),
  exchangeCustomerAuthorizationCode: vi.fn(), verifyCustomerIdToken: vi.fn(),
}));
vi.mock("@/app/lib/shopify/session-lifetime", async () => await import("../../../../lib/shopify/session-lifetime"));
import { exchangeCustomerAuthorizationCode, verifyCustomerIdToken } from "@/app/lib/shopify/customers";
import { GET } from "./route";

afterEach(() => { vi.useRealTimers(); vi.clearAllMocks(); });
it("caps all new authentication cookies to seven days while respecting shorter access tokens", async () => {
  vi.useFakeTimers(); vi.setSystemTime("2026-11-04T00:00:00Z");
  const sevenDays = 7 * 86400;
  vi.mocked(exchangeCustomerAuthorizationCode).mockResolvedValue({ token: { access_token: "test-access", refresh_token: "test-refresh", id_token: "test-identity", expires_in: 3600 }, openIdConfiguration: { authorization_endpoint: "https://identity.example/auth", token_endpoint: "https://identity.example/token", end_session_endpoint: "https://identity.example/logout", jwks_uri: "https://identity.example/jwks", issuer: "https://identity.example" } });
  vi.mocked(verifyCustomerIdToken).mockResolvedValue(Date.now() + sevenDays * 1000);
  const response = await GET(new NextRequest("https://example.com/api/auth/shopify/callback?code=test&state=equal", { headers: { cookie: "state=equal; nonce=test-nonce; verifier=test-verifier; cartId=kept-cart" } }));
  expect(response.headers.get("location")).toBe("https://example.com/compte");
  expect(response.cookies.get("access")?.maxAge).toBe(3600);
  expect(response.cookies.get("refresh")?.maxAge).toBe(sevenDays);
  expect(response.cookies.get("identity")?.maxAge).toBe(sevenDays);
  expect(response.cookies.get("refresh")?.httpOnly).toBe(true);
  expect(response.cookies.get("refresh")?.secure).toBe(true);
  expect(response.cookies.get("cartId")).toBeUndefined();
});
