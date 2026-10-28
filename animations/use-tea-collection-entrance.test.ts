import { useRef } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

type Trigger = {
  start: number;
  scroll: () => number;
  kill: ReturnType<typeof vi.fn>;
};
type TriggerOptions = {
  onEnter: () => void;
  onEnterBack: () => void;
  onRefresh: (trigger: Trigger) => void;
};

const harness = vi.hoisted(() => ({
  setup: null as (() => unknown) | null,
  scroll: 0,
  triggers: [] as { options: TriggerOptions; trigger: Trigger }[],
  timelines: [] as {
    play: ReturnType<typeof vi.fn>;
    delay: ReturnType<typeof vi.fn>;
    progress: ReturnType<typeof vi.fn>;
  }[],
}));

vi.mock("react", () => ({ useRef: vi.fn() }));
vi.mock("./gsap", () => ({
  useGSAP: (setup: () => unknown) => { harness.setup = setup; },
  gsap: {
    set: vi.fn(),
    matchMedia: () => ({
      add: (_conditions: unknown, setup: (context: unknown) => void) => setup({ conditions: { desktop: true } }),
      revert: vi.fn(),
    }),
    timeline: () => {
      const timeline = {
        fromTo: vi.fn().mockReturnThis(), to: vi.fn().mockReturnThis(),
        duration: () => 0.69, time: () => 0,
        delay: vi.fn().mockReturnThis(), play: vi.fn().mockReturnThis(),
        progress: vi.fn().mockReturnThis(), pause: vi.fn().mockReturnThis(),
      };
      harness.timelines.push(timeline);
      return timeline;
    },
  },
}));
vi.mock("./scroll-trigger", () => ({
  ScrollTrigger: {
    create: (options: TriggerOptions) => {
      const trigger = { start: 1000, scroll: () => harness.scroll, kill: vi.fn() };
      harness.triggers.push({ options, trigger });
      return trigger;
    },
  },
}));

import { useTeaCollectionEntrance } from "./use-tea-collection-entrance";

beforeEach(() => {
  harness.scroll = 0;
  harness.triggers = [];
  harness.timelines = [];
  const cards = Array.from({ length: 5 }, () => ({ offsetTop: 300 }));
  const section = {
    querySelector: () => ({}),
    querySelectorAll: () => cards,
  };
  // The hook's first ref is the section; the remaining refs retain their own values.
  let refIndex = 0;
  vi.mocked(useRef).mockImplementation(((initial: unknown) => ({
    current: refIndex++ === 0 ? section : initial,
  })) as typeof useRef);
});

describe("collection entrance after anchor navigation", () => {
  it("reveals products when mounting beyond the row threshold without an entry event", () => {
    harness.scroll = 1200;
    useTeaCollectionEntrance();
    harness.setup?.();
    expect(harness.timelines[1].play).toHaveBeenCalledOnce();
  });

  it("catches an anchor jump during refresh, without restarting the row", () => {
    useTeaCollectionEntrance();
    harness.setup?.();
    const { options, trigger } = harness.triggers[0];
    const row = harness.timelines[1];
    expect(row.play).not.toHaveBeenCalled();
    harness.scroll = 1200;
    options.onRefresh(trigger);
    options.onEnter();
    options.onEnterBack();
    options.onRefresh(trigger);
    expect(row.play).toHaveBeenCalledOnce();
  });

  it("keeps rows below the viewport waiting until normal scroll entry", () => {
    useTeaCollectionEntrance();
    harness.setup?.();
    const { options, trigger } = harness.triggers[0];
    options.onRefresh(trigger);
    expect(harness.timelines[1].play).not.toHaveBeenCalled();
    options.onEnter();
    expect(harness.timelines[1].play).toHaveBeenCalledOnce();
  });
});
