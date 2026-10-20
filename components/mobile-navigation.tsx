"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import CustomerAccountLink from "@/components/customer-account-link";
import styles from "./site-navigation.module.css";

const easing = "cubic-bezier(0.23, 1, 0.32, 1)";

type MobileNavigationProps = {
  pathname: string;
  items: readonly { label: string; href: string }[];
};

export default function MobileNavigation({ pathname, items }: MobileNavigationProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const animationRef = useRef<Animation | null>(null);
  const closingRef = useRef(false);
  const previousOverflow = useRef<string | null>(null);
  const [open, setOpen] = useState(false);

  const restoreScroll = () => {
    if (previousOverflow.current === null) return;
    document.documentElement.style.overflow = previousOverflow.current;
    previousOverflow.current = null;
  };

  const showMenu = () => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    animationRef.current?.cancel();
    closingRef.current = false;
    previousOverflow.current = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    dialog.showModal();
    closeButtonRef.current?.focus({ preventScroll: true });
    setOpen(true);
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      animationRef.current = dialog.animate(
        [{ opacity: 0, transform: "translateY(-16px)" }, { opacity: 1, transform: "translateY(0px)" }],
        { duration: 250, easing },
      );
    }
  };

  const closeMenu = () => {
    const dialog = dialogRef.current;
    if (!dialog?.open || closingRef.current) return;
    closingRef.current = true;
    const appearance = getComputedStyle(dialog);
    const firstFrame = { opacity: appearance.opacity, transform: appearance.transform };
    animationRef.current?.cancel();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      dialog.close();
      return;
    }
    const animation = dialog.animate(
      [firstFrame, { opacity: 0, transform: "translateY(-16px)" }],
      { duration: 200, easing },
    );
    animationRef.current = animation;
    animation.onfinish = () => dialog.close();
  };

  useEffect(() => {
    const dialog = dialogRef.current;
    const desktop = window.matchMedia("(min-width: 768px)");
    const closeOnDesktop = () => {
      if (desktop.matches) dialog?.close();
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => {
      desktop.removeEventListener("change", closeOnDesktop);
      animationRef.current?.cancel();
      dialog?.close();
      restoreScroll();
    };
  }, []);

  useEffect(() => {
    dialogRef.current?.close();
  }, [pathname]);

  return (
    <div className={styles.mobileControls}>
      <button type="button" className={styles.menuButton} aria-label="Ouvrir le menu" aria-haspopup="dialog" aria-expanded={open} aria-controls="mobile-navigation" onClick={showMenu}>
        <span className={styles.burger} aria-hidden="true"><span /><span /></span>
      </button>
      <dialog
        ref={dialogRef}
        id="mobile-navigation"
        aria-label="Menu principal"
        className={styles.mobileDialog}
        data-lenis-prevent
        onCancel={(event) => { event.preventDefault(); closeMenu(); }}
        onClose={() => {
          animationRef.current?.cancel();
          closingRef.current = false;
          restoreScroll();
          setOpen(false);
        }}
        onClick={(event) => { if (event.target === dialogRef.current) closeMenu(); }}
      >
        <div className={styles.dialogHeader}>
          <Link href="/" className={styles.logo} aria-label="SÖRNA, accueil" onClick={() => dialogRef.current?.close()}>SÖRNA</Link>
          <button ref={closeButtonRef} type="button" className={styles.menuButton} aria-label="Fermer le menu" onClick={closeMenu}>
            <span className={`${styles.burger} ${styles.burgerOpen}`} aria-hidden="true"><span /><span /></span>
          </button>
        </div>
        <nav aria-label="Navigation mobile" className={styles.mobileNavigation}>
          {items.map((item) => (
            <Link key={item.href} href={item.href} className={styles.mobileLink} aria-current={pathname === item.href ? "page" : undefined} onClick={() => dialogRef.current?.close()}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className={styles.mobileUtilities}>
          <div className={styles.mobileCommerce}>
            <CustomerAccountLink />
            <Link href="/panier" prefetch={false} className={styles.mobileCart} onClick={() => dialogRef.current?.close()}>
              Panier
            </Link>
          </div>
          <button type="button" disabled title="Le changement de langue sera disponible ultérieurement" aria-label="Langue : français" className={styles.mobileLanguage}>
            Français <Image src="/figma/hero/chevron.svg" alt="" width={10} height={5} />
          </button>
        </div>
      </dialog>
    </div>
  );
}
