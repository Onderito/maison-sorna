"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const linkClassName =
  "inline-flex min-h-11 items-center justify-center whitespace-nowrap text-xs uppercase tracking-[0.08em] transition-opacity hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current active:opacity-50 motion-reduce:transition-none md:text-sm";

export default function CustomerAccountLink() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function readSession() {
      try {
        const response = await fetch("/api/auth/shopify/status", {
          cache: "no-store",
          signal: controller.signal,
        });
        const result = (await response.json()) as { authenticated?: unknown };

        if (response.ok && typeof result.authenticated === "boolean") {
          setAuthenticated(result.authenticated);
        }
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          console.error("Impossible de vérifier la session client.", error);
        }
      }
    }

    void readSession();
    return () => controller.abort();
  }, []);

  if (authenticated === null) {
    return <span className="block h-11 w-[5.5rem] md:w-[13rem]" aria-hidden="true" />;
  }

  if (!authenticated) {
    return (
      <Link
        href="/api/auth/shopify/login"
        prefetch={false}
        className={linkClassName}
      >
        Se connecter
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-4 lg:gap-6">
      <Link href="/compte" prefetch={false} className={linkClassName}>
        Mon compte
      </Link>
      <Link
        href="/api/auth/shopify/logout"
        prefetch={false}
        className={`${linkClassName} hidden md:inline-flex`}
      >
        Se déconnecter
      </Link>
    </div>
  );
}
