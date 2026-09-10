import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import {
  getCustomerOrder,
  type CustomerMoney,
} from "@/app/lib/shopify/customer-orders";
import { getCustomerProfile } from "@/app/lib/shopify/customers";

export const metadata: Metadata = { title: "Commande | Maison Sörna" };

function formatMoney(money: CustomerMoney | null) {
  if (!money) return "—";
  const amount = Number(money.amount);
  if (!Number.isFinite(amount)) return `${money.amount} ${money.currencyCode}`;
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: money.currencyCode,
  }).format(amount);
}

export default async function CustomerOrderPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const [{ orderId }, customer] = await Promise.all([params, getCustomerProfile()]);
  if (!customer) redirect("/api/auth/shopify/login");

  const order = await getCustomerOrder(orderId);
  if (!order) notFound();

  return (
    <main className="mx-auto w-[calc(100%-2rem)] max-w-[1569px] border-t border-current/20 py-14 md:w-[90.8%] md:py-24">
      <Link href="/compte" className="text-xs tracking-[0.14em] uppercase underline underline-offset-4">
        Retour au compte
      </Link>
      <div className="mt-10 grid gap-10 border-t border-current pt-8 md:grid-cols-[1fr_auto]">
        <div>
          <p className="text-xs tracking-[0.16em] uppercase opacity-60">Commande</p>
          <h1 className="mt-4 font-display text-[clamp(3.5rem,8vw,8rem)] leading-none tracking-[-0.045em]">
            {order.name}
          </h1>
        </div>
        <a href={order.statusPageUrl} className="inline-flex min-h-11 items-center border-b border-current text-sm uppercase tracking-[0.12em]">
          Suivi Shopify
        </a>
      </div>

      <div className="mt-16 grid gap-14 lg:grid-cols-[1.5fr_0.7fr]">
        <section>
          <h2 className="text-xs tracking-[0.16em] uppercase opacity-60">Articles</h2>
          <ul className="mt-6 border-t border-current/20">
            {order.lineItems.map((item) => (
              <li key={item.id} className="grid grid-cols-[1fr_auto] gap-6 border-b border-current/20 py-6">
                <div>
                  <p className="font-display text-2xl">{item.title}</p>
                  {item.variantTitle && <p className="mt-1 text-sm opacity-60">{item.variantTitle}</p>}
                  <p className="mt-3 text-sm">Quantité : {item.quantity}</p>
                </div>
                <p className="tabular-nums">{formatMoney(item.totalPrice)}</p>
              </li>
            ))}
          </ul>
        </section>

        <div className="space-y-12">
          <section className="border-t border-current pt-5">
            <h2 className="text-xs tracking-[0.16em] uppercase opacity-60">Total</h2>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-8"><dt>Sous-total</dt><dd>{formatMoney(order.subtotal)}</dd></div>
              <div className="flex justify-between gap-8"><dt>Livraison</dt><dd>{formatMoney(order.totalShipping)}</dd></div>
              <div className="flex justify-between gap-8"><dt>Taxes</dt><dd>{formatMoney(order.totalTax)}</dd></div>
              <div className="flex justify-between gap-8 border-t border-current/20 pt-4 text-base"><dt>Total</dt><dd>{formatMoney(order.totalPrice)}</dd></div>
            </dl>
          </section>

          <section className="border-t border-current pt-5">
            <h2 className="text-xs tracking-[0.16em] uppercase opacity-60">Livraison</h2>
            {order.shippingAddress ? (
              <address className="mt-5 text-sm leading-6 not-italic opacity-80">
                {order.shippingAddress.name && <span className="block">{order.shippingAddress.name}</span>}
                {order.shippingAddress.formatted.map((line, index) => (
                  <span key={`${index}-${line}`} className="block">{line}</span>
                ))}
              </address>
            ) : <p className="mt-5 text-sm opacity-80">Aucune adresse de livraison.</p>}
          </section>
        </div>
      </div>
    </main>
  );
}
