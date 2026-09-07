import { NextRequest, NextResponse } from "next/server";

import {
  CUSTOMER_AUTH_COOKIES,
  getCustomerAccountConfiguration,
  getCustomerOpenIdConfiguration,
} from "@/app/lib/shopify/customers";

function clearCustomerSession(response: NextResponse) {
  response.cookies.delete(CUSTOMER_AUTH_COOKIES.accessToken);
  response.cookies.delete(CUSTOMER_AUTH_COOKIES.refreshToken);
  response.cookies.delete(CUSTOMER_AUTH_COOKIES.idToken);
  response.cookies.delete(CUSTOMER_AUTH_COOKIES.state);
  response.cookies.delete(CUSTOMER_AUTH_COOKIES.nonce);
  response.cookies.delete(CUSTOMER_AUTH_COOKIES.codeVerifier);
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
