import { afterEach, describe, expect, mock, test } from "bun:test";
import { trackAdConversion } from "./ad-conversions";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
  mock.restore();
});

describe("reklam dönüşüm ilişkilendirmesi", () => {
  test("ilan iletişim dönüşümünü attribution endpointine yollar", async () => {
    const fetchMock = mock(() => Promise.resolve(new Response(null, { status: 204 })));
    globalThis.fetch = fetchMock as typeof fetch;
    trackAdConversion("offer_submit", "listing", 42);
    await Promise.resolve();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith("/api/v1/banners/conversion", expect.objectContaining({
      method: "POST",
      credentials: "include",
      body: JSON.stringify({ eventType: "offer_submit", entityType: "listing", entityId: "42" }),
    }));
  });
});
