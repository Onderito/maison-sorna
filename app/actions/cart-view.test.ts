import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/app/lib/shopify/cart", () => ({ getCartDetails: vi.fn() }));
import { getCartDetails } from "@/app/lib/shopify/cart";
import { readCartView } from "./cart-view";

beforeEach(() => vi.clearAllMocks());

describe("readCartView", () => {
  it("returns only presentation data, without the private cart key or checkout URL", async () => {
    const data = {
      id: "private-cart-key", checkoutUrl: "https://checkout.example/private",
      totalQuantity: 1, lines: [],
      cost: { subtotalAmount: { amount: "28", currencyCode: "EUR" }, subtotalAmountEstimated: true },
    };
    vi.mocked(getCartDetails).mockResolvedValue(data);
    const result = await readCartView();
    expect(result).toEqual({ status: "success", cart: {
      totalQuantity: 1, lines: [], cost: data.cost,
    } });
    expect(JSON.stringify(result)).not.toContain("private");
  });
  it("treats an expired cart as empty", async () => {
    vi.mocked(getCartDetails).mockResolvedValue(null);
    expect(await readCartView()).toEqual({ status: "success", cart: null });
  });
  it("reports an unavailable API without exposing its response", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(getCartDetails).mockRejectedValue(new Error("private response"));
    const result = await readCartView();
    expect(result.status).toBe("error");
    expect(JSON.stringify(result)).not.toContain("private response");
    log.mockRestore();
  });
});
