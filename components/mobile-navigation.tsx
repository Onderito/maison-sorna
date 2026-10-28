"use client";

import { TransitionLink as Link } from "@/components/page-transition";
import { useEffect, useRef, useState } from "react";

import CustomerAccountLink from "@/components/customer-account-link";
import { getNavigationSubmenuLinks } from "./navigation-submenu-links";
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
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  const restoreScroll = () => {
    if (previousOverflow.current === null) return;
    document.documentElement.style.overflow = previousOverflow.current;
    previousOverflow.current = null;
  };

  const closeForNavigation = () => {
    // Release the menu's lock before the page transition acquires its own.
    restoreScroll();
    dialogRef.current?.close();
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
    setExpandedGroup(null);
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
      <button type="button" disabled title="Le changement de langue sera disponible ultérieurement" aria-label="Langue : français" className={styles.language}>
        Fr
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true"><path d="m1 1 4 4 4-4" stroke="currentColor" /></svg>
      </button>
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
          setExpandedGroup(null);
        }}
        onClick={(event) => { if (event.target === dialogRef.current) closeMenu(); }}
      >
        <div className={styles.dialogHeader}>
          <Link href="/" className={styles.logo} aria-label="SÖRNA, accueil" onClick={closeForNavigation}>SÖRNA</Link>
          <button ref={closeButtonRef} type="button" className={styles.menuButton} aria-label="Fermer le menu" onClick={closeMenu}>
            <span className={`${styles.burger} ${styles.burgerOpen}`} aria-hidden="true"><span /><span /></span>
          </button>
        </div>
        <nav aria-label="Navigation mobile" className={styles.mobileNavigation}>
          {items.map((item) => {
            const links = getNavigationSubmenuLinks(item.href);
            return (
            <div key={item.href}>
              <div className={styles.mobileGroupTrigger}>
                <Link href={item.href} className={styles.mobileLink} aria-current={pathname === item.href ? "page" : undefined} onClick={closeForNavigation}>
                  {item.label}
                </Link>
                {links && (
                  <button
                    type="button"
                    className={styles.mobileSubmenuToggle}
                    aria-label={`Sous-catégories ${item.label}`}
                    aria-expanded={expandedGroup === item.href}
                    aria-controls={`mobile-submenu-${item.href.slice(1)}`}
                    onClick={() => setExpandedGroup((current) => current === item.href ? null : item.href)}
                  >
                    <svg width="16" height="10" viewBox="0 0 16 10" fill="none" aria-hidden="true"><path d="m1 1 7 7 7-7" stroke="currentColor" strokeWidth="1.5" /></svg>
                  </button>
                )}
              </div>
              {links && (
                <ul id={`mobile-submenu-${item.href.slice(1)}`} className={styles.mobileSubmenu} hidden={expandedGroup !== item.href}>
                  {links.map((link) => (
                    <li key={link.href}><Link href={link.href} onClick={closeForNavigation}>{link.label}</Link></li>
                  ))}
                </ul>
              )}
            </div>
            );
          })}
        </nav>
        <div className={styles.mobileUtilities}>
          <div className={styles.mobileCommerce}>
            <CustomerAccountLink />
            <Link href="/panier" prefetch={false} className={styles.mobileCart} onClick={closeForNavigation}>
              Panier
            </Link>
          </div>
        </div>
      </dialog>
    </div>
  );
}
