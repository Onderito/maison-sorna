import type { TeaCardEntry } from "./_components/tea-card-data";
import type { ShopifyProduct } from "@/app/lib/shopify-types";

// Editorial presentation only. Prices, variants and availability come from Shopify.
export const teaEditions = [
  {
    handle: "pivoine-royale", title: "Pivoine Royale", family: "Thé blanc",
    signature: "La délicatesse de la feuille.", illustration: "02",
    photograph: "/figma/infuser/product/pivoine-royale-feuilles.png", photographAlt: "Feuilles de Pivoine Royale.",
    teaType: "Thé\nblanc", origin: "Chine", lot: "—", vintage: "—", harvest: "—", region: "Chine",
  },
  {
    handle: "brume-des-cimes", title: "Brume des Cimes", family: "Thé vert",
    signature: "La fraîcheur du printemps.", illustration: "01",
    photograph: "/figma/infuser/product/brume-des-cimes-feuilles.png", photographAlt: "Feuilles de Brume des Cimes.",
    teaType: "Thé\nvert", origin: "Chine", lot: "—", vintage: "—", harvest: "—", region: "Chine",
  },
  {
    handle: "ecorce-de-feu", title: "Écorce de Feu", family: "Oolong de roche",
    signature: "La roche, le feu et le temps.", illustration: "05",
    photograph: "/figma/infuser/product/ecorce-de-feu-feuilles.png", photographAlt: "Feuilles d’Écorce de Feu.",
    teaType: "Oolong\nde roche", origin: "Monts Wuyi", lot: "—", vintage: "—", harvest: "—", region: "Monts Wuyi\nFujian - Chine",
  },
  {
    handle: "miel-dorchidee", title: "Miel d’Orchidée", family: "Oolong",
    signature: "Une feuille, des notes florales.", illustration: "04",
    photograph: "/figma/infuser/product/miel-dorchidee-feuilles.png", photographAlt: "Feuilles de Miel d’Orchidée.",
    teaType: "Oolong", origin: "Chine", lot: "—", vintage: "—", harvest: "—", region: "Chine",
  },
  {
    handle: "sourcil-dor", title: "Sourcil d’Or", family: "Thé noir",
    signature: "Toute la profondeur du thé noir.", illustration: "03",
    photograph: "/figma/infuser/product/sourcil-dor-feuilles.png", photographAlt: "Feuilles de Sourcil d’Or.",
    teaType: "Thé\nnoir", origin: "Village\nde Tongmu", lot: "01", vintage: "2026", harvest: "2024", region: "Monts Wuyi\nFujian - Chine",
  },
] as const;

export function getTeaCardEntry(product: ShopifyProduct): TeaCardEntry | null {
  const edition = teaEditions.find((item) => item.handle === product.handle);
  return edition ? { ...edition, title: product.title, photographFit: "contain", product } : null;
}
