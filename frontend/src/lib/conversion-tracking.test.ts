import { describe, expect, it } from "bun:test";
import { sanitizeConversionParams } from "./conversion-tracking";

describe("sanitizeConversionParams", () => {
  it("keeps analytics-safe primitive values", () => {
    expect(sanitizeConversionParams({ method: "email", count: 1, verified: true })).toEqual({
      method: "email",
      count: 1,
      verified: true,
    });
  });

  it("drops absent values", () => {
    expect(sanitizeConversionParams({ listing_id: undefined, category_id: null })).toEqual({});
  });
});
