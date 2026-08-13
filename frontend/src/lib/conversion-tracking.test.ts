import { afterEach, describe, expect, it, mock } from "bun:test";
import { sanitizeConversionParams, trackAttributedConversion, trackConversion } from "./conversion-tracking";

const originalFetch = globalThis.fetch;

afterEach(() => {
  delete (globalThis as typeof globalThis & { window?: unknown }).window;
  globalThis.fetch = originalFetch;
  mock.restore();
});

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

describe("conversion tracking", () => {
  it("uses checklist event names and includes the listing/category identity", () => {
    const gtag = mock(() => undefined);
    Object.assign(globalThis, { window: { gtag } });

    trackConversion("phone_click", { listing_id: "ilan-1", category_id: "cat-1" });

    expect(gtag).toHaveBeenCalledWith("event", "phone_click", {
      listing_id: "ilan-1",
      category_id: "cat-1",
      event_category: "conversion",
    });
  });

  it("sends an attributed action once to GA4 and once to the sponsor engine", async () => {
    const gtag = mock(() => undefined);
    const fetchMock = mock(() => Promise.resolve(new Response(null, { status: 204 })));
    Object.assign(globalThis, { window: { gtag } });
    globalThis.fetch = fetchMock as typeof fetch;

    trackAttributedConversion("whatsapp_click", {
      listing_id: "ilan-1",
      category_id: "cat-1",
    }, { eventType: "whatsapp_click", entityType: "listing", entityId: "ilan-1" });
    await Promise.resolve();

    expect(gtag).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith("/api/v1/banners/conversion", expect.objectContaining({
      method: "POST",
      body: JSON.stringify({ eventType: "whatsapp_click", entityType: "listing", entityId: "ilan-1" }),
    }));
  });

  it("uses the global gtag queue after the deferred loader starts", () => {
    const gtag = mock(() => undefined);
    Object.assign(globalThis, { window: { gtag, dataLayer: [] } });

    trackConversion("generate_lead", { listing_id: "42", category_id: "7" });

    expect(gtag).toHaveBeenCalledWith("event", "generate_lead", {
      listing_id: "42",
      category_id: "7",
      event_category: "conversion",
    });
  });
});
