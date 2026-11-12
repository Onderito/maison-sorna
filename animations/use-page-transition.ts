"use client";

import { useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLenis } from "lenis/react";
import { CustomEase } from "gsap/CustomEase";
import { gsap, useGSAP } from "./gsap";
import { ScrollTrigger } from "./scroll-trigger";

gsap.registerPlugin(CustomEase);

const editorialPaths = new Set(["/", "/infuser", "/appliquer", "/ressentir", "/recevoir"]);
type TransitionController = {
  navigate: (href: string) => boolean;
  committed: (pathname: string) => void;
  afterReveal: (callback: () => void) => () => void;
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
    // Covering crosses the screen (strong in-out); uncovering must show the
    // new page at once (strong out).
    const coverEase = CustomEase.create("", "0.77,0,0.175,1");
    const revealEase = CustomEase.create("", "0.23,1,0.32,1");
    // Depth: the page travels with the curtain, a fraction of its distance.
    const pageLift = 30;
    const pageRise = 40;
    // The curtain covers as one surface and leaves upward as a staircase.
    const columns = Array.from(curtain.querySelectorAll?.<HTMLElement>("[data-transition-column]") ?? []);
    const leaving: gsap.TweenTarget = columns.length ? columns : curtain;
    const stairStep = 0.07;
    const mark = curtain.querySelector?.<HTMLElement>("[data-transition-mark]") ?? null;
    // Editorial pacing: a responsive cover, a readable mark, a slow unveiling.
    const page = () => document.querySelector?.<HTMLElement>("main") ?? null;
    let movedPage = false;
    const coverDuration = 0.4;
    const revealDuration = 0.6;
    // The mark stays readable at least this long once the curtain has closed.
    const markHold = 400;
    let coveredAt = 0;
    let phase: "idle" | "covering" | "waiting" | "revealing" = "idle";
    let destination: URL | null = null;
    // A link chosen while the curtain is still out runs once it has left.
    let queued: URL | null = null;
    let origin: { pathname: string; scroll: number } | null = null;
    let tween: gsap.core.Tween | null = null;
    let liftTween: gsap.core.Tween | null = null;
    let watchdog = 0;
    let frame = 0;
    let assetTimeout = 0;
    let holdTimeout = 0;
    let releaseScroll: (() => void) | null = null;
    let generation = 0;
    // Heroes start while the curtain is still leaving, not after it has gone:
    // waiting for the last column made titles arrive almost a second late.
    const heroHandoff = 250;
    let handoff = 0;
    let pageShown = false;
    const revealCallbacks = new Set<() => void>();
    const releaseReveal = () => {
      window.clearTimeout(handoff);
      pageShown = true;
      const callbacks = Array.from(revealCallbacks);
      revealCallbacks.clear();
      callbacks.forEach(callback => callback());
    };

    gsap.set(curtain, { y: 0, yPercent: 100, visibility: "hidden" });

    const finish = contextSafe(() => {
      generation++;
      window.clearTimeout(watchdog);
      window.clearTimeout(assetTimeout);
      window.clearTimeout(holdTimeout);
      window.cancelAnimationFrame(frame);
      tween?.kill();
      liftTween?.kill();
      liftTween = null;
      gsap.set(curtain, { y: 0, yPercent: 100, visibility: "hidden", pointerEvents: "none", clearProps: "willChange" });
      if (columns.length) { gsap.killTweensOf(columns); gsap.set(columns, { clearProps: "transform,willChange" }); }
      if (mark) { gsap.killTweensOf(mark); gsap.set(mark, { opacity: 0 }); }
      const main = page();
      if (main && movedPage) { gsap.killTweensOf(main); gsap.set(main, { clearProps: "transform" }); }
      // Triggers measured while the page was offset must be remeasured.
      if (movedPage) ScrollTrigger.refresh();
      movedPage = false;
      releaseScroll?.();
      releaseScroll = null;
      phase = "idle";
      destination = null;
      queued = null;
      origin = null;
      releaseReveal();
      pageShown = false;
    });

    const reveal = contextSafe(() => {
      if (phase !== "waiting") return;
      window.clearTimeout(watchdog);
      phase = "revealing";
      const duration = reduced.matches ? 0 : revealDuration;
      const main = page();
      if (main && duration) {
        movedPage = true;
        gsap.set(main, { y: pageRise });
        gsap.to(main, { y: 0, duration, ease: revealEase });
      }
      if (mark) gsap.to(mark, { opacity: 0, duration: 0.2, ease: "power1.out" });
      if (columns.length) gsap.set(columns, { willChange: "transform" });
      tween = gsap.to(leaving, {
        yPercent: -100, duration, ease: coverEase,
        stagger: duration ? stairStep : 0,
        onComplete: () => {
          const next = queued;
          finish();
          if (next && !navigate(next.href)) router.push(`${next.pathname}${next.search}${next.hash}`);
        },
      });
      if (duration) handoff = window.setTimeout(releaseReveal, heroHandoff);
      else releaseReveal();
    });

    const navigate = contextSafe((href: string): boolean => {
      const next = new URL(href, window.location.href);
      if (next.origin !== window.location.origin) return false;
      // Re-selecting the current page is an explicit return to its beginning.
      // Section anchors and query changes retain their normal navigation.
      if (next.pathname === window.location.pathname && next.search === window.location.search && !next.hash) {
        if (phase !== "idle") return true;
        if (window.location.hash) router.replace(`${next.pathname}${next.search}`, { scroll: false });
        if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
        else window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        return true;
      }
      if (!editorialPaths.has(window.location.pathname) ||
          !editorialPaths.has(next.pathname) || next.pathname === window.location.pathname || reduced.matches) return false;
      if (phase === "waiting" || phase === "revealing") {
        if (next.pathname !== destination?.pathname) queued = next;
        return true;
      }
      destination = next;
      router.prefetch(next.pathname);
      if (phase === "covering") return true;

      phase = "covering";
      origin = { pathname: window.location.pathname, scroll: window.scrollY };
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
      // The leaving page lifts by scrolling, not by transforming <main>:
      // a transform would detach its fixed navigation and pinned scenes.
      if (typeof window.scrollY === "number") {
        const lift = { y: window.scrollY };
        liftTween = gsap.to(lift, {
          y: window.scrollY + pageLift, duration: coverDuration, ease: coverEase,
          onUpdate: () => {
            if (lenis) lenis.scrollTo(lift.y, { immediate: true, force: true });
            else window.scrollTo({ top: lift.y, left: 0, behavior: "instant" });
          },
        });
      }
      gsap.set(curtain, { y: 0, yPercent: 100, visibility: "visible", pointerEvents: "auto", willChange: "transform" });
      // The brand mark settles in as the curtain closes, fades as it leaves.
      if (mark) gsap.to(mark, { opacity: 1, duration: 0.3, delay: 0.15, ease: revealEase });
      tween = gsap.to(curtain, {
        yPercent: 0,
        duration: coverDuration,
        ease: coverEase,
        onComplete: () => {
          if (!destination) return;
          phase = "waiting";
          coveredAt = performance.now();
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
        const remainingHold = mark ? markHold - (performance.now() - coveredAt) : 0;
        const markRead = remainingHold > 0
          ? new Promise<void>((resolve) => { holdTimeout = window.setTimeout(resolve, remainingHold); })
          : Promise.resolve();
        void Promise.all([Promise.race([decoded, boundedWait]), markRead]).then(() => {
          window.clearTimeout(assetTimeout);
          if (generation === currentGeneration) reveal();
        });
      });
    };

    // Back/forward during a transition: drop it, and if the visitor returns to
    // the page they were leaving, give back the position reset under the curtain.
    const cancel = () => {
      const left = origin;
      finish();
      if (!left || left.pathname !== window.location.pathname || !left.scroll) return;
      frame = window.requestAnimationFrame(() => {
        frame = window.requestAnimationFrame(() => {
          if (lenis) lenis.scrollTo(left.scroll, { immediate: true, force: true });
          else window.scrollTo({ top: left.scroll, left: 0, behavior: "instant" });
        });
      });
    };
    controllerRef.current = {
      navigate, committed,
      afterReveal: callback => {
        if (phase === "idle" || pageShown) callback();
        else revealCallbacks.add(callback);
        return () => { revealCallbacks.delete(callback); };
      },
    };
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

  return {
    curtainRef,
    navigate: (href: string) => controllerRef.current?.navigate(href) ?? false,
    afterReveal: (callback: () => void) => {
      if (controllerRef.current) return controllerRef.current.afterReveal(callback);
      callback();
      return () => {};
    },
  };
}
