"use client";

// =============================================================
// FILE: src/app/(main)/admin/(admin)/xml-feeds/admin-xml-feeds-client.tsx
// XML Feed listesi + create dialog + manuel run
// =============================================================
import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  PlayCircle, Plus, RefreshCw, Trash2, ChevronRight, Rss,
} from "lucide-react";

import { useAdminT } from "@/app/(main)/admin/_components/common/useAdminT";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

import {
  useListXmlFeedsAdminQuery,
  useCreateXmlFeedAdminMutation,
  useDeleteXmlFeedAdminMutation,
  useTriggerXmlFeedRunAdminMutation,
} from "@/integrations/hooks";
import type {
  XmlFeedDto,
  XmlFeedFormat,
  XmlFeedCreatePayload,
  XmlFeedRunStatus,
} from "@/integrations/shared";

// -------------------------------------------------------------
const STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  success:     "default",
  partial:     "secondary",
  started:     "outline",
  http_error:  "destructive",
  parse_error: "destructive",
  failed:      "destructive",
};

function StatusBadge({ status }: { status: XmlFeedRunStatus | null }) {
  if (!status) return <Badge variant="outline">—</Badge>;
  return <Badge variant={STATUS_VARIANTS[status] ?? "outline"}>{status}</Badge>;
}

function formatDate(v: string | null): string {
  if (!v) return "—";
  try {
    return new Date(v).toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return v;
  }
}

// -------------------------------------------------------------
// Create form initial
// -------------------------------------------------------------
const EMPTY_FORM: XmlFeedCreatePayload = {
  name:              "",
  url:               "",
  format:            "sahibinden",
  interval_minutes:  240,
  is_active:         true,
  auth_header_name:  null,
  auth_header_value: null,
};

