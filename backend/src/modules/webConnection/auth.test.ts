import { describe, expect, it } from "bun:test";
import { isValidContentApiKey } from "./auth";

describe("isValidContentApiKey", () => {
  it("accepts bearer and x-api-key credentials", () => {
    expect(isValidContentApiKey("secret", "Bearer secret", undefined)).toBe(true);
    expect(isValidContentApiKey("secret", undefined, "secret")).toBe(true);
  });

  it("rejects missing, malformed, and different credentials", () => {
    expect(isValidContentApiKey(undefined, "Bearer secret", undefined)).toBe(false);
    expect(isValidContentApiKey("secret", undefined, undefined)).toBe(false);
    expect(isValidContentApiKey("secret", "Bearer wrong", undefined)).toBe(false);
  });
});
