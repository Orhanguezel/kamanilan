'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import RichContentEditor from '@/app/(main)/admin/_components/common/RichContentEditor';
import { AdminImageUploadField } from '@/app/(main)/admin/_components/common/AdminImageUploadField';
import { useAdminT } from '@/app/(main)/admin/_components/common/useAdminT';

import {
  useGetProductAdminQuery,
  useCreateProductAdminMutation,
  useUpdateProductAdminMutation,
} from '@/integrations/endpoints/admin/products_admin.endpoints';
import { useListCategoriesAdminQuery } from '@/integrations/endpoints/admin/categories_admin.endpoints';
import { useListSubCategoriesAdminQuery } from '@/integrations/endpoints/admin/subcategories_admin.endpoints';
import { useListBrandsAdminQuery } from '@/integrations/endpoints/admin/brands.admin.endpoints';
import { useListListingTagsAdminQuery } from '@/integrations/endpoints/admin/listing_tags.admin.endpoints';
import { useListVariantsAdminQuery } from '@/integrations/endpoints/admin/variants_admin.endpoints';
import { useGetUserAdminQuery } from '@/integrations/endpoints/admin/users/auth_admin.endpoints';

import type { ListingBrandView } from '@/integrations/shared/brand';
import type { ListingTagView } from '@/integrations/shared/listing_tag';
import type { VariantView } from '@/integrations/shared/variants_admin.types';
import type { AdminProductCreatePayload } from '@/integrations/shared/product_admin.types';

interface Props {
  id: string;
}

const isUuid = (v: unknown): v is string =>
  typeof v === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v.trim());

type FormState = {
  title: string;
  slug: string;
  status: string;
  address: string;
  district: string;
  city: string;
  neighborhood: string;
  category_id: string;
  sub_category_id: string;
  brand_id: string;
  tag_ids: string[];
  variant_values: Record<string, string>;
  price: string;
  currency: string;
  is_negotiable: boolean;
  min_price_admin: string;
  listing_no: string;
  badge_text: string;
  description: string;
  excerpt: string;
  image_url: string;
  image_asset_id: string;
  alt: string;
  has_video: boolean;
  has_clip: boolean;
  has_virtual_tour: boolean;
  has_map: boolean;
  is_active: boolean;
  featured: boolean;
  display_order: string;
  meta_title: string;
  meta_description: string;
};

const INITIAL_FORM: FormState = {
  title: '',
  slug: '',
  status: '',
  address: '',
  district: '',
  city: '',
  neighborhood: '',
  category_id: '',
  sub_category_id: '',
  brand_id: '',
  tag_ids: [],
  variant_values: {},
  price: '',
  currency: 'TRY',
  is_negotiable: false,
  min_price_admin: '',
  listing_no: '',
  badge_text: '',
  description: '',
  excerpt: '',
  image_url: '',
  image_asset_id: '',
  alt: '',
  has_video: false,
  has_clip: false,
  has_virtual_tour: false,
  has_map: true,
  is_active: true,
  featured: false,
  display_order: '0',
  meta_title: '',
  meta_description: '',
};

