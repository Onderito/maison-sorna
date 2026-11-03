"use client";

import { TransitionLink as Link } from "@/components/page-transition";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { useSiteNavigation } from "@/animations/use-site-navigation";
import { createPortal } from "react-dom";

import CartButton from "./cart-button";
import { useCart } from "./cart-provider";
import CustomerAccountLink from "@/components/customer-account-link";
import MobileNavigation from "@/components/mobile-navigation";
import NavigationSubmenu from "@/components/navigation-submenu";
import { getNavigationSubmenuLinks, recevoirNavigationLinks } from "./navigation-submenu-links";
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
  const { cart, isOpen } = useCart();
  const hydrated = useSyncExternalStore(subscribeToHydration, clientSnapshot, serverSnapshot);
  const { headerRef, barRef, surfaceRef, state: scrollState } = useSiteNavigation(overlay, pathname, hydrated);
  const { hidden, surface } = scrollState;
  const light = !surface && tone === "light";
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
        <Link href="/" className={styles.logo} aria-label="SÖRNA, accueil"><span className={styles.logoMark} aria-hidden="true" /></Link>
        <MobileNavigation pathname={pathname} items={[...navigation, { label: "Recevoir", href: "/recevoir" }]} />
        <nav className={styles.primary} aria-label="Navigation principale">
          {navigation.map((item) => {
            const links = getNavigationSubmenuLinks(item.href);
            return links ? (
              <NavigationSubmenu key={`${item.href}:${pathname}`} current={pathname === item.href} label={item.label} href={item.href} links={links} />
            ) : (
            <Link key={item.href} href={item.href} className={styles.navLink} aria-current={pathname === item.href ? "page" : undefined}>
              {item.label}
            </Link>
            );
          })}
        </nav>
        <div className={styles.actions}>
          <NavigationSubmenu key={`recevoir:${pathname}`} current={pathname === "/recevoir"} label="Recevoir" href="/recevoir" links={recevoirNavigationLinks} linkClassName={styles.recevoirLink} />
          <button type="button" disabled title="Le changement de langue sera disponible ultérieurement" aria-label="Langue : français" className={styles.language}>
            Fr
            <svg width="8" height="5" viewBox="0 0 10 6" fill="none" aria-hidden="true"><path d="m1 1 4 4 4-4" stroke="currentColor" strokeWidth="1" /></svg>
          </button>
          <CartButton className={styles.cart} />
          <CustomerAccountLink />
        </div>
      </div>
    </header>
  );

  return (
    <>
      {!overlay && <div className={styles.spacer} aria-hidden="true" />}
      {hydrated ? createPortal(<>{header}
        {!!cart?.totalQuantity && <CartButton className={`${styles.floatingCart} ${hidden && !isOpen ? styles.floatingVisible : ""}`} />}
      </>, document.body) : header}
    </>
  );
}
