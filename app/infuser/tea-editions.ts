import type { TeaCardEntry } from "./_components/tea-card-data";
import type { ShopifyProduct } from "@/app/lib/shopify-types";
import { parseTeaDescription } from "@/app/lib/shopify/tea-description";

// Local photographs are previews until the product has an image in Shopify.
export const teaEditions = [
  {
    handle: "pivoine-royale", title: "Pivoine Royale", family: "Thé blanc",
    signature: "La délicatesse de la feuille.", illustration: "02",
    photograph: "/figma/infuser/product/pivoine-royale-feuilles.png", photographAlt: "Feuilles de Pivoine Royale.",
  },
  {
    handle: "brume-des-cimes", title: "Brume des Cimes", family: "Thé vert",
    signature: "La fraîcheur du printemps.", illustration: "01",
    photograph: "/figma/infuser/product/brume-des-cimes-feuilles.png", photographAlt: "Feuilles de Brume des Cimes.",
  },
  {
    handle: "miel-dorchidee", title: "Miel d’Orchidée", family: "Oolong",
    signature: "Une feuille, des notes florales.", illustration: "04",
    photograph: "/figma/infuser/product/miel-dorchidee-feuilles.png", photographAlt: "Feuilles de Miel d’Orchidée.",
  },
  {
    handle: "sourcil-dor", title: "Sourcil d’Or", family: "Thé noir",
    signature: "Toute la profondeur du thé noir.", illustration: "03",
    photograph: "/figma/infuser/product/sourcil-dor-feuilles.png", photographAlt: "Feuilles de Sourcil d’Or.",
  },
  {
    handle: "ecorce-de-feu", title: "Écorce de Feu", family: "Oolong de roche",
    signature: "La roche, le feu et le temps.", illustration: "05",
    photograph: "/figma/infuser/product/ecorce-de-feu-feuilles.png", photographAlt: "Feuilles d’Écorce de Feu.",
  },
] as const;

export function getTeaCardEntry(product: ShopifyProduct): TeaCardEntry | null {
  const edition = teaEditions.find((item) => item.handle === product.handle);
  const description = parseTeaDescription(product.descriptionHtml ?? "", product.description);
  return edition ? {
    ...edition,
    title: product.title,
    photograph: product.featuredImage?.url ?? edition.photograph,
    photographAlt: product.featuredImage?.altText ?? edition.photographAlt,
    teaType: description.teaType ?? product.productType,
    cuvee: description.cuvee,
    origin: description.origin?.split(",")[0] ?? null,
    region: description.origin,
    vintage: description.vintage,
    harvest: description.harvest,
    oxidation: description.oxidation,
    roasting: description.roasting,
    sections: description.sections,
    photographFit: "contain",
    product,
  } : null;
}
