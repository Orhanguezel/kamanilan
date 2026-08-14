export type AdsOperationTab = "slots" | "packages" | "calendar" | "waitlist" | "requests" | "reports";

export const ADS_OPERATION_TABS: Array<{ key: AdsOperationTab; label: string }> = [
  { key: "slots", label: "Slotlar" },
  { key: "packages", label: "Paketler" },
  { key: "calendar", label: "Takvim" },
  { key: "waitlist", label: "Bekleme listesi" },
  { key: "requests", label: "Self-servis talepleri" },
  { key: "reports", label: "Raporlar" },
];

export function dateOffset(days: number, now = new Date()): string {
  return new Date(now.getTime() + days * 86_400_000).toISOString().slice(0, 10);
}

export function asItems(payload: unknown): Array<Record<string, unknown>> {
  if (!payload || typeof payload !== "object") return [];
  const items = (payload as { items?: unknown }).items;
  return Array.isArray(items)
    ? items.filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
    : [];
}
