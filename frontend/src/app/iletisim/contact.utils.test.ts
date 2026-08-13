import { describe, expect, it } from "bun:test";
import { normalizeContactPhone } from "./contact.utils";

describe("normalizeContactPhone", () => {
  it("adds the selected country code to a local number", () => {
    expect(normalizeContactPhone("+90", "532 123 45 67")).toBe("+90532 123 45 67");
  });

  it("keeps an international number unchanged", () => {
    expect(normalizeContactPhone("+90", "+49 170 1234567")).toBe("+49 170 1234567");
  });

  it("returns an empty value for an empty number", () => {
    expect(normalizeContactPhone("+90", "   ")).toBe("");
  });
});
