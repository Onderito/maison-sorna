"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { useSiteNavigation } from "@/animations/use-site-navigation";
import { createPortal } from "react-dom";

import CustomerAccountLink from "@/components/customer-account-link";
import MobileNavigation from "@/components/mobile-navigation";
import styles from "./site-navigation.module.css";

const navigation = [
  { label: "Infuser", href: "/infuser" },
  { label: "Appliquer", href: "/appliquer" },
  { label: "Ressentir", href: "/ressentir" },
] as const;

const subscribeToHydration = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

type SiteNavigationProps = {
  overlay?: boolean;
  tone?: "dark" | "light" | "auto";
};

export default function SiteNavigation({ overlay = false, tone = "auto" }: SiteNavigationProps) {
  const pathname = usePathname();
  const hydrated = useSyncExternalStore(subscribeToHydration, clientSnapshot, serverSnapshot);
  const { headerRef, barRef, surfaceRef, state: scrollState } = useSiteNavigation(overlay, pathname, hydrated);
  const { hidden, surface } = scrollState;
  const light = !surface && tone === "light";
  const assets = light ? "/figma/ressenti-hero" : "/figma/hero";
  const header = (
    <header
      ref={headerRef}
      className={styles.header}
      data-docked={scrollState.docked}
      data-surface={surface}
      data-hidden={hidden}
      data-light={light}
    >
      <span ref={surfaceRef} className={styles.surface} aria-hidden="true" />
      <div ref={barRef} className={styles.bar}>
        <Link href="/" className={styles.logo} aria-label="SÖRNA, accueil">SÖRNA</Link>
        <MobileNavigation pathname={pathname} items={navigation} />
        <nav className={styles.primary} aria-label="Navigation principale">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} className={styles.navLink} aria-current={pathname === item.href ? "page" : undefined}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className={styles.actions}>
          <button type="button" disabled title="Le changement de langue sera disponible ultérieurement" aria-label="Langue : français" className={styles.language}>
            Fr
            <Image src={`${assets}/chevron.svg`} alt="" width={10} height={5} />
          </button>
          <Link href="/panier" prefetch={false} aria-label="Voir le panier" title="Panier" className={styles.cart}>
            Panier
          </Link>
          <CustomerAccountLink />
        </div>
      </div>
    </header>
  );

  return (
    <>
      {!overlay && <div className={styles.spacer} aria-hidden="true" />}
      {hydrated ? createPortal(header, document.body) : header}
    </>
  );
}
