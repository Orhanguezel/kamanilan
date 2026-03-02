'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, FileJson } from 'lucide-react';
import { toast } from 'sonner';

import { useAdminT } from '@/app/(main)/admin/_components/common/useAdminT';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminJsonEditor } from '@/app/(main)/admin/_components/common/AdminJsonEditor';
import { AdminImageUploadField } from '@/app/(main)/admin/_components/common/AdminImageUploadField';
import {
  useCreateCategoryAdminMutation,
  useGetCategoryAdminQuery,
  useUpdateCategoryAdminMutation,
} from '@/integrations/endpoints/admin/categories_admin.endpoints';

interface Props {
  id: string;
}

export default function CategoryDetailClient({ id }: Props) {
  const t = useAdminT('admin.categories');
  const router = useRouter();
  const isNew = id === 'new';

  const { data: category, isFetching } = useGetCategoryAdminQuery({ id }, { skip: isNew });
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryAdminMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryAdminMutation();

  const [activeTab, setActiveTab] = React.useState<'form' | 'json'>('form');
  const [formData, setFormData] = React.useState({
    name: '',
    slug: '',
    description: '',
    alt: '',
    image_url: '',
    icon: '',
    is_active: true,
    is_featured: false,
    has_cart: true,
    is_unlimited: false,
    display_order: 0,
    whatsapp_number: '',
    phone_number: '',
  });

  React.useEffect(() => {
    if (!category || isNew) return;
    setFormData({
      name: category.name || '',
      slug: category.slug || '',
      description: category.description || '',
      alt: category.alt || '',
      image_url: category.image_url || '',
      icon: category.icon || '',
      is_active: category.is_active ?? true,
      is_featured: category.is_featured ?? false,
      has_cart: category.has_cart ?? true,
      is_unlimited: category.is_unlimited ?? false,
      display_order: category.display_order || 0,
      whatsapp_number: category.whatsapp_number || '',
      phone_number: category.phone_number || '',
    });
  }, [category, isNew]);

  const isLoading = isFetching || isCreating || isUpdating;

  const handleBack = () => router.push('/admin/categories');
  const handleChange = (field: string, value: unknown) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!formData.name.trim() || !formData.slug.trim()) {
      toast.error(t('messages.requiredError'));
      return;
    }

    const payload = {
      name: formData.name.trim(),
      slug: formData.slug.trim(),
      description: formData.description?.trim() || undefined,
      alt: formData.alt?.trim() || undefined,
      image_url: formData.image_url?.trim() || undefined,
      icon: formData.icon?.trim() || undefined,
      is_active: formData.is_active,
      is_featured: formData.is_featured,
      has_cart: formData.has_cart,
      is_unlimited: formData.is_unlimited,
      display_order: Number(formData.display_order || 0),
      whatsapp_number: formData.whatsapp_number?.trim() || null,
      phone_number: formData.phone_number?.trim() || null,
    };

    try {
      if (isNew) {
        await createCategory(payload).unwrap();
        toast.success(t('messages.created'));
      } else {
        await updateCategory({ id, patch: payload }).unwrap();
        toast.success(t('messages.updated'));
      }
      router.push('/admin/categories');
    } catch {
      toast.error(t('messages.saveError'));
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <CardTitle className="text-base">{isNew ? t('actions.create') : t('actions.edit')}</CardTitle>
                <CardDescription>{isNew ? t('detail.createDesc') : t('detail.editDesc')}</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'form' | 'json')}>
        <TabsList>
          <TabsTrigger value="form">{t('detail.formTab')}</TabsTrigger>
          <TabsTrigger value="json">
            <FileJson className="h-4 w-4 mr-2" />
            {t('detail.jsonTab')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="form">
          <form onSubmit={handleSubmit}>
            <Card>
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t('form.name')} *</Label>
                      <Input id="name" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} disabled={isLoading} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="slug">{t('form.slug')} *</Label>
                      <Input id="slug" value={formData.slug} onChange={(e) => handleChange('slug', e.target.value)} disabled={isLoading} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">{t('form.description')}</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        disabled={isLoading}
                        rows={4}
                        placeholder={t('form.descriptionPlaceholder')}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="icon">{t('form.icon')}</Label>
                        <Input id="icon" value={formData.icon} onChange={(e) => handleChange('icon', e.target.value)} disabled={isLoading} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="alt">{t('form.alt')}</Label>
                        <Input id="alt" value={formData.alt} onChange={(e) => handleChange('alt', e.target.value)} disabled={isLoading} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="display_order">{t('form.displayOrder')}</Label>
                        <Input
                          id="display_order"
                          type="number"
                          value={formData.display_order}
                          onChange={(e) => handleChange('display_order', Number(e.target.value))}
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="whatsapp_number">WhatsApp Numarası</Label>
                        <Input
                          id="whatsapp_number"
                          value={formData.whatsapp_number}
                          onChange={(e) => handleChange('whatsapp_number', e.target.value)}
                          placeholder="+90 532 000 00 00"
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone_number">Telefon Numarası</Label>
                        <Input
                          id="phone_number"
                          value={formData.phone_number}
                          onChange={(e) => handleChange('phone_number', e.target.value)}
                          placeholder="+90 352 000 00 00"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-6">
                      <div className="flex items-center gap-2">
                        <Switch id="is_active" checked={formData.is_active} onCheckedChange={(v) => handleChange('is_active', v)} disabled={isLoading} />
                        <Label htmlFor="is_active" className="cursor-pointer">{t('form.isActive')}</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch id="is_featured" checked={formData.is_featured} onCheckedChange={(v) => handleChange('is_featured', v)} disabled={isLoading} />
                        <Label htmlFor="is_featured" className="cursor-pointer">{t('form.isFeatured')}</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch id="has_cart" checked={formData.has_cart} onCheckedChange={(v) => handleChange('has_cart', v)} disabled={isLoading} />
                        <Label htmlFor="has_cart" className="cursor-pointer">{t('form.hasCart')}</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch id="is_unlimited" checked={formData.is_unlimited} onCheckedChange={(v) => handleChange('is_unlimited', v)} disabled={isLoading} />
                        <Label htmlFor="is_unlimited" className="cursor-pointer">Sınırsız İlan (Abonelik Gerekmez)</Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <AdminImageUploadField
                      label={t('form.image')}
                      value={formData.image_url}
                      onChange={(url) => handleChange('image_url', url)}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={handleBack} disabled={isLoading}>
                    {t('actions.cancel')}
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    <Save className="h-4 w-4 mr-2" />
                    {t('actions.save')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </TabsContent>

        <TabsContent value="json">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('detail.jsonTitle')}</CardTitle>
              <CardDescription>{t('detail.jsonDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <AdminJsonEditor value={formData} onChange={(json) => setFormData((p) => ({ ...p, ...json }))} disabled={isLoading} height={500} />
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={handleBack} disabled={isLoading}>
                  {t('actions.cancel')}
                </Button>
                <Button onClick={handleSubmit} disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {t('actions.save')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
