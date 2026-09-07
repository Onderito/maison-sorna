import "server-only";

import { createPublicKey, verify, type JsonWebKey } from "node:crypto";
import { cookies } from "next/headers";

export const CUSTOMER_AUTH_COOKIES = {
  state: "__Host-shopify_customer_auth_state",
  nonce: "__Host-shopify_customer_auth_nonce",
  codeVerifier: "__Host-shopify_customer_auth_code_verifier",
  accessToken: "__Host-shopify_customer_access_token",
  refreshToken: "__Host-shopify_customer_refresh_token",
  idToken: "__Host-shopify_customer_id_token",
} as const;

type OpenIdConfiguration = {
  authorization_endpoint: string;
  token_endpoint: string;
  end_session_endpoint: string;
  jwks_uri: string;
  issuer: string;
};

type JsonWebKeyWithId = JsonWebKey & { kid: string };

type CustomerTokenResponse = {
  access_token: string;
  expires_in: number;
  id_token: string;
  refresh_token?: string;
};

export type RefreshedCustomerToken = {
  accessToken: string;
  expiresIn: number;
  refreshToken?: string;
};

export type CustomerProfile = {
  firstName: string | null;
  displayName: string;
  emailAddress: string | null;
};

export type CustomerOrder = {
  id: string;
  name: string;
  processedAt: string;
  financialStatus: string | null;
  fulfillmentStatus: string;
  statusPageUrl: string;
  totalPrice: {
    amount: string;
    currencyCode: string;
  };
};

function requireEnvironmentVariable(name: string) {
  const value = process.env[name];

  if (!value) throw new Error(`La variable ${name} est manquante.`);
  return value;
}

function requireHttpsUrl(name: string) {
  const url = new URL(requireEnvironmentVariable(name));
  if (url.protocol !== "https:") {
    throw new Error(`La variable ${name} doit utiliser HTTPS.`);
  }
  return url;
}

function isHttpsUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export function getCustomerAccountConfiguration() {
  const shopDomain = requireEnvironmentVariable("SHOPIFY_STORE_DOMAIN");
  const clientId = requireEnvironmentVariable("SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID");
  const siteUrl = requireHttpsUrl("NEXT_SITE_URL");

  return {
    shopDomain,
    clientId,
    siteUrl,
    callbackUrl: new URL("/api/auth/shopify/callback", siteUrl),
  };
}

export async function getCustomerOpenIdConfiguration(shopDomain: string) {
  const response = await fetch(
    `https://${shopDomain}/.well-known/openid-configuration`,
    { cache: "no-store" },
  );

  if (!response.ok) {
    throw new Error(`La configuration du compte client Shopify est indisponible (HTTP ${response.status}).`);
  }

  const configuration = (await response.json()) as Partial<OpenIdConfiguration>;

  if (
    !isHttpsUrl(configuration.authorization_endpoint) ||
    !isHttpsUrl(configuration.token_endpoint) ||
    !isHttpsUrl(configuration.end_session_endpoint) ||
    !isHttpsUrl(configuration.jwks_uri) ||
    !isHttpsUrl(configuration.issuer)
  ) {
    throw new Error("Shopify a renvoyé une configuration client invalide.");
  }

  return configuration as OpenIdConfiguration;
}

export async function exchangeCustomerAuthorizationCode({
  code,
  codeVerifier,
}: {
  code: string;
  codeVerifier: string;
}) {
  const { shopDomain, clientId, siteUrl, callbackUrl } = getCustomerAccountConfiguration();
  const openIdConfiguration = await getCustomerOpenIdConfiguration(shopDomain);
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: clientId,
    redirect_uri: callbackUrl.toString(),
    code,
    code_verifier: codeVerifier,
  });
  const response = await fetch(openIdConfiguration.token_endpoint, {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Origin: siteUrl.origin,
    },
    body,
  });

  if (!response.ok) {
    throw new Error(`L’échange du code client Shopify a échoué (HTTP ${response.status}).`);
  }

  const token = (await response.json()) as Partial<CustomerTokenResponse>;

  if (
    typeof token.access_token !== "string" ||
    typeof token.id_token !== "string" ||
    !Number.isInteger(token.expires_in) ||
    Number(token.expires_in) <= 0 ||
    (token.refresh_token !== undefined && typeof token.refresh_token !== "string")
  ) {
    throw new Error("Shopify a renvoyé une session client invalide.");
  }

  return { token: token as CustomerTokenResponse, openIdConfiguration };
}

