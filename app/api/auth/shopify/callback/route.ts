import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

import {
  CUSTOMER_AUTH_COOKIES,
  exchangeCustomerAuthorizationCode,
  getCustomerAccountConfiguration,
  verifyCustomerIdToken,
} from "@/app/lib/shopify/customers";

import { remainingSessionSeconds } from "@/app/lib/shopify/session-lifetime";

function valuesMatch(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function clearAuthenticationCookies(response: NextResponse) {
  const expiredCookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };

  response.cookies.set(CUSTOMER_AUTH_COOKIES.state, "", expiredCookieOptions);
  response.cookies.set(CUSTOMER_AUTH_COOKIES.nonce, "", expiredCookieOptions);
  response.cookies.set(CUSTOMER_AUTH_COOKIES.codeVerifier, "", expiredCookieOptions);
}

export async function GET(request: NextRequest) {
  const { siteUrl } = getCustomerAccountConfiguration();
  const accountUrl = new URL("/compte", siteUrl);
  const errorUrl = new URL("/compte?erreur=authentification", siteUrl);
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const savedState = request.cookies.get(CUSTOMER_AUTH_COOKIES.state)?.value;
  const nonce = request.cookies.get(CUSTOMER_AUTH_COOKIES.nonce)?.value;
  const codeVerifier = request.cookies.get(CUSTOMER_AUTH_COOKIES.codeVerifier)?.value;

  if (!code || !state || !savedState || !nonce || !codeVerifier || !valuesMatch(state, savedState)) {
    const response = NextResponse.redirect(errorUrl);
    clearAuthenticationCookies(response);
    return response;
  }

  try {
    const { token, openIdConfiguration } = await exchangeCustomerAuthorizationCode({ code, codeVerifier });
    const expiresAt = await verifyCustomerIdToken({ idToken: token.id_token, nonce, openIdConfiguration });

    const sessionMaxAge = remainingSessionSeconds(expiresAt);
    const response = NextResponse.redirect(accountUrl);
    const cookieOptions = { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/" };

    response.cookies.set(CUSTOMER_AUTH_COOKIES.accessToken, token.access_token, {
      ...cookieOptions,
      maxAge: Math.min(token.expires_in, sessionMaxAge),
    });
    response.cookies.set(CUSTOMER_AUTH_COOKIES.idToken, token.id_token, {
      ...cookieOptions,
      maxAge: sessionMaxAge,
    });
    if (token.refresh_token) {
      response.cookies.set(CUSTOMER_AUTH_COOKIES.refreshToken, token.refresh_token, {
        ...cookieOptions,
        maxAge: sessionMaxAge,
      });
    }

    clearAuthenticationCookies(response);
    return response;
  } catch (error) {
    console.error("Impossible de terminer la connexion Shopify.", error);
    const response = NextResponse.redirect(errorUrl);
    clearAuthenticationCookies(response);
    return response;
  }
}
