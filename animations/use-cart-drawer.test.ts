import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";

const harness = vi.hoisted(() => ({
  effects: [] as (() => void | (() => void))[],
  lenis: { isStopped: false, stop: vi.fn(), start: vi.fn() },
}));
vi.mock("react", () => ({
  useRef: (value: unknown) => ({ current: value }),
  useEffect: (setup: () => void | (() => void)) => harness.effects.push(setup),
}));
vi.mock("lenis/react", () => ({ useLenis: () => harness.lenis }));
vi.mock("./gsap", () => ({ gsap: { set: vi.fn(), fromTo: vi.fn(() => ({ kill: vi.fn() })), to: vi.fn(() => ({ kill: vi.fn() })) } }));
import { gsap } from "./gsap";
import { useCartDrawer } from "./use-cart-drawer";

function Scene(nested = false) {
  const root = { style: { overflow: nested ? "hidden" : "", paddingRight: nested ? "12px" : "" }, clientWidth: 1000 };
  const blur = { cancel: vi.fn(), reverse: vi.fn() };
  const foreground = { closest: () => ({}), animate: vi.fn() };
  const underlying = { closest: () => null, animate: vi.fn(() => blur) };
  const dialog = { open: false, offsetWidth: 400,
    showModal: vi.fn(() => { dialog.open = true; }),
    close: vi.fn(() => { dialog.open = false; }),
    removeAttribute: vi.fn(), setAttribute: vi.fn(),
  };
  vi.stubGlobal("document", { documentElement: root, activeElement: null, querySelector: () => null,
    querySelectorAll: (selector: string) => selector === "dialog[open]" ? (nested ? [underlying] : []) : [underlying, foreground] });
  vi.stubGlobal("window", { innerWidth: 1000 });
  vi.stubGlobal("HTMLElement", class {});
  vi.stubGlobal("getComputedStyle", () => ({ paddingRight: "0px", filter: "none" }));
  vi.stubGlobal("matchMedia", () => ({ matches: false }));
  vi.stubGlobal("requestAnimationFrame", vi.fn(() => 1));
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
  harness.lenis.isStopped = nested;
  const hook = useCartDrawer(true);
  hook.sheetRef.current = {} as HTMLElement;
  hook.dialogRef.current = dialog as unknown as HTMLDialogElement;
  hook.closeButtonRef.current = { focus: vi.fn() } as unknown as HTMLButtonElement;
  harness.effects[0]();
  return { hook, dialog, root, blur, foreground };
}

beforeEach(() => { vi.useFakeTimers(); vi.clearAllMocks(); harness.effects = []; });
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

describe("cart drawer modal lifecycle", () => {
  it("never applies background blur to the cart footer", () => {
    const { foreground } = Scene();
    expect(foreground.animate).not.toHaveBeenCalled();
  });
  it("positions the sheet off-screen before native autofocus can reveal it", () => {
    const { dialog } = Scene();
    expect(vi.mocked(gsap.set).mock.invocationCallOrder[0]).toBeLessThan(dialog.showModal.mock.invocationCallOrder[0]);
  });
  it("opens with power2.out over 300ms", () => {
    Scene();
    const enter = vi.mocked(requestAnimationFrame).mock.calls[0][0];
    enter(0);
    expect(gsap.fromTo).toHaveBeenCalledWith(expect.anything(),
      expect.objectContaining({ xPercent: 100 }),
      expect.objectContaining({ xPercent: 0, duration: 0.3, ease: "power2.out" }),
    );
  });
  it("keeps the modal open during its exit, then restores normal page scrolling", () => {
    const { hook, dialog, root, blur } = Scene();
    expect(root.style.overflow).toBe("hidden");
    hook.close();
    vi.advanceTimersByTime(299);
    expect(dialog.open).toBe(true);
    vi.advanceTimersByTime(1);
    expect(dialog.open).toBe(false);
    hook.onClosed();
    expect(root.style.overflow).toBe("");
    expect(harness.lenis.start).toHaveBeenCalledOnce();
    expect(blur.reverse).toHaveBeenCalledOnce();
    expect(blur.cancel).toHaveBeenCalledOnce();
  });
  it("preserves the product sheet's existing scroll lock when only the cart closes", () => {
    const { hook, root } = Scene(true);
    hook.close();
    vi.advanceTimersByTime(300);
    hook.onClosed();
    expect(root.style).toEqual({ overflow: "hidden", paddingRight: "12px" });
    expect(harness.lenis.start).not.toHaveBeenCalled();
  });
  it("releases its own lock and background animation if unmounted while open", () => {
    const { dialog, root, blur } = Scene();
    const cleanup = harness.effects[1]();
    cleanup?.();
    expect(dialog.close).toHaveBeenCalledOnce();
    expect(root.style.overflow).toBe("");
    expect(blur.cancel).toHaveBeenCalledOnce();
    expect(harness.lenis.start).toHaveBeenCalledOnce();
  });
});
