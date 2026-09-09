import { isIP } from "node:net";
import { NextRequest, NextResponse } from "next/server";

import {
  CUSTOMER_AUTH_COOKIES,
  refreshCustomerAccessToken,
} from "@/app/lib/shopify/customers";
import {
  associateCustomerWithCart,
  getCartDetails,
  SHOPIFY_CART_COOKIE,
} from "@/app/lib/shopify/cart";

const SESSION_MAX_AGE = 30 * 24 * 60 * 60;

function checkoutErrorUrl(request: NextRequest) {
  return new URL("/panier?erreur=checkout", request.url);
}

function getBuyerIp(request: NextRequest) {
  const forwardedIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const candidate = forwardedIp || request.headers.get("x-real-ip")?.trim();
  return candidate && isIP(candidate) ? candidate : undefined;
}

function clearCustomerSession(response: NextResponse) {
  const expiredCookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };

  response.cookies.set(CUSTOMER_AUTH_COOKIES.accessToken, "", expiredCookieOptions);
  response.cookies.set(CUSTOMER_AUTH_COOKIES.refreshToken, "", expiredCookieOptions);
  response.cookies.set(CUSTOMER_AUTH_COOKIES.idToken, "", expiredCookieOptions);
}

function clearCart(response: NextResponse) {
  response.cookies.set(SHOPIFY_CART_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function GET(request: NextRequest) {
  try {
    const cart = await getCartDetails();
    if (!cart || cart.totalQuantity === 0) {
      const response = NextResponse.redirect(checkoutErrorUrl(request));
      response.headers.set("Cache-Control", "no-store");
      if (!cart) clearCart(response);
      return response;
    }

    const accessToken = request.cookies.get(CUSTOMER_AUTH_COOKIES.accessToken)?.value;
    const refreshToken = request.cookies.get(CUSTOMER_AUTH_COOKIES.refreshToken)?.value;
    const buyerIp = getBuyerIp(request);
    let checkoutUrl = cart.checkoutUrl;
    let refreshedSession: Awaited<ReturnType<typeof refreshCustomerAccessToken>> | null = null;
    let shouldClearSession = false;

    try {
      if (accessToken) {
        try {
          checkoutUrl = (await associateCustomerWithCart({
            cartId: cart.id,
            customerAccessToken: accessToken,
            buyerIp,
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
          buyerIp,
        })).checkoutUrl;
      }
    } catch {
      // Une session client expirée ne doit pas empêcher un paiement invité.
      console.warn("Session client Shopify ignorée pendant la préparation du checkout.");
      refreshedSession = null;
      shouldClearSession = true;
      checkoutUrl = cart.checkoutUrl;
    }

    const response = NextResponse.redirect(checkoutUrl);
    response.headers.set("Cache-Control", "no-store");

    if (shouldClearSession) {
      clearCustomerSession(response);
    } else if (refreshedSession) {
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
