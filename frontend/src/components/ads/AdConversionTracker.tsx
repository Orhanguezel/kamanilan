"use client";

import { useEffect } from "react";
import { trackAttributedConversion } from "@/lib/conversion-tracking";
import { trackAdConversion, type AdConversionEvent } from "@/lib/ad-conversions";

function analyticsEvent(eventType: AdConversionEvent) {
  if (eventType === "phone_click" || eventType === "whatsapp_click") return eventType;
  if (eventType === "offer_submit" || eventType === "seller_contact") return "generate_lead" as const;
  return null;
}

function trackEvent(eventType: AdConversionEvent, entityType: "listing" | "seller" | "product", entityId: string | number) {
  const eventName = analyticsEvent(eventType);
  if (!eventName) {
    trackAdConversion(eventType, entityType, entityId);
    return;
  }
  trackAttributedConversion(eventName, {
    entity_type: entityType,
    entity_id: entityId,
  }, { eventType, entityType, entityId });
}

export function AdConversionTracker({ eventType, entityType, entityId }: {
  eventType: AdConversionEvent;
  entityType: "listing" | "seller" | "product";
  entityId: string | number;
}) {
  useEffect(() => trackEvent(eventType, entityType, entityId), [eventType, entityType, entityId]);
  return null;
}

export function TrackedAdLink({ eventType, entityType, entityId, ...props }: React.ComponentProps<"a"> & {
  eventType: AdConversionEvent;
  entityType: "listing" | "seller" | "product";
  entityId: string | number;
}) {
  return <a {...props} onClick={(event) => {
    trackEvent(eventType, entityType, entityId);
    props.onClick?.(event);
  }} />;
}
