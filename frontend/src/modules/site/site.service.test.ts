import { describe, expect, it } from "bun:test";
import { sumCategoryCounts } from "./site.utils";

describe("sumCategoryCounts", () => {
  it("returns the current total across active categories", () => {
    expect(sumCategoryCounts({ tarim: 2, emlak: 3, hizmet: 1 })).toBe(6);
  });

  it("returns zero when there are no active listings", () => {
    expect(sumCategoryCounts({})).toBe(0);
  });
});
