// Tabs of one browser share the cart cookie. Running their cart additions one
// at a time keeps two tabs from each creating a cart (the second cookie would
// drop the first cart) or from both passing the per-product limit check.
const CART_LOCK = "sorna-cart";

export function withCartLock<T>(task: () => Promise<T>): Promise<T> {
  if (typeof navigator === "undefined" || !navigator.locks) return task();
  return navigator.locks.request(CART_LOCK, task) as Promise<T>;
}
