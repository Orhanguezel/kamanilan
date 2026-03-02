import type { Metadata } from "next";
import { t } from "@/lib/t";
import { fetchAPI } from "@/lib/api-server";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import { KuponlarClient } from "./kuponlar-client";

export interface Coupon {
  id: string;
  code: string;
  title: string;
  description?: string | null;
  discount_type: "percent" | "amount";
  discount_value: string | number;
  min_order_amount?: string | number | null;
  max_discount?: string | number | null;
  max_uses?: number | null;
  uses_count: number;
  start_at?: string | null;
  end_at?: string | null;
  is_active: number | boolean;
  image_url?: string | null;
}

async function getCoupons(page = 1, limit = 12): Promise<{ items: Coupon[]; total: number }> {
  const offset = (page - 1) * limit;
  try {
    const res = await fetchAPI<Coupon[]>(`${API_ENDPOINTS.COUPONS}?limit=${limit}&offset=${offset}`, {}, "tr");
    // Backend returns array; total in x-total-count header (not accessible from fetchAPI here)
    const items = Array.isArray(res) ? res : [];
    return { items, total: items.length };
  } catch {
    return { items: [], total: 0 };
  }
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Kuponlar - Kaman İlan",
    description: "Kaman İlan'ın aktif kupon ve indirim kodlarını keşfedin.",
    alternates: { canonical: "/kuponlar" },
  };
}

export default async function KuponlarPage() {
  const { items } = await getCoupons(1, 50);
  return (
    <KuponlarClient
      coupons={items}
      breadcrumbs={[
        { label: t("common.home"), href: "/" },
        { label: "Kuponlar" },
      ]}
    />
  );
}
