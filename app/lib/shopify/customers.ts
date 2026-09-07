import "server-only";

type OpenIdConfiguration = {
  authorization_endpoint: string;
};

function requireEnvironmentVariable(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`La variable ${name} est manquante.`);
  }

  return value;
}

function requireHttpsUrl(name: string) {
  const value = requireEnvironmentVariable(name);
  const url = new URL(value);

  if (url.protocol !== "https:") {
    throw new Error(`La variable ${name} doit utiliser HTTPS.`);
  }

  return url;
}

export function getCustomerAccountConfiguration() {
  const shopDomain = requireEnvironmentVariable("SHOPIFY_STORE_DOMAIN");
  const clientId = requireEnvironmentVariable(
    "SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID",
  );
  const siteUrl = requireHttpsUrl("NEXT_SITE_URL");

  return {
    shopDomain,
    clientId,
    siteUrl,
    callbackUrl: new URL("/api/auth/shopify/callback", siteUrl),
  };
}

export async function getCustomerAuthorizationEndpoint(shopDomain: string) {
  const response = await fetch(
    `https://${shopDomain}/.well-known/openid-configuration`,
    { cache: "no-store" },
  );

  if (!response.ok) {
    throw new Error(
      `La configuration du compte client Shopify est indisponible (HTTP ${response.status}).`,
    );
  }

  const configuration = (await response.json()) as Partial<OpenIdConfiguration>;

  if (
    typeof configuration.authorization_endpoint !== "string" ||
    !configuration.authorization_endpoint.startsWith("https://")
  ) {
    throw new Error(
      "Shopify a renvoyé un point d’autorisation client invalide.",
    );
  }

  return configuration.authorization_endpoint;
}
