"use client";

// =============================================================
// FILE: src/app/(main)/admin/(admin)/imports/[id]/admin-import-detail-client.tsx
// Job detay + wizard (mapping -> preview -> commit)
// =============================================================
import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft, Save, PlayCircle, RefreshCw, AlertTriangle, FileCheck2,
} from "lucide-react";

import { useAdminT } from "@/app/(main)/admin/_components/common/useAdminT";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

import {
  useGetImportJobAdminQuery,
  useListImportItemsAdminQuery,
  usePutImportMappingAdminMutation,
  useCommitImportJobAdminMutation,
} from "@/integrations/hooks";
import type {
  ImportJobDto,
  ImportJobItemDto,
  ImportJobItemStatus,
  ImportJobStatus,
  ImportMapping,
} from "@/integrations/shared";

interface Props {
  id: string;
}

// -------------------------------------------------------------
// Mapping form — her zorunlu alan icin kolon dropdown'u
// -------------------------------------------------------------
const MAPPING_FIELDS: Array<{ key: keyof ImportMapping; required?: boolean; labelKey: string }> = [
  { key: "title",             required: true,  labelKey: "title" },
  { key: "city",              required: true,  labelKey: "city" },
  { key: "district",          required: true,  labelKey: "district" },
  { key: "price",                               labelKey: "price" },
  { key: "currency",                            labelKey: "currency" },
  { key: "neighborhood",                        labelKey: "neighborhood" },
  { key: "address",                             labelKey: "address" },
  { key: "description",                         labelKey: "description" },
  { key: "excerpt",                             labelKey: "excerpt" },
  { key: "status",                              labelKey: "status" },
  { key: "category_slug",                       labelKey: "category_slug" },
  { key: "sub_category_slug",                   labelKey: "sub_category_slug" },
  { key: "brand_slug",                          labelKey: "brand_slug" },
  { key: "external_id",                         labelKey: "external_id" },
  { key: "photos",                              labelKey: "photos" },
  { key: "slug",                                labelKey: "slug" },
];

// -------------------------------------------------------------
// Helpers
// -------------------------------------------------------------
const STATUS_VARIANTS: Record<ImportJobStatus, "default" | "secondary" | "destructive" | "outline"> = {
  pending:    "outline",
  parsed:     "secondary",
  review:     "secondary",
  importing:  "default",
  completed:  "default",
  failed:     "destructive",
};

const ITEM_STATUS_VARIANTS: Record<ImportJobItemStatus, "default" | "secondary" | "destructive" | "outline"> = {
  valid:    "secondary",
  invalid:  "destructive",
  imported: "default",
  skipped:  "outline",
  failed:   "destructive",
};

function ItemErrors({ errors }: { errors: unknown }) {
  if (!Array.isArray(errors) || errors.length === 0) return <span className="text-muted-foreground">-</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {errors.slice(0, 3).map((e, i) => (
        <Badge key={i} variant="outline" className="text-[10px]">
          {String(e)}
        </Badge>
      ))}
      {errors.length > 3 && (
        <span className="text-xs text-muted-foreground">+{errors.length - 3}</span>
      )}
    </div>
  );
}

