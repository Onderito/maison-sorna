"use client";

import { useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLenis } from "lenis/react";
import { CustomEase } from "gsap/CustomEase";
import { gsap, useGSAP } from "./gsap";

gsap.registerPlugin(CustomEase);

const editorialPaths = new Set(["/", "/infuser", "/appliquer", "/ressentir"]);
type TransitionController = {
  navigate: (href: string) => boolean;
  committed: (pathname: string) => void;
};

export function usePageTransition() {
  const curtainRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<TransitionController | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const lenis = useLenis();

  useGSAP((_, contextSafe) => {
    const curtain = curtainRef.current;
    if (!curtain || !contextSafe) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const ease = CustomEase.create("", "0.2,-0.03,0.52,0.99");
    let phase: "idle" | "covering" | "waiting" | "revealing" = "idle";
    let destination: URL | null = null;
    let tween: gsap.core.Tween | null = null;
    let watchdog = 0;
    let frame = 0;
    let assetTimeout = 0;
    let releaseScroll: (() => void) | null = null;
    let generation = 0;

    gsap.set(curtain, { y: 0, yPercent: 100, visibility: "hidden" });

    const finish = contextSafe(() => {
      generation++;
      window.clearTimeout(watchdog);
      window.clearTimeout(assetTimeout);
      window.cancelAnimationFrame(frame);
      tween?.kill();
      gsap.set(curtain, { y: 0, yPercent: 100, visibility: "hidden", pointerEvents: "none", clearProps: "willChange" });
      releaseScroll?.();
      releaseScroll = null;
      phase = "idle";
      destination = null;
    });

    const reveal = contextSafe(() => {
      if (phase !== "waiting") return;
      window.clearTimeout(watchdog);
      phase = "revealing";
      tween = gsap.to(curtain, { yPercent: -100, duration: reduced.matches ? 0 : 0.28, ease, onComplete: finish });
    });

    const navigate = contextSafe((href: string): boolean => {
      const next = new URL(href, window.location.href);
      if (next.origin !== window.location.origin || !editorialPaths.has(window.location.pathname) ||
          !editorialPaths.has(next.pathname) || next.pathname === window.location.pathname || reduced.matches) return false;
      if (phase === "waiting" || phase === "revealing") return true;
      destination = next;
      router.prefetch(next.pathname);
      if (phase === "covering") return true;

      phase = "covering";
      const overflow = document.documentElement.style.overflow;
      const padding = document.documentElement.style.paddingRight;
      const scrollbar = window.innerWidth - document.documentElement.clientWidth;
      const resumeLenis = lenis && !lenis.isStopped;
      if (scrollbar > 0) {
        document.documentElement.style.paddingRight = `${parseFloat(getComputedStyle(document.documentElement).paddingRight) + scrollbar}px`;
      }
      document.documentElement.style.overflow = "hidden";
      lenis?.stop();
      releaseScroll = () => {
        if (resumeLenis) lenis.start();
        document.documentElement.style.overflow = overflow;
        document.documentElement.style.paddingRight = padding;
      };
      gsap.set(curtain, { y: 0, yPercent: 100, visibility: "visible", pointerEvents: "auto", willChange: "transform" });
      tween = gsap.to(curtain, {
        yPercent: 0,
        duration: 0.25,
        ease,
        onComplete: () => {
          if (!destination) return;
          phase = "waiting";
          // Reset under the opaque curtain, before the next page mounts:
          // one-shot reveals must never observe the previous page's scroll.
          // force is required because Lenis is stopped during the transition.
          if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
          else window.scrollTo({ top: 0, left: 0, behavior: "instant" });
          router.push(`${destination.pathname}${destination.search}${destination.hash}`);
          // A slow or failed navigation must never leave an opaque curtain trapping the user.
          watchdog = window.setTimeout(finish, 8000);
        },
      });
      return true;
    });

    const committed = (nextPathname: string) => {
      if (phase === "idle") return;
      if (phase !== "waiting" || destination?.pathname !== nextPathname) {
        finish();
        return;
      }
      const currentGeneration = ++generation;
      // Let the new page's layout effects settle, then decode its hero before uncovering it.
      frame = window.requestAnimationFrame(() => {
        const images = Array.from(document.querySelectorAll<HTMLImageElement>("main > section:first-child img"));
        const decoded = Promise.allSettled(images.map((image) => image.decode()));
        const boundedWait = new Promise<void>((resolve) => { assetTimeout = window.setTimeout(resolve, 750); });
        void Promise.race([decoded, boundedWait]).then(() => {
          window.clearTimeout(assetTimeout);
          if (generation === currentGeneration) reveal();
        });
      });
    };

    const cancel = () => finish();
    controllerRef.current = { navigate, committed };
    window.addEventListener("popstate", cancel);
    reduced.addEventListener("change", cancel);
    return () => {
      finish();
      controllerRef.current = null;
      window.removeEventListener("popstate", cancel);
      reduced.removeEventListener("change", cancel);
    };
  }, { scope: curtainRef, dependencies: [lenis, router], revertOnUpdate: true });

  useGSAP(() => {
    controllerRef.current?.committed(pathname);
  }, { dependencies: [pathname] });

  return { curtainRef, navigate: (href: string) => controllerRef.current?.navigate(href) ?? false };
}
