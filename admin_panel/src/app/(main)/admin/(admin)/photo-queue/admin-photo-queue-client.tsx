"use client";

// =============================================================
// FILE: src/app/(main)/admin/(admin)/photo-queue/admin-photo-queue-client.tsx
// Stats cards + failed list + retry
// =============================================================
import * as React from "react";
import { toast } from "sonner";
import {
  RefreshCw, RotateCcw, ImageDown, Clock, CheckCircle2, XCircle, AlertTriangle,
} from "lucide-react";

import { useAdminT } from "@/app/(main)/admin/_components/common/useAdminT";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

import {
  useGetPhotoQueueStatsAdminQuery,
  useListPhotoQueueFailedAdminQuery,
  useRetryPhotoQueueItemAdminMutation,
} from "@/integrations/hooks";
import type { PhotoQueueDto } from "@/integrations/shared";

// -------------------------------------------------------------
function formatDate(v: string | null): string {
  if (!v) return "—";
  try {
    return new Date(v).toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return v;
  }
}

function StatCard({
  icon: Icon, label, value, tone,
}: {
  icon: typeof Clock;
  label: string;
  value: number;
  tone: "default" | "warning" | "success" | "danger";
}) {
  const toneClass = {
    default: "text-muted-foreground",
    warning: "text-amber-600",
    success: "text-success",
    danger:  "text-destructive",
  }[tone];

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
            <p className="mt-2 font-fraunces text-3xl tabular-nums">{value}</p>
          </div>
          <Icon className={`h-8 w-8 ${toneClass}`} />
        </div>
      </CardContent>
    </Card>
  );
}

// =============================================================
export default function AdminPhotoQueueClient() {
  const t = useAdminT("admin.photoQueue");

  const {
    data: stats,
    isFetching: statsFetching,
    refetch: refetchStats,
  } = useGetPhotoQueueStatsAdminQuery(undefined, { pollingInterval: 15_000 });

  const {
    data: failed = [],
    isFetching: failedFetching,
    refetch: refetchFailed,
  } = useListPhotoQueueFailedAdminQuery({ limit: 100 });

  const [retry, retryState] = useRetryPhotoQueueItemAdminMutation();

  const handleRetry = async (item: PhotoQueueDto) => {
    try {
      await retry(item.id).unwrap();
      toast.success(t("messages.retried"));
    } catch (err: any) {
      toast.error(err?.data?.error?.message ?? t("errors.generic"));
    }
  };

  const handleRefresh = () => {
    refetchStats();
    refetchFailed();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base">{t("header.title")}</CardTitle>
              <CardDescription>{t("header.description")}</CardDescription>
            </div>
            <Button variant="outline" size="icon" onClick={handleRefresh} disabled={statsFetching || failedFetching}>
              <RefreshCw className={`h-4 w-4 ${statsFetching ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Clock}        label={t("stats.pending")}     value={stats?.pending     ?? 0} tone="warning" />
        <StatCard icon={ImageDown}    label={t("stats.downloading")} value={stats?.downloading ?? 0} tone="default" />
        <StatCard icon={CheckCircle2} label={t("stats.done")}        value={stats?.done        ?? 0} tone="success" />
        <StatCard icon={XCircle}      label={t("stats.failed")}      value={stats?.failed      ?? 0} tone="danger" />
      </div>

      {/* Failed items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("failed.title")}</CardTitle>
          <CardDescription>{t("failed.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          {failedFetching && (
            <div className="flex justify-center py-4"><Spinner className="h-5 w-5" /></div>
          )}
          {!failedFetching && failed.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
              <CheckCircle2 className="h-8 w-8 text-success opacity-40" />
              <p className="text-sm">{t("failed.empty")}</p>
            </div>
          )}
          {!failedFetching && failed.length > 0 && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("failed.table.source")}</TableHead>
                    <TableHead>{t("failed.table.url")}</TableHead>
                    <TableHead>{t("failed.table.error")}</TableHead>
                    <TableHead className="text-right">{t("failed.table.retries")}</TableHead>
                    <TableHead>{t("failed.table.updatedAt")}</TableHead>
                    <TableHead className="w-16 text-right">—</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {failed.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{item.source}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-xs">
                        <a
                          href={item.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:underline"
                        >
                          {item.source_url}
                        </a>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="flex items-center gap-1 text-xs text-destructive">
                          <AlertTriangle className="h-3 w-3 shrink-0" />
                          <span className="truncate">{item.last_error ?? t("failed.noError")}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {item.retry_count}/3
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDate(item.updated_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRetry(item)}
                          disabled={retryState.isLoading}
                          title={t("actions.retry")}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
