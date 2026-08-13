import { trackAdConversion, type AdConversionEvent } from "./ad-conversions";

export type ConversionEventName =
  | "sign_up"
  | "login"
  | "generate_lead"
  | "listing_submit"
  | "seller_application_submit"
  | "phone_click"
  | "whatsapp_click";

export type ConversionEventParams = Record<
  string,
  string | number | boolean | null | undefined
>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (command: "event", eventName: string, params?: ConversionEventParams) => void;
  }
}

export function sanitizeConversionParams(
  params: ConversionEventParams,
): Record<string, string | number | boolean> {
  return Object.fromEntries(
    Object.entries(params).filter(
      (entry): entry is [string, string | number | boolean] =>
        entry[1] !== null && entry[1] !== undefined,
    ),
  );
}

export function trackConversion(
  eventName: ConversionEventName,
  params: ConversionEventParams = {},
): void {
  if (typeof window === "undefined") return;

  const payload = {
    ...sanitizeConversionParams(params),
    event_category: "conversion",
  };

  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, payload);
    return;
  }

  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event: eventName, ...payload });
}

export type AttributedConversion = {
  eventType: AdConversionEvent;
  entityType: "listing" | "seller" | "product";
  entityId: string | number;
};

/**
 * Records one user action in the two intentionally separate destinations:
 * GA4/Google Ads for marketing and the ad engine for sponsor attribution.
 */
export function trackAttributedConversion(
  eventName: ConversionEventName,
  params: ConversionEventParams,
  attribution?: AttributedConversion,
): void {
  trackConversion(eventName, params);
  if (attribution) {
    trackAdConversion(attribution.eventType, attribution.entityType, attribution.entityId);
  }
}
