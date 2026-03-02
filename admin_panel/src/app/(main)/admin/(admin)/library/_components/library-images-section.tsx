'use client';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Trash2, Image as ImageIcon, Copy, CheckCircle2, Star } from 'lucide-react';
import { AdminImageUploadField } from '@/app/(main)/admin/_components/common/AdminImageUploadField';
import { resolveMediaUrl } from '@/lib/media-url';
import type {
  LibraryImageDto,
  LibraryImageCreatePayload,
  LibraryImageUpdatePayload,
} from '@/integrations/shared';
import {
  useListLibraryImagesAdminQuery,
  useCreateLibraryImageAdminMutation,
  useUpdateLibraryImageAdminMutation,
  useRemoveLibraryImageAdminMutation,
} from '@/integrations/hooks';

export type LibraryImagesSectionProps = {
  libraryId: string;
  locale: string;
  disabled?: boolean;
  onSelectAsCover?: (url: string) => void;
  coverUrl?: string;
  metadata?: Record<string, string | number | boolean>;
};

const toStr = (v: unknown) => (v === null || v === undefined ? '' : String(v));

function resolveUrl(url: string) {
  return resolveMediaUrl(url);
}

function normalizeRows(data: any): LibraryImageDto[] {
  if (Array.isArray(data)) return data as LibraryImageDto[];
  if (Array.isArray(data?.items)) return data.items as LibraryImageDto[];
  if (Array.isArray(data?.data)) return data.data as LibraryImageDto[];
  if (Array.isArray(data?.rows)) return data.rows as LibraryImageDto[];
  return [];
}

function orderOf(r: any): number {
  const n = Number(r?.display_order);
  return Number.isFinite(n) ? n : 0;
}

function imageIdOf(r: any): string {
  const v = r?.id ?? r?.image_id ?? r?.imageId ?? r?.imageID;
  return v ? String(v) : '';
}

const UrlInline: React.FC<{ url: string; disabled?: boolean }> = ({ url, disabled }) => {
  const safe = (url || '').trim();

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!safe) return;

    try {
      await navigator.clipboard.writeText(safe);
      toast.success('URL kopyalandı.');
    } catch {
      toast.error('URL kopyalanamadı.');
    }
  };

  return (
    <div className="flex items-center gap-2 mt-1 min-w-0">
      <div
        className="text-[10px] text-muted-foreground truncate flex-1"
        title={safe}
      >
        {safe}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-5 w-5 shrink-0"
        onClick={handleCopy}
        disabled={disabled || !safe}
        title="URL'i kopyala"
      >
        <Copy className="h-3 w-3" />
      </Button>
    </div>
  );
};

