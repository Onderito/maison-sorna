import type { ShopifyProduct } from "@/app/lib/shopify-types";
import type { TeaDescriptionSection } from "@/app/lib/shopify/tea-description";

export type TeaCardEntry = {
  handle: string;
  title: string;
  photograph: string;
  photographAlt: string;
  photographFit?: "contain" | "cover";
  teaType: string;
  origin: string | null;
  cuvee: string | null;
  vintage: string | null;
  harvest: string | null;
  region: string | null;
  oxidation: string | null;
  roasting: string | null;
  sections: TeaDescriptionSection[];
  product: ShopifyProduct | null;
};
