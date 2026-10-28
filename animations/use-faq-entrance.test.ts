import { useRef } from "react";
import { beforeEach, expect, it, vi } from "vitest";

type TriggerOptions = { onEnter: () => void; onRefresh: () => void };
const harness = vi.hoisted(() => ({
  setup: null as (() => void) | null,
  refresh: null as TriggerOptions | null,
  complete: () => {},
  play: vi.fn(),
  targets: [] as unknown[],
  top: 1200,
  reduced: false,
  timeline: vi.fn(),
  passages: 0,
  labels: [] as [string, number][],
}));
vi.mock("react", () => ({ useRef: vi.fn() }));
vi.mock("./gsap", () => ({
  useGSAP: (setup: () => void) => { harness.setup = setup; },
  gsap: {
    set: vi.fn(),
    registerPlugin: vi.fn(),
    matchMedia: () => ({
      add: (_conditions: unknown, setup: (context: unknown) => void) => setup({ conditions: { reduced: harness.reduced } }),
      revert: vi.fn(),
    }),
    timeline: (options?: { onComplete: () => void }) => {
      harness.timeline();
      if (options?.onComplete) harness.complete = options.onComplete;
      const timeline = {
        addLabel: vi.fn(function (this: unknown, name: string, position: number) {
          harness.labels.push([name, position]);
          return this;
        }),
        add: vi.fn(function (this: unknown, target: unknown) { harness.targets.push(target); return this; }),
        to: vi.fn(function (this: unknown, target: unknown) { harness.targets.push(target); return this; }),
        play: harness.play,
      };
      return timeline;
    },
  },
}));
vi.mock("gsap/SplitText", () => ({
  SplitText: {
    create: (_targets: unknown, options: { onSplit: (split: unknown) => void }) => {
      const split = { lines: [], words: [], isSplit: true, revert: vi.fn() };
      options.onSplit(split);
      return split;
    },
  },
}));
vi.mock("./create-editorial-text-reveal", () => ({
  appendEditorialTextReveal: () => `text-${++harness.passages}`,
}));
vi.mock("./scroll-trigger", () => ({
  ScrollTrigger: {
    create: (options: TriggerOptions) => {
      harness.refresh = options;
      return { kill: vi.fn() };
    },
  },
}));
import { useFaqEntrance } from "./use-faq-entrance";

let section: { dataset: { faqPending?: string } };
beforeEach(() => {
  vi.clearAllMocks();
  harness.targets = [];
  harness.passages = 0;
  harness.labels = [];
  harness.refresh = null;
  harness.reduced = false;
  harness.top = 1200;
  section = {
    dataset: { faqPending: "" },
    ...{
      getBoundingClientRect: () => ({ top: harness.top }),
      querySelector: (selector: string) => selector,
      querySelectorAll: () => ["question-1", "question-2"],
    },
  };
  let index = 0;
  vi.mocked(useRef).mockImplementation(((initial: unknown) => ({ current: index++ === 0 ? section : initial })) as typeof useRef);
  vi.stubGlobal("window", { innerHeight: 1000 });
});

it("uses ordered overlapping starts instead of waiting for each passage to finish", () => {
  useFaqEntrance();
  harness.setup?.();
  expect(harness.timeline).toHaveBeenCalledTimes(3);
  expect(harness.targets).toEqual([
    "text-1", "text-2", "[data-faq-photograph]",
    ["question-1", "question-2"], "[data-faq-contact]",
  ]);
  expect(harness.labels).toEqual([
    ["titre", 0], ["description", 0.18], ["image", 0.38],
    ["questions", 0.58], ["contact", 0.95],
  ]);
  expect(harness.play).not.toHaveBeenCalled();
});

it("does not replay when refresh or entry fires again", () => {
  useFaqEntrance();
  harness.setup?.();
  harness.top = 500;
  harness.refresh?.onRefresh();
  harness.refresh?.onEnter();
  harness.refresh?.onRefresh();
  expect(harness.play).toHaveBeenCalledOnce();
  harness.complete();
  harness.refresh?.onRefresh();
  expect(harness.play).toHaveBeenCalledOnce();
});

it("leaves reduced-motion content visible without creating a timeline", () => {
  harness.reduced = true;
  useFaqEntrance();
  harness.setup?.();
  expect(section.dataset.faqPending).toBeUndefined();
  expect(harness.timeline).not.toHaveBeenCalled();
});
