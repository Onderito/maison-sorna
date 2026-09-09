import { describe, expect, it } from "vitest";

import {
  getCartErrorMessage,
  getCartWarningMessage,
} from "./cart-feedback";

function cartError(code: string | null, message = "technical Shopify message") {
  return { code, field: null, message };
}

function cartWarning(code: string, message = "technical Shopify warning") {
  return { code, message, target: null };
}

describe("getCartErrorMessage", () => {
  it.each([
    ["INVALID_MERCHANDISE_LINE", "Cet article n’est plus présent dans le panier."],
    ["MERCHANDISE_NOT_APPLICABLE", "Cet article n’est plus disponible dans cette configuration."],
    ["INVALID_INCREMENT", "Cette quantité ne respecte pas le pas de commande de cet article."],
    ["MINIMUM_NOT_MET", "La quantité choisie est inférieure au minimum autorisé."],
    ["MAXIMUM_EXCEEDED", "La quantité choisie dépasse le maximum autorisé."],
    ["SERVICE_UNAVAILABLE", "Shopify est momentanément indisponible. Réessaie dans un instant."],
  ])("traduit le code Shopify %s", (code, expected) => {
    expect(getCartErrorMessage([cartError(code)])).toBe(expected);
  });

  it("ne présente pas un message Shopify inconnu au client", () => {
    const message = getCartErrorMessage([cartError("UNKNOWN", "internal detail")]);

    expect(message).not.toContain("internal detail");
    expect(message).toContain("Shopify n’a pas pu modifier le panier");
  });
});

describe("getCartWarningMessage", () => {
  it("priorise une rupture de stock", () => {
    expect(getCartWarningMessage([
      cartWarning("MERCHANDISE_NOT_ENOUGH_STOCK"),
      cartWarning("MERCHANDISE_OUT_OF_STOCK"),
    ])).toContain("rupture de stock");
  });

  it("explique une quantité réduite au stock disponible", () => {
    expect(getCartWarningMessage([
      cartWarning("MERCHANDISE_NOT_ENOUGH_STOCK"),
    ])).toContain("ajustée au stock");
  });
});