export async function refreshCustomerAccessToken(
  refreshToken: string,
): Promise<RefreshedCustomerToken> {
  const { shopDomain, clientId, siteUrl } = getCustomerAccountConfiguration();
  const openIdConfiguration = await getCustomerOpenIdConfiguration(shopDomain);
  const response = await fetch(openIdConfiguration.token_endpoint, {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Origin: siteUrl.origin,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: clientId,
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    throw new Error(`Le renouvellement de la session Shopify a échoué (HTTP ${response.status}).`);
  }

  const token = (await response.json()) as {
    access_token?: unknown;
    expires_in?: unknown;
    refresh_token?: unknown;
  };
  if (
    typeof token.access_token !== "string" ||
    !Number.isInteger(token.expires_in) ||
    Number(token.expires_in) <= 0 ||
    (token.refresh_token !== undefined && typeof token.refresh_token !== "string")
  ) {
    throw new Error("Shopify a renvoyé un renouvellement de session invalide.");
  }

  return {
    accessToken: token.access_token,
    expiresIn: Number(token.expires_in),
    refreshToken: typeof token.refresh_token === "string" ? token.refresh_token : undefined,
  };
}

function decodeJwtPart(value: string) {
  return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as Record<string, unknown>;
}

export async function verifyCustomerIdToken({
  idToken,
  nonce,
  openIdConfiguration,
}: {
  idToken: string;
  nonce: string;
  openIdConfiguration: OpenIdConfiguration;
}) {
  const parts = idToken.split(".");
  if (parts.length !== 3) throw new Error("Le jeton d’identité Shopify est mal formé.");

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const header = decodeJwtPart(encodedHeader);
  const payload = decodeJwtPart(encodedPayload);

  if (header.alg !== "RS256" || typeof header.kid !== "string") {
    throw new Error("Le jeton d’identité Shopify utilise une clé invalide.");
  }

  const jwksResponse = await fetch(openIdConfiguration.jwks_uri, { cache: "no-store" });
  if (!jwksResponse.ok) {
    throw new Error(`Les clés de signature Shopify sont indisponibles (HTTP ${jwksResponse.status}).`);
  }

  const jwks = (await jwksResponse.json()) as { keys?: JsonWebKeyWithId[] };
  const signingKey = jwks.keys?.find((key) => key.kid === header.kid);
  if (!signingKey) throw new Error("La clé de signature Shopify est introuvable.");

  const signatureIsValid = verify(
    "RSA-SHA256",
    Buffer.from(`${encodedHeader}.${encodedPayload}`),
    createPublicKey({ key: signingKey, format: "jwk" }),
    Buffer.from(encodedSignature, "base64url"),
  );
  const { clientId } = getCustomerAccountConfiguration();
  const audience = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  const now = Math.floor(Date.now() / 1000);

  if (
    !signatureIsValid ||
    payload.iss !== openIdConfiguration.issuer ||
    !audience.includes(clientId) ||
    payload.nonce !== nonce ||
    typeof payload.exp !== "number" ||
    payload.exp <= now
  ) {
    throw new Error("Le jeton d’identité Shopify n’est pas valide.");
  }
}

async function getCustomerGraphqlEndpoint(shopDomain: string) {
  const response = await fetch(
    `https://${shopDomain}/.well-known/customer-account-api`,
    { cache: "no-store" },
  );
  if (!response.ok) {
    throw new Error(`L’API de compte client Shopify est indisponible (HTTP ${response.status}).`);
  }

  const configuration = (await response.json()) as { graphql_api?: unknown };
  if (!isHttpsUrl(configuration.graphql_api)) {
    throw new Error("Shopify a renvoyé un endpoint client invalide.");
  }
  return configuration.graphql_api;
}

export async function getCustomerProfile(): Promise<CustomerProfile | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(CUSTOMER_AUTH_COOKIES.accessToken)?.value;
  if (!accessToken) return null;

  const { shopDomain } = getCustomerAccountConfiguration();
  const endpoint = await getCustomerGraphqlEndpoint(shopDomain);
  const response = await fetch(endpoint, {
    method: "POST",
    cache: "no-store",
    headers: { "Content-Type": "application/json", Authorization: accessToken },
    body: JSON.stringify({
      operationName: "CustomerProfile",
      query: `query CustomerProfile {
        customer {
          firstName
          displayName
          emailAddress { emailAddress }
        }
      }`,
    }),
  });

  if (response.status === 401) return null;
  if (!response.ok) {
    throw new Error(`La récupération du compte client a échoué (HTTP ${response.status}).`);
  }

  const result = (await response.json()) as {
    data?: {
      customer?: {
        firstName?: unknown;
        displayName?: unknown;
        emailAddress?: { emailAddress?: unknown } | null;
      };
    };
    errors?: unknown[];
  };
  if (result.errors?.length) {
    throw new Error("Shopify a renvoyé une erreur pour le compte client.", { cause: result.errors });
  }

  const customer = result.data?.customer;
  const email = customer?.emailAddress?.emailAddress;
  if (
    !customer ||
    typeof customer.displayName !== "string" ||
    (customer.firstName != null && typeof customer.firstName !== "string") ||
    (email != null && typeof email !== "string")
  ) {
    throw new Error("Shopify a renvoyé un profil client invalide.");
  }

  return {
    firstName: typeof customer.firstName === "string" ? customer.firstName : null,
    displayName: customer.displayName,
    emailAddress: typeof email === "string" ? email : null,
  };
}

