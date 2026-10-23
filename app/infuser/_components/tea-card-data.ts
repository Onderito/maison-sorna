import type { ShopifyProduct } from "@/app/lib/shopify-types";

export type TeaCardEntry = {
  handle: string;
  title: string;
  photograph: string;
  photographAlt: string;
  photographFit?: "contain" | "cover";
  teaType: string;
  origin: string;
  lot: string;
  vintage: string;
  harvest: string;
  region: string;
  product: ShopifyProduct | null;
};
