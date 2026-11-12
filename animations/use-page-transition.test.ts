import { useRef } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const harness = vi.hoisted(() => ({
  setups: [] as (() => unknown)[],
  reduced: false,
  hasLenis: true,
  frames: [] as (() => void)[],
  lenis: { scrollTo: vi.fn(), stop: vi.fn(), start: vi.fn(), isStopped: false },
  router: { push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() },
}));

vi.mock("react", () => ({ useRef: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => harness.router,
  usePathname: () => "/infuser",
}));
vi.mock("lenis/react", () => ({ useLenis: () => harness.hasLenis ? harness.lenis : null }));
vi.mock("gsap/CustomEase", () => ({ CustomEase: { create: () => "editorial-ease" } }));
vi.mock("./scroll-trigger", () => ({ ScrollTrigger: { refresh: vi.fn() } }));
vi.mock("./gsap", () => ({
  useGSAP: (setup: (context: unknown, safe: (callback: unknown) => unknown) => unknown) => {
    harness.setups.push(() => setup(undefined, callback => callback));
  },
  gsap: { registerPlugin: vi.fn(), set: vi.fn(), killTweensOf: vi.fn(), to: vi.fn(() => ({ kill: vi.fn() })) },
}));

import { gsap } from "./gsap";
import { usePageTransition } from "./use-page-transition";

beforeEach(() => {
  vi.clearAllMocks();
  harness.setups = [];
  harness.reduced = false;
  harness.hasLenis = true;
  harness.frames = [];
  let refIndex = 0;
  vi.mocked(useRef).mockImplementation(((initial: unknown) => ({
    current: refIndex++ === 0 ? {} : initial,
  })) as typeof useRef);
});

function useMountTransition(path: string) {
  vi.stubGlobal("window", {
    location: new URL(path, "https://sorna.example"),
    innerWidth: 1280,
    scrollTo: vi.fn(),
    matchMedia: () => ({ matches: harness.reduced, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    setTimeout: vi.fn(() => 1),
    clearTimeout: vi.fn(),
    requestAnimationFrame: vi.fn((callback: () => void) => {
      harness.frames.push(callback);
      return harness.frames.length;
    }),
    cancelAnimationFrame: vi.fn(),
  });
  vi.stubGlobal("document", {
    documentElement: { clientWidth: 1280, style: { overflow: "", paddingRight: "" } },
    querySelectorAll: () => [],
  });
  const transition = usePageTransition();
  harness.setups[0]();
  return transition;
}

describe("return to the current page’s beginning", () => {
  it.each(["/", "/infuser", "/appliquer", "/ressentir", "/recevoir", "/panier"])("returns to the top of %s without replaying a page transition", path => {
    const transition = useMountTransition(path);
    expect(transition.navigate(path)).toBe(true);
    expect(harness.lenis.scrollTo).toHaveBeenCalledWith(0, { immediate: true, force: true });
    expect(harness.router.push).not.toHaveBeenCalled();
    expect(harness.router.replace).not.toHaveBeenCalled();
    expect(gsap.to).not.toHaveBeenCalled();
  });

  it("clears an existing section hash so reload also opens the page at the top", () => {
    const transition = useMountTransition("/infuser#faq");
    expect(transition.navigate("/infuser")).toBe(true);
    expect(harness.router.replace).toHaveBeenCalledWith("/infuser", { scroll: false });
    expect(harness.lenis.scrollTo).toHaveBeenCalledOnce();
  });

  it("works when reduced motion is enabled", () => {
    harness.reduced = true;
    const transition = useMountTransition("/recevoir");
    expect(transition.navigate("/recevoir")).toBe(true);
    expect(harness.lenis.scrollTo).toHaveBeenCalledOnce();
  });

  it("uses native scrolling when Lenis is unavailable", () => {
    harness.hasLenis = false;
    const transition = useMountTransition("/infuser");
    expect(transition.navigate("/infuser")).toBe(true);
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: "instant" });
  });
});

