export type ShopifyMoney = {
  amount: string;
  currencyCode: string;
};

export type ShopifyImage = {
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
};

export type ShopifyQuantityRule = {
  minimum: number;
  maximum: number | null;
  increment: number;
};

export type ShopifyVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  price: ShopifyMoney;
  quantityRule: ShopifyQuantityRule;
};

export type ShopifyProduct = {
  id: string;
  handle: string;
  title: string;
  description: string;
  featuredImage: ShopifyImage | null;
  variants: {
    nodes: ShopifyVariant[];
  };
};

export type ShopifyCart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
};

export type ShopifyCartLine = {
  id: string;
  quantity: number;
  cost: {
    amountPerQuantity: ShopifyMoney;
    totalAmount: ShopifyMoney;
  };
  merchandise: {
    id: string;
    title: string;
    availableForSale: boolean;
    quantityRule: ShopifyQuantityRule;
    image: ShopifyImage | null;
    product: {
      title: string;
      handle: string;
      featuredImage: ShopifyImage | null;
    };
  };
};

export type ShopifyCartDetails = ShopifyCart & {
  cost: {
    subtotalAmount: ShopifyMoney;
    subtotalAmountEstimated: boolean;
  };
  lines: ShopifyCartLine[];
};

export type CartView = Omit<ShopifyCartDetails, "id" | "checkoutUrl">;

export type CartLineActionResult = {
  status: "success" | "warning" | "error";
  message: string;
};

export type ShopifyCartMutationPayload = {
  cart: ShopifyCart | null;
  userErrors: { code: string | null; field: string[] | null; message: string }[];
  warnings: { code: string; message: string; target: string | null }[];
};

export type AddToCartResult = {
  status: "success" | "warning" | "error";
  message: string;
  totalQuantity?: number;
};
