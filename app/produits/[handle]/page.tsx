import { getProduct } from "@/app/lib/shopify/products";
import { getCart } from "@/app/actions/cart";
import { notFound } from "next/navigation";
import Image from "next/image";
import ProductVariantSelector from "@/components/product-variant-selector";
import Link from "next/link";
import TeaCard from "@/app/infuser/_components/tea-card";
import { getTeaCardEntry } from "@/app/infuser/tea-editions";
import SiteFooter from "@/components/site-footer";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;

  const product = await getProduct(handle);

  if (product === null) {
    notFound();
  }

  const teaEntry = getTeaCardEntry(product);
  if (teaEntry) {
    return <>
      <main className="pt-4">
        <div className="site-container flex flex-wrap items-center justify-between gap-4 px-1 pb-2 text-base">
          <Link href="/infuser#les-cuvees" className="inline-flex min-h-11 items-center gap-3 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4"><span aria-hidden="true">←</span> Les cinq cuvées</Link>
          <p className="font-display text-xl uppercase text-[#838d76]">Les Cinq Sommets</p>
        </div>
        <h1 className="sr-only">{product.title}</h1>
        <TeaCard entry={teaEntry} />
      </main>
      <SiteFooter />
    </>;
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
