import { describe, expect, it } from "bun:test";
import {
  normalizeGa4MeasurementId,
  normalizeGoogleAdsId,
  selectGoogleTagLoaderId,
} from "./tracking-ids";

describe("tracking IDs", () => {
  it("normalizes valid Google Ads IDs", () => {
    expect(normalizeGoogleAdsId("18115197942")).toBe("AW-18115197942");
    expect(normalizeGoogleAdsId("AW-18115197942")).toBe("AW-18115197942");
  });

  it("accepts valid GA4 measurement IDs", () => {
    expect(normalizeGa4MeasurementId("g-f0l4j8x30t")).toBe("G-F0L4J8X30T");
  });

  it("rejects unrelated identifiers", () => {
    expect(normalizeGoogleAdsId("215-828-1044")).toBeNull();
    expect(normalizeGa4MeasurementId("14481791763")).toBeNull();
  });

  it("prefers the working Ads destination for the shared Google tag loader", () => {
    expect(selectGoogleTagLoaderId("AW-18115197942", "G-F0L4J8X30T")).toBe(
      "AW-18115197942"
    );
    expect(selectGoogleTagLoaderId(null, "G-F0L4J8X30T")).toBe("G-F0L4J8X30T");
  });
});
