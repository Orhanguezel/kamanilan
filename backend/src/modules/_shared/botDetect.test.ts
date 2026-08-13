import { describe, expect, it } from "bun:test";

import { isBotUserAgent } from "./botDetect";

describe("isBotUserAgent", () => {
  it("recognizes common crawler user agents", () => {
    expect(isBotUserAgent("Mozilla/5.0 (compatible; Googlebot/2.1)")).toBe(true);
    expect(isBotUserAgent("Mozilla/5.0 Chrome-Lighthouse")).toBe(true);
  });

  it("does not classify normal browsers or missing headers as bots", () => {
    expect(isBotUserAgent("Mozilla/5.0 AppleWebKit/537.36 Chrome/140 Safari/537.36")).toBe(false);
    expect(isBotUserAgent(undefined)).toBe(false);
  });
});
