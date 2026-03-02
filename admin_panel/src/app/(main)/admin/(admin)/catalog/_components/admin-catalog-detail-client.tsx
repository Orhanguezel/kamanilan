'use client';

// =============================================================
// FILE: src/app/(main)/admin/(admin)/catalog/_components/admin-catalog-detail-client.tsx
// Admin Catalog Request — Detail / Edit
// =============================================================

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Mail, Trash2, Save } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { useAdminT } from '@/app/(main)/admin/_components/common/useAdminT';

import type { CatalogRequestDto, CatalogRequestStatus } from '@/integrations/shared';
import {
  useGetCatalogRequestAdminQuery,
  usePatchCatalogRequestAdminMutation,
  useRemoveCatalogRequestAdminMutation,
  useResendCatalogRequestAdminMutation,
} from '@/integrations/hooks';

/* ------------------------------------------------------------------ */

type FormValues = {
  status: CatalogRequestStatus;
  admin_notes: string;
};

function statusVariant(s: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (s === 'sent') return 'default';
  if (s === 'failed') return 'destructive';
  if (s === 'archived') return 'outline';
  return 'secondary';
}

function fmtDate(v: string | null | undefined): string {
  if (!v) return '-';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleString('tr-TR');
}

/* ------------------------------------------------------------------ */

export default function AdminCatalogDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const t = useAdminT('admin.catalog');

  const { data, isLoading, isFetching, error } = useGetCatalogRequestAdminQuery({ id });
  const [patchReq, { isLoading: isSaving }] = usePatchCatalogRequestAdminMutation();
  const [removeReq, { isLoading: isDeleting }] = useRemoveCatalogRequestAdminMutation();
  const [resendReq, { isLoading: isResending }] = useResendCatalogRequestAdminMutation();

  const [values, setValues] = React.useState<FormValues>({ status: 'new', admin_notes: '' });

  React.useEffect(() => {
    if (data) {
      setValues({
        status: data.status ?? 'new',
        admin_notes: data.admin_notes ?? '',
      });
    }
  }, [data]);

  const loading = isLoading || isFetching;
  const busy = loading || isSaving || isDeleting || isResending;

  const row = data as CatalogRequestDto | undefined;

  async function onSave() {
    if (busy) return;
    try {
      await patchReq({
        id,
        body: {
          status: values.status || undefined,
          admin_notes: values.admin_notes.trim() || null,
        },
      }).unwrap();
      toast.success(t('messages.saved'));
    } catch (err: any) {
      toast.error(err?.data?.error?.message || err?.message || t('messages.saveError'));
    }
  }

  async function onResend() {
    if (busy) return;
    try {
      await resendReq({ id }).unwrap();
      toast.success(t('messages.resent'));
    } catch (err: any) {
      toast.error(err?.data?.error?.message || err?.message || t('messages.resendError'));
    }
  }

  async function onDelete() {
    if (busy) return;
    if (!window.confirm(t('detail.confirmDelete'))) return;
    try {
      await removeReq({ id }).unwrap();
      toast.success(t('messages.deleted'));
      router.push('/admin/catalog');
    } catch (err: any) {
      toast.error(err?.data?.error?.message || err?.message || t('messages.deleteError'));
    }
  }

  /* Not found */
  if (!loading && error && !data) {
    return (
      <div className="space-y-4">
        <h1 className="text-lg font-semibold">{t('detail.notFoundTitle')}</h1>
        <p className="text-sm text-muted-foreground">
          {t('detail.notFoundDescription')} <code className="ml-1">{id}</code>
        </p>
        <Button variant="outline" onClick={() => router.push('/admin/catalog')}>
          <ArrowLeft className="mr-2 size-4" />
          {t('actions.backToList')}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold">{t('detail.title')}</h1>
            {row?.status ? <Badge variant={statusVariant(row.status)}>{row.status}</Badge> : null}
          </div>
          <p className="text-sm text-muted-foreground">{t('detail.subtitle')}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push('/admin/catalog')}>
            <ArrowLeft className="mr-2 size-4" />
            {t('actions.backToList')}
          </Button>
          <Button variant="outline" size="sm" onClick={onResend} disabled={busy}>
            <Mail className="mr-2 size-4" />
            {isResending ? t('actions.resending') : t('actions.resend')}
          </Button>
          <Button variant="destructive" size="sm" onClick={onDelete} disabled={busy}>
            <Trash2 className="mr-2 size-4" />
            {isDeleting ? t('actions.deleting') : t('actions.delete')}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* LEFT — Customer Info (read-only) */}
        <Card className="xl:col-span-2">
          <CardHeader className="gap-2">
            <CardTitle className="text-base">{t('detail.customerInfo')}</CardTitle>
            <CardDescription>{t('detail.customerInfoDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>{t('detail.customerName')}</Label>
              <Input value={row?.customer_name ?? ''} readOnly />
            </div>
            <div className="space-y-2">
              <Label>{t('detail.companyName')}</Label>
              <Input value={row?.company_name ?? ''} readOnly />
            </div>
            <div className="space-y-2">
              <Label>{t('detail.email')}</Label>
              <Input value={row?.email ?? ''} readOnly />
            </div>
            <div className="space-y-2">
              <Label>{t('detail.phone')}</Label>
              <Input value={row?.phone ?? ''} readOnly />
            </div>
            <div className="space-y-2">
              <Label>{t('detail.locale')}</Label>
              <Input value={row?.locale ?? ''} readOnly />
            </div>
            <div className="space-y-2">
              <Label>{t('detail.createdAt')}</Label>
              <Input value={row ? fmtDate(row.created_at) : ''} readOnly />
            </div>
            <div className="space-y-2">
              <Label>{t('detail.emailSentAt')}</Label>
              <Input value={row ? fmtDate(row.email_sent_at) : ''} readOnly />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>{t('detail.message')}</Label>
              <Textarea value={row?.message ?? ''} readOnly rows={4} />
            </div>

            <div className="md:col-span-2 text-sm text-muted-foreground">
              {t('detail.consentMarketing')}:{' '}
              <strong>{row?.consent_marketing ? t('detail.yes') : t('detail.no')}</strong>
              {' • '}
              {t('detail.consentTerms')}:{' '}
              <strong>{row?.consent_terms ? t('detail.yes') : t('detail.no')}</strong>
            </div>
          </CardContent>
        </Card>

        {/* RIGHT — Editable fields */}
        <Card>
          <CardHeader className="gap-2">
            <CardTitle className="text-base">{t('detail.adminSection')}</CardTitle>
            <CardDescription>{t('detail.adminSectionDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="space-y-2">
              <Label>{t('detail.statusLabel')}</Label>
              <Select
                value={values.status}
                onValueChange={(v) =>
                  setValues((p) => ({ ...p, status: v as CatalogRequestStatus }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">{t('status.new')}</SelectItem>
                  <SelectItem value="sent">{t('status.sent')}</SelectItem>
                  <SelectItem value="failed">{t('status.failed')}</SelectItem>
                  <SelectItem value="archived">{t('status.archived')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('detail.adminNotes')}</Label>
              <Textarea
                value={values.admin_notes}
                onChange={(e) => setValues((p) => ({ ...p, admin_notes: e.target.value }))}
                disabled={busy}
                placeholder={t('detail.adminNotesPlaceholder')}
                rows={6}
              />
            </div>

            <Button onClick={onSave} disabled={busy} className="w-full">
              <Save className="mr-2 size-4" />
              {isSaving ? t('actions.saving') : t('actions.save')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
