"use client";

import { TransitionLink as Link } from "@/components/page-transition";
import { useId } from "react";
import { useNavigationSubmenu } from "@/animations/use-navigation-submenu";
import styles from "./site-navigation.module.css";

type NavigationSubmenuProps = {
  current: boolean;
  label: string;
  href: string;
  links: readonly { label: string; href: string }[];
};

export default function NavigationSubmenu({ current, label, href, links }: NavigationSubmenuProps) {
  const id = useId();
  const { groupRef, panelRef, toggleRef, expanded } = useNavigationSubmenu();

  return (
    <div ref={groupRef} className={styles.submenuGroup}>
      <div className={styles.submenuTrigger}>
        <Link href={href} className={styles.navLink} aria-current={current ? "page" : undefined}>
          {label}
        </Link>
        <button ref={toggleRef} type="button" className={styles.submenuToggle}
          aria-label={`Sous-menu ${label}`} aria-expanded={expanded} aria-controls={id}>
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true">
            <path d="m1 1 4 4 4-4" stroke="currentColor" />
          </svg>
        </button>
      </div>
      <div ref={panelRef} id={id} className={styles.submenuPanel} inert={!expanded}>
        <ul className={styles.submenuList}>
          {links.map((item) => (
            <li key={item.href}><Link href={item.href} className={styles.submenuLink}>{item.label}</Link></li>
          ))}
        </ul>
      </div>
    </div>
  );
}
