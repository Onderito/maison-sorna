import type { ShopifyCartMutationPayload } from "@/app/lib/shopify-types";

type CartUserError = ShopifyCartMutationPayload["userErrors"][number];
type CartWarning = ShopifyCartMutationPayload["warnings"][number];

export function getCartErrorMessage(errors: CartUserError[]) {
  const codes = new Set(errors.map((error) => error.code));

  if (codes.has("INVALID_MERCHANDISE_LINE")) {
    return "Cet article n’est plus présent dans le panier.";
  }
  if (codes.has("MERCHANDISE_NOT_APPLICABLE")) {
    return "Cet article n’est plus disponible dans cette configuration.";
  }
  if (codes.has("INVALID_INCREMENT")) {
    return "Cette quantité ne respecte pas le pas de commande de cet article.";
  }
  if (codes.has("MINIMUM_NOT_MET")) {
    return "La quantité choisie est inférieure au minimum autorisé.";
  }
  if (codes.has("MAXIMUM_EXCEEDED") || codes.has("LESS_THAN")) {
    return "La quantité choisie dépasse le maximum autorisé.";
  }
  if (codes.has("CART_TOO_LARGE")) {
    return "Le panier contient trop d’articles pour être mis à jour.";
  }
  if (codes.has("SERVICE_UNAVAILABLE")) {
    return "Shopify est momentanément indisponible. Réessaie dans un instant.";
  }

  return "Shopify n’a pas pu modifier le panier. Vérifie son contenu et réessaie.";
}

export function getCartWarningMessage(warnings: CartWarning[]) {
  const codes = new Set(warnings.map((warning) => warning.code));

  if (codes.has("MERCHANDISE_OUT_OF_STOCK")) {
    return "Cet article est maintenant en rupture de stock et le panier a été actualisé.";
  }
  if (codes.has("MERCHANDISE_NOT_ENOUGH_STOCK")) {
    return "La quantité a été ajustée au stock actuellement disponible.";
  }

  return "Le panier a été actualisé par Shopify. Vérifie les quantités avant de continuer.";
}
