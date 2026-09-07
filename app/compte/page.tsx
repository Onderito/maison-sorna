import type { Metadata } from "next";

import {
  getCustomerAddresses,
  type CustomerAddress,
} from "@/app/lib/shopify/customer-addresses";
import {
  getCustomerOrders,
  getOrderRouteId,
  type CustomerOrder,
} from "@/app/lib/shopify/customer-orders";
import {
  getCustomerProfile,
} from "@/app/lib/shopify/customers";
import Link from "next/link";

export const metadata: Metadata = { title: "Compte | Maison Sörna" };

function capitalize(value: string) {
  return value.charAt(0).toLocaleUpperCase("fr-FR") + value.slice(1);
}

function getGreetingName(customer: Awaited<ReturnType<typeof getCustomerProfile>>) {
  if (!customer) return null;

  const firstName = customer.firstName?.trim();
  if (firstName) return firstName;

  const emailName = customer.emailAddress
    ?.split("@")[0]
    ?.split(/[._+-]+/)[0]
    ?.trim();
  if (emailName) return capitalize(emailName);

  return capitalize(customer.displayName.trim().split(/\s+/)[0] || "vous");
}

const financialStatusLabels: Record<string, string> = {
  AUTHORIZED: "Autorisée",
  EXPIRED: "Expirée",
  PAID: "Payée",
  PARTIALLY_PAID: "Partiellement payée",
  PARTIALLY_REFUNDED: "Partiellement remboursée",
  PENDING: "Paiement en attente",
  REFUNDED: "Remboursée",
  VOIDED: "Annulée",
};

const fulfillmentStatusLabels: Record<string, string> = {
  FULFILLED: "Expédiée",
  IN_PROGRESS: "En préparation",
  ON_HOLD: "En attente",
  OPEN: "À préparer",
  PARTIALLY_FULFILLED: "Partiellement expédiée",
  PENDING_FULFILLMENT: "En attente de préparation",
  RESTOCKED: "Remise en stock",
  SCHEDULED: "Planifiée",
  UNFULFILLED: "À préparer",
};

function formatOrderDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatOrderPrice(order: CustomerOrder) {
  const amount = Number(order.totalPrice.amount);
  if (!Number.isFinite(amount)) return `${order.totalPrice.amount} ${order.totalPrice.currencyCode}`;

  try {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: order.totalPrice.currencyCode,
    }).format(amount);
  } catch {
    return `${order.totalPrice.amount} ${order.totalPrice.currencyCode}`;
  }
}

function OrderHistory({ orders }: { orders: CustomerOrder[] }) {
  if (orders.length === 0) {
    return (
      <p className="mt-5 max-w-md text-base leading-7 opacity-75">
        Vous n’avez pas encore passé de commande avec ce compte.
      </p>
    );
  }

  return (
    <ol className="mt-6 border-t border-current/20">
      {orders.map((order) => (
        <li key={order.id} className="grid gap-5 border-b border-current/20 py-6 sm:grid-cols-[1fr_auto]">
          <div>
            <p className="font-display text-2xl tracking-[-0.02em]">{order.name}</p>
            <p className="mt-1 text-sm opacity-60">{formatOrderDate(order.processedAt)}</p>
            <p className="mt-4 text-sm leading-6">
              {financialStatusLabels[order.financialStatus ?? ""] ??
                order.financialStatus ??
                "Paiement non renseigné"}
              <span aria-hidden="true" className="mx-2 opacity-40">/</span>
              {fulfillmentStatusLabels[order.fulfillmentStatus] ?? order.fulfillmentStatus}
            </p>
          </div>
          <div className="flex flex-col items-start gap-4 sm:items-end sm:text-right">
            <p className="text-base tabular-nums">{formatOrderPrice(order)}</p>
            {getOrderRouteId(order.id) ? <Link
              href={`/compte/commandes/${getOrderRouteId(order.id)}`}
              className="inline-flex min-h-10 items-center border-b border-current text-xs tracking-[0.12em] uppercase transition-opacity hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current active:opacity-50 motion-reduce:transition-none"
            >
              Voir la commande
            </Link> : <a href={order.statusPageUrl}>Voir la commande</a>}
          </div>
        </li>
      ))}
    </ol>
  );
}

