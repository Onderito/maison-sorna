import { afterEach, describe, expect, it, vi } from "vitest";
import { withCartLock } from "./cart-lock";

afterEach(() => vi.unstubAllGlobals());

describe("withCartLock", () => {
  it("runs cart additions one at a time across tabs", async () => {
    let queue = Promise.resolve();
    const request = vi.fn((name: string, task: () => Promise<unknown>) => {
      const run = queue.then(task);
      queue = run.then(() => undefined);
      return run;
    });
    vi.stubGlobal("navigator", { locks: { request } });

    const order: string[] = [];
    const add = (name: string) => withCartLock(async () => {
      order.push(`${name}:start`);
      await new Promise((resolve) => setTimeout(resolve, 5));
      order.push(`${name}:end`);
      return name;
    });

    await expect(Promise.all([add("a"), add("b")])).resolves.toEqual(["a", "b"]);
    expect(request).toHaveBeenCalledWith("sorna-cart", expect.any(Function));
    expect(order).toEqual(["a:start", "a:end", "b:start", "b:end"]);
  });

  it("still adds when the browser has no Web Locks", async () => {
    vi.stubGlobal("navigator", {});
    await expect(withCartLock(async () => "ok")).resolves.toBe("ok");
  });
});
