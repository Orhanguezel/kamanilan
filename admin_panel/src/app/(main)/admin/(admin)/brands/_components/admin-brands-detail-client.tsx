'use client';

import * as React from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { useAdminT } from '@/app/(main)/admin/_components/common/useAdminT';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useCreateBrandAdminMutation,
  useGetBrandAdminQuery,
  useUpdateBrandAdminMutation,
} from '@/integrations/endpoints/admin/brands.admin.endpoints';
import { useListCategoriesAdminQuery } from '@/integrations/endpoints/admin/categories_admin.endpoints';
import { useListSubCategoriesAdminQuery } from '@/integrations/endpoints/admin/subcategories_admin.endpoints';
import type { ListingBrandCreatePayload } from '@/integrations/shared';

type Props = { mode: 'create' } | { mode: 'edit'; id: string };

type FormState = {
  name: string;
  slug: string;
  description: string;
  category_id: string;
  sub_category_id: string;
  is_active: boolean;
  display_order: string;
};

const initialForm: FormState = {
  name: '',
  slug: '',
  description: '',
  category_id: '',
  sub_category_id: '',
  is_active: true,
  display_order: '0',
};

const toBool = (v: unknown) => v === true || v === 1 || v === '1';

export default function AdminBrandsDetailClient(props: Props) {
  const t = useAdminT('admin.brands');
  const router = useRouter();
  const isEdit = props.mode === 'edit';

  const [form, setForm] = React.useState<FormState>(initialForm);

  const { data, isLoading: brandLoading, isFetching: brandFetching } = useGetBrandAdminQuery(
    { id: isEdit ? props.id : '' },
    { skip: !isEdit },
  );

  React.useEffect(() => {
    if (!data || !isEdit) return;
    setForm({
      name: data.name || '',
      slug: data.slug || '',
      description: data.description || '',
      category_id: data.category_id || '',
      sub_category_id: data.sub_category_id || '',
      is_active: toBool(data.is_active),
      display_order: String(data.display_order ?? 0),
    });
  }, [data, isEdit]);

  const categoriesQ = useListCategoriesAdminQuery({
    is_active: true,
    limit: 500,
    offset: 0,
    sort: 'display_order',
    order: 'asc',
  } as any);

  const subQ = useListSubCategoriesAdminQuery(
    {
      category_id: form.category_id || undefined,
      is_active: true,
      limit: 500,
      offset: 0,
      sort: 'display_order',
      order: 'asc',
    } as any,
    { skip: !form.category_id },
  );

  const [createBrand, createState] = useCreateBrandAdminMutation();
  const [updateBrand, updateState] = useUpdateBrandAdminMutation();

  const categories = categoriesQ.data ?? [];
  const subcategories = subQ.data ?? [];
  const busy =
    brandLoading ||
    brandFetching ||
    categoriesQ.isLoading ||
    categoriesQ.isFetching ||
    subQ.isLoading ||
    subQ.isFetching ||
    createState.isLoading ||
    updateState.isLoading;

  const onSubmit = async () => {
    if (!form.name.trim() || !form.slug.trim() || !form.category_id) {
      toast.error(t('messages.requiredError'));
      return;
    }

    const payload: ListingBrandCreatePayload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description.trim() || null,
      category_id: form.category_id,
      sub_category_id: form.sub_category_id || null,
      is_active: form.is_active,
      display_order: Number(form.display_order || 0),
    };

    try {
      if (isEdit) {
        await updateBrand({ id: props.id, patch: payload }).unwrap();
        toast.success(t('messages.updated'));
      } else {
        await createBrand(payload).unwrap();
        toast.success(t('messages.created'));
      }
      router.push('/admin/brands');
    } catch (e: any) {
      toast.error(e?.data?.error?.message || e?.message || t('messages.saveError'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold">{isEdit ? t('form.titleEdit') : t('form.titleCreate')}</h1>
          <p className="text-sm text-muted-foreground">{t('header.description')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/admin/brands')} disabled={busy}>
            <ArrowLeft className="mr-2 size-4" />
            {t('actions.clear')}
          </Button>
          <Button onClick={onSubmit} disabled={busy}>
            <Save className="mr-2 size-4" />
            {isEdit ? t('actions.update') : t('actions.create')}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? t('form.titleEdit') : t('form.titleCreate')}</CardTitle>
          <CardDescription>{t('header.description')}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>{t('form.name')}</Label>
            <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>{t('form.slug')}</Label>
            <Input value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>{t('form.displayOrder')}</Label>
            <Input
              type="number"
              value={form.display_order}
              onChange={(e) => setForm((p) => ({ ...p, display_order: e.target.value }))}
            />
          </div>

          <div className="space-y-2 md:col-span-3">
            <Label>{t('form.description')}</Label>
            <Input
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label>{t('form.category')}</Label>
            <Select
              value={form.category_id || 'none'}
              onValueChange={(v) =>
                setForm((p) => ({ ...p, category_id: v === 'none' ? '' : v, sub_category_id: '' }))
              }
            >
              <SelectTrigger><SelectValue placeholder={t('form.allCategories')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t('form.none')}</SelectItem>
                {categories.map((cat: any) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name || cat.slug}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('form.subcategory')}</Label>
            <Select
              value={form.sub_category_id || 'none'}
              onValueChange={(v) => setForm((p) => ({ ...p, sub_category_id: v === 'none' ? '' : v }))}
              disabled={!form.category_id}
            >
              <SelectTrigger><SelectValue placeholder={t('form.allSubcategories')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t('form.none')}</SelectItem>
                {subcategories.map((sub: any) => (
                  <SelectItem key={sub.id} value={sub.id}>{sub.name || sub.slug}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end gap-3 pb-1">
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))}
              />
              {t('form.isActive')}
            </label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
