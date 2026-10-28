import { expect, it, vi } from "vitest";
import type { SplitText } from "gsap/SplitText";

const callbacks = vi.hoisted(() => ({ complete: () => {} }));
vi.mock("./gsap", () => ({
  gsap: {
    set: vi.fn(),
    timeline: (options: { onComplete: () => void }) => {
      callbacks.complete = options.onComplete;
      return {};
    },
  },
}));

import { createEditorialTextReveal } from "./create-editorial-text-reveal";

it("lets SplitText finish measuring before restoring an already passed paragraph", async () => {
  const revert = vi.fn();
  const split = { lines: [], words: [], isSplit: true, revert } as unknown as SplitText;
  createEditorialTextReveal(split);
  callbacks.complete();
  expect(revert).not.toHaveBeenCalled();
  await Promise.resolve();
  expect(revert).toHaveBeenCalledOnce();
});

it("does not revert again if cleanup already restored the paragraph", async () => {
  const revert = vi.fn();
  const split = { lines: [], words: [], isSplit: false, revert } as unknown as SplitText;
  createEditorialTextReveal(split);
  callbacks.complete();
  await Promise.resolve();
  expect(revert).not.toHaveBeenCalled();
});
