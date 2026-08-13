import { describe, expect, it } from "bun:test";
import { COMMERCE_ENABLED, isCommerceRoute } from "./features";

describe("commerce feature flag", () => {
  it("keeps commerce disabled until payment and shipping are ready", () => {
    expect(COMMERCE_ENABLED).toBe(false);
  });

  it("identifies cart, checkout and order-success routes", () => {
    expect(isCommerceRoute("/sepet")).toBe(true);
    expect(isCommerceRoute("/odeme")).toBe(true);
    expect(isCommerceRoute("/siparis/basarili")).toBe(true);
    expect(isCommerceRoute("/ilanlar")).toBe(false);
  });
});