describe("other navigation stays intact", () => {
  it.each(["/infuser#les-cuvees", "/infuser#faq", "/infuser?format=sachet", "https://other.example/infuser"])("leaves %s to its usual navigation", href => {
    const transition = useMountTransition("/infuser");
    expect(transition.navigate(href)).toBe(false);
    expect(harness.lenis.scrollTo).not.toHaveBeenCalled();
  });

  it("does not intercept removal of a query parameter", () => {
    const transition = useMountTransition("/infuser?format=sachet");
    expect(transition.navigate("/infuser")).toBe(false);
    expect(harness.lenis.scrollTo).not.toHaveBeenCalled();
  });

  it("retains the curtain for a different editorial page", () => {
    const transition = useMountTransition("/infuser");
    expect(transition.navigate("/ressentir")).toBe(true);
    expect(harness.router.prefetch).toHaveBeenCalledWith("/ressentir");
    expect(gsap.to).toHaveBeenCalledOnce();
    expect(harness.router.push).not.toHaveBeenCalled();
  });
});

describe("hero entries wait for the page to be visible", () => {
  it("starts immediately on a direct page load", () => {
    const transition = useMountTransition("/infuser");
    const reveal = vi.fn();
    transition.afterReveal(reveal);
    expect(reveal).toHaveBeenCalledOnce();
  });

  it("waits through coverage, asset decoding and uncovering", async () => {
    const transition = useMountTransition("/ressentir");
    transition.navigate("/infuser");
    const reveal = vi.fn();
    transition.afterReveal(reveal);
    expect(reveal).not.toHaveBeenCalled();

    vi.mocked(gsap.to).mock.calls[0][1]?.onComplete?.();
    harness.setups[1]();
    harness.frames[0]();
    await vi.waitFor(() => expect(gsap.to).toHaveBeenCalledTimes(2));
    expect(reveal).not.toHaveBeenCalled();

    vi.mocked(gsap.to).mock.calls[1][1]?.onComplete?.();
    expect(reveal).toHaveBeenCalledOnce();
    expect(harness.lenis.start).toHaveBeenCalledOnce();
  });

  it("does not start an unmounted hero after uncovering", async () => {
    const transition = useMountTransition("/ressentir");
    transition.navigate("/infuser");
    const reveal = vi.fn();
    const unsubscribe = transition.afterReveal(reveal);
    unsubscribe();

    vi.mocked(gsap.to).mock.calls[0][1]?.onComplete?.();
    harness.setups[1]();
    harness.frames[0]();
    await vi.waitFor(() => expect(gsap.to).toHaveBeenCalledTimes(2));
    vi.mocked(gsap.to).mock.calls[1][1]?.onComplete?.();
    expect(reveal).not.toHaveBeenCalled();
  });
});

describe("interruptions during a transition", () => {
  it("runs a link chosen while the curtain is leaving once it has left", async () => {
    const transition = useMountTransition("/ressentir");
    transition.navigate("/infuser");
    vi.mocked(gsap.to).mock.calls[0][1]?.onComplete?.();
    harness.setups[1]();
    harness.frames[0]();
    await vi.waitFor(() => expect(gsap.to).toHaveBeenCalledTimes(2));

    expect(transition.navigate("/recevoir")).toBe(true);
    expect(harness.router.prefetch).not.toHaveBeenCalledWith("/recevoir");

    vi.mocked(gsap.to).mock.calls[1][1]?.onComplete?.();
    expect(harness.router.prefetch).toHaveBeenCalledWith("/recevoir");
    expect(gsap.to).toHaveBeenCalledTimes(3);
  });

  it("stops the page lift and restores the scroll position on back navigation", () => {
    const transition = useMountTransition("/ressentir");
    Object.assign(window, { scrollY: 640 });
    transition.navigate("/infuser");
    const lift = vi.mocked(gsap.to).mock.results[0].value as { kill: ReturnType<typeof vi.fn> };
    const cover = vi.mocked(gsap.to).mock.calls.find(([, vars]) => vars?.yPercent === 0);
    cover?.[1]?.onComplete?.();
    harness.lenis.scrollTo.mockClear();

    const popstate = vi.mocked(window.addEventListener).mock.calls.find(([type]) => type === "popstate")?.[1] as () => void;
    Object.assign(window, { location: new URL("/ressentir", "https://sorna.example") });
    popstate();
    expect(lift.kill).toHaveBeenCalled();
    harness.frames.at(-1)?.();
    harness.frames.at(-1)?.();
    expect(harness.lenis.scrollTo).toHaveBeenCalledWith(640, { immediate: true, force: true });
  });
});
