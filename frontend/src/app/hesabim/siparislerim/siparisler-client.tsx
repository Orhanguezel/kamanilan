"use client";

import { useState } from "react";
import { useOrderListQuery, useCancelOrderMutation } from "@/modules/order/order.service";
import type { Order } from "@/modules/order/order.type";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package, Loader2, Search, ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  translations: Record<string, string>;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  processing: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
  pickup: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  shipped: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400",
  delivered: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  on_hold: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
};

const STATUS_FILTERS = [
  { value: "", label: "Tümü" },
  { value: "pending", label: "Bekliyor" },
  { value: "confirmed", label: "Onaylandı" },
  { value: "processing", label: "Hazırlanıyor" },
  { value: "shipped", label: "Kargoda" },
  { value: "delivered", label: "Teslim Edildi" },
  { value: "cancelled", label: "İptal" },
];

function getStatusLabel(status: string, tr: Record<string, string>) {
  const map: Record<string, string> = {
    pending: tr.status_pending,
    confirmed: tr.status_confirmed,
    processing: tr.status_processing,
    pickup: tr.status_pickup,
    shipped: tr.status_shipped,
    delivered: tr.status_delivered,
    cancelled: tr.status_cancelled,
    on_hold: tr.status_on_hold,
  };
  return map[status] ?? status;
}

export function SiparislerClient({ translations: tr }: Props) {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [cancelConfirmId, setCancelConfirmId] = useState<string | null>(null);

  const { data, isLoading } = useOrderListQuery({ page, status: statusFilter });
  const cancelMutation = useCancelOrderMutation();

  const orders: Order[] = data?.data ?? [];
  const total = data?.total ?? 0;
  const limit = data?.limit ?? 20;
  const totalPages = Math.ceil(total / limit);

  const canCancelOrder = (order: Order) =>
    !["cancelled", "delivered", "shipped"].includes(order.status);

  return (
    <div className="rounded-lg border bg-card p-6">
      <h2 className="mb-6 text-lg font-semibold">{tr.my_orders}</h2>

      {/* Status filter */}
      <div className="mb-4 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => { setStatusFilter(f.value); setPage(1); }}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              statusFilter === f.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80 text-muted-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
          <Package className="mb-3 h-10 w-10 opacity-30" />
          <p className="text-sm">{tr.no_orders}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="rounded-lg border p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">#{order.order_number}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        STATUS_COLORS[order.status] ?? "bg-muted text-muted-foreground"
                      }`}
                    >
                      {getStatusLabel(order.status, tr)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString("tr-TR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  {order.items && order.items.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {order.items.length} {tr.items_count}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    {Number(order.total_amount).toLocaleString("tr-TR", {
                      minimumFractionDigits: 2,
                    })}{" "}
                    {order.currency}
                  </p>
                  <div className="mt-2 flex gap-2 justify-end">
                    {canCancelOrder(order) && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive border-destructive hover:bg-destructive/10 h-7 text-xs"
                        onClick={() => setCancelConfirmId(order.id)}
                      >
                        {tr.cancel_order}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            {tr.previous}
          </Button>
          <span className="text-sm text-muted-foreground">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            {tr.next}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Cancel confirmation dialog */}
      {cancelConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-lg bg-card p-6 shadow-xl">
            <h3 className="mb-2 font-semibold">{tr.cancel_confirm}</h3>
            <p className="mb-6 text-sm text-muted-foreground">{tr.cancel_confirm_message}</p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setCancelConfirmId(null)}>
                {tr.cancel_no}
              </Button>
              <Button
                variant="destructive"
                disabled={cancelMutation.isPending}
                onClick={() => {
                  cancelMutation.mutate(cancelConfirmId, {
                    onSuccess: () => setCancelConfirmId(null),
                  });
                }}
              >
                {cancelMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {tr.cancel_yes}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
