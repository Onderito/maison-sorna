"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { ScrollTrigger } from "@/animations/scroll-trigger";
import { useSyncExternalStore, type ReactNode } from "react";

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

function updateScrollTriggers() {
  ScrollTrigger.update();
}

function ScrollAnimationSync() {
  // Lenis owns the only RAF; all scenes share one ScrollTrigger update.
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

  return (
    <ReactLenis
      root
      options={{
        autoRaf: true,
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
