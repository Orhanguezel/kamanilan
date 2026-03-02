'use client';

import * as React from 'react';
import { Pencil, Plus, RefreshCcw, Trash2, ToggleLeft, ToggleRight, X, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { CouponCreatePayload, CouponUpdatePayload, CouponView } from '@/integrations/shared';
import {
  useListCouponsAdminQuery,
  useCreateCouponAdminMutation,
  useUpdateCouponAdminMutation,
  useDeleteCouponAdminMutation,
  useToggleCouponAdminMutation,
} from '@/integrations/hooks';

type FormState = {
  code: string;
  title: string;
  description: string;
  discount_type: 'percent' | 'amount';
  discount_value: string;
  min_order_amount: string;
  max_discount: string;
  max_uses: string;
  start_at: string;
  end_at: string;
  is_active: boolean;
};

const emptyForm: FormState = {
  code: '',
  title: '',
  description: '',
  discount_type: 'percent',
  discount_value: '',
  min_order_amount: '',
  max_discount: '',
  max_uses: '',
  start_at: '',
  end_at: '',
  is_active: true,
};

function couponToForm(c: CouponView): FormState {
  return {
    code: c.code,
    title: c.title,
    description: c.description ?? '',
    discount_type: c.discount_type,
    discount_value: String(c.discount_value),
    min_order_amount: c.min_order_amount != null ? String(c.min_order_amount) : '',
    max_discount: c.max_discount != null ? String(c.max_discount) : '',
    max_uses: c.max_uses != null ? String(c.max_uses) : '',
    start_at: c.start_at ? c.start_at.slice(0, 16) : '',
    end_at: c.end_at ? c.end_at.slice(0, 16) : '',
    is_active: c.is_active,
  };
}

function formToPayload(f: FormState): CouponCreatePayload {
  return {
    code: f.code.trim().toUpperCase(),
    title: f.title.trim(),
    description: f.description.trim() || null,
    discount_type: f.discount_type,
    discount_value: Number(f.discount_value),
    min_order_amount: f.min_order_amount ? Number(f.min_order_amount) : null,
    max_discount: f.max_discount ? Number(f.max_discount) : null,
    max_uses: f.max_uses ? Number(f.max_uses) : null,
    start_at: f.start_at || null,
    end_at: f.end_at || null,
    is_active: f.is_active ? 1 : 0,
  };
}

export default function AdminKuponlarClient() {
  const [q, setQ] = React.useState('');
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [showForm, setShowForm] = React.useState(false);
  const [form, setForm] = React.useState<FormState>(emptyForm);

  const listQ = useListCouponsAdminQuery(
    { q: q.trim() || undefined, limit: 200, offset: 0, sort: 'created_at', orderDir: 'desc' },
    { refetchOnMountOrArgChange: true },
  );

  const [createCoupon, createState] = useCreateCouponAdminMutation();
  const [updateCoupon, updateState] = useUpdateCouponAdminMutation();
  const [deleteCoupon, deleteState] = useDeleteCouponAdminMutation();
  const [toggleCoupon, toggleState] = useToggleCouponAdminMutation();

  const rows = listQ.data ?? [];
  const busy =
    listQ.isLoading ||
    listQ.isFetching ||
    createState.isLoading ||
    updateState.isLoading ||
    deleteState.isLoading ||
    toggleState.isLoading;

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(item: CouponView) {
    setEditingId(item.id);
    setForm(couponToForm(item));
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  function set(key: keyof FormState, value: string | boolean) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.code || !form.title || !form.discount_value) {
      toast.error('Kod, başlık ve indirim değeri zorunludur.');
      return;
    }
    try {
      const payload = formToPayload(form);
      if (editingId) {
        await updateCoupon({ id: editingId, patch: payload as CouponUpdatePayload }).unwrap();
        toast.success('Kupon güncellendi.');
      } else {
        await createCoupon(payload).unwrap();
        toast.success('Kupon oluşturuldu.');
      }
      closeForm();
      listQ.refetch();
    } catch (err: any) {
      toast.error(err?.data?.error?.message || err?.message || 'Bir hata oluştu.');
    }
  }

  async function onDelete(item: CouponView) {
    if (!window.confirm(`"${item.title}" kuponunu silmek istiyor musunuz?`)) return;
    try {
      await deleteCoupon({ id: item.id }).unwrap();
      toast.success('Kupon silindi.');
    } catch (err: any) {
      toast.error(err?.data?.error?.message || err?.message || 'Silinemedi.');
    }
  }

  async function onToggle(item: CouponView) {
    try {
      await toggleCoupon({ id: item.id }).unwrap();
      toast.success(item.is_active ? 'Kupon devre dışı bırakıldı.' : 'Kupon aktif edildi.');
    } catch (err: any) {
      toast.error(err?.data?.error?.message || err?.message || 'Değiştirilemedi.');
    }
  }

  const fmtDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold">Kuponlar</h1>
          <p className="text-sm text-muted-foreground">İndirim kuponlarını yönetin.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => listQ.refetch()} disabled={busy}>
            <RefreshCcw className="mr-2 size-4" />
            Yenile
          </Button>
          <Button onClick={openCreate}>
            <Plus className="mr-2 size-4" />
            Yeni Kupon
          </Button>
        </div>
      </div>

      {/* Create / Edit Form */}
      {showForm && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>{editingId ? 'Kuponu Düzenle' : 'Yeni Kupon'}</CardTitle>
              <CardDescription>Tüm alanları doldurun, ardından kaydedin.</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={closeForm}>
              <X className="size-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <Label>Kupon Kodu *</Label>
                <Input
                  value={form.code}
                  onChange={(e) => set('code', e.target.value.toUpperCase())}
                  placeholder="HOSGELDIN10"
                  className="font-mono uppercase"
                />
              </div>

              <div className="space-y-1">
                <Label>Başlık *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => set('title', e.target.value)}
                  placeholder="Hoş Geldin İndirimi"
                />
              </div>

              <div className="space-y-1">
                <Label>İndirim Türü</Label>
                <Select
                  value={form.discount_type}
                  onValueChange={(v) => set('discount_type', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">Yüzde (%)</SelectItem>
                    <SelectItem value="amount">Tutar (₺)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label>İndirim Değeri *</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.discount_value}
                  onChange={(e) => set('discount_value', e.target.value)}
                  placeholder={form.discount_type === 'percent' ? '10' : '25'}
                />
              </div>

              <div className="space-y-1">
                <Label>Min. Sipariş Tutarı (₺)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.min_order_amount}
                  onChange={(e) => set('min_order_amount', e.target.value)}
                  placeholder="Boş bırakın = yok"
                />
              </div>

              <div className="space-y-1">
                <Label>Maks. İndirim Tutarı (₺)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.max_discount}
                  onChange={(e) => set('max_discount', e.target.value)}
                  placeholder="Boş bırakın = sınırsız"
                />
              </div>

              <div className="space-y-1">
                <Label>Maks. Kullanım Sayısı</Label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={form.max_uses}
                  onChange={(e) => set('max_uses', e.target.value)}
                  placeholder="Boş bırakın = sınırsız"
                />
              </div>

              <div className="space-y-1">
                <Label>Başlangıç Tarihi</Label>
                <Input
                  type="datetime-local"
                  value={form.start_at}
                  onChange={(e) => set('start_at', e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <Label>Bitiş Tarihi</Label>
                <Input
                  type="datetime-local"
                  value={form.end_at}
                  onChange={(e) => set('end_at', e.target.value)}
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <Label>Açıklama</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  rows={2}
                  placeholder="İsteğe bağlı açıklama..."
                />
              </div>

              <div className="flex items-center gap-2 md:col-span-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={form.is_active}
                  onChange={(e) => set('is_active', e.target.checked)}
                  className="size-4"
                />
                <Label htmlFor="is_active">Aktif</Label>
              </div>

              <div className="flex gap-2 md:col-span-2">
                <Button type="submit" disabled={busy}>
                  <Save className="mr-2 size-4" />
                  {editingId ? 'Güncelle' : 'Oluştur'}
                </Button>
                <Button type="button" variant="outline" onClick={closeForm}>
                  İptal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* List */}
      <Card>
        <CardHeader>
          <CardTitle>Kupon Listesi</CardTitle>
          <CardDescription>Toplam {rows.length} kupon</CardDescription>
          <div className="pt-2">
            <Input
              placeholder="Ara (kod, başlık…)"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="max-w-xs"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kod</TableHead>
                <TableHead>Başlık</TableHead>
                <TableHead>İndirim</TableHead>
                <TableHead>Kullanım</TableHead>
                <TableHead>Bitiş</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <span className="font-mono text-sm font-bold tracking-widest">{item.code}</span>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{item.title}</div>
                    {item.description && (
                      <div className="text-xs text-muted-foreground line-clamp-1">{item.description}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    {item.discount_type === 'percent'
                      ? `%${item.discount_value}`
                      : `${item.discount_value} ₺`}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {item.uses_count}
                      {item.max_uses ? ` / ${item.max_uses}` : ''}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs">{fmtDate(item.end_at)}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.is_active ? 'default' : 'secondary'}>
                      {item.is_active ? 'Aktif' : 'Pasif'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="outline"
                        title={item.is_active ? 'Devre dışı bırak' : 'Aktif et'}
                        onClick={() => onToggle(item)}
                        disabled={busy}
                      >
                        {item.is_active ? (
                          <ToggleRight className="size-4 text-green-600" />
                        ) : (
                          <ToggleLeft className="size-4 text-muted-foreground" />
                        )}
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => openEdit(item)}
                        disabled={busy}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => onDelete(item)}
                        disabled={busy}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!rows.length && (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    Henüz kupon yok.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
