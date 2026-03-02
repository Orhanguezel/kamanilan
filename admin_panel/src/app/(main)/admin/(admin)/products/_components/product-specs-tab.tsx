// =============================================================
// FILE: src/app/(main)/admin/(admin)/products/_components/product-specs-tab.tsx
// Ürün Teknik Özellikler Tab — Shadcn/UI + RTK Query
// Ensotek Admin Panel Standartı
// =============================================================

'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminJsonEditor } from '@/app/(main)/admin/_components/common/AdminJsonEditor';
import { Plus, Trash2, RefreshCw, Save, FileJson } from 'lucide-react';
import { toast } from 'sonner';
import {
  useListProductSpecsAdminQuery,
  useReplaceProductSpecsAdminMutation,
} from '@/integrations/endpoints/admin/product_specs_admin.endpoints';
import type { AdminProductSpecCreatePayload } from '@/integrations/shared/product_specs_admin.types';

export type ProductSpecsTabProps = {
  productId: string;
  locale: string;
  disabled?: boolean;
};

export function ProductSpecsTab({ productId, locale, disabled }: ProductSpecsTabProps) {
  const [items, setItems] = React.useState<AdminProductSpecCreatePayload[]>([]);
  const [viewMode, setViewMode] = React.useState<'form' | 'json'>('form');

  const {
    data,
    isLoading,
    isFetching,
    refetch,
  } = useListProductSpecsAdminQuery(
    { productId, locale },
    { skip: !productId || !locale },
  );

  const [replaceSpecs, { isLoading: isSaving }] = useReplaceProductSpecsAdminMutation();

  React.useEffect(() => {
    if (!data) return;
    setItems(
      (data as any[]).map((s) => ({
        id: s.id,
        name: s.name,
        value: s.value,
        category: s.category,
        order_num: s.order_num,
      })),
    );
  }, [data]);

  const busy = isLoading || isFetching || isSaving || !!disabled;

  const handleSave = async () => {
    if (!locale) { toast.error('Lütfen önce bir dil seçin.'); return; }
    try {
      const normalized = (items ?? []).map((raw) => ({
        id: raw.id,
        name: String(raw.name ?? '').trim(),
        value: String(raw.value ?? '').trim(),
        category: (raw.category as any) ?? 'custom',
        order_num: typeof raw.order_num === 'number' ? raw.order_num : parseInt(String(raw.order_num ?? '0'), 10) || 0,
      }));
      await replaceSpecs({ productId, locale, payload: { items: normalized } }).unwrap();
      toast.success('Teknik özellikler kaydedildi.');
      void refetch();
    } catch (err: any) {
      toast.error(err?.data?.error?.message || err?.message || 'Kayıt sırasında hata oluştu.');
    }
  };

  const handleItemChange = (index: number, field: keyof AdminProductSpecCreatePayload, value: string) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? { ...item, [field]: field === 'order_num' ? parseInt(value, 10) || 0 : value }
          : item,
      ),
    );
  };

  const handleAddRow = () => {
    setItems((prev) => [...prev, { name: '', value: '', category: 'custom', order_num: prev.length }]);
  };

  const handleRemoveRow = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleJsonChange = (next: any) => {
    if (!Array.isArray(next)) { toast.error('Geçersiz format. Array bekleniyor.'); return; }
    setItems(next);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Teknik Özellikler</CardTitle>
            <CardDescription>
              Aktif dil: <code className="text-xs">{locale}</code>
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => refetch()} disabled={busy}>
              <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            </Button>
            <Button onClick={handleSave} disabled={busy} size="sm">
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'form' | 'json')}>
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="form">Form</TabsTrigger>
              <TabsTrigger value="json">
                <FileJson className="h-4 w-4 mr-1" />JSON
              </TabsTrigger>
            </TabsList>
            {viewMode === 'form' && (
              <Button variant="outline" size="sm" onClick={handleAddRow} disabled={busy}>
                <Plus className="h-4 w-4 mr-2" />Satır Ekle
              </Button>
            )}
          </div>

          <TabsContent value="form" className="mt-4">
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Henüz teknik özellik yok. "Satır Ekle" ile başlayın.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Alan (name)</TableHead>
                    <TableHead>Değer (value)</TableHead>
                    <TableHead className="w-35">Kategori</TableHead>
                    <TableHead className="w-20 text-center">Sıra</TableHead>
                    <TableHead className="w-15" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((spec, index) => (
                    <TableRow key={spec.id ?? index}>
                      <TableCell>
                        <Input
                          value={spec.name ?? ''}
                          onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                          disabled={busy}
                          placeholder="capacity, fanType..."
                          className="h-8 text-sm"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={spec.value ?? ''}
                          onChange={(e) => handleItemChange(index, 'value', e.target.value)}
                          disabled={busy}
                          placeholder="1.500 m³/h – 4.500 m³/h"
                          className="h-8 text-sm"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={spec.category ?? 'custom'}
                          onChange={(e) => handleItemChange(index, 'category', e.target.value)}
                          disabled={busy}
                          placeholder="physical, performance..."
                          className="h-8 text-sm"
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Input
                          type="number"
                          value={spec.order_num ?? 0}
                          onChange={(e) => handleItemChange(index, 'order_num', e.target.value)}
                          disabled={busy}
                          className="h-8 text-sm w-16 text-center"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveRow(index)}
                          disabled={busy}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          <TabsContent value="json" className="mt-4">
            <AdminJsonEditor
              value={items}
              onChange={handleJsonChange}
              disabled={busy}
              height={300}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