// =============================================================
// Main
// =============================================================
export default function AdminImportDetailClient({ id }: Props) {
  const t = useAdminT("admin.imports");
  const router = useRouter();

  const {
    data: job,
    isLoading: jobLoading,
    isFetching: jobFetching,
    refetch: refetchJob,
  } = useGetImportJobAdminQuery(id, { pollingInterval: 0 });

  const [activeItemStatus, setActiveItemStatus] =
    React.useState<ImportJobItemStatus>("valid");

  const {
    data: items = [],
    isFetching: itemsFetching,
    refetch: refetchItems,
  } = useListImportItemsAdminQuery(
    { jobId: id, params: { status: activeItemStatus, limit: 50 } },
    { skip: !job || job.status === "pending" },
  );

  const [putMapping, mappingState]     = usePutImportMappingAdminMutation();
  const [commitJob,  commitState]      = useCommitImportJobAdminMutation();

  // Mapping form state — upload sonrasi detected_columns'dan
  // preview_rows gelmiyor bu endpoint'te; items.raw_json'dan çıkariyoruz.
  const [mapping, setMapping] = React.useState<ImportMapping>({
    title:    "",
    city:     "",
    district: "",
  });

  // Kolon listesi — ilk item'in raw_json'undaki keys
  const detectedColumns: string[] = React.useMemo(() => {
    if (items.length === 0) return [];
    const first = items[0]?.raw_json;
    if (!first || typeof first !== "object") return [];
    return Object.keys(first);
  }, [items]);

  // Mevcut mapping varsa UI'a yansit
  React.useEffect(() => {
    if (job?.mapping_json && typeof job.mapping_json === "object") {
      setMapping(job.mapping_json as ImportMapping);
    }
  }, [job?.mapping_json]);

  async function handleSaveMapping() {
    if (!mapping.title || !mapping.city || !mapping.district) {
      toast.error(t("errors.mappingRequired"));
      return;
    }
    try {
      const res = await putMapping({ id, body: { mapping } }).unwrap();
      toast.success(
        t("messages.mappingSaved", {
          valid:   res.valid_rows,
          invalid: res.invalid_rows,
        }),
      );
      refetchJob();
      refetchItems();
    } catch (err: any) {
      toast.error(err?.data?.error?.message ?? t("errors.mappingFailed"));
    }
  }

  async function handleCommit() {
    if (!job || job.valid_rows === 0) {
      toast.error(t("errors.noValidItems"));
      return;
    }
    if (!window.confirm(t("commitConfirm", { count: job.valid_rows }))) return;
    try {
      const res = await commitJob({
        id,
        body: { skip_invalid: true, default_status: "active" },
      }).unwrap();
      toast.success(t("messages.committed", {
        imported: res.imported_count,
        failed:   res.failed_count,
      }));
      refetchJob();
      refetchItems();
    } catch (err: any) {
      if (err?.status === 402 && err?.data?.error?.message === "listing_limit_exceeded") {
        toast.error(t("errors.limitExceeded", {
          overage: err.data.error.overage ?? 0,
        }));
      } else {
        toast.error(err?.data?.error?.message ?? t("errors.commitFailed"));
      }
    }
  }

  if (jobLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!job) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">{t("errors.jobNotFound")}</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push("/admin/imports")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("actions.backToList")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const isReviewOrPending = job.status === "pending" || job.status === "review" || job.status === "parsed";
  const canCommit = job.status === "review" && job.valid_rows > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => router.push("/admin/imports")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <CardTitle className="text-base">
                  {job.file_name}
                  <Badge variant={STATUS_VARIANTS[job.status]} className="ml-3">
                    {job.status}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {t("detail.summary", {
                    total:    job.total_rows,
                    valid:    job.valid_rows,
                    invalid:  job.invalid_rows,
                    imported: job.imported_count,
                  })}
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={() => refetchJob()} disabled={jobFetching}>
                <RefreshCw className={`h-4 w-4 ${jobFetching ? "animate-spin" : ""}`} />
              </Button>
              {canCommit && (
                <Button onClick={handleCommit} disabled={commitState.isLoading}>
                  {commitState.isLoading ? (
                    <Spinner className="mr-2 h-4 w-4" />
                  ) : (
                    <PlayCircle className="mr-2 h-4 w-4" />
                  )}
                  {t("actions.commit", { count: job.valid_rows })}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Mapping (sadece pending / parsed / review iken) */}
      {isReviewOrPending && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("mapping.title")}</CardTitle>
            <CardDescription>{t("mapping.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {MAPPING_FIELDS.map((f) => {
                const value = mapping[f.key] ?? "";
                return (
                  <div key={f.key} className="space-y-2">
                    <Label>
                      {t(`mapping.fields.${f.labelKey}`)}
                      {f.required && <span className="text-destructive ml-1">*</span>}
                    </Label>
                    <Select
                      value={value || "none"}
                      onValueChange={(v) => {
                        setMapping((prev) => ({
                          ...prev,
                          [f.key]: v === "none" ? "" : v,
                        }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("mapping.selectColumn")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">{t("mapping.none")}</SelectItem>
                        {detectedColumns.map((col) => (
                          <SelectItem key={col} value={col}>
                            {col}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSaveMapping} disabled={mappingState.isLoading || detectedColumns.length === 0}>
                {mappingState.isLoading ? (
                  <Spinner className="mr-2 h-4 w-4" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {t("actions.validateAndSave")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Items preview (validate sonrasi) */}
      {job.status !== "pending" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("items.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs
              value={activeItemStatus}
              onValueChange={(v) => setActiveItemStatus(v as ImportJobItemStatus)}
            >
              <TabsList>
                <TabsTrigger value="valid">
                  {t("items.tabs.valid")} ({job.valid_rows})
                </TabsTrigger>
                <TabsTrigger value="invalid">
                  {t("items.tabs.invalid")} ({job.invalid_rows})
                </TabsTrigger>
                <TabsTrigger value="imported">
                  {t("items.tabs.imported")} ({job.imported_count})
                </TabsTrigger>
                <TabsTrigger value="failed">{t("items.tabs.failed")}</TabsTrigger>
              </TabsList>
              <TabsContent value={activeItemStatus} className="mt-4">
                {itemsFetching && (
                  <div className="flex justify-center py-4">
                    <Spinner className="h-5 w-5" />
                  </div>
                )}
                {!itemsFetching && items.length === 0 && (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    {t("items.empty")}
                  </p>
                )}
                {!itemsFetching && items.length > 0 && (
                  <ItemsTable items={items} t={t} />
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Completion summary */}
      {(job.status === "completed" || job.status === "failed") && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              {job.status === "completed" ? (
                <FileCheck2 className="h-5 w-5 text-success" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-destructive" />
              )}
              {t(`completion.${job.status}`)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              {t("completion.summary", {
                imported: job.imported_count,
                total:    job.valid_rows,
              })}
            </p>
            {job.finished_at && (
              <p className="mt-2 text-xs text-muted-foreground">
                {new Date(job.finished_at).toLocaleString("tr-TR")}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// Items table
// -------------------------------------------------------------
function ItemsTable({
  items,
  t,
}: {
  items: ImportJobItemDto[];
  t: ReturnType<typeof useAdminT>;
}) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12 text-right">#</TableHead>
            <TableHead>{t("items.table.title")}</TableHead>
            <TableHead>{t("items.table.status")}</TableHead>
            <TableHead>{t("items.table.errors")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const raw = item.raw_json as Record<string, string>;
            const normalized = item.normalized_json as { title?: string } | null;
            const displayTitle =
              normalized?.title ||
              Object.values(raw).find((v) => typeof v === "string" && v.length > 2) ||
              "-";
            return (
              <TableRow key={item.id}>
                <TableCell className="text-right tabular-nums text-xs text-muted-foreground">
                  {item.row_index + 1}
                </TableCell>
                <TableCell className="max-w-md truncate text-sm">{displayTitle}</TableCell>
                <TableCell>
                  <Badge variant={ITEM_STATUS_VARIANTS[item.status]}>
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <ItemErrors errors={item.errors_json} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
