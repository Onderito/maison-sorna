"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { readCartView } from "@/app/actions/cart-view";
import type { CartView } from "@/app/lib/shopify-types";
import CartDrawer from "./cart-drawer";

type CartContextValue = {
  cart: CartView | null;
  isOpen: boolean;
  openCart: (variantId?: string) => Promise<void>;
  refreshCart: () => Promise<void>;
};
const CartContext = createContext<CartContextValue | null>(null);

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("Le panier nécessite CartProvider.");
  return value;
}

export default function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartView | null>(null);
  const [isOpen, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addedVariant, setAddedVariant] = useState<string | undefined>();
  const request = useRef(0);
  const pathname = usePathname();

  const refreshCart = useCallback(async () => {
    const current = ++request.current;
    setLoading(true);
    setError(null);
    try {
      const result = await readCartView();
      if (current !== request.current) return;
      if (result.status === "success") setCart(result.cart);
      else setError(result.message);
    } catch {
      if (current === request.current) setError("Le panier n’a pas pu être chargé. Vérifiez votre connexion et réessayez.");
    } finally {
      if (current === request.current) setLoading(false);
    }
  }, []);

  const openCart = useCallback(async (variantId?: string) => {
    setAddedVariant(variantId);
    setOpen(true);
    await refreshCart();
  }, [refreshCart]);

  useEffect(() => {
    const requests = request;
    const current = ++requests.current;
    // Initial/navigation reads settle asynchronously; explicit interactions
    // use refreshCart to expose their pending state immediately.
    void readCartView().then((result) => {
      if (current !== requests.current) return;
      if (result.status === "success") { setCart(result.cart); setError(null); }
      else setError(result.message);
      setLoading(false);
    }).catch(() => {
      if (current === requests.current) {
        setError("Le panier n’a pas pu être chargé. Vérifiez votre connexion.");
        setLoading(false);
      }
    });
    const refresh = () => { void refreshCart(); };
    window.addEventListener("focus", refresh);
    return () => { ++requests.current; window.removeEventListener("focus", refresh); };
  }, [pathname, refreshCart]);

  const value = useMemo(() => ({ cart, isOpen, openCart, refreshCart }), [cart, isOpen, openCart, refreshCart]);
  return <CartContext.Provider value={value}>
    {children}
    <CartDrawer cart={cart} isOpen={isOpen} loading={loading} error={error} addedVariant={addedVariant}
      onClosed={() => setOpen(false)} refreshCart={refreshCart} />
  </CartContext.Provider>;
}
