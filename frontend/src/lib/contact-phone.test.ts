import { describe, expect, it } from "bun:test";
import { normalizeContactPhone } from "./contact-phone";

describe("normalizeContactPhone", () => {
  it("normalizes Turkish local phone numbers", () => {
    expect(normalizeContactPhone("0536 482 81 75")).toBe("+905364828175");
  });

  it("keeps international country codes", () => {
    expect(normalizeContactPhone("+90 (536) 482 81 75")).toBe("+905364828175");
    expect(normalizeContactPhone("0090 536 482 81 75")).toBe("+905364828175");
  });

  it("does not create a link without a usable phone number", () => {
    expect(normalizeContactPhone(null)).toBeNull();
    expect(normalizeContactPhone("telefon yok")).toBeNull();
  });
});