export const LibraryImagesSection: React.FC<LibraryImagesSectionProps> = ({
  libraryId,
  locale,
  disabled,
  onSelectAsCover,
  coverUrl,
  metadata,
}) => {
  const { data, isLoading, isFetching, refetch } = useListLibraryImagesAdminQuery(
    { id: libraryId, locale } as any,
    { skip: !libraryId },
  );

  const [createImg, { isLoading: creating }] = useCreateLibraryImageAdminMutation();
  const [updateImg, { isLoading: updating }] = useUpdateLibraryImageAdminMutation();
  const [removeImg, { isLoading: deleting }] = useRemoveLibraryImageAdminMutation();

  const busy = !!disabled || creating || updating || deleting;
  const rows: LibraryImageDto[] = useMemo(() => normalizeRows(data), [data]);
  const inflightUrlsRef = useRef<Set<string>>(new Set());
  const [lastUploadedUrl, setLastUploadedUrl] = useState<string>('');

  const sortedRows = useMemo(() => {
    return rows
      .slice()
      .sort(
        (a: any, b: any) => orderOf(a) - orderOf(b) || String(a.id).localeCompare(String(b.id)),
      );
  }, [rows]);

  const getNextOrder = () => {
    const maxOrder = rows.reduce((m, r: any) => Math.max(m, orderOf(r)), 0);
    return maxOrder + 10;
  };

  const createLibraryImageFromUrl = async (url: string) => {
    const safeUrl = url.trim();
    if (!safeUrl) return;

    const exists = rows.some((r: any) => (r.image_url || '').trim() === safeUrl);
    if (exists) return;

    if (inflightUrlsRef.current.has(safeUrl)) return;
    inflightUrlsRef.current.add(safeUrl);

    try {
      const payload: LibraryImageCreatePayload = {
        image_url: safeUrl,
        image_asset_id: null,
        is_active: true,
        display_order: getNextOrder(),
        locale,
        title: null,
        alt: null,
        caption: null,
      };

      await createImg({ id: libraryId, payload } as any).unwrap();
      toast.success('Galeri görseli eklendi.');
      await refetch();
    } catch (err: any) {
      toast.error(err?.data?.error?.message || err?.message || 'Resim kaydı oluşturulamadı.');
    } finally {
      inflightUrlsRef.current.delete(safeUrl);
    }
  };

  const handleUploadedUrl = async (url: string) => {
    setLastUploadedUrl(url);
    await createLibraryImageFromUrl(url);
  };

  const handleSetOrder = useCallback(
    async (r: LibraryImageDto, display_order: number) => {
      const imageId = imageIdOf(r);
      if (!imageId) return;

      try {
        const patch: LibraryImageUpdatePayload = { display_order, locale };
        await updateImg({ id: libraryId, imageId, patch } as any).unwrap();
        toast.success('Sıralama güncellendi.');
        await refetch();
      } catch (err: any) {
        toast.error(err?.data?.error?.message || err?.message || 'Sıralama güncellenemedi.');
      }
    },
    [libraryId, locale, updateImg, refetch],
  );

  const handleDelete = useCallback(
    async (r: LibraryImageDto) => {
      const imageId = imageIdOf(r);
      if (!imageId) return;
      if (!confirm('Bu görseli silmek istiyor musun?')) return;

      try {
        await removeImg({ id: libraryId, imageId } as any).unwrap();
        toast.success('Görsel silindi.');
        await refetch();
      } catch (err: any) {
        toast.error(err?.data?.error?.message || err?.message || 'Silme hatası.');
      }
    },
    [libraryId, removeImg, refetch],
  );

  return (
    <Card className="overflow-hidden">
      <CardHeader className="py-3 bg-muted/30 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-primary" />
            Galeri Görselleri
          </CardTitle>
          {(isLoading || isFetching) && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        <div className="rounded-lg border bg-muted/20 p-4">
          <AdminImageUploadField
            label="Yeni görsel yükle"
            bucket="default"
            folder="library/gallery"
            metadata={metadata}
            multiple
            value={lastUploadedUrl}
            onChange={handleUploadedUrl}
            disabled={busy}
          />
        </div>

        {sortedRows.length > 0 && (
          <div className="space-y-3">
            {sortedRows.map((r: any) => {
              const id = imageIdOf(r);
              const url = (r.image_url || '').trim();
              const isCover = !!coverUrl && coverUrl === url;
              const resolved = resolveUrl(url);

              return (
                <div
                  key={id || String(url)}
                  className={`group relative border rounded-lg p-3 transition-all hover:shadow-sm ${
                    isCover ? 'border-primary bg-primary/5 ring-1 ring-primary/10' : 'bg-card'
                  }`}
                >
                  <div className="flex gap-4">
                    <div className="w-20 h-20 shrink-0 bg-white rounded-md border overflow-hidden relative group/img">
                      <img
                        src={resolved}
                        alt={toStr(r.alt)}
                        className="w-full h-full object-cover transition-transform group-hover/img:scale-105"
                        onError={(e) => {
                          const img = e.currentTarget as HTMLImageElement;
                          if (!img.dataset.triedFallback) {
                            img.dataset.triedFallback = '1';
                            // If primary URL fails, keep deterministic placeholder
                          }
                          img.src = 'https://placehold.co/100x100?text=Error';
                        }}
                      />
                      {isCover && (
                        <div className="absolute top-0 right-0 p-1">
                           <div className="bg-primary text-primary-foreground rounded-full p-0.5 shadow-sm">
                             <CheckCircle2 className="h-3 w-3" />
                           </div>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono text-muted-foreground">
                              #{orderOf(r)}
                            </span>
                            {isCover && <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Kapak Görseli</span>}
                          </div>
                          <UrlInline url={url} disabled={busy} />
                        </div>

                        <div className="flex gap-1 shrink-0">
                          {onSelectAsCover && url && !isCover && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 text-[10px] hover:bg-primary hover:text-primary-foreground transition-colors"
                              disabled={busy}
                              onClick={() => onSelectAsCover(url)}
                            >
                              <Star className="h-3 w-3 mr-1" /> Kapak Yap
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:bg-destructive/10"
                            disabled={busy}
                            onClick={() => handleDelete(r)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pt-2 mt-2 border-t border-dashed">
                        <Label className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">Görüntüleme Sırası:</Label>
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            className="h-7 w-16 text-[10px] text-center"
                            disabled={busy}
                            defaultValue={orderOf(r)}
                            onBlur={(e) => {
                               const val = Number(e.target.value) || 0;
                               if (val !== orderOf(r)) handleSetOrder(r, val);
                            }}
                          />
                        </div>
                        {isCover && <div className="ml-auto text-[10px] text-primary italic">Kapak olarak aktif</div>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {sortedRows.length === 0 && !isLoading && (
          <div className="text-xs text-muted-foreground italic text-center py-8 border-2 border-dashed rounded-lg bg-muted/10">
            Galeri görseli bulunmuyor.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
