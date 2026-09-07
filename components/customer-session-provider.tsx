"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const CustomerSessionContext = createContext<boolean | undefined>(undefined);

export function CustomerSessionProvider({
  children,
  initialAuthenticated,
}: {
  children: ReactNode;
  initialAuthenticated: boolean;
}) {
  const [authenticated, setAuthenticated] = useState(initialAuthenticated);

  useEffect(() => {
    const controller = new AbortController();

    async function verifySession() {
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

    void verifySession();
    return () => controller.abort();
  }, []);

  return (
    <CustomerSessionContext value={authenticated}>
      {children}
    </CustomerSessionContext>
  );
}

export function useCustomerSession() {
  const authenticated = useContext(CustomerSessionContext);

  if (authenticated === undefined) {
    throw new Error("useCustomerSession doit être utilisé dans CustomerSessionProvider.");
  }

  return authenticated;
}
