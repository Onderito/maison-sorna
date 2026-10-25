"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type FocusEvent, type PointerEvent } from "react";
import { CustomEase } from "gsap/CustomEase";
import { gsap, useGSAP } from "./gsap";
import { ScrollTrigger } from "./scroll-trigger";

gsap.registerPlugin(CustomEase);

const motionQuery = "(prefers-reduced-motion: reduce)";
function subscribe(onChange: () => void) {
  const preference = window.matchMedia(motionQuery);
  preference.addEventListener("change", onChange);
  return () => preference.removeEventListener("change", onChange);
}
const getSnapshot = () => window.matchMedia(motionQuery).matches;
const getServerSnapshot = () => true;

export function useFaqItem(expanded: boolean) {
  const itemRef = useRef<HTMLDivElement>(null);
  const answerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const highlightRef = useRef<HTMLSpanElement>(null);
  const initialized = useRef(false);
  const current = useRef<gsap.core.Timeline | null>(null);
  const feedback = useRef({ hovered: false, focused: false, pressed: false });
  const [contentHeight, setContentHeight] = useState<number | null>(null);
  const reduced = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const { contextSafe } = useGSAP({ scope: itemRef });

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    const observer = new ResizeObserver(() => setContentHeight(content.getBoundingClientRect().height));
    observer.observe(content);
    return () => observer.disconnect();
  }, []);

  useGSAP(() => {
    const answer = answerRef.current;
    const content = contentRef.current;
    const indicator = indicatorRef.current;
    if (!answer || !content || !indicator) return;

    const height = expanded ? contentHeight ?? content.getBoundingClientRect().height : 0;
    const heightChanged = Math.abs(answer.getBoundingClientRect().height - height) > 0.5;
    const duration = initialized.current && !reduced ? 0.2 : 0;
    initialized.current = true;
    // Preserve the current rendered values when a rapid toggle interrupts a tween.
    current.current?.kill();
    current.current = gsap.timeline({
      defaults: { duration, ease: CustomEase.create("", "0.23,1,0.32,1") },
      onComplete: () => {
        if (expanded) answer.style.height = "auto";
        if (heightChanged) ScrollTrigger.refresh(true);
      },
    })
      // Height is necessary here: adjacent questions must follow the answer.
      .to(answer, { height }, 0)
      .to(content, {
        opacity: expanded ? 1 : 0,
        y: reduced || expanded ? 0 : 4,
        duration: duration ? expanded ? 0.16 : 0.12 : 0,
      }, 0)
      .to(indicator, { rotation: expanded ? 0 : 90, opacity: expanded ? 0 : 1 }, 0);
  }, { scope: itemRef, dependencies: [expanded, contentHeight, reduced] });

  function updateHighlight() {
    contextSafe(() => {
      const { hovered, focused, pressed } = feedback.current;
      gsap.to(highlightRef.current, {
        opacity: focused || pressed ? 1 : hovered ? 0.7 : 0,
        duration: reduced ? 0.12 : 0.16,
        ease: "power1.inOut",
        overwrite: true,
      });
    })();
  }

  const interaction = {
    onPointerEnter() {
      feedback.current.hovered = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
      updateHighlight();
    },
    onPointerLeave() {
      feedback.current.hovered = false;
      feedback.current.pressed = false;
      updateHighlight();
    },
    onPointerDown(event: PointerEvent<HTMLDivElement>) {
      if (event.button !== 0) return;
      feedback.current.pressed = true;
      updateHighlight();
    },
    onPointerUp() {
      feedback.current.pressed = false;
      updateHighlight();
    },
    onPointerCancel() {
      feedback.current.pressed = false;
      updateHighlight();
    },
    onFocusCapture(event: FocusEvent<HTMLDivElement>) {
      feedback.current.focused = event.target.matches(":focus-visible");
      updateHighlight();
    },
    onBlurCapture(event: FocusEvent<HTMLDivElement>) {
      if (event.currentTarget.contains(event.relatedTarget)) return;
      feedback.current.focused = false;
      feedback.current.pressed = false;
      updateHighlight();
    },
  };

  return { itemRef, answerRef, contentRef, indicatorRef, highlightRef, interaction };
}