function AddressBook({ addresses }: { addresses: CustomerAddress[] }) {
  if (addresses.length === 0) {
    return (
      <p className="mt-5 max-w-md text-base leading-7 opacity-75">
        Aucune adresse n’est encore enregistrée sur ce compte.
      </p>
    );
  }

  return (
    <ol className="mt-6 grid border-t border-current/20 md:grid-cols-2">
      {addresses.map((address, index) => (
        <li
          key={address.id}
          className={`border-b border-current/20 py-6 md:px-8 ${index % 2 === 0 ? "md:border-r md:pl-0" : "md:pr-0"}`}
        >
          <div className="flex items-baseline justify-between gap-6">
            <p className="font-display text-2xl tracking-[-0.02em]">
              {address.name || `Adresse ${index + 1}`}
            </p>
            {address.isDefault && (
              <p className="text-[0.65rem] tracking-[0.14em] uppercase opacity-60">Par défaut</p>
            )}
          </div>
          <address className="mt-4 text-sm leading-6 not-italic opacity-75">
            {address.company && <span className="block">{address.company}</span>}
            {address.formatted.map((line, lineIndex) => (
              <span key={`${lineIndex}-${line}`} className="block">{line}</span>
            ))}
            {address.phoneNumber && <span className="mt-2 block">{address.phoneNumber}</span>}
          </address>
        </li>
      ))}
    </ol>
  );
}

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ erreur?: string }>;
}) {
  const [{ erreur }, customer, orders, addresses] = await Promise.all([
    searchParams,
    getCustomerProfile(),
    getCustomerOrders(),
    getCustomerAddresses(),
  ]);
  const greetingName = getGreetingName(customer);

  return (
    <main className="mx-auto w-[calc(100%-2rem)] max-w-[1569px] border-t border-current/20 py-14 md:w-[90.8%] md:py-24">
      <p className="text-xs tracking-[0.18em] uppercase">Espace personnel</p>
      <div className="mt-12 grid gap-12 border-t border-current/20 pt-8 md:grid-cols-[minmax(0,1fr)_minmax(18rem,0.65fr)] md:gap-20 md:pt-12">
        <h1 className="max-w-4xl font-display text-[clamp(3.5rem,9vw,9rem)] leading-[0.82] tracking-[-0.045em]">
          {greetingName ? `Bonjour, ${greetingName}` : "Votre compte"}
        </h1>

        <div className="border-t border-current pt-6">
          {customer ? (
            <div>
              <p className="text-xs tracking-[0.16em] uppercase opacity-60">Commandes</p>
              <OrderHistory orders={orders ?? []} />
              <a
                href="/api/auth/shopify/logout"
                className="mt-10 inline-flex min-h-12 items-center border-b border-current text-sm tracking-[0.12em] uppercase transition-opacity hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current active:opacity-50 motion-reduce:transition-none"
              >
                Se déconnecter
              </a>
            </div>
          ) : (
            <div>
              <p className="max-w-md text-base leading-7 opacity-75">
                Connectez-vous pour retrouver vos informations et vos commandes Maison Sörna.
              </p>
              {erreur === "authentification" && (
                <p className="mt-6 border-l border-current pl-4 text-sm leading-6" role="alert">
                  La connexion n’a pas pu être terminée. Veuillez recommencer.
                </p>
              )}
              <a
                href="/api/auth/shopify/login"
                className="mt-10 inline-flex min-h-12 items-center border-b border-current text-sm tracking-[0.12em] uppercase transition-opacity hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current active:opacity-50 motion-reduce:transition-none"
              >
                Se connecter
              </a>
            </div>
          )}
        </div>
      </div>
      {customer && (
        <section className="mt-20 border-t border-current pt-6 md:mt-28">
          <p className="text-xs tracking-[0.16em] uppercase opacity-60">Adresses</p>
          <AddressBook addresses={addresses ?? []} />
        </section>
      )}
    </main>
  );
}
