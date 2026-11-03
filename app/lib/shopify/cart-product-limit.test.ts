import { describe, expect, it } from "vitest";
import type { ShopifyCartLine } from "@/app/lib/shopify-types";
import { CART_PRODUCT_LIMIT, exceedsCartProductLimit, getProductCartQuantity } from "./cart-product-limit";

function line(id: string, handle: string, quantity: number): ShopifyCartLine {
  return {
    id, quantity,
    cost: { amountPerQuantity: { amount: "10", currencyCode: "EUR" }, totalAmount: { amount: String(quantity * 10), currencyCode: "EUR" } },
    merchandise: {
      id: `variant-${id}`, title: id, availableForSale: true,
      quantityRule: { minimum: 1, maximum: null, increment: 1 }, image: null,
      product: { title: handle, handle, featuredImage: null },
    },
  };
}

describe("limite par produit du panier", () => {
  it("cumule les formats et les lignes du même produit", () => {
    const lines = [line("50g", "the-blanc", 1), line("100g", "the-blanc", 1), line("other", "the-vert", 2)];
    expect(getProductCartQuantity(lines, "the-blanc")).toBe(CART_PRODUCT_LIMIT);
    expect(exceedsCartProductLimit(lines)).toBe(false);
    expect(exceedsCartProductLimit([...lines, line("third", "the-blanc", 1)])).toBe(true);
  });
  it("exclut la ligne modifiée pour compter sa nouvelle quantité une seule fois", () => {
    const lines = [line("a", "the-blanc", 1), line("b", "the-blanc", 1)];
    const otherFormats = getProductCartQuantity(lines, "the-blanc", "a");
    expect(otherFormats + 1 <= CART_PRODUCT_LIMIT).toBe(true);
    expect(otherFormats + 2 <= CART_PRODUCT_LIMIT).toBe(false);
  });
  it("détecte les anciens paniers au-dessus de la limite et autorise un panier vide", () => {
    expect(exceedsCartProductLimit([line("a", "the-blanc", 3)])).toBe(true);
    expect(exceedsCartProductLimit([])).toBe(false);
    expect(getProductCartQuantity([], "the-blanc")).toBe(0);
  });
});
