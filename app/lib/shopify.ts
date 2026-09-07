export async function shopifyFetch(
  query: string,
  variables = {},
  options: { cache?: RequestCache } = {},
) {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const storefrontAccessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

  if (!domain) {
    throw new Error("La variable SHOPIFY_STORE_DOMAIN est manquante.");
  }

  if (!storefrontAccessToken) {
    throw new Error("La variable SHOPIFY_STOREFRONT_ACCESS_TOKEN est manquante.");
  }

  const response = await fetch(`https://${domain}/api/2026-07/graphql.json`, {
    method: "POST",
    cache: options.cache,

    headers: {
      "Content-Type": "application/json",
      "Shopify-Storefront-Private-Token": storefrontAccessToken,
    },

    body: JSON.stringify({
      query,
      variables,
    }),
  });

  if (!response.ok) {
    throw new Error(`La requête Shopify a échoué (HTTP ${response.status}).`);
  }

  const result = await response.json();

  if (result.errors?.length) {
    throw new Error("Shopify a renvoyé une erreur GraphQL.", {
      cause: result.errors,
    });
  }

  return result;
}

export const getProductsQuery = `
  query GetProducts {
    products(first: 5) {
      nodes {
        id
        title
        handle
        description
        priceRange {
  minVariantPrice {
    amount
    currencyCode
  }
}
  featuredImage {
  url
  altText
  width
  height
}
      }
    }
  }
`;

export const getProductQuery = `
query GetProduct($handle: String!) {
  product(handle: $handle) {
    id
    title
    handle
    description

    featuredImage {
      url
      altText
      width
      height
    }

    variants(first: 10) {
      nodes {
        id
        title
        availableForSale

        price {
          amount
          currencyCode
        }

        selectedOptions {
          name
          value
        }
      }
    }
  }
}
`;

export const createCartMutation = `
  mutation CreateCart {
    cartCreate {
      cart {
        id
        checkoutUrl
        totalQuantity
      }
      userErrors {
        field
        message
      }
      warnings {
        code
        message
      }
    }
  }
`;

export const addToCartMutation = `
  mutation AddToCart(
    $cartId: ID!
    $merchandiseId: ID!
  ) {
    cartLinesAdd(
      cartId: $cartId
      lines: [
        {
          merchandiseId: $merchandiseId
          quantity: 1
        }
      ]
    ) {
      cart {
        id
        checkoutUrl
        totalQuantity
      }

      userErrors {
        field
        message
      }
      warnings {
        code
        message
      }
    }
  }
`;

export const getCartQuery = `
  query GetCart($cartId: ID!) {
    cart(id: $cartId) {
      id
      checkoutUrl
      totalQuantity
    }
  }
`;
