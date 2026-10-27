"use client";

import { createContext, useContext, type ReactNode } from "react";
import Link from "next/link";
import type { ComponentProps } from "react";
import { usePageTransition } from "@/animations/use-page-transition";
import styles from "./page-transition.module.css";

const PageTransitionContext = createContext<((href: string) => boolean) | null>(null);

export function PageTransition({ children }: { children: ReactNode }) {
  const { curtainRef, navigate } = usePageTransition();
  return (
    <PageTransitionContext.Provider value={navigate}>
      {children}
      <div ref={curtainRef} className={styles.curtain} aria-hidden="true" />
    </PageTransitionContext.Provider>
  );
}

export function TransitionLink(props: Omit<ComponentProps<typeof Link>, "onNavigate">) {
  const navigate = useContext(PageTransitionContext);
  return <Link {...props} onNavigate={(event) => {
    if (typeof props.href === "string" && navigate?.(props.href)) event.preventDefault();
  }} />;
}