// =============================================================
export default function AdminXmlFeedsClient() {
  const t = useAdminT("admin.xmlFeeds");

  const { data: feeds = [], isLoading, isFetching, refetch } = useListXmlFeedsAdminQuery();
  const [createFeed, createState] = useCreateXmlFeedAdminMutation();
  const [deleteFeed, deleteState] = useDeleteXmlFeedAdminMutation();
  const [triggerRun, runState]    = useTriggerXmlFeedRunAdminMutation();

  const [showCreate, setShowCreate] = React.useState(false);
  const [form, setForm] = React.useState<XmlFeedCreatePayload>(EMPTY_FORM);

  const busy =
    isLoading || isFetching ||
    createState.isLoading || deleteState.isLoading || runState.isLoading;

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.url.trim()) {
      toast.error(t("errors.requiredFields"));
      return;
    }
    try {
      await createFeed({
        ...form,
        name: form.name.trim(),
        url:  form.url.trim(),
        auth_header_name:  form.auth_header_name?.trim() || null,
        auth_header_value: form.auth_header_value?.trim() || null,
      }).unwrap();
      toast.success(t("messages.created"));
      setForm(EMPTY_FORM);
      setShowCreate(false);
    } catch (err: any) {
      toast.error(err?.data?.error?.message ?? t("errors.createFailed"));
    }
  }

  async function handleDelete(feed: XmlFeedDto) {
    if (!window.confirm(t("deleteConfirm", { name: feed.name }))) return;
    try {
      await deleteFeed(feed.id).unwrap();
      toast.success(t("messages.deleted"));
    } catch (err: any) {
      toast.error(err?.data?.error?.message ?? t("errors.generic"));
    }
  }

  async function handleRun(feed: XmlFeedDto) {
    if (!feed.is_active) {
      toast.error(t("errors.feedInactive"));
      return;
    }
    try {
      const r = await triggerRun(feed.id).unwrap();
      toast.success(t("messages.runCompleted", {
        added:   r.items_added,
        updated: r.items_updated,
        failed:  r.items_failed,
      }));
    } catch (err: any) {
      toast.error(err?.data?.error?.message ?? t("errors.runFailed"));
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base">{t("header.title")}</CardTitle>
              <CardDescription>{t("header.description")}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => refetch()} disabled={busy}>
                <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
              </Button>
              <Button onClick={() => setShowCreate(true)} disabled={busy}>
                <Plus className="mr-2 h-4 w-4" />
                {t("actions.create")}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {feeds.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-muted-foreground">
              <Rss className="h-10 w-10 opacity-40" />
              <p className="text-sm">{t("empty.title")}</p>
              <p className="text-xs">{t("empty.hint")}</p>
            </div>
          )}

          {feeds.length > 0 && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("table.name")}</TableHead>
                    <TableHead>{t("table.url")}</TableHead>
                    <TableHead>{t("table.format")}</TableHead>
                    <TableHead>{t("table.status")}</TableHead>
                    <TableHead>{t("table.interval")}</TableHead>
                    <TableHead>{t("table.lastFetched")}</TableHead>
                    <TableHead className="w-40 text-right">{t("table.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feeds.map((feed) => (
                    <TableRow key={feed.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{feed.name}</span>
                          {!feed.is_active && (
                            <span className="text-xs text-muted-foreground">{t("state.inactive")}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-xs text-muted-foreground">
                        {feed.url}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{feed.format}</Badge>
                      </TableCell>
                      <TableCell><StatusBadge status={feed.last_status} /></TableCell>
                      <TableCell className="tabular-nums text-sm">
                        {feed.interval_minutes} dk
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDate(feed.last_fetched_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRun(feed)}
                            disabled={!feed.is_active || runState.isLoading}
                            title={t("actions.runNow")}
                          >
                            <PlayCircle className="h-4 w-4" />
                          </Button>
                          <Button asChild variant="ghost" size="icon" title={t("actions.open")}>
                            <Link href={`/admin/xml-feeds/${feed.id}`}>
                              <ChevronRight className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(feed)}
                            title={t("actions.delete")}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("create.title")}</DialogTitle>
            <DialogDescription>{t("create.description")}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="feed-name">{t("fields.name")} *</Label>
              <Input
                id="feed-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder={t("placeholders.name")}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="feed-url">{t("fields.url")} *</Label>
              <Input
                id="feed-url"
                type="url"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                placeholder="https://..."
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("fields.format")}</Label>
                <Select
                  value={form.format ?? "sahibinden"}
                  onValueChange={(v) => setForm({ ...form, format: v as XmlFeedFormat })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sahibinden">Sahibinden</SelectItem>
                    <SelectItem value="generic">Generic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="feed-interval">{t("fields.interval")}</Label>
                <Input
                  id="feed-interval"
                  type="number"
                  min={30}
                  max={10080}
                  value={form.interval_minutes ?? 240}
                  onChange={(e) =>
                    setForm({ ...form, interval_minutes: Number(e.target.value) || 240 })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="feed-auth-name">{t("fields.authHeaderName")}</Label>
                <Input
                  id="feed-auth-name"
                  value={form.auth_header_name ?? ""}
                  onChange={(e) => setForm({ ...form, auth_header_name: e.target.value })}
                  placeholder="X-API-Key"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="feed-auth-value">{t("fields.authHeaderValue")}</Label>
                <Input
                  id="feed-auth-value"
                  type="password"
                  value={form.auth_header_value ?? ""}
                  onChange={(e) => setForm({ ...form, auth_header_value: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-md border p-3">
              <Label htmlFor="feed-active">{t("fields.isActive")}</Label>
              <Switch
                id="feed-active"
                checked={form.is_active ?? true}
                onCheckedChange={(v) => setForm({ ...form, is_active: v })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>
                {t("actions.cancel")}
              </Button>
              <Button type="submit" disabled={createState.isLoading}>
                {createState.isLoading && <Spinner className="mr-2 h-4 w-4" />}
                {t("actions.save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
