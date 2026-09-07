import "server-only";

import { customerAccountFetch } from "@/app/lib/shopify/customers";

export type CustomerMoney = {
  amount: string;
  currencyCode: string;
};

export type CustomerOrder = {
  id: string;
  name: string;
  processedAt: string;
  financialStatus: string | null;
  fulfillmentStatus: string;
  statusPageUrl: string;
  totalPrice: CustomerMoney;
};

export type CustomerOrderDetail = CustomerOrder & {
  subtotal: CustomerMoney | null;
  totalShipping: CustomerMoney;
  totalTax: CustomerMoney | null;
  shippingAddress: {
    name: string | null;
    formatted: string[];
  } | null;
  lineItems: {
    id: string;
    title: string;
    variantTitle: string | null;
    quantity: number;
    totalPrice: CustomerMoney | null;
  }[];
};

const orderSummaryFields = `
  id
  name
  processedAt
  financialStatus
  fulfillmentStatus
  statusPageUrl
  totalPrice { amount currencyCode }
`;

function isHttpsUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function parseMoney(value: unknown, nullable = false): CustomerMoney | null {
  if (value === null && nullable) return null;
  if (!value || typeof value !== "object") {
    throw new Error("Shopify a renvoyé un montant de commande invalide.");
  }

  const money = value as Record<string, unknown>;
  if (typeof money.amount !== "string" || typeof money.currencyCode !== "string") {
    throw new Error("Shopify a renvoyé un montant de commande invalide.");
  }
  return { amount: money.amount, currencyCode: money.currencyCode };
}

function parseOrderSummary(value: unknown): CustomerOrder {
  if (!value || typeof value !== "object") {
    throw new Error("Shopify a renvoyé une commande invalide.");
  }

  const order = value as Record<string, unknown>;
  if (
    typeof order.id !== "string" ||
    typeof order.name !== "string" ||
    typeof order.processedAt !== "string" ||
    (order.financialStatus !== null && typeof order.financialStatus !== "string") ||
    typeof order.fulfillmentStatus !== "string" ||
    !isHttpsUrl(order.statusPageUrl)
  ) {
    throw new Error("Shopify a renvoyé une commande invalide.");
  }

  return {
    id: order.id,
    name: order.name,
    processedAt: order.processedAt,
    financialStatus: order.financialStatus,
    fulfillmentStatus: order.fulfillmentStatus,
    statusPageUrl: order.statusPageUrl,
    totalPrice: parseMoney(order.totalPrice) as CustomerMoney,
  };
}

export function getOrderRouteId(orderId: string) {
  const match = /^gid:\/\/shopify\/Order\/(\d+)$/.exec(orderId);
  return match?.[1] ?? null;
}

export async function getCustomerOrders(): Promise<CustomerOrder[] | null> {
  const data = await customerAccountFetch<{
    customer?: { orders?: { nodes?: unknown[] } };
  }>({
    operationName: "CustomerOrders",
    query: `query CustomerOrders {
      customer {
        orders(first: 20, sortKey: PROCESSED_AT, reverse: true) {
          nodes { ${orderSummaryFields} }
        }
      }
    }`,
  });
  if (!data) return null;

  const nodes = data.customer?.orders?.nodes;
  if (!Array.isArray(nodes)) {
    throw new Error("Shopify a renvoyé un historique de commandes invalide.");
  }
  return nodes.map(parseOrderSummary);
}

export async function getCustomerOrder(orderRouteId: string): Promise<CustomerOrderDetail | null> {
  if (!/^\d+$/.test(orderRouteId)) return null;

  const data = await customerAccountFetch<{ order?: Record<string, unknown> | null }>({
    operationName: "CustomerOrder",
    query: `query CustomerOrder($id: ID!) {
      order(id: $id) {
        ${orderSummaryFields}
        subtotal { amount currencyCode }
        totalShipping { amount currencyCode }
        totalTax { amount currencyCode }
        shippingAddress { name formatted }
        lineItems(first: 100) {
          nodes {
            id
            title
            variantTitle
            quantity
            totalPrice { amount currencyCode }
          }
        }
      }
    }`,
    variables: { id: `gid://shopify/Order/${orderRouteId}` },
  });
  if (!data?.order) return null;

  const summary = parseOrderSummary(data.order);
  const items = (data.order.lineItems as { nodes?: unknown[] } | undefined)?.nodes;
  const address = data.order.shippingAddress;
  if (!Array.isArray(items)) throw new Error("Shopify a renvoyé des articles de commande invalides.");
  if (address !== null && (!address || typeof address !== "object")) {
    throw new Error("Shopify a renvoyé une adresse de livraison invalide.");
  }

  const shippingAddress = address as Record<string, unknown> | null;
  if (
    shippingAddress &&
    ((shippingAddress.name !== null && typeof shippingAddress.name !== "string") ||
      !Array.isArray(shippingAddress.formatted) ||
      !shippingAddress.formatted.every((line) => typeof line === "string"))
  ) {
    throw new Error("Shopify a renvoyé une adresse de livraison invalide.");
  }

  return {
    ...summary,
    subtotal: parseMoney(data.order.subtotal, true),
    totalShipping: parseMoney(data.order.totalShipping) as CustomerMoney,
    totalTax: parseMoney(data.order.totalTax, true),
    shippingAddress: shippingAddress ? {
      name: shippingAddress.name as string | null,
      formatted: shippingAddress.formatted as string[],
    } : null,
    lineItems: items.map((item) => {
      if (!item || typeof item !== "object") throw new Error("Shopify a renvoyé un article invalide.");
      const line = item as Record<string, unknown>;
      if (
        typeof line.id !== "string" ||
        typeof line.title !== "string" ||
        (line.variantTitle !== null && typeof line.variantTitle !== "string") ||
        !Number.isInteger(line.quantity) ||
        Number(line.quantity) < 1
      ) {
        throw new Error("Shopify a renvoyé un article invalide.");
      }
      return {
        id: line.id,
        title: line.title,
        variantTitle: line.variantTitle as string | null,
        quantity: Number(line.quantity),
        totalPrice: parseMoney(line.totalPrice, true),
      };
    }),
  };
}
