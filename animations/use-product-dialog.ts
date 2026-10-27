"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { useLenis } from "lenis/react";
import { CustomEase } from "gsap/CustomEase";
import { gsap, useGSAP } from "./gsap";

gsap.registerPlugin(CustomEase);
const productEase = CustomEase.create("product-expansion", "0.2,-0.03,0.52,0.99");

// Measure the actual contained bitmap, excluding its padding. Both endpoints
// retain the image aspect ratio, so the shared image only needs uniform scale.
function imageBounds(image: HTMLImageElement, ratio: number) {
  const rect = image.getBoundingClientRect();
  const style = getComputedStyle(image);
  const sx = rect.width / parseFloat(style.width) || 1;
  const sy = rect.height / parseFloat(style.height) || 1;
  const left = parseFloat(style.paddingLeft) * sx;
  const right = parseFloat(style.paddingRight) * sx;
  const top = parseFloat(style.paddingTop) * sy;
  const bottom = parseFloat(style.paddingBottom) * sy;
  const width = Math.min(rect.width - left - right, (rect.height - top - bottom) * ratio);
  const height = width / ratio;
  return { x: rect.x + left + (rect.width - left - right - width) / 2,
    y: rect.y + top + (rect.height - top - bottom - height) / 2, width, height };
}

