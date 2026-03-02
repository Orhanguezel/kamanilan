"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, ChevronRight, CheckCheck } from "lucide-react";
import {
  useNotificationListQuery,
  useMarkAsReadMutation,
  useMarkAllReadMutation,
} from "@/modules/notification/notification.service";
import type { Notification } from "@/modules/notification/notification.type";
import { t } from "@/lib/t";

const LIMIT = 20;

export function NotificationClient() {
  const [offset, setOffset] = useState(0);
  const [isReadFilter, setIsReadFilter] = useState<boolean | undefined>(undefined);

  const { data: notifications = [], isLoading, isError } = useNotificationListQuery({
    limit: LIMIT,
    offset,
    is_read: isReadFilter,
  });
  const markAsRead = useMarkAsReadMutation();
  const markAllRead = useMarkAllReadMutation();

  function handleMarkAsRead(notification: Notification) {
    if (!notification.is_read) {
      markAsRead.mutate(notification.id);
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const tabs = [
    { key: undefined, label: t("notification.filter_all") },
    { key: false, label: t("notification.filter_unread") },
    { key: true, label: t("notification.filter_read") },
  ] as const;

  return (
    <div className="container py-6">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          {t("nav.home")}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">{t("notification.title")}</span>
      </nav>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">{t("notification.title")}</h1>
        <button
          onClick={() => markAllRead.mutate()}
          disabled={markAllRead.isPending}
          className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
        >
          <CheckCheck className="h-4 w-4" />
          {t("notification.mark_all_read")}
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex gap-2">
        {tabs.map((tab) => (
          <button
            key={String(tab.key)}
            onClick={() => {
              setIsReadFilter(tab.key as boolean | undefined);
              setOffset(0);
            }}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              isReadFilter === tab.key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-lg border p-4">
              <div className="flex gap-3">
                <div className="h-10 w-10 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-2/3 rounded bg-muted" />
                  <div className="h-3 w-full rounded bg-muted" />
                  <div className="h-3 w-1/4 rounded bg-muted" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-muted-foreground">{t("common.error")}</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Bell className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <p className="text-lg font-medium">{t("notification.no_notifications")}</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleMarkAsRead(notification)}
                className={`cursor-pointer rounded-lg border p-4 transition-colors hover:bg-muted/50 ${
                  !notification.is_read ? "border-primary/20 bg-primary/5" : ""
                }`}
              >
                <div className="flex gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                      !notification.is_read
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Bell className="h-5 w-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3
                        className={`text-sm ${
                          !notification.is_read ? "font-semibold" : "font-medium"
                        }`}
                      >
                        {notification.title}
                      </h3>
                      {!notification.is_read && (
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      {formatDate(notification.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load more / pagination */}
          <div className="mt-8 flex items-center justify-center gap-4">
            {offset > 0 && (
              <button
                onClick={() => setOffset(Math.max(0, offset - LIMIT))}
                className="rounded-md border px-3 py-2 text-sm hover:bg-muted"
              >
                {t("common.prev")}
              </button>
            )}
            {notifications.length === LIMIT && (
              <button
                onClick={() => setOffset(offset + LIMIT)}
                className="rounded-md border px-3 py-2 text-sm hover:bg-muted"
              >
                {t("common.next")}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
