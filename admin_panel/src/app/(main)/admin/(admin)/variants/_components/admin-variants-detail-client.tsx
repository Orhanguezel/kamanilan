'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
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
  useCreateVariantAdminMutation,
  useGetVariantAdminQuery,
  useUpdateVariantAdminMutation,
} from '@/integrations/endpoints/admin/variants_admin.endpoints';
import { useListUnitsAdminQuery } from '@/integrations/endpoints/admin/units_admin.endpoints';
import { useListCategoriesAdminQuery } from '@/integrations/endpoints/admin/categories_admin.endpoints';
import { useListSubCategoriesAdminQuery } from '@/integrations/endpoints/admin/subcategories_admin.endpoints';
import type { VariantCreatePayload, VariantValueType } from '@/integrations/shared/variants_admin.types';

type FormState = {
  name: string;
  slug: string;
  description: string;
  value_type: VariantValueType;
  category_id: string;
  sub_category_id: string;
  unit_id: string;
  options_csv: string;
  is_required: boolean;
  is_filterable: boolean;
  is_active: boolean;
  display_order: string;
};

const initialForm: FormState = {
  name: '',
  slug: '',
  description: '',
  value_type: 'text',
  category_id: '',
  sub_category_id: '',
  unit_id: '',
  options_csv: '',
  is_required: false,
  is_filterable: true,
  is_active: true,
  display_order: '0',
};

const toBool = (v: unknown) => v === true || v === 1 || v === '1';

export default function AdminVariantsDetailClient({ id }: { id: string }) {
  const t = useAdminT('admin.variants');
  const router = useRouter();
  const isNew = id === 'new';

  const [form, setForm] = React.useState<FormState>(initialForm);

  const variantQ = useGetVariantAdminQuery({ id }, { skip: isNew });
  const [createVariant, createState] = useCreateVariantAdminMutation();
  const [updateVariant, updateState] = useUpdateVariantAdminMutation();

  const categoriesQ = useListCategoriesAdminQuery({ is_active: true, limit: 500, offset: 0, sort: 'display_order', order: 'asc' } as any);
  const unitsQ = useListUnitsAdminQuery({ is_active: true, limit: 500, offset: 0, sort: 'display_order', order: 'asc' });
  const subcategoriesQ = useListSubCategoriesAdminQuery(
    { category_id: form.category_id || undefined, is_active: true, limit: 500, offset: 0, sort: 'display_order', order: 'asc' } as any,
    { skip: !form.category_id },
  );

  const categories = categoriesQ.data ?? [];
  const subcategories = subcategoriesQ.data ?? [];
  const units = unitsQ.data ?? [];

  React.useEffect(() => {
    if (isNew || !variantQ.data) return;
    const item = variantQ.data;
    setForm({
      name: item.name,
      slug: item.slug,
      description: item.description || '',
      value_type: item.value_type,
      category_id: item.category_id,
      sub_category_id: item.sub_category_id || '',
      unit_id: item.unit_id || '',
      options_csv: Array.isArray(item.options_json) ? item.options_json.join(', ') : '',
      is_required: toBool(item.is_required),
      is_filterable: toBool(item.is_filterable),
      is_active: toBool(item.is_active),
      display_order: String(item.display_order ?? 0),
    });
  }, [isNew, variantQ.data]);

  const busy =
    variantQ.isLoading || categoriesQ.isLoading || unitsQ.isLoading || createState.isLoading || updateState.isLoading;

  const onBack = () => router.push('/admin/variants');

  const onSubmit = async () => {
    if (!form.name.trim() || !form.slug.trim() || !form.value_type || !form.category_id) {
      toast.error(t('messages.requiredError'));
      return;
    }

    const options = form.options_csv
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean);

    const payload: VariantCreatePayload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description.trim() || null,
      value_type: form.value_type,
      category_id: form.category_id,
      sub_category_id: form.sub_category_id || null,
      unit_id: form.unit_id || null,
      options_json: options.length ? options : null,
      is_required: form.is_required,
      is_filterable: form.is_filterable,
      is_active: form.is_active,
      display_order: Number(form.display_order || 0),
    };

    try {
      if (isNew) {
        const created = await createVariant(payload).unwrap();
        toast.success(t('messages.created'));
        router.push(`/admin/variants/${created.id}`);
        return;
      }
      await updateVariant({ id, patch: payload }).unwrap();
      toast.success(t('messages.updated'));
    } catch (e: any) {
      toast.error(e?.data?.error?.message || e?.message || t('messages.saveError'));
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={onBack} disabled={busy}>
                <ArrowLeft className="size-4" />
              </Button>
              <div>
                <CardTitle>{isNew ? t('form.titleCreate') : t('form.titleEdit')}</CardTitle>
                <CardDescription>{t('header.description')}</CardDescription>
              </div>
            </div>
            <Button onClick={onSubmit} disabled={busy}>
              <Save className="mr-2 size-4" />
              {isNew ? t('actions.create') : t('actions.update')}
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="grid gap-4 pt-6 md:grid-cols-3">
          <div className="space-y-2">
            <Label>{t('form.name')}</Label>
            <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} disabled={busy} />
          </div>
          <div className="space-y-2">
            <Label>{t('form.slug')}</Label>
            <Input value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} disabled={busy} />
          </div>
          <div className="space-y-2">
            <Label>{t('form.valueType')}</Label>
            <Select value={form.value_type} onValueChange={(v) => setForm((p) => ({ ...p, value_type: v as VariantValueType }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="text">{t('types.text')}</SelectItem>
                <SelectItem value="number">{t('types.number')}</SelectItem>
                <SelectItem value="boolean">{t('types.boolean')}</SelectItem>
                <SelectItem value="single_select">{t('types.single_select')}</SelectItem>
                <SelectItem value="multi_select">{t('types.multi_select')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-3">
            <Label>{t('form.description')}</Label>
            <Input value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} disabled={busy} />
          </div>

          <div className="space-y-2">
            <Label>{t('form.category')}</Label>
            <Select
              value={form.category_id || 'none'}
              onValueChange={(v) => setForm((p) => ({ ...p, category_id: v === 'none' ? '' : v, sub_category_id: '' }))}
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

          <div className="space-y-2">
            <Label>{t('form.unit')}</Label>
            <Select value={form.unit_id || 'none'} onValueChange={(v) => setForm((p) => ({ ...p, unit_id: v === 'none' ? '' : v }))}>
              <SelectTrigger><SelectValue placeholder={t('form.allUnits')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t('form.none')}</SelectItem>
                {units.map((u: any) => (
                  <SelectItem key={u.id} value={u.id}>{u.name} ({u.symbol})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>{t('form.optionsCsv')}</Label>
            <Input value={form.options_csv} onChange={(e) => setForm((p) => ({ ...p, options_csv: e.target.value }))} disabled={busy} />
          </div>

          <div className="space-y-2">
            <Label>{t('form.displayOrder')}</Label>
            <Input type="number" value={form.display_order} onChange={(e) => setForm((p) => ({ ...p, display_order: e.target.value }))} disabled={busy} />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_required} onChange={(e) => setForm((p) => ({ ...p, is_required: e.target.checked }))} className="size-4" />
            {t('form.isRequired')}
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_filterable} onChange={(e) => setForm((p) => ({ ...p, is_filterable: e.target.checked }))} className="size-4" />
            {t('form.isFilterable')}
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))} className="size-4" />
            {t('form.isActive')}
          </label>
        </CardContent>
      </Card>
    </div>
  );
}