export async function getCustomerOrders(): Promise<CustomerOrder[] | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(CUSTOMER_AUTH_COOKIES.accessToken)?.value;
  if (!accessToken) return null;

  const { shopDomain } = getCustomerAccountConfiguration();
  const endpoint = await getCustomerGraphqlEndpoint(shopDomain);
  const response = await fetch(endpoint, {
    method: "POST",
    cache: "no-store",
    headers: { "Content-Type": "application/json", Authorization: accessToken },
    body: JSON.stringify({
      operationName: "CustomerOrders",
      query: `query CustomerOrders {
        customer {
          orders(first: 20, sortKey: PROCESSED_AT, reverse: true) {
            nodes {
              id
              name
              processedAt
              financialStatus
              fulfillmentStatus
              statusPageUrl
              totalPrice { amount currencyCode }
            }
          }
        }
      }`,
    }),
  });

  if (response.status === 401) return null;
  if (!response.ok) {
    throw new Error(`La récupération des commandes a échoué (HTTP ${response.status}).`);
  }

  const result = (await response.json()) as {
    data?: { customer?: { orders?: { nodes?: unknown[] } } };
    errors?: unknown[];
  };
  if (result.errors?.length) {
    throw new Error("Shopify a renvoyé une erreur pour les commandes client.", {
      cause: result.errors,
    });
  }

  const nodes = result.data?.customer?.orders?.nodes;
  if (!Array.isArray(nodes)) {
    throw new Error("Shopify a renvoyé un historique de commandes invalide.");
  }

  return nodes.map((node) => {
    if (!node || typeof node !== "object") {
      throw new Error("Shopify a renvoyé une commande invalide.");
    }

    const order = node as Record<string, unknown>;
    const totalPrice = order.totalPrice;
    if (
      typeof order.id !== "string" ||
      typeof order.name !== "string" ||
      typeof order.processedAt !== "string" ||
      (order.financialStatus !== null && typeof order.financialStatus !== "string") ||
      typeof order.fulfillmentStatus !== "string" ||
      !isHttpsUrl(order.statusPageUrl) ||
      !totalPrice ||
      typeof totalPrice !== "object" ||
      typeof (totalPrice as Record<string, unknown>).amount !== "string" ||
      typeof (totalPrice as Record<string, unknown>).currencyCode !== "string"
    ) {
      throw new Error("Shopify a renvoyé une commande invalide.");
    }

    return {
      id: order.id,
      name: order.name,
      processedAt: order.processedAt,
      financialStatus: order.financialStatus,
      fulfillmentStatus: order.fulfillmentStatus,
      statusPageUrl: order.statusPageUrl,
      totalPrice: {
        amount: (totalPrice as Record<string, string>).amount,
        currencyCode: (totalPrice as Record<string, string>).currencyCode,
      },
    };
  });
}
