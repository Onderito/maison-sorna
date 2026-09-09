import { describe, expect, it } from "vitest";

import { getCartLineQuantityError } from "./cart-validation";

function line({
  quantity = 2,
  availableForSale = true,
  minimum = 1,
  maximum = null,
  increment = 1,
}: {
  quantity?: number;
  availableForSale?: boolean;
  minimum?: number;
  maximum?: number | null;
  increment?: number;
} = {}) {
  return {
    quantity,
    merchandise: {
      availableForSale,
      quantityRule: { minimum, maximum, increment },
    },
  };
}

describe("getCartLineQuantityError", () => {
  it("accepte une quantité conforme aux règles Shopify", () => {
    expect(getCartLineQuantityError(
      line({ minimum: 2, maximum: 8, increment: 2 }),
      6,
    )).toBeNull();
  });

  it("refuse une quantité sous le minimum", () => {
    expect(getCartLineQuantityError(line({ minimum: 2 }), 1)).toContain("minimale");
  });

  it("refuse une quantité au-dessus du maximum", () => {
    expect(getCartLineQuantityError(line({ maximum: 4 }), 5)).toContain("maximale");
  });

  it("refuse une quantité qui ne respecte pas l’incrément", () => {
    expect(getCartLineQuantityError(line({ increment: 2 }), 3)).toContain("multiple de 2");
  });

  it("empêche d’augmenter une variante devenue indisponible", () => {
    expect(getCartLineQuantityError(
      line({ quantity: 2, availableForSale: false }),
      3,
    )).toContain("plus disponible");
  });

  it("autorise la diminution d’une variante devenue indisponible", () => {
    expect(getCartLineQuantityError(
      line({ quantity: 2, availableForSale: false }),
      1,
    )).toBeNull();
  });
});
