"use client";

import { useCart } from "./cart-provider";

export default function CartButton({ className, onClick }: { className?: string; onClick?: () => void }) {
  const { cart, isOpen, openCart } = useCart();
  const count = cart?.totalQuantity ?? 0;
  return <button type="button" className={className} aria-haspopup="dialog" aria-expanded={isOpen}
    aria-label={`Ouvrir le panier${count ? `, ${count} ${count > 1 ? "articles" : "article"}` : ""}`}
    onClick={() => { if (onClick) onClick(); else void openCart(); }}>
    Panier{count > 0 && <> <span>({count})</span></>}
  </button>;
}
