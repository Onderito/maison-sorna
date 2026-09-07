"use client";

import Link from "next/link";

import { useCustomerSession } from "@/components/customer-session-provider";

const linkClassName =
  "inline-flex min-h-11 items-center justify-center whitespace-nowrap text-xs uppercase tracking-[0.08em] transition-opacity hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current active:opacity-50 motion-reduce:transition-none md:text-sm";

export default function CustomerAccountLink() {
  const authenticated = useCustomerSession();

  if (!authenticated) {
    return (
      <a
        href="/api/auth/shopify/login"
        className={linkClassName}
      >
        Se connecter
      </a>
    );
  }

  return (
    <div className="flex items-center gap-4 lg:gap-6">
      <Link href="/compte" prefetch={false} className={linkClassName}>
        Mon compte
      </Link>
      <a
        href="/api/auth/shopify/logout"
        className={`${linkClassName} hidden md:inline-flex`}
      >
        Se déconnecter
      </a>
    </div>
  );
}