export function useProductDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLAnchorElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const movingImageRef = useRef<HTMLDivElement>(null);
  const restoreImageRef = useRef<(() => void) | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const animationRef = useRef<gsap.core.Timeline | null>(null);
  const releaseScrollRef = useRef<(() => void) | null>(null);
  const closing = useRef(false);
  const outsidePointerDown = useRef(false);
  const [isOpen, setIsOpen] = useState(false);
  const lenis = useLenis();
  function finishClose(dialog: HTMLDialogElement) {
    // Hide the complete surface, including borders outside the stagger, before
    // the native dialog leaves the top layer and queues its close event.
    gsap.set([sheetRef.current, backdropRef.current], { autoAlpha: 0 });
    // The native close event is queued. Restore the real bitmap BEFORE leaving
    // the top layer, in the same frame as removing its animated duplicate.
    restoreImageRef.current?.();
    restoreImageRef.current = null;
    // Native dialog.close() may restore focus before the queued onClose event.
    if (openerRef.current) openerRef.current.dataset.dialogReturnFocus = "true";
    dialog.close();
  }

  const { contextSafe } = useGSAP(() => {
    const dialog = dialogRef.current;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finishMotion = () => {
      if (!preference.matches || !dialog?.open) return;
      if (closing.current) finishClose(dialog);
      else animationRef.current?.progress(1);
    };
    preference.addEventListener("change", finishMotion);
    return () => {
      preference.removeEventListener("change", finishMotion);
      animationRef.current?.kill();
      restoreImageRef.current?.();
      dialog?.close();
      releaseScrollRef.current?.();
      releaseScrollRef.current = null;
    };
  }, { scope: dialogRef });

  function open() {
    contextSafe(() => {
      const dialog = dialogRef.current;
      const sheet = sheetRef.current;
      const backdrop = backdropRef.current;
      if (!dialog || !sheet || !backdrop || dialog.open) return;

      const source = openerRef.current?.querySelector<HTMLImageElement>("[data-product-artwork] img");
      const target = imageRef.current?.querySelector("img");
      const moving = movingImageRef.current;
      if (!source || !target || !moving) return;
      // Read the card before any scroll-lock or modal writes.
      const ratio = source.naturalWidth / source.naturalHeight || 1;
      const origin = imageBounds(source, ratio);
      const root = document.documentElement;
      const overflow = root.style.overflow;
      const paddingRight = root.style.paddingRight;
      const scrollbar = window.innerWidth - root.clientWidth;
      const wasStopped = lenis?.isStopped ?? true;
      if (scrollbar > 0) root.style.paddingRight = `calc(${getComputedStyle(root).paddingRight} + ${scrollbar}px)`;
      root.style.overflow = "hidden";
      // Override Lenis's overflow: clip before stopping, so the root keeps its
      // scroll position. Resume before removing that override for the same reason.
      lenis?.stop();
      releaseScrollRef.current = () => {
        if (!wasStopped) lenis?.start();
        root.style.overflow = overflow;
        root.style.paddingRight = paddingRight;
      };

      closing.current = false;
      dialog.showModal();
      setIsOpen(true);
      closeButtonRef.current?.focus({ preventScroll: true });
      animationRef.current?.kill();
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const desktop = window.matchMedia("(min-width: 768px)").matches;
      const detailsDelay = reduced ? 0 : desktop ? 0.42 : 0.27;
      const surfaceDelay = !reduced && desktop ? 0.42 : 0;
      sheet.scrollTop = 0;
      sheet.querySelector("[data-product-reveal]")?.closest("[data-product-scroll]")?.scrollTo(0, 0);
      const destination = imageBounds(target, ratio);
      const clone = (target.complete && target.naturalWidth ? target : source).cloneNode() as HTMLImageElement;
      clone.removeAttribute("id");
      clone.alt = "";
      clone.style.cssText = "";
      // Lock the selected resource; avoid srcset choosing a new image mid-flight.
      clone.removeAttribute("srcset");
      clone.removeAttribute("sizes");
      clone.src = target.complete && target.naturalWidth ? target.currentSrc : source.currentSrc;
      moving.replaceChildren(clone);
      const visibility = source.style.visibility;
      source.style.visibility = "hidden";
      restoreImageRef.current = () => { source.style.visibility = visibility; moving.replaceChildren(); };
      const elements = sheet.querySelectorAll<HTMLElement>("[data-product-reveal]");
      gsap.set(moving, { left: destination.x, top: destination.y, width: destination.width, height: destination.height,
        x: reduced ? 0 : origin.x - destination.x, y: reduced ? 0 : origin.y - destination.y,
        scale: reduced ? 1 : origin.width / destination.width, autoAlpha: 1 });
      gsap.set(imageRef.current, { visibility: "hidden" });
      gsap.set(elements, { opacity: 0, x: reduced ? 0 : -16 });
      gsap.set(sheet, { autoAlpha: 1 });
      animationRef.current = gsap.timeline({
        defaults: { ease: productEase },
        onComplete: () => {
          gsap.set(imageRef.current, { visibility: "visible" });
          gsap.set(moving, { visibility: "hidden" });
        },
      })
        .fromTo(backdrop, { autoAlpha: 0 }, { autoAlpha: 1, duration: reduced ? 0 : 0.3 }, 0)
        .fromTo(sheet.querySelector("[data-product-scroll]"), { autoAlpha: 0 }, { autoAlpha: 1, duration: reduced ? 0 : 0.3 }, surfaceDelay)
        .fromTo(sheet.querySelector("[data-product-visual]"), { opacity: 0 }, { opacity: 1, duration: reduced ? 0 : 0.3 }, 0)
        .to(moving, { x: 0, y: 0, scale: 1, duration: reduced ? 0 : 0.3 }, 0)
        .to(elements, { opacity: 1, x: 0, duration: reduced ? 0 : 0.25, stagger: reduced ? 0 : 0.025 }, detailsDelay);
      // The shared image lives above the right background, not inside its fade.
      gsap.set(closeButtonRef.current, { opacity: 1 });
    })();
  }

  function close() {
    contextSafe(() => {
      const dialog = dialogRef.current;
      if (!dialog?.open || closing.current) return;
      closing.current = true;
      const timeline = animationRef.current;
      const moving = movingImageRef.current;
      const source = openerRef.current?.querySelector<HTMLImageElement>("[data-product-artwork] img");
      const target = imageRef.current?.querySelector("img");
      if (!timeline || !moving || !source || !target || timeline.time() === 0 ||
          window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        finishClose(dialog);
        return;
      }

      // Re-read the thumbnail: its hover position (or viewport size) may have
      // changed since opening. Return to where it is now, not a stale snapshot.
      const ratio = source.naturalWidth / source.naturalHeight || 1;
      const origin = imageBounds(source, ratio);
      const settled = timeline.progress() === 1;
      const destination = settled ? imageBounds(target, ratio) : null;
      const baseX = destination?.x ?? parseFloat(moving.style.left);
      const baseY = destination?.y ?? parseFloat(moving.style.top);
      const baseWidth = destination?.width ?? parseFloat(moving.style.width);
      const elements = sheetRef.current?.querySelectorAll<HTMLElement>("[data-product-reveal]");
      timeline.kill();
      if (destination) {
        gsap.set(moving, { left: destination.x, top: destination.y, width: destination.width,
          height: destination.height, x: 0, y: 0, scale: 1 });
      }
      gsap.set(imageRef.current, { visibility: "hidden" });
      gsap.set(moving, { visibility: "visible" });
      animationRef.current = gsap.timeline({
        defaults: { ease: productEase },
        onComplete: () => finishClose(dialog),
      })
        .to(elements ?? [], { opacity: 0, x: -16, duration: 0.12, stagger: { each: 0.01, from: "end" } }, 0)
        .to(sheetRef.current?.querySelector("[data-product-scroll]") ?? [], { autoAlpha: 0, duration: 0.16 }, 0)
        .to(moving, { x: origin.x - baseX, y: origin.y - baseY,
          scale: origin.width / baseWidth, duration: 0.22 }, 0.08)
        .to([backdropRef.current, sheetRef.current], { autoAlpha: 0, duration: 0.22 }, 0.08);
    })();
  }

  function onClosed() {
    animationRef.current?.kill();
    restoreImageRef.current?.();
    restoreImageRef.current = null;
    releaseScrollRef.current?.();
    releaseScrollRef.current = null;
    closing.current = false;
    setIsOpen(false);
    if (openerRef.current?.isConnected) {
      openerRef.current.dataset.dialogReturnFocus = "true";
      openerRef.current.focus({ preventScroll: true });
    }
  }

  function onOutsidePointerDown(target: EventTarget) {
    outsidePointerDown.current = target === dialogRef.current || target === backdropRef.current;
  }

  function onOutsideClick(target: EventTarget) {
    if (outsidePointerDown.current && (target === dialogRef.current || target === backdropRef.current)) close();
    outsidePointerDown.current = false;
  }

  function onKeyDown(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== "Tab") return;
    if (!closing.current) animationRef.current?.progress(1);
    const dialog = dialogRef.current;
    if (!dialog) return;
    const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )).filter((element) => element.getClientRects().length > 0 && !element.closest("[inert]"));
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first && last) {
      event.preventDefault();
      last.focus({ preventScroll: true });
    } else if (!event.shiftKey && document.activeElement === last && first) {
      event.preventDefault();
      first.focus({ preventScroll: true });
    }
  }

  return {
    dialogRef, sheetRef, backdropRef, openerRef, closeButtonRef, imageRef, movingImageRef,
    isOpen, open, close, onClosed, onOutsidePointerDown, onOutsideClick, onKeyDown,
  };
}
