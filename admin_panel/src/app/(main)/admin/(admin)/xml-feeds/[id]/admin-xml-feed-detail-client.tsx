"use client";

// =============================================================
// FILE: src/app/(main)/admin/(admin)/xml-feeds/[id]/admin-xml-feed-detail-client.tsx
// Feed detay: edit form + runs history + category-map editor + items listesi
// =============================================================
import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft, PlayCircle, RefreshCw, Save, Trash2,
} from "lucide-react";

import { useAdminT } from "@/app/(main)/admin/_components/common/useAdminT";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

import {
  useGetXmlFeedAdminQuery,
  useUpdateXmlFeedAdminMutation,
  useTriggerXmlFeedRunAdminMutation,
  useListXmlFeedRunsAdminQuery,
  useGetXmlFeedCategoryMapAdminQuery,
  usePutXmlFeedCategoryMapAdminMutation,
  useDeleteXmlFeedCategoryMapEntryAdminMutation,
} from "@/integrations/hooks";
import type {
  XmlFeedUpdatePayload,
  XmlFeedRunStatus,
  XmlFeedCategoryMapDto,
} from "@/integrations/shared";

interface Props {
  id: string;
}

// -------------------------------------------------------------
const STATUS_VARIANTS: Record<XmlFeedRunStatus, "default" | "secondary" | "destructive" | "outline"> = {
  success:     "default",
  partial:     "secondary",
  started:     "outline",
  http_error:  "destructive",
  parse_error: "destructive",
  failed:      "destructive",
};

function formatDate(v: string | null): string {
  if (!v) return "—";
  try {
    return new Date(v).toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return v;
  }
}

