"use client";

import { useEffect, useRef } from "react";
import { useLenis } from "lenis/react";
import { gsap } from "./gsap";

export function useCartDrawer(isOpen: boolean) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const sheetRef = useRef<HTMLElement>(null);
  const sheetMotion = useRef<gsap.core.Tween | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const closing = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const frame = useRef(0);
  const backgroundMotion = useRef<Animation[]>([]);
  const opener = useRef<HTMLElement | null>(null);
  const releaseScroll = useRef<(() => void) | null>(null);
  const lenis = useLenis();

  function restoreScroll() {
    releaseScroll.current?.();
    releaseScroll.current = null;
  }
  function onClosed() {
    if (timer.current) clearTimeout(timer.current);
    cancelAnimationFrame(frame.current);
    closing.current = false;
    sheetMotion.current?.kill();
    if (sheetRef.current) gsap.set(sheetRef.current, { clearProps: "transform,opacity" });
    dialogRef.current?.removeAttribute("data-visible");
    backgroundMotion.current.forEach((animation) => animation.cancel());
    backgroundMotion.current = [];
    restoreScroll();
    // Floating access becomes visible again after the provider closes the cart.
    frame.current = requestAnimationFrame(() => {
      const target = opener.current;
      if (target?.isConnected && getComputedStyle(target).visibility !== "hidden") target.focus({ preventScroll: true });
    });
  }
  function close() {
    const dialog = dialogRef.current;
    if (!dialog?.open || closing.current) return;
    closing.current = true;
    cancelAnimationFrame(frame.current);
    dialog.removeAttribute("data-visible");
    backgroundMotion.current.forEach((animation) => animation.reverse());
    // The modal stays in the top layer until the exit has finished.
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    sheetMotion.current = gsap.to(sheetRef.current, {
      x: 0, xPercent: reduced ? 0 : 100, opacity: reduced ? 0 : 1,
      duration: reduced ? 0.15 : 0.3, ease: "power2.out", overwrite: true,
    });
    timer.current = setTimeout(() => dialog.close(), reduced ? 150 : 300);
  }

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!isOpen || !dialog || dialog.open) return;
    const active = document.activeElement;
    // Disabling the add button while Shopify responds can move focus to body.
    opener.current = active instanceof HTMLElement && active !== document.body
      ? active : document.querySelector<HTMLElement>("button[aria-busy='true']");
    const root = document.documentElement;
    const overflow = root.style.overflow;
    const padding = root.style.paddingRight;
    const wasStopped = lenis?.isStopped ?? true;
    const scrollbar = window.innerWidth - root.clientWidth;
    if (scrollbar > 0) root.style.paddingRight = `calc(${getComputedStyle(root).paddingRight} + ${scrollbar}px)`;
    root.style.overflow = "hidden";
    lenis?.stop();
    releaseScroll.current = () => {
      if (!wasStopped) lenis?.start();
      root.style.overflow = overflow;
      root.style.paddingRight = padding;
    };
    closing.current = false;
    // Blur the surface below the cart explicitly: a backdrop cannot sample
    // another native dialog in the top layer. Normal pages use the same rhythm.
    const underlying = Array.from(document.querySelectorAll<HTMLElement>("dialog[open]"));
    const backgrounds = underlying.length ? underlying : Array.from(document.querySelectorAll<HTMLElement>("main, footer, header[data-hidden]"))
      .filter((element) => !element.closest("dialog") && !element.parentElement?.closest("main"));
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    gsap.set(sheetRef.current, { x: 0, xPercent: reduced ? 0 : 100, opacity: reduced ? 0 : 1 });
    dialog.showModal();
    backgroundMotion.current = backgrounds.map((element) => {
      const original = getComputedStyle(element).filter;
      return element.animate([
        { filter: original }, { filter: original === "none" ? "blur(5px)" : `${original} blur(5px)` },
      ], { duration: matchMedia("(prefers-reduced-motion: reduce)").matches ? 150 : 300, easing: "ease", fill: "forwards" });
    });
    closeButtonRef.current?.focus({ preventScroll: true });
    frame.current = requestAnimationFrame(() => {
      dialog.setAttribute("data-visible", "");
      sheetMotion.current = gsap.fromTo(sheetRef.current,
        { x: 0, xPercent: reduced ? 0 : 100, opacity: reduced ? 0 : 1 },
        { x: 0, xPercent: 0, opacity: 1, duration: reduced ? 0.15 : 0.3,
          ease: "power2.out", overwrite: true, immediateRender: true },
      );
    });
  }, [isOpen, lenis]);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
    cancelAnimationFrame(frame.current);
    sheetMotion.current?.kill();
    dialogRef.current?.close();
    backgroundMotion.current.forEach((animation) => animation.cancel());
    restoreScroll();
  }, []);

  return { dialogRef, sheetRef, closeButtonRef, close, onClosed };
}