export default function ProductDetailClient({ id }: Props) {
  const t = useAdminT('admin.products');
  const router = useRouter();
  const isNew = id === 'new';

  const [form, setForm] = React.useState<FormState>(INITIAL_FORM);

  const { data: item, isFetching, refetch } = useGetProductAdminQuery({ id }, { skip: isNew });
  const ownerId = !isNew && typeof item?.user_id === 'string' && item.user_id.trim() ? item.user_id.trim() : '';
  const { data: ownerUser } = useGetUserAdminQuery({ id: ownerId }, { skip: !ownerId });
  const [createProduct, { isLoading: isCreating }] = useCreateProductAdminMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductAdminMutation();

  const { data: categories = [] } = useListCategoriesAdminQuery(
    { is_active: true, limit: 500, offset: 0, sort: 'display_order', order: 'asc' } as any,
    { refetchOnMountOrArgChange: true },
  );
  const { data: subcategories = [] } = useListSubCategoriesAdminQuery(
    {
      category_id: form.category_id || undefined,
      is_active: true,
      limit: 500,
      offset: 0,
      sort: 'display_order',
      order: 'asc',
    } as any,
    { skip: !form.category_id, refetchOnMountOrArgChange: true },
  );

  const { data: brands = [] } = useListBrandsAdminQuery(
    {
      category_id: form.category_id || undefined,
      sub_category_id: form.sub_category_id || undefined,
      is_active: true,
      limit: 300,
      offset: 0,
      sort: 'display_order',
      order: 'asc',
    },
    { skip: !form.category_id },
  );
  const { data: listingTags = [] } = useListListingTagsAdminQuery(
    {
      category_id: form.category_id || undefined,
      sub_category_id: form.sub_category_id || undefined,
      is_active: true,
      limit: 300,
      offset: 0,
      sort: 'display_order',
      order: 'asc',
    },
    { skip: !form.category_id },
  );
  const { data: variants = [] } = useListVariantsAdminQuery(
    {
      category_id: form.category_id || undefined,
      sub_category_id: form.sub_category_id || undefined,
      is_active: true,
      limit: 500,
      offset: 0,
      sort: 'display_order',
      order: 'asc',
    },
    { skip: !form.category_id },
  );

  React.useEffect(() => {
    if (!item || isNew) return;
    const vvObj: Record<string, string> = {};
    const rawVv = Array.isArray((item as any).variant_values) ? (item as any).variant_values : [];
    for (const row of rawVv) {
      if (row?.variant_id) vvObj[String(row.variant_id)] = String(row.value ?? '');
    }

    setForm({
      title: item.title || '',
      slug: item.slug || '',
      status: item.status || '',
      address: item.address || '',
      district: item.district || '',
      city: item.city || '',
      neighborhood: item.neighborhood || '',
      category_id: item.category_id ? String(item.category_id) : '',
      sub_category_id: item.sub_category_id ? String(item.sub_category_id) : '',
      brand_id: item.brand_id ? String(item.brand_id) : '',
      tag_ids: Array.isArray(item.tag_ids) ? item.tag_ids.map((x) => String(x)) : [],
      variant_values: vvObj,
      price: item.price != null ? String(item.price) : '',
      currency: item.currency || 'TRY',
      is_negotiable: !!item.is_negotiable,
      min_price_admin: item.min_price_admin != null ? String(item.min_price_admin) : '',
      listing_no: item.listing_no || '',
      badge_text: item.badge_text || '',
      description: item.description || '',
      excerpt: item.excerpt || '',
      image_url: item.image_url || '',
      image_asset_id: item.image_asset_id || '',
      alt: item.alt || '',
      has_video: !!item.has_video,
      has_clip: !!item.has_clip,
      has_virtual_tour: !!item.has_virtual_tour,
      has_map: !!item.has_map,
      is_active: !!item.is_active,
      featured: !!item.featured,
      display_order: item.display_order != null ? String(item.display_order) : '0',
      meta_title: item.meta_title || '',
      meta_description: item.meta_description || '',
    });
  }, [item, isNew]);

  React.useEffect(() => {
    if (!form.brand_id) return;
    if (!brands.length) return;
    const exists = brands.some((b: ListingBrandView) => b.id === form.brand_id);
    if (!exists) setForm((p) => ({ ...p, brand_id: '' }));
  }, [brands, form.brand_id]);

  React.useEffect(() => {
    if (!form.tag_ids.length) return;
    if (!listingTags.length) {
      setForm((p) => ({ ...p, tag_ids: [] }));
      return;
    }
    const available = new Set(listingTags.map((t: ListingTagView) => String(t.id)));
    const next = form.tag_ids.filter((idItem) => available.has(String(idItem)));
    if (next.length !== form.tag_ids.length) setForm((p) => ({ ...p, tag_ids: next }));
  }, [listingTags, form.tag_ids]);

  const isLoading = isFetching || isCreating || isUpdating;
  const ownerName =
    (typeof item?.owner_name === 'string' && item.owner_name.trim() ? item.owner_name.trim() : '') ||
    ownerUser?.full_name ||
    ownerUser?.email ||
    ownerId ||
    '—';

  const onBack = () => router.push('/admin/ilanlar');

  const onSave = async () => {
    if (!form.title.trim() || !form.slug.trim()) {
      toast.error(t('messages.requiredError'));
      return;
    }
    if (!form.status.trim() || !form.address.trim() || !form.district.trim() || !form.city.trim()) {
      toast.error(t('messages.requiredLocationError'));
      return;
    }

    const variantValuesPayload = variants
      .map((v: VariantView) => ({
        variant_id: String(v.id),
        value: String(form.variant_values[String(v.id)] ?? '').trim(),
      }))
      .filter((x) => x.value.length > 0);

    const payload: AdminProductCreatePayload = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      status: form.status.trim(),
      address: form.address.trim(),
      district: form.district.trim(),
      city: form.city.trim(),
      neighborhood: form.neighborhood.trim() || null,
      category_id: form.category_id || null,
      sub_category_id: form.sub_category_id || null,
      brand_id: form.brand_id || null,
      tag_ids: form.tag_ids,
      variant_values: variantValuesPayload,
      price: form.price !== '' ? Number(form.price) : null,
      currency: form.currency.trim() || 'TRY',
      is_negotiable: form.is_negotiable,
      min_price_admin: form.min_price_admin !== '' ? Number(form.min_price_admin) : null,
      listing_no: form.listing_no.trim() || null,
      badge_text: form.badge_text.trim() || null,
      description: form.description || null,
      excerpt: form.excerpt || null,
      image_url: form.image_url || null,
      image_asset_id: form.image_asset_id || null,
      alt: form.alt || null,
      has_video: form.has_video,
      has_clip: form.has_clip,
      has_virtual_tour: form.has_virtual_tour,
      has_map: form.has_map,
      is_active: form.is_active,
      featured: form.featured,
      display_order: Number(form.display_order || 0),
      meta_title: form.meta_title || null,
      meta_description: form.meta_description || null,
    };

    try {
      if (isNew) {
        const result = await createProduct(payload).unwrap();
        toast.success(t('messages.created'));
        if (result?.id && isUuid(result.id)) router.push(`/admin/ilanlar/${result.id}`);
        return;
      }
      await updateProduct({ id, patch: payload }).unwrap();
      toast.success(t('messages.updated'));
      refetch();
    } catch (error: any) {
      const msg = error?.data?.error?.message || error?.message || t('messages.updateError');
      toast.error(String(msg));
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <CardTitle className="text-base">
                  {isNew ? t('actions.create') : t('actions.edit')}
                </CardTitle>
                <CardDescription>
                  {isNew ? t('form.createDescription') : t('form.editDescription')}
                </CardDescription>
                {!isNew ? (
                  <CardDescription>Ilan Sahibi: {ownerName}</CardDescription>
                ) : null}
              </div>
            </div>
            <Button onClick={onSave} disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {t('actions.save')}
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('form.titleLabel')}</Label>
                  <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} disabled={isLoading} />
                </div>
                <div className="space-y-2">
                  <Label>{t('form.slugLabel')}</Label>
                  <Input value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} disabled={isLoading} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('form.statusLabel')}</Label>
                  <Input value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))} disabled={isLoading} />
                </div>
                <div className="space-y-2">
                  <Label>{t('form.badgeTextLabel')}</Label>
                  <Input value={form.badge_text} onChange={(e) => setForm((p) => ({ ...p, badge_text: e.target.value }))} disabled={isLoading} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>{t('form.cityLabel')}</Label>
                  <Input value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} disabled={isLoading} />
                </div>
                <div className="space-y-2">
                  <Label>{t('form.districtLabel')}</Label>
                  <Input value={form.district} onChange={(e) => setForm((p) => ({ ...p, district: e.target.value }))} disabled={isLoading} />
                </div>
                <div className="space-y-2">
                  <Label>{t('form.neighborhoodLabel')}</Label>
                  <Input value={form.neighborhood} onChange={(e) => setForm((p) => ({ ...p, neighborhood: e.target.value }))} disabled={isLoading} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('form.addressLabel')}</Label>
                <Input value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} disabled={isLoading} />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>{t('form.priceLabel')}</Label>
                  <Input type="number" step="0.01" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} disabled={isLoading} />
                </div>
                <div className="space-y-2">
                  <Label>{t('form.currencyLabel')}</Label>
                  <Input value={form.currency} onChange={(e) => setForm((p) => ({ ...p, currency: e.target.value }))} disabled={isLoading} />
                </div>
                <div className="space-y-2">
                  <Label>{t('form.minPriceAdminLabel')}</Label>
                  <Input type="number" step="0.01" value={form.min_price_admin} onChange={(e) => setForm((p) => ({ ...p, min_price_admin: e.target.value }))} disabled={isLoading} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('form.excerptLabel')}</Label>
                <Textarea value={form.excerpt} onChange={(e) => setForm((p) => ({ ...p, excerpt: e.target.value }))} disabled={isLoading} rows={2} />
              </div>

              <div className="space-y-2">
                <Label>{t('form.descriptionLabel')}</Label>
                <RichContentEditor value={form.description} onChange={(v) => setForm((p) => ({ ...p, description: v }))} disabled={isLoading} />
              </div>

              <div className="space-y-2">
                <Label>{t('form.tagsLabel')}</Label>
                <div className="max-h-44 overflow-auto rounded-md border p-2 space-y-2">
                  {listingTags.length === 0 ? (
                    <p className="text-xs text-muted-foreground">{t('form.noTags')}</p>
                  ) : (
                    listingTags.map((tag: ListingTagView) => {
                      const checked = form.tag_ids.includes(String(tag.id));
                      return (
                        <label key={tag.id} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            className="h-4 w-4"
                            checked={checked}
                            disabled={isLoading}
                            onChange={(e) => {
                              const curr = form.tag_ids;
                              const next = e.target.checked
                                ? Array.from(new Set([...curr, String(tag.id)]))
                                : curr.filter((x) => String(x) !== String(tag.id));
                              setForm((p) => ({ ...p, tag_ids: next }));
                            }}
                          />
                          <span>{tag.name}</span>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              {variants.length > 0 ? (
                <div className="space-y-2">
                  <Label>{t('form.variantsLabel')}</Label>
                  <div className="space-y-3 rounded-md border p-3">
                    {variants.map((v: VariantView) => (
                      <div key={v.id} className="grid grid-cols-2 gap-3">
                        <div className="text-sm text-muted-foreground">{v.name}</div>
                        <Input
                          value={form.variant_values[String(v.id)] || ''}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              variant_values: { ...p.variant_values, [String(v.id)]: e.target.value },
                            }))
                          }
                          disabled={isLoading}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label>{t('form.categoryLabel')}</Label>
                <Select
                  value={form.category_id || 'none'}
                  onValueChange={(v) => {
                    setForm((p) => ({
                      ...p,
                      category_id: v === 'none' ? '' : v,
                      sub_category_id: '',
                      brand_id: '',
                      tag_ids: [],
                      variant_values: {},
                    }));
                  }}
                  disabled={isLoading}
                >
                  <SelectTrigger><SelectValue placeholder={t('list.allCategories')} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">—</SelectItem>
                    {categories.map((cat: any) => (
                      <SelectItem key={cat.id} value={String(cat.id)}>{cat.name || cat.slug}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t('form.subcategoryLabel')}</Label>
                <Select
                  value={form.sub_category_id || 'none'}
                  onValueChange={(v) => setForm((p) => ({ ...p, sub_category_id: v === 'none' ? '' : v }))}
                  disabled={isLoading || !form.category_id}
                >
                  <SelectTrigger><SelectValue placeholder={t('list.allSubcategories')} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">—</SelectItem>
                    {subcategories.map((sub: any) => (
                      <SelectItem key={sub.id} value={String(sub.id)}>{sub.name || sub.slug}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t('form.brandLabel')}</Label>
                <Select
                  value={form.brand_id || 'none'}
                  onValueChange={(v) => setForm((p) => ({ ...p, brand_id: v === 'none' ? '' : v }))}
                  disabled={isLoading || !form.category_id}
                >
                  <SelectTrigger><SelectValue placeholder={t('form.brandPlaceholder')} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">—</SelectItem>
                    {brands.map((brand: ListingBrandView) => (
                      <SelectItem key={brand.id} value={String(brand.id)}>{brand.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <AdminImageUploadField
                label={t('form.coverLabel')}
                value={form.image_url}
                onChange={(url) => setForm((p) => ({ ...p, image_url: url }))}
                disabled={isLoading}
              />

              <div className="space-y-2">
                <Label>{t('form.imageAltLabel')}</Label>
                <Input value={form.alt} onChange={(e) => setForm((p) => ({ ...p, alt: e.target.value }))} disabled={isLoading} />
              </div>

              <div className="space-y-2">
                <Label>{t('form.metaTitleLabel')}</Label>
                <Input value={form.meta_title} onChange={(e) => setForm((p) => ({ ...p, meta_title: e.target.value }))} disabled={isLoading} />
              </div>
              <div className="space-y-2">
                <Label>{t('form.metaDescriptionLabel')}</Label>
                <Textarea value={form.meta_description} onChange={(e) => setForm((p) => ({ ...p, meta_description: e.target.value }))} disabled={isLoading} rows={3} />
              </div>

              <div className="space-y-3 rounded-md border p-3">
                <div className="flex items-center gap-2">
                  <Switch checked={form.is_active} onCheckedChange={(v) => setForm((p) => ({ ...p, is_active: v }))} disabled={isLoading} />
                  <Label>{t('list.columns.active')}</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={form.featured} onCheckedChange={(v) => setForm((p) => ({ ...p, featured: v }))} disabled={isLoading} />
                  <Label>{t('list.columns.featured')}</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={form.is_negotiable} onCheckedChange={(v) => setForm((p) => ({ ...p, is_negotiable: v }))} disabled={isLoading} />
                  <Label>{t('form.negotiableLabel')}</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={form.has_video} onCheckedChange={(v) => setForm((p) => ({ ...p, has_video: v }))} disabled={isLoading} />
                  <Label>{t('form.hasVideoLabel')}</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={form.has_clip} onCheckedChange={(v) => setForm((p) => ({ ...p, has_clip: v }))} disabled={isLoading} />
                  <Label>{t('form.hasClipLabel')}</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={form.has_virtual_tour} onCheckedChange={(v) => setForm((p) => ({ ...p, has_virtual_tour: v }))} disabled={isLoading} />
                  <Label>{t('form.hasVirtualTourLabel')}</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={form.has_map} onCheckedChange={(v) => setForm((p) => ({ ...p, has_map: v }))} disabled={isLoading} />
                  <Label>{t('form.hasMapLabel')}</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('form.displayOrderLabel')}</Label>
                <Input type="number" value={form.display_order} onChange={(e) => setForm((p) => ({ ...p, display_order: e.target.value }))} disabled={isLoading} />
              </div>

              <div className="space-y-2">
                <Label>{t('form.listingNoLabel')}</Label>
                <Input value={form.listing_no} onChange={(e) => setForm((p) => ({ ...p, listing_no: e.target.value }))} disabled={isLoading} />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onBack} disabled={isLoading}>
              {t('actions.cancel')}
            </Button>
            <Button onClick={onSave} disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {t('actions.save')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
