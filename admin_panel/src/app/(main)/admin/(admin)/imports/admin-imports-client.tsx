"use client";

// =============================================================
// FILE: src/app/(main)/admin/(admin)/imports/admin-imports-client.tsx
// Toplu Import liste + upload (inline form)
// =============================================================
import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Upload, FileSpreadsheet, RefreshCw, Trash2, ChevronRight, FileCheck2, AlertCircle } from "lucide-react";

import { useAdminT } from "@/app/(main)/admin/_components/common/useAdminT";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

import {
  useListImportJobsAdminQuery,
  useUploadImportJobAdminMutation,
  useDeleteImportJobAdminMutation,
} from "@/integrations/hooks";
import type { ImportJobDto, ImportJobStatus } from "@/integrations/shared";

// -------------------------------------------------------------
// Status badge
// -------------------------------------------------------------
const STATUS_VARIANTS: Record<ImportJobStatus, "default" | "secondary" | "destructive" | "outline"> = {
  pending:    "outline",
  parsed:     "secondary",
  review:     "secondary",
  importing:  "default",
  completed:  "default",
  failed:     "destructive",
};

function StatusBadge({ status }: { status: ImportJobStatus }) {
  return <Badge variant={STATUS_VARIANTS[status] ?? "outline"}>{status}</Badge>;
}

function formatDate(v: string | null): string {
  if (!v) return "-";
  try {
    return new Date(v).toLocaleString("tr-TR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return v;
  }
}

function formatBytes(n: number): string {
  if (!n) return "0 B";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

// -------------------------------------------------------------
// Main component
// -------------------------------------------------------------
export default function AdminImportsClient() {
  const t = useAdminT("admin.imports");
  const router = useRouter();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const { data: jobs = [], isLoading, isFetching, refetch } = useListImportJobsAdminQuery();
  const [uploadJob, { isLoading: uploading }] = useUploadImportJobAdminMutation();
  const [deleteJob, { isLoading: deleting }]  = useDeleteImportJobAdminMutation();

  const busy = isLoading || isFetching || uploading || deleting;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset input so ayni dosya tekrar secilebilir
    e.target.value = "";

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await uploadJob(formData).unwrap();
      toast.success(t("messages.uploaded", { rows: res.total_rows }));
      router.push(`/admin/imports/${res.job_id}`);
    } catch (err: any) {
      toast.error(err?.data?.error?.message ?? t("errors.uploadFailed"));
    }
  };

  const handleDelete = async (job: ImportJobDto) => {
    if (!window.confirm(t("deleteConfirm", { name: job.file_name }))) return;
    try {
      await deleteJob(job.id).unwrap();
      toast.success(t("messages.deleted"));
    } catch (err: any) {
      toast.error(err?.data?.error?.message ?? t("errors.generic"));
    }
  };

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
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
                className="hidden"
                onChange={handleFileSelect}
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={busy}
              >
                {uploading ? <Spinner className="mr-2 h-4 w-4" /> : <Upload className="mr-2 h-4 w-4" />}
                {t("actions.upload")}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {jobs.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-muted-foreground">
              <FileSpreadsheet className="h-10 w-10 opacity-40" />
              <p className="text-sm">{t("empty.title")}</p>
              <p className="text-xs">{t("empty.hint")}</p>
            </div>
          )}

          {jobs.length > 0 && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("table.fileName")}</TableHead>
                    <TableHead>{t("table.status")}</TableHead>
                    <TableHead className="text-right">{t("table.rows")}</TableHead>
                    <TableHead className="text-right">{t("table.imported")}</TableHead>
                    <TableHead>{t("table.createdAt")}</TableHead>
                    <TableHead className="w-32 text-right">{t("table.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{job.file_name}</span>
                          <span className="text-xs text-muted-foreground">
                            {job.source_type.toUpperCase()} · {formatBytes(job.file_size)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell><StatusBadge status={job.status} /></TableCell>
                      <TableCell className="text-right tabular-nums">
                        {job.valid_rows}/{job.total_rows}
                        {job.invalid_rows > 0 && (
                          <span className="ml-1 text-xs text-destructive">
                            (!{job.invalid_rows})
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {job.status === "completed" ? (
                          <span className="inline-flex items-center gap-1 text-success">
                            <FileCheck2 className="h-3.5 w-3.5" />
                            {job.imported_count}
                          </span>
                        ) : job.status === "failed" ? (
                          <span className="inline-flex items-center gap-1 text-destructive">
                            <AlertCircle className="h-3.5 w-3.5" />
                            {job.imported_count}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">{job.imported_count}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDate(job.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button asChild variant="ghost" size="icon" title={t("actions.open")}>
                            <Link href={`/admin/imports/${job.id}`}>
                              <ChevronRight className="h-4 w-4" />
                            </Link>
                          </Button>
                          {job.status !== "importing" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(job)}
                              title={t("actions.delete")}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
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
    </div>
  );
}
