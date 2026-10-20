"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
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
  const headerRef = useRef<HTMLElement>(null);
  const [scrollState, setScrollState] = useState({ docked: !overlay, surface: false, hidden: false });

  useEffect(() => {
    let previousY = Math.max(0, window.scrollY);
    let direction = 0;
    let accumulated = 0;
    let hidden = false;
    let frame = 0;

    const update = () => {
      frame = 0;
      const maxY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const y = Math.min(maxY, Math.max(0, window.scrollY));
      const delta = y - previousY;
      const nextDirection = Math.sign(delta);
      if (nextDirection && nextDirection !== direction) {
        direction = nextDirection;
        accumulated = 0;
      }
      accumulated += Math.abs(delta);
      if (y <= 48) hidden = false;
      else if (accumulated >= 24) hidden = direction > 0;
      // Keep links available while the user is navigating with the keyboard.
      if (headerRef.current?.contains(document.activeElement)) hidden = false;
      previousY = y;
      const docked = !overlay || y > 48;
      const surface = overlay ? y >= Math.max(48, window.innerHeight - 88) : y > 48;
      setScrollState((current) => current.docked === docked && current.surface === surface && current.hidden === hidden
        ? current : { docked, surface, hidden });
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [overlay, pathname]);

  const hidden = scrollState.hidden;
  const surface = pathname !== "/panier" && scrollState.surface;
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
      onFocusCapture={() => setScrollState((current) => current.hidden ? { ...current, hidden: false } : current)}
    >
      <div className={styles.bar}>
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
