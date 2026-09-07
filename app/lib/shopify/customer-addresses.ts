import "server-only";

import { customerAccountFetch } from "@/app/lib/shopify/customers";

export type CustomerAddress = {
  id: string;
  isDefault: boolean;
  name: string | null;
  company: string | null;
  formatted: string[];
  phoneNumber: string | null;
};

const customerAddressesQuery = `
  query CustomerAddresses {
    customer {
      defaultAddress { id }
      addresses(first: 20) {
        nodes {
          id
          name
          company
          formatted
          phoneNumber
        }
      }
    }
  }
`;

function optionalString(value: unknown) {
  return value === null || typeof value === "string";
}

export async function getCustomerAddresses(): Promise<CustomerAddress[] | null> {
  const data = await customerAccountFetch<{
    customer?: {
      defaultAddress?: { id?: unknown } | null;
      addresses?: { nodes?: unknown[] };
    };
  }>({
    operationName: "CustomerAddresses",
    query: customerAddressesQuery,
  });
  if (!data) return null;

  const customer = data.customer;
  const nodes = customer?.addresses?.nodes;
  const defaultAddressId = customer?.defaultAddress?.id;
  if (
    !customer ||
    !Array.isArray(nodes) ||
    (defaultAddressId !== undefined && typeof defaultAddressId !== "string")
  ) {
    throw new Error("Shopify a renvoyé une liste d’adresses invalide.");
  }

  return nodes.map((node) => {
    if (!node || typeof node !== "object") {
      throw new Error("Shopify a renvoyé une adresse invalide.");
    }

    const address = node as Record<string, unknown>;
    if (
      typeof address.id !== "string" ||
      !optionalString(address.name) ||
      !optionalString(address.company) ||
      !Array.isArray(address.formatted) ||
      !address.formatted.every((line) => typeof line === "string") ||
      !optionalString(address.phoneNumber)
    ) {
      throw new Error("Shopify a renvoyé une adresse invalide.");
    }

    return {
      id: address.id,
      isDefault: address.id === defaultAddressId,
      name: address.name,
      company: address.company,
      formatted: address.formatted,
      phoneNumber: address.phoneNumber,
    };
  });
}
