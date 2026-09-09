import type { ShopifyQuantityRule } from "@/app/lib/shopify-types";

type CartLineQuantityContext = {
  quantity: number;
  merchandise: {
    availableForSale: boolean;
    quantityRule: ShopifyQuantityRule;
  };
};

export function getCartLineQuantityError(
  line: CartLineQuantityContext,
  quantity: number,
) {
  const { minimum, maximum, increment } = line.merchandise.quantityRule;

  if (!line.merchandise.availableForSale && quantity > line.quantity) {
    return "Cet article n’est plus disponible en quantité supplémentaire.";
  }
  if (quantity < minimum) {
    return `La quantité minimale pour cet article est ${minimum}.`;
  }
  if (maximum !== null && quantity > maximum) {
    return `La quantité maximale pour cet article est ${maximum}.`;
  }
  if (quantity % increment !== 0) {
    return `Cet article doit être commandé par multiple de ${increment}.`;
  }

  return null;
}
