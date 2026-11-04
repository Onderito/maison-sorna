"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

const CustomerSessionContext = createContext<boolean | undefined>(undefined);

export function CustomerSessionProvider({
  children,
  initialAuthenticated,
}: {
  children: ReactNode;
  initialAuthenticated: boolean;
}) {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(initialAuthenticated);
  const authenticatedRef = useRef(initialAuthenticated);

  useEffect(() => {
    const controller = new AbortController();
    let expiryTimer = 0;
    let verifying = false;

    async function verifySession() {
      if (verifying || controller.signal.aborted) return;
      verifying = true;
      try {
        const response = await fetch("/api/auth/shopify/status", {
          cache: "no-store",
          signal: controller.signal,
        });
        const result = (await response.json()) as {
          authenticated?: unknown;
          refreshed?: unknown;
          expiresIn?: unknown;
        };

        if (!controller.signal.aborted && response.ok && typeof result.authenticated === "boolean") {
          const wasAuthenticated = authenticatedRef.current;
          authenticatedRef.current = result.authenticated;
          setAuthenticated(result.authenticated);
          clearTimeout(expiryTimer);
          if (result.authenticated && typeof result.expiresIn === "number" && Number.isFinite(result.expiresIn)) {
            expiryTimer = window.setTimeout(() => { void verifySession(); }, Math.max(1000, result.expiresIn * 1000));
          }
          if (result.refreshed === true || (wasAuthenticated && !result.authenticated)) router.refresh();
        }
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          console.error("Impossible de vérifier la session client.", error);
        }
      } finally {
        verifying = false;
      }
    }

    void verifySession();
    const onFocus = () => { void verifySession(); };
    window.addEventListener("focus", onFocus);
    return () => {
      controller.abort();
      clearTimeout(expiryTimer);
      window.removeEventListener("focus", onFocus);
    };
  }, [router]);

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