// =============================================================
export default function AdminXmlFeedDetailClient({ id }: Props) {
  const t = useAdminT("admin.xmlFeeds");
  const router = useRouter();

  const {
    data: feed,
    isLoading: feedLoading,
    isFetching: feedFetching,
    refetch: refetchFeed,
  } = useGetXmlFeedAdminQuery(id);

  const { data: runs = [], refetch: refetchRuns } =
    useListXmlFeedRunsAdminQuery({ id, limit: 20 });

  const { data: categoryMap = [], refetch: refetchCatMap } =
    useGetXmlFeedCategoryMapAdminQuery(id);

  const [updateFeed, updateState] = useUpdateXmlFeedAdminMutation();
  const [triggerRun, runState]    = useTriggerXmlFeedRunAdminMutation();
  const [putCatMap,  catMapState] = usePutXmlFeedCategoryMapAdminMutation();
  const [deleteMap,  deleteMapState] = useDeleteXmlFeedCategoryMapEntryAdminMutation();

  // Edit form state
  const [form, setForm] = React.useState<XmlFeedUpdatePayload>({});

  React.useEffect(() => {
    if (feed) {
      setForm({
        name:             feed.name,
        url:              feed.url,
        format:           feed.format,
        interval_minutes: feed.interval_minutes,
        auth_header_name: feed.auth_header_name,
        auth_header_value: undefined, // mask placeholder — degistirilmezse gonderme
        is_active:        !!feed.is_active,
      });
    }
  }, [feed]);

  async function handleSave() {
    try {
      const patch = { ...form };
      // auth_header_value boş gelirse degistirme; "***" placeholder olmayan bir deger varsa gonder
      if (patch.auth_header_value === undefined || patch.auth_header_value === "") {
        delete patch.auth_header_value;
      }
      await updateFeed({ id, patch }).unwrap();
      toast.success(t("messages.updated"));
    } catch (err: any) {
      toast.error(err?.data?.error?.message ?? t("errors.generic"));
    }
  }

  async function handleRun() {
    if (!feed?.is_active) {
      toast.error(t("errors.feedInactive"));
      return;
    }
    try {
      const r = await triggerRun(id).unwrap();
      toast.success(t("messages.runCompleted", {
        added: r.items_added, updated: r.items_updated, failed: r.items_failed,
      }));
      refetchRuns();
      refetchCatMap();
    } catch (err: any) {
      toast.error(err?.data?.error?.message ?? t("errors.runFailed"));
    }
  }

  if (feedLoading) {
    return <div className="flex justify-center py-20"><Spinner className="h-8 w-8" /></div>;
  }
  if (!feed) {
    return (
      <Card><CardContent className="pt-6">
        <p className="text-sm text-muted-foreground">{t("errors.feedNotFound")}</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/admin/xml-feeds")}>
          <ArrowLeft className="mr-2 h-4 w-4" />{t("actions.backToList")}
        </Button>
      </CardContent></Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => router.push("/admin/xml-feeds")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <CardTitle className="text-base">
                  {feed.name}
                  {feed.last_status && (
                    <Badge variant={STATUS_VARIANTS[feed.last_status] ?? "outline"} className="ml-3">
                      {feed.last_status}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  {t("detail.lastFetched")}: {formatDate(feed.last_fetched_at)}
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={() => refetchFeed()} disabled={feedFetching}>
                <RefreshCw className={`h-4 w-4 ${feedFetching ? "animate-spin" : ""}`} />
              </Button>
              <Button onClick={handleRun} disabled={!feed.is_active || runState.isLoading}>
                {runState.isLoading ? <Spinner className="mr-2 h-4 w-4" /> : <PlayCircle className="mr-2 h-4 w-4" />}
                {t("actions.runNow")}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="settings">
        <TabsList>
          <TabsTrigger value="settings">{t("tabs.settings")}</TabsTrigger>
          <TabsTrigger value="runs">{t("tabs.runs")} ({runs.length})</TabsTrigger>
          <TabsTrigger value="categoryMap">{t("tabs.categoryMap")} ({categoryMap.length})</TabsTrigger>
        </TabsList>

        {/* Settings / edit form */}
        <TabsContent value="settings" className="mt-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label>{t("fields.name")}</Label>
                <Input value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>{t("fields.url")}</Label>
                <Input type="url" value={form.url ?? ""} onChange={(e) => setForm({ ...form, url: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("fields.interval")}</Label>
                  <Input
                    type="number"
                    min={30}
                    max={10080}
                    value={form.interval_minutes ?? 240}
                    onChange={(e) =>
                      setForm({ ...form, interval_minutes: Number(e.target.value) || 240 })
                    }
                  />
                </div>
                <div className="space-y-2 flex items-end">
                  <div className="w-full flex items-center justify-between rounded-md border p-3">
                    <Label>{t("fields.isActive")}</Label>
                    <Switch
                      checked={form.is_active ?? true}
                      onCheckedChange={(v) => setForm({ ...form, is_active: v })}
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("fields.authHeaderName")}</Label>
                  <Input
                    value={form.auth_header_name ?? ""}
                    onChange={(e) => setForm({ ...form, auth_header_name: e.target.value })}
                    placeholder="X-API-Key"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("fields.authHeaderValue")}</Label>
                  <Input
                    type="password"
                    value={form.auth_header_value ?? ""}
                    onChange={(e) => setForm({ ...form, auth_header_value: e.target.value })}
                    placeholder={feed.auth_header_value === "***" ? "(kayitli — değiştirmek icin yaz)" : ""}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={updateState.isLoading}>
                  {updateState.isLoading ? <Spinner className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                  {t("actions.save")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Runs history */}
        <TabsContent value="runs" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              {runs.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">{t("runs.empty")}</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("runs.table.startedAt")}</TableHead>
                        <TableHead>{t("runs.table.status")}</TableHead>
                        <TableHead className="text-right">{t("runs.table.found")}</TableHead>
                        <TableHead className="text-right">{t("runs.table.added")}</TableHead>
                        <TableHead className="text-right">{t("runs.table.updated")}</TableHead>
                        <TableHead className="text-right">{t("runs.table.skipped")}</TableHead>
                        <TableHead className="text-right">{t("runs.table.failed")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {runs.map((run) => (
                        <TableRow key={run.id}>
                          <TableCell className="text-xs text-muted-foreground">{formatDate(run.started_at)}</TableCell>
                          <TableCell>
                            <Badge variant={STATUS_VARIANTS[run.status] ?? "outline"}>{run.status}</Badge>
                          </TableCell>
                          <TableCell className="text-right tabular-nums">{run.items_found}</TableCell>
                          <TableCell className="text-right tabular-nums text-success">{run.items_added}</TableCell>
                          <TableCell className="text-right tabular-nums">{run.items_updated}</TableCell>
                          <TableCell className="text-right tabular-nums text-muted-foreground">{run.items_skipped}</TableCell>
                          <TableCell className="text-right tabular-nums text-destructive">{run.items_failed}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Category map */}
        <TabsContent value="categoryMap" className="mt-4">
          <CategoryMapEditor
            feedId={id}
            rows={categoryMap}
            onSave={async (entries) => {
              try {
                await putCatMap({ id, body: { entries } }).unwrap();
                toast.success(t("messages.categoryMapSaved"));
                refetchCatMap();
              } catch (err: any) {
                toast.error(err?.data?.error?.message ?? t("errors.generic"));
              }
            }}
            onDelete={async (entryId) => {
              try {
                await deleteMap({ id, entryId }).unwrap();
                toast.success(t("messages.deleted"));
                refetchCatMap();
              } catch (err: any) {
                toast.error(err?.data?.error?.message ?? t("errors.generic"));
              }
            }}
            t={t}
            saving={catMapState.isLoading || deleteMapState.isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// -------------------------------------------------------------
// Category map editor — external string → local category/sub UUID
// -------------------------------------------------------------
function CategoryMapEditor({
  rows, onSave, onDelete, t, saving,
}: {
  feedId: string;
  rows: XmlFeedCategoryMapDto[];
  onSave: (entries: Array<{ external_category: string; local_category_id: string | null; local_subcategory_id: string | null }>) => Promise<void>;
  onDelete: (entryId: string) => Promise<void>;
  t: ReturnType<typeof useAdminT>;
  saving: boolean;
}) {
  // Local edit state: row'lar + yeni satir buffer
  const [drafts, setDrafts] = React.useState<Record<string, { cat: string; sub: string }>>({});

  React.useEffect(() => {
    const next: Record<string, { cat: string; sub: string }> = {};
    for (const r of rows) {
      next[r.id] = {
        cat: r.local_category_id ?? "",
        sub: r.local_subcategory_id ?? "",
      };
    }
    setDrafts(next);
  }, [rows]);

  const handleSaveAll = () => {
    const entries = rows.map((r) => ({
      external_category:    r.external_category,
      local_category_id:    drafts[r.id]?.cat || null,
      local_subcategory_id: drafts[r.id]?.sub || null,
    }));
    onSave(entries);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("categoryMap.title")}</CardTitle>
        <CardDescription>{t("categoryMap.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">{t("categoryMap.empty")}</p>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("categoryMap.table.external")}</TableHead>
                    <TableHead>{t("categoryMap.table.localCat")}</TableHead>
                    <TableHead>{t("categoryMap.table.localSub")}</TableHead>
                    <TableHead className="w-16 text-right">—</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium text-sm">{r.external_category}</TableCell>
                      <TableCell>
                        <Input
                          placeholder="category UUID"
                          value={drafts[r.id]?.cat ?? ""}
                          onChange={(e) =>
                            setDrafts((d) => ({
                              ...d,
                              [r.id]: { ...(d[r.id] ?? { cat: "", sub: "" }), cat: e.target.value },
                            }))
                          }
                          className="h-8 text-xs font-mono"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder="sub_category UUID"
                          value={drafts[r.id]?.sub ?? ""}
                          onChange={(e) =>
                            setDrafts((d) => ({
                              ...d,
                              [r.id]: { ...(d[r.id] ?? { cat: "", sub: "" }), sub: e.target.value },
                            }))
                          }
                          className="h-8 text-xs font-mono"
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => onDelete(r.id)} disabled={saving}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSaveAll} disabled={saving}>
                {saving ? <Spinner className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                {t("actions.save")}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
