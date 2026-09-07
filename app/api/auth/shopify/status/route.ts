import { NextRequest, NextResponse } from "next/server";

import {
  CUSTOMER_AUTH_COOKIES,
  getCustomerProfile,
  refreshCustomerAccessToken,
} from "@/app/lib/shopify/customers";

const SESSION_MAX_AGE = 30 * 24 * 60 * 60;

export async function GET(request: NextRequest) {
  try {
    const customer = await getCustomerProfile();

    if (customer) {
      return NextResponse.json(
        { authenticated: true, refreshed: false },
        { headers: { "Cache-Control": "no-store" } },
      );
    }

    const refreshToken = request.cookies.get(CUSTOMER_AUTH_COOKIES.refreshToken)?.value;
    if (!refreshToken) {
      return NextResponse.json(
        { authenticated: false, refreshed: false },
        { headers: { "Cache-Control": "no-store" } },
      );
    }

    const token = await refreshCustomerAccessToken(refreshToken);
    const response = NextResponse.json(
      { authenticated: true, refreshed: true },
      { headers: { "Cache-Control": "no-store" } },
    );
    const cookieOptions = { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/" };

    response.cookies.set(CUSTOMER_AUTH_COOKIES.accessToken, token.accessToken, {
      ...cookieOptions,
      maxAge: token.expiresIn,
    });
    if (token.refreshToken) {
      response.cookies.set(CUSTOMER_AUTH_COOKIES.refreshToken, token.refreshToken, {
        ...cookieOptions,
        maxAge: SESSION_MAX_AGE,
      });
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
