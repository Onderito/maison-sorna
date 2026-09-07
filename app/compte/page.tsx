import type { Metadata } from "next";
import Link from "next/link";

import { getCustomerProfile } from "@/app/lib/shopify/customers";

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

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ erreur?: string }>;
}) {
  const [{ erreur }, customer] = await Promise.all([searchParams, getCustomerProfile()]);
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
              <p className="mt-5 max-w-md text-base leading-7 opacity-75">
                Votre historique de commandes apparaîtra ici lors de la prochaine étape.
              </p>
              <Link
                href="/api/auth/shopify/logout"
                prefetch={false}
                className="mt-10 inline-flex min-h-12 items-center border-b border-current text-sm tracking-[0.12em] uppercase transition-opacity hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current active:opacity-50 motion-reduce:transition-none"
              >
                Se déconnecter
              </Link>
            </div>
          ) : (
            <div>
              <p className="max-w-md text-base leading-7 opacity-75">
                Connectez-vous pour retrouver vos informations et, bientôt, vos commandes Maison Sörna.
              </p>
              {erreur === "authentification" && (
                <p className="mt-6 border-l border-current pl-4 text-sm leading-6" role="alert">
                  La connexion n’a pas pu être terminée. Veuillez recommencer.
                </p>
              )}
              <Link
                href="/api/auth/shopify/login"
                prefetch={false}
                className="mt-10 inline-flex min-h-12 items-center border-b border-current text-sm tracking-[0.12em] uppercase transition-opacity hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current active:opacity-50 motion-reduce:transition-none"
              >
                Se connecter
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
