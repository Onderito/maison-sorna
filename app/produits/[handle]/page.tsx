import { getProductQuery, shopifyFetch } from "@/app/lib/shopify";
import type { ShopifyProduct } from "@/app/lib/shopify-types";
import { getCart } from "@/app/actions/cart";
import { notFound } from "next/navigation";
import Image from "next/image";
import ProductVariantSelector from "@/components/product-variant-selector";
import Link from "next/link";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;

  const response = await shopifyFetch(getProductQuery, {
    handle,
  });

  if (!response.data || !("product" in response.data)) {
    throw new Error(
      "La réponse Shopify ne contient pas le champ product attendu.",
    );
  }

  const product: ShopifyProduct | null = response.data.product;

  if (product === null) {
    notFound();
  }

  const cart = await getCart();

  return (
    <main className="mx-auto w-full max-w-3xl space-y-8 px-6 py-12">
      <header className="space-y-4">
        <h1 className="text-3xl">{product.title}</h1>
        <p className="whitespace-pre-line opacity-80">{product.description}</p>
      </header>

      {product.featuredImage && (
        <div className="image-grain">
        <Image
          src={product.featuredImage.url}
          alt={product.featuredImage.altText ?? product.title}
          width={product.featuredImage.width ?? 800}
          height={product.featuredImage.height ?? 800}
          sizes="(max-width: 768px) calc(100vw - 48px), 720px"
          className="h-96 w-full object-cover"
        />
        </div>
      )}

      <ProductVariantSelector
        key={product.id}
        variants={product.variants.nodes}
      />

      {cart && cart.totalQuantity > 0 && (
        <Link href="/panier" prefetch={false} className="inline-flex min-h-11 items-center underline underline-offset-4">
          Voir le panier
        </Link>
      )}
    </main>
  );
}
