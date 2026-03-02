// =============================================================
// FILE: src/app/(main)/admin/(admin)/products/_components/product-faqs-tab.tsx
// Ürün SSS (FAQ) Tab — Shadcn/UI + RTK Query
// Ensotek Admin Panel Standartı
// =============================================================

'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
  useListProductFaqsAdminQuery,
  useReplaceProductFaqsAdminMutation,
} from '@/integrations/endpoints/admin/products_admin.faqs.endpoints';
import type { AdminProductFaqCreatePayload } from '@/integrations/shared/product_faqs_admin.types';

export type ProductFaqsTabProps = {
  productId: string;
  locale: string;
  disabled?: boolean;
};

export function ProductFaqsTab({ productId, locale, disabled }: ProductFaqsTabProps) {
  const [items, setItems] = React.useState<AdminProductFaqCreatePayload[]>([]);
  const [viewMode, setViewMode] = React.useState<'form' | 'json'>('form');

  const {
    data,
    isLoading,
    isFetching,
    refetch,
  } = useListProductFaqsAdminQuery(
    { productId, locale },
    { skip: !productId || !locale },
  );

  const [replaceFaqs, { isLoading: isSaving }] = useReplaceProductFaqsAdminMutation();

  React.useEffect(() => {
    if (!data) return;
    setItems(
      (data as any[]).map((f) => ({
        id: f.id,
        question: f.question,
        answer: f.answer,
        display_order: f.display_order,
        is_active: f.is_active,
      })),
    );
  }, [data]);

  const busy = isLoading || isFetching || isSaving || !!disabled;

  const handleSave = async () => {
    if (!locale) { toast.error('Lütfen önce bir dil seçin.'); return; }
    try {
      const normalized = (items ?? []).map((raw) => ({
        id: raw.id,
        question: String(raw.question ?? '').trim(),
        answer: String(raw.answer ?? ''),
        display_order: typeof raw.display_order === 'number' ? raw.display_order : parseInt(String(raw.display_order ?? '0'), 10) || 0,
        is_active: raw.is_active !== false,
      }));
      await replaceFaqs({ productId, locale, payload: { items: normalized } }).unwrap();
      toast.success('SSS kayıtları kaydedildi.');
      void refetch();
    } catch (err: any) {
      toast.error(err?.data?.error?.message || err?.message || 'Kayıt sırasında hata oluştu.');
    }
  };

  const handleChange = (index: number, field: keyof AdminProductFaqCreatePayload, value: unknown) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  const handleAddRow = () => {
    setItems((prev) => [...prev, { question: '', answer: '', display_order: prev.length, is_active: true }]);
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
            <CardTitle className="text-base">Sık Sorulan Sorular (SSS)</CardTitle>
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
                <Plus className="h-4 w-4 mr-2" />Soru Ekle
              </Button>
            )}
          </div>

          <TabsContent value="form" className="mt-4">
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Henüz soru yok. "Soru Ekle" ile başlayın.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[30%]">Soru</TableHead>
                    <TableHead>Cevap</TableHead>
                    <TableHead className="w-17.5 text-center">Sıra</TableHead>
                    <TableHead className="w-17.5 text-center">Aktif</TableHead>
                    <TableHead className="w-15" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((faq, index) => (
                    <TableRow key={faq.id ?? index}>
                      <TableCell className="align-top">
                        <Input
                          value={faq.question ?? ''}
                          onChange={(e) => handleChange(index, 'question', e.target.value)}
                          disabled={busy}
                          placeholder="Teslim süresi nedir?"
                          className="h-8 text-sm"
                        />
                      </TableCell>
                      <TableCell className="align-top">
                        <Textarea
                          value={faq.answer ?? ''}
                          onChange={(e) => handleChange(index, 'answer', e.target.value)}
                          disabled={busy}
                          placeholder="Proje detayına göre 4-6 hafta..."
                          rows={2}
                          className="text-sm"
                        />
                      </TableCell>
                      <TableCell className="text-center align-top">
                        <Input
                          type="number"
                          value={faq.display_order ?? 0}
                          onChange={(e) => handleChange(index, 'display_order', parseInt(e.target.value, 10) || 0)}
                          disabled={busy}
                          className="h-8 text-sm w-16 text-center"
                        />
                      </TableCell>
                      <TableCell className="text-center align-middle">
                        <Switch
                          checked={!!faq.is_active}
                          onCheckedChange={(v) => handleChange(index, 'is_active', v)}
                          disabled={busy}
                        />
                      </TableCell>
                      <TableCell className="align-top">
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
