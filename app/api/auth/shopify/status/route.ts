import { NextRequest, NextResponse } from "next/server";

import {
  CUSTOMER_AUTH_COOKIES,
  getCustomerProfile,
  getCustomerSessionExpiresAt,
  refreshCustomerAccessToken,
} from "@/app/lib/shopify/customers";
import { remainingSessionSeconds } from "@/app/lib/shopify/session-lifetime";

const cookieOptions = { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/" };

function expiredSession() {
  const response = NextResponse.json({ authenticated: false, refreshed: false }, { headers: { "Cache-Control": "no-store" } });
  for (const name of [CUSTOMER_AUTH_COOKIES.accessToken, CUSTOMER_AUTH_COOKIES.refreshToken, CUSTOMER_AUTH_COOKIES.idToken]) {
    response.cookies.set(name, "", { ...cookieOptions, maxAge: 0 });
  }
  return response;
}

export async function GET(request: NextRequest) {
  try {
    const expiresAt = await getCustomerSessionExpiresAt();
    if (!remainingSessionSeconds(expiresAt)) return expiredSession();
    const customer = await getCustomerProfile();
    if (customer) {
      return NextResponse.json(
        { authenticated: true, refreshed: false, expiresAt, expiresIn: remainingSessionSeconds(expiresAt) },
        { headers: { "Cache-Control": "no-store" } },
      );
    }

    const refreshToken = request.cookies.get(CUSTOMER_AUTH_COOKIES.refreshToken)?.value;
    if (!refreshToken) return expiredSession();
    const token = await refreshCustomerAccessToken(refreshToken);
    const maxAge = remainingSessionSeconds(expiresAt);
    if (!maxAge) return expiredSession();
    const response = NextResponse.json(
      { authenticated: true, refreshed: true, expiresAt, expiresIn: maxAge },
      { headers: { "Cache-Control": "no-store" } },
    );
    response.cookies.set(CUSTOMER_AUTH_COOKIES.accessToken, token.accessToken, {
      ...cookieOptions, maxAge: Math.min(token.expiresIn, maxAge),
    });
    if (token.refreshToken) {
      response.cookies.set(CUSTOMER_AUTH_COOKIES.refreshToken, token.refreshToken, { ...cookieOptions, maxAge });
    }
    return response;
  } catch (error) {
    console.error("Impossible de vérifier la session client Shopify.", error);
    return NextResponse.json(
      { authenticated: false, refreshed: false },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
