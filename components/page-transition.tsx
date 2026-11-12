"use client";

import { createContext, useContext, type ReactNode } from "react";
import Link from "next/link";
import type { ComponentProps } from "react";
import { usePageTransition } from "@/animations/use-page-transition";
import styles from "./page-transition.module.css";

type PageTransitionContextValue = Pick<ReturnType<typeof usePageTransition>, "navigate" | "afterReveal">;
const PageTransitionContext = createContext<PageTransitionContextValue | null>(null);

export function useAfterPageReveal() {
  return useContext(PageTransitionContext)?.afterReveal;
}

export function PageTransition({ children }: { children: ReactNode }) {
  const { curtainRef, navigate, afterReveal } = usePageTransition();
  return (
    <PageTransitionContext.Provider value={{ navigate, afterReveal }}>
      {children}
      <div ref={curtainRef} className={styles.curtain} aria-hidden="true" />
    </PageTransitionContext.Provider>
  );
}

export function TransitionLink(props: Omit<ComponentProps<typeof Link>, "onNavigate">) {
  const transition = useContext(PageTransitionContext);
  return <Link {...props} onNavigate={(event) => {
    if (typeof props.href === "string" && transition?.navigate(props.href)) event.preventDefault();
  }} />;
}
