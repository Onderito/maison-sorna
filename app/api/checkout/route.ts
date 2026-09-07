import { NextRequest, NextResponse } from "next/server";

import {
  CUSTOMER_AUTH_COOKIES,
  refreshCustomerAccessToken,
} from "@/app/lib/shopify/customers";
import {
  associateCustomerWithCart,
  getCartDetails,
} from "@/app/lib/shopify/cart";

const SESSION_MAX_AGE = 30 * 24 * 60 * 60;

function checkoutErrorUrl(request: NextRequest) {
  return new URL("/panier?erreur=checkout", request.url);
}

export async function GET(request: NextRequest) {
  try {
    const cart = await getCartDetails();
    if (!cart || cart.totalQuantity === 0) {
      return NextResponse.redirect(checkoutErrorUrl(request));
    }

    const accessToken = request.cookies.get(CUSTOMER_AUTH_COOKIES.accessToken)?.value;
    const refreshToken = request.cookies.get(CUSTOMER_AUTH_COOKIES.refreshToken)?.value;
    let checkoutUrl = cart.checkoutUrl;
    let refreshedSession: Awaited<ReturnType<typeof refreshCustomerAccessToken>> | null = null;

    if (accessToken) {
      try {
        checkoutUrl = (await associateCustomerWithCart({
          cartId: cart.id,
          customerAccessToken: accessToken,
        })).checkoutUrl;
      } catch (error) {
        if (!refreshToken) throw error;
        refreshedSession = await refreshCustomerAccessToken(refreshToken);
      }
    } else if (refreshToken) {
      refreshedSession = await refreshCustomerAccessToken(refreshToken);
    }

    if (refreshedSession) {
      checkoutUrl = (await associateCustomerWithCart({
        cartId: cart.id,
        customerAccessToken: refreshedSession.accessToken,
      })).checkoutUrl;
    }

    const response = NextResponse.redirect(checkoutUrl);
    if (refreshedSession) {
      const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: "lax" as const,
        path: "/",
      };
      response.cookies.set(CUSTOMER_AUTH_COOKIES.accessToken, refreshedSession.accessToken, {
        ...cookieOptions,
        maxAge: refreshedSession.expiresIn,
      });
      if (refreshedSession.refreshToken) {
        response.cookies.set(CUSTOMER_AUTH_COOKIES.refreshToken, refreshedSession.refreshToken, {
          ...cookieOptions,
          maxAge: SESSION_MAX_AGE,
        });
      }
    }

    return response;
  } catch (error) {
    console.error("Impossible de préparer le checkout Shopify.", error);
    return NextResponse.redirect(checkoutErrorUrl(request));
  }
}
