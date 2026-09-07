"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type CustomerAccountLinkProps = {
  assets: string;
  iconClass: string;
  overlay: boolean;
};

export default function CustomerAccountLink({
  assets,
  iconClass,
  overlay,
}: CustomerAccountLinkProps) {
  const [authenticated, setAuthenticated] = useState(false);

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

  const label = authenticated ? "Se déconnecter" : "Se connecter";
  const href = authenticated
    ? "/api/auth/shopify/logout"
    : "/api/auth/shopify/login";

  return (
    <Link
      href={href}
      prefetch={false}
      aria-label={label}
      title={label}
      className="flex min-h-11 min-w-11 items-center justify-center gap-2 transition-transform duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current active:scale-[0.96] motion-reduce:transform-none motion-reduce:transition-none"
    >
      <Image
        src={`${assets}/account.svg`}
        alt=""
        width={18}
        height={18}
        className={`size-[18px] ${iconClass}`}
      />
      {!overlay && <span className="hidden text-sm xl:inline">{label}</span>}
    </Link>
  );
}
