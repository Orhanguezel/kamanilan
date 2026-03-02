// =============================================================
// FILE: src/app/(main)/admin/(admin)/products/_components/product-reviews-tab.tsx
// Ürün Değerlendirmeleri Tab — Shadcn/UI + RTK Query
// Ensotek Admin Panel Standartı
// =============================================================

'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { RefreshCw, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  useListProductReviewsAdminQuery,
  useCreateProductReviewAdminMutation,
  useToggleProductReviewActiveAdminMutation,
  useDeleteProductReviewAdminMutation,
} from '@/integrations/endpoints/admin/products_admin.reviews.endpoints';
import type { AdminProductReviewCreatePayload } from '@/integrations/shared/product_reviews_admin.types';

export type ProductReviewsTabProps = {
  productId: string;
  disabled?: boolean;
};

const EMPTY_REVIEW: AdminProductReviewCreatePayload = {
  rating: 5,
  comment: '',
  customer_name: '',
  is_active: true,
  review_date: '',
};

export function ProductReviewsTab({ productId, disabled }: ProductReviewsTabProps) {
  const [newReview, setNewReview] = React.useState<AdminProductReviewCreatePayload>({ ...EMPTY_REVIEW });
  const [showForm, setShowForm] = React.useState(false);

  const {
    data,
    isLoading,
    isFetching,
    refetch,
  } = useListProductReviewsAdminQuery(
    { productId, order: 'desc' },
    { skip: !productId },
  );

  const [createReview, { isLoading: isCreating }] = useCreateProductReviewAdminMutation();
  const [toggleActive, { isLoading: isToggling }] = useToggleProductReviewActiveAdminMutation();
  const [deleteReview, { isLoading: isDeleting }] = useDeleteProductReviewAdminMutation();

  const reviews = (data ?? []) as any[];
  const busy = isLoading || isFetching || isToggling || isDeleting || !!disabled;

  const handleCreate = async () => {
    if (!newReview.rating || newReview.rating < 0 || newReview.rating > 5) {
      toast.error('Rating 0-5 arasında olmalı.');
      return;
    }
    try {
      await createReview({
        productId,
        payload: { ...newReview, rating: Number(newReview.rating) },
      }).unwrap();
      toast.success('Yorum eklendi.');
      setNewReview({ ...EMPTY_REVIEW });
      setShowForm(false);
      void refetch();
    } catch (err: any) {
      toast.error(err?.data?.error?.message || err?.message || 'Yorum eklenirken hata oluştu.');
    }
  };

  const handleToggle = async (review: any) => {
    try {
      await toggleActive({ productId, reviewId: review.id, is_active: !review.is_active }).unwrap();
      toast.success('Durum güncellendi.');
      void refetch();
    } catch (err: any) {
      toast.error(err?.data?.error?.message || err?.message || 'Güncelleme sırasında hata oluştu.');
    }
  };

  const handleDelete = async (review: any) => {
    if (!confirm('Bu yorumu silmek istediğine emin misin?')) return;
    try {
      await deleteReview({ productId, reviewId: review.id }).unwrap();
      toast.success('Yorum silindi.');
      void refetch();
    } catch (err: any) {
      toast.error(err?.data?.error?.message || err?.message || 'Silme sırasında hata oluştu.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Yeni yorum ekle */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              Değerlendirmeler ({reviews.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => refetch()} disabled={busy}>
                <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                variant={showForm ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setShowForm((v) => !v)}
                disabled={busy}
              >
                <Plus className="h-4 w-4 mr-2" />
                {showForm ? 'İptal' : 'Yorum Ekle'}
              </Button>
            </div>
          </div>
        </CardHeader>

        {showForm && (
          <CardContent className="border-t pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="review_rating">Rating (0-5)</Label>
                <Input
                  id="review_rating"
                  type="number"
                  min={0}
                  max={5}
                  step={0.5}
                  value={newReview.rating}
                  onChange={(e) => setNewReview((p) => ({ ...p, rating: Number(e.target.value) }))}
                  disabled={isCreating || !!disabled}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="review_customer">Müşteri Adı</Label>
                <Input
                  id="review_customer"
                  value={newReview.customer_name ?? ''}
                  onChange={(e) => setNewReview((p) => ({ ...p, customer_name: e.target.value }))}
                  disabled={isCreating || !!disabled}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="review_date">Tarih</Label>
                <Input
                  id="review_date"
                  type="date"
                  value={newReview.review_date ?? ''}
                  onChange={(e) => setNewReview((p) => ({ ...p, review_date: e.target.value }))}
                  disabled={isCreating || !!disabled}
                />
              </div>
              <div className="flex items-end gap-3 pb-1">
                <div className="flex items-center gap-2">
                  <Switch
                    id="review_active"
                    checked={!!newReview.is_active}
                    onCheckedChange={(v) => setNewReview((p) => ({ ...p, is_active: v }))}
                    disabled={isCreating || !!disabled}
                  />
                  <Label htmlFor="review_active" className="cursor-pointer">Aktif</Label>
                </div>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <Label htmlFor="review_comment">Yorum</Label>
              <Textarea
                id="review_comment"
                value={newReview.comment ?? ''}
                onChange={(e) => setNewReview((p) => ({ ...p, comment: e.target.value }))}
                disabled={isCreating || !!disabled}
                rows={2}
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleCreate} disabled={isCreating || !!disabled} size="sm">
                {isCreating ? 'Ekleniyor...' : 'Yorum Ekle'}
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Mevcut yorumlar */}
      <Card>
        <CardContent className="p-0">
          {isFetching && reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Yükleniyor...</p>
          ) : reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Bu ürün için henüz yorum yok.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-17.5 text-center">Rating</TableHead>
                  <TableHead className="w-40">Müşteri</TableHead>
                  <TableHead>Yorum</TableHead>
                  <TableHead className="w-27.5">Tarih</TableHead>
                  <TableHead className="w-20 text-center">Durum</TableHead>
                  <TableHead className="w-30 text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="font-mono">
                        {typeof r.rating?.toFixed === 'function' ? r.rating.toFixed(1) : r.rating}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-sm">{r.customer_name || '—'}</div>
                      {r.user_id && (
                        <div className="text-xs text-muted-foreground">{r.user_id}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm truncate max-w-70" title={r.comment || ''}>
                        {r.comment || <span className="text-muted-foreground italic">—</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {r.review_date ? r.review_date.substring(0, 10) : '—'}
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={!!r.is_active}
                        onCheckedChange={() => handleToggle(r)}
                        disabled={busy}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(r)}
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
        </CardContent>
      </Card>
    </div>
  );
}
