import { NextRequest, NextResponse } from "next/server";

import {
  CUSTOMER_AUTH_COOKIES,
  getCustomerAccountConfiguration,
  getCustomerOpenIdConfiguration,
} from "@/app/lib/shopify/customers";

function clearCustomerSession(response: NextResponse) {
  const expiredCookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };

  for (const cookieName of Object.values(CUSTOMER_AUTH_COOKIES)) {
    response.cookies.set(cookieName, "", expiredCookieOptions);
  }
}

export async function GET(request: NextRequest) {
  const { shopDomain, siteUrl } = getCustomerAccountConfiguration();
  const logoutRoute = new URL("/api/auth/shopify/logout", siteUrl);
  const homeUrl = new URL("/", siteUrl);

  if (request.nextUrl.origin !== siteUrl.origin) {
    return NextResponse.redirect(logoutRoute);
  }

  const idToken = request.cookies.get(CUSTOMER_AUTH_COOKIES.idToken)?.value;

  try {
    if (!idToken) {
      const response = NextResponse.redirect(homeUrl);
      clearCustomerSession(response);
      return response;
    }

    const openIdConfiguration = await getCustomerOpenIdConfiguration(shopDomain);
    const logoutUrl = new URL(openIdConfiguration.end_session_endpoint);
    logoutUrl.searchParams.set("id_token_hint", idToken);
    logoutUrl.searchParams.set("post_logout_redirect_uri", homeUrl.toString());

    const response = NextResponse.redirect(logoutUrl);
    clearCustomerSession(response);
    return response;
  } catch (error) {
    console.error("Impossible de terminer la déconnexion Shopify.", error);
    const response = NextResponse.redirect(homeUrl);
    clearCustomerSession(response);
    return response;
  }
}
