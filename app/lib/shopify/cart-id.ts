// Shopify cart IDs look like gid://shopify/Cart/<token>?key=<secret>.
// Shopify rejects malformed IDs (e.g. "%" or spaces) with a GraphQL error
// instead of returning `cart: null`, so such a cookie must be treated as
// "no cart" before querying, otherwise the cart stays broken until it expires.
const CART_ID_PATTERN = /^gid:\/\/shopify\/Cart\/[A-Za-z0-9_-]+(?:\?key=[A-Za-z0-9_-]+)?$/;

export function isShopifyCartId(value: unknown): value is string {
  return typeof value === "string" && CART_ID_PATTERN.test(value);
}
