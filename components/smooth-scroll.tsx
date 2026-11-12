"use client";

import { ReactLenis, useLenis, type LenisRef } from "lenis/react";
import { gsap } from "@/animations/gsap";
import { ScrollTrigger } from "@/animations/scroll-trigger";
import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

function updateScrollTriggers() {
  ScrollTrigger.update();
}

function ScrollAnimationSync() {
  // Every Lenis scroll step refreshes all scenes once.
  useLenis(updateScrollTriggers);
  return null;
}

function subscribeToReducedMotion(onChange: () => void) {
  const preference = window.matchMedia(reducedMotionQuery);
  preference.addEventListener("change", onChange);
  return () => preference.removeEventListener("change", onChange);
}

function getReducedMotionSnapshot() {
  return window.matchMedia(reducedMotionQuery).matches;
}

function getServerReducedMotionSnapshot() {
  return null;
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  const reducedMotion = useSyncExternalStore<boolean | null>(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getServerReducedMotionSnapshot,
  );
  const lenisRef = useRef<LenisRef>(null);

  useEffect(() => {
    // One loop for scroll and animation: GSAP's ticker advances Lenis, so a
    // scrubbed scene never draws a frame with the previous scroll position.
    const advance = (time: number) => lenisRef.current?.lenis?.raf(time * 1000);
    gsap.ticker.add(advance);
    // Lag smoothing would shift GSAP's clock away from Lenis after a long frame.
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(advance);
      gsap.ticker.lagSmoothing(500, 33);
    };
  }, []);

  return (
    <ReactLenis
      root
      ref={lenisRef}
      options={{
        autoRaf: false,
        lerp: 0.1,
        smoothWheel: reducedMotion === false,
        syncTouch: false,
        anchors: { immediate: reducedMotion !== false },
        stopInertiaOnNavigate: true,
      }}
    >
      <ScrollAnimationSync />
      {children}
    </ReactLenis>
  );
}
