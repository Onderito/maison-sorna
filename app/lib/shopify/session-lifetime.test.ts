import { generateKeyPairSync, sign } from "node:crypto";
import { describe, expect, it } from "vitest";
import { CART_MAX_AGE, CUSTOMER_SESSION_MAX_AGE, customerSessionExpiresAt, isCartExpired, remainingSessionSeconds, verifyCustomerIdentitySignature } from "./session-lifetime";

const now = Date.parse("2026-11-04T00:00:00Z");
const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const key = { ...publicKey.export({ format: "jwk" }), kid: "test-key" };
const expected = { issuer: "https://identity.example", clientId: "test-client" };
function token(payload: Record<string, unknown>) {
  const body = [JSON.stringify({ alg: "RS256", kid: "test-key" }), JSON.stringify(payload)]
    .map((value) => Buffer.from(value).toString("base64url")).join(".");
  return `${body}.${sign("RSA-SHA256", Buffer.from(body), privateKey).toString("base64url")}`;
}

it("expires a cart at 14 days, including carts saved with the old 30-day cookie", () => {
  const createdAt = new Date(now - CART_MAX_AGE * 1000).toISOString();
  expect(isCartExpired(createdAt, now - 1)).toBe(false);
  expect(isCartExpired(createdAt, now)).toBe(true);
  expect(() => isCartExpired("not-a-date", now)).toThrow();
});

describe("absolute customer session deadline", () => {
  const claims = { iat: now / 1000 };
  const deadline = customerSessionExpiresAt(claims, now);
  it("expires at exactly 7 days", () => {
    expect(deadline).toBe(now + CUSTOMER_SESSION_MAX_AGE * 1000);
    expect(remainingSessionSeconds(deadline, deadline! - 1000)).toBe(1);
    expect(remainingSessionSeconds(deadline, deadline!)).toBe(0);
  });
  it("cannot gain another 7 days when tokens are refreshed on day 6", () => {
    expect(remainingSessionSeconds(deadline, now + 6 * 86400_000)).toBe(86400);
  });
  it("rejects missing, invalid, or future login timestamps", () => {
    for (const iat of [undefined, "tomorrow", now / 1000 + 86400, -1]) {
      expect(customerSessionExpiresAt({ iat }, now)).toBeNull();
    }
    expect(remainingSessionSeconds(null, now)).toBe(0);
  });
});

it("only trusts login timestamps signed by Shopify's configured issuer and key", () => {
  const claims = { iss: expected.issuer, aud: expected.clientId, iat: now / 1000 };
  const signed = token(claims);
  expect(verifyCustomerIdentitySignature(signed, [key], expected).iat).toBe(claims.iat);
  const parts = signed.split(".");
  parts[1] = Buffer.from(JSON.stringify({ ...claims, iat: claims.iat + 86400 })).toString("base64url");
  expect(() => verifyCustomerIdentitySignature(parts.join("."), [key], expected)).toThrow();
  expect(() => verifyCustomerIdentitySignature(token({ ...claims, iss: "https://other.example" }), [key], expected)).toThrow();
  expect(() => verifyCustomerIdentitySignature(token({ ...claims, aud: "other-client" }), [key], expected)).toThrow();
});
