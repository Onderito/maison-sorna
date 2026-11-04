import { createPublicKey, verify, type JsonWebKey } from "node:crypto";

export const CUSTOMER_SESSION_MAX_AGE = 7 * 24 * 60 * 60;
export const CART_MAX_AGE = 14 * 24 * 60 * 60;

export class InvalidCustomerSessionError extends Error {}

export function verifyCustomerIdentitySignature(
  idToken: string,
  keys: (JsonWebKey & { kid?: string })[],
  expected: { issuer: string; clientId: string },
): Record<string, unknown> {
  try {
    const parts = idToken.split(".");
    if (parts.length !== 3) throw new Error();
    const [headerPart, payloadPart, signaturePart] = parts;
    const header: Record<string, unknown> = JSON.parse(Buffer.from(headerPart, "base64url").toString("utf8"));
    const payload: Record<string, unknown> = JSON.parse(Buffer.from(payloadPart, "base64url").toString("utf8"));
    const key = keys.find((candidate) => candidate.kid === header.kid);
    if (header.alg !== "RS256" || typeof header.kid !== "string" || !key || !payload ||
      !verify("RSA-SHA256", Buffer.from(`${headerPart}.${payloadPart}`), createPublicKey({ key, format: "jwk" }), Buffer.from(signaturePart, "base64url")) ||
      payload.iss !== expected.issuer || !(Array.isArray(payload.aud) ? payload.aud : [payload.aud]).includes(expected.clientId)) {
      throw new Error();
    }
    return payload;
  } catch {
    throw new InvalidCustomerSessionError("La preuve de connexion Shopify n’est pas valide.");
  }
}

// This is an absolute deadline from the original, signed login receipt.
// Renewing the access/refresh tokens must not move it forward.
export function customerSessionExpiresAt(claims: Record<string, unknown>, now = Date.now()): number | null {
  const issuedAt = claims.iat;
  if (typeof issuedAt !== "number" || !Number.isSafeInteger(issuedAt) || issuedAt <= 0 || issuedAt * 1000 > now + 60_000) return null;
  return (issuedAt + CUSTOMER_SESSION_MAX_AGE) * 1000;
}

export function remainingSessionSeconds(expiresAt: number | null, now = Date.now()): number {
  return expiresAt === null ? 0 : Math.max(0, Math.min(CUSTOMER_SESSION_MAX_AGE, Math.floor((expiresAt - now) / 1000)));
}

export function isCartExpired(createdAt: string, now = Date.now()): boolean {
  const created = Date.parse(createdAt);
  if (!Number.isFinite(created)) throw new Error("La date du panier Shopify n’est pas valide.");
  return now >= created + CART_MAX_AGE * 1000;
}
