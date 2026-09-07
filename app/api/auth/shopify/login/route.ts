import { createHash, randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

import {
  getCustomerAccountConfiguration,
  getCustomerAuthorizationEndpoint,
} from "@/app/lib/shopify/customers";

const AUTH_COOKIE_MAX_AGE = 10 * 60;

function createSecureValue() {
  return randomBytes(32).toString("base64url");
}

function createCodeChallenge(codeVerifier: string) {
  return createHash("sha256").update(codeVerifier).digest("base64url");
}

export async function GET(request: NextRequest) {
  try {
    const { shopDomain, clientId, siteUrl, callbackUrl } =
      getCustomerAccountConfiguration();

    if (request.nextUrl.origin !== siteUrl.origin) {
      return NextResponse.redirect(
        new URL("/api/auth/shopify/login", siteUrl),
      );
    }

    const authorizationEndpoint =
      await getCustomerAuthorizationEndpoint(shopDomain);
    const state = createSecureValue();
    const nonce = createSecureValue();
    const codeVerifier = createSecureValue();
    const authorizationUrl = new URL(authorizationEndpoint);

    authorizationUrl.searchParams.set(
      "scope",
      "openid email customer-account-api:full",
    );
    authorizationUrl.searchParams.set("client_id", clientId);
    authorizationUrl.searchParams.set("response_type", "code");
    authorizationUrl.searchParams.set("redirect_uri", callbackUrl.toString());
    authorizationUrl.searchParams.set("state", state);
    authorizationUrl.searchParams.set("nonce", nonce);
    authorizationUrl.searchParams.set(
      "code_challenge",
      createCodeChallenge(codeVerifier),
    );
    authorizationUrl.searchParams.set("code_challenge_method", "S256");

    const response = NextResponse.redirect(authorizationUrl);
    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "lax" as const,
      path: "/",
      maxAge: AUTH_COOKIE_MAX_AGE,
    };

    response.cookies.set("shopify_customer_auth_state", state, cookieOptions);
    response.cookies.set("shopify_customer_auth_nonce", nonce, cookieOptions);
    response.cookies.set(
      "shopify_customer_auth_code_verifier",
      codeVerifier,
      cookieOptions,
    );

    return response;
  } catch (error) {
    console.error("Impossible de démarrer la connexion Shopify.", error);

    return NextResponse.json(
      { message: "La connexion est momentanément indisponible." },
      { status: 503 },
    );
  }
}
