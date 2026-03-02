'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Settings } from 'lucide-react';
import { toast } from 'sonner';

import { useAdminT } from '@/app/(main)/admin/_components/common/useAdminT';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useGetPlanAdminQuery,
  useCreatePlanAdminMutation,
  useUpdatePlanAdminMutation,
  useGetPlanFeaturesAdminQuery,
  useUpsertPlanFeaturesAdminMutation,
} from '@/integrations/endpoints/admin/subscriptions_admin.endpoints';
import type { FeatureItem } from '@/integrations/shared';

interface Props {
  id: string;
}

// Feature anahtarlarının Türkçe etiketleri ve tipleri
const FEATURE_META: Record<string, { label: string; type: 'number' | 'bool'; hint?: string }> = {
  max_active_listings:  { label: 'Maks. Aktif İlan',       type: 'number', hint: '-1 = sınırsız' },
  listing_duration_days:{ label: 'İlan Süresi (Gün)',       type: 'number', hint: '-1 = süresiz' },
  can_add_video:        { label: 'Video Ekleyebilir',       type: 'bool' },
  can_feature_listing:  { label: 'İlanı Öne Çıkarabilir',  type: 'bool' },
  can_boost_listing:    { label: 'İlan Boost Yapabilir',    type: 'bool' },
};

const DEFAULT_FEATURES: FeatureItem[] = Object.keys(FEATURE_META).map((key) => ({
  key,
  value: FEATURE_META[key].type === 'bool' ? 'false' : '0',
  is_enabled: true,
}));

export default function SubscriptionPlanDetailClient({ id }: Props) {
  const t = useAdminT('admin.subscriptions');
  const router = useRouter();
  const isNew = id === 'new';
  const planId = isNew ? 0 : Number(id);

  const { data: plan, isFetching: isFetchingPlan } = useGetPlanAdminQuery(planId, { skip: isNew });
  const { data: featuresData, isFetching: isFetchingFeatures } = useGetPlanFeaturesAdminQuery(planId, { skip: isNew });

  const [createPlan, { isLoading: isCreating }] = useCreatePlanAdminMutation();
  const [updatePlan, { isLoading: isUpdating }] = useUpdatePlanAdminMutation();
  const [upsertFeatures, { isLoading: isSavingFeatures }] = useUpsertPlanFeaturesAdminMutation();

  const [formData, setFormData] = React.useState({
    name: '',
    slug: '',
    description: '',
    price_monthly: '0',
    price_yearly: '',
    is_active: true,
    is_default: false,
    display_order: 0,
  });

  const [features, setFeatures] = React.useState<FeatureItem[]>(DEFAULT_FEATURES);

  // Plan yüklenince formu doldur
  React.useEffect(() => {
    if (!plan || isNew) return;
    setFormData({
      name:          plan.name || '',
      slug:          plan.slug || '',
      description:   plan.description || '',
      price_monthly: plan.price_monthly ?? '0',
      price_yearly:  plan.price_yearly ?? '',
      is_active:     plan.is_active ?? true,
      is_default:    plan.is_default ?? false,
      display_order: plan.display_order ?? 0,
    });
  }, [plan, isNew]);

  // Features yüklenince doldur
  React.useEffect(() => {
    if (!featuresData || isNew) return;
    const loaded = featuresData.map((f) => ({
      key:        f.feature_key,
      value:      f.feature_value,
      is_enabled: f.is_enabled,
    }));
    // Bilinmeyen keyleri de koru
    const allKeys = new Set([...Object.keys(FEATURE_META), ...loaded.map(f => f.key)]);
    const merged = Array.from(allKeys).map((key) => {
      const existing = loaded.find(f => f.key === key);
      if (existing) return existing;
      return { key, value: FEATURE_META[key]?.type === 'bool' ? 'false' : '0', is_enabled: true };
    });
    setFeatures(merged);
  }, [featuresData, isNew]);

  const isLoading = isFetchingPlan || isFetchingFeatures || isCreating || isUpdating || isSavingFeatures;

  const handleChange = (field: string, value: unknown) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const setFeatureValue = (key: string, value: string) =>
    setFeatures((prev) => prev.map(f => f.key === key ? { ...f, value } : f));

  const setFeatureEnabled = (key: string, enabled: boolean) =>
    setFeatures((prev) => prev.map(f => f.key === key ? { ...f, is_enabled: enabled } : f));

  const handleSavePlan = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!formData.name.trim() || !formData.slug.trim()) {
      toast.error(t('messages.requiredError'));
      return;
    }

    const payload = {
      name:          formData.name.trim(),
      slug:          formData.slug.trim(),
      description:   formData.description?.trim() || null,
      price_monthly: Number(formData.price_monthly) || 0,
      price_yearly:  formData.price_yearly ? Number(formData.price_yearly) : null,
      is_active:     formData.is_active,
      is_default:    formData.is_default,
      display_order: Number(formData.display_order || 0),
    };

    try {
      if (isNew) {
        const created = await createPlan(payload).unwrap();
        toast.success(t('messages.created'));
        // Yeni plan oluşturulunca features'ı da kaydet
        await upsertFeatures({ planId: created!.id, body: { features } }).unwrap();
        router.push('/admin/subscriptions');
      } else {
        await updatePlan({ id: planId, patch: payload }).unwrap();
        toast.success(t('messages.updated'));
      }
    } catch {
      toast.error(t('messages.saveError'));
    }
  };

  const handleSaveFeatures = async () => {
    if (isNew) return;
    try {
      await upsertFeatures({ planId, body: { features } }).unwrap();
      toast.success(t('messages.featuresUpdated'));
    } catch {
      toast.error(t('messages.saveError'));
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push('/admin/subscriptions')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <CardTitle className="text-base">
                {isNew ? t('actions.create') : t('actions.edit')}
              </CardTitle>
              <CardDescription>
                {isNew ? t('detail.createDesc') : `${t('detail.editDesc')} — ${plan?.name || ''}`}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="form" className="w-full">
        <TabsList>
          <TabsTrigger value="form">{t('detail.formTab')}</TabsTrigger>
          {!isNew && (
            <TabsTrigger value="features">
              <Settings className="h-4 w-4 mr-2" />
              {t('detail.featuresTab')}
            </TabsTrigger>
          )}
        </TabsList>

        {/* ── Plan formu ── */}
        <TabsContent value="form">
          <form onSubmit={handleSavePlan}>
            <Card>
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t('form.name')} *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">{t('form.slug')} *</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => handleChange('slug', e.target.value)}
                      disabled={isLoading}
                      placeholder="free, basic, pro..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">{t('form.description')}</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    disabled={isLoading}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price_monthly">{t('form.priceMonthly')} (₺)</Label>
                    <Input
                      id="price_monthly"
                      type="number"
                      min={0}
                      step={0.01}
                      value={formData.price_monthly}
                      onChange={(e) => handleChange('price_monthly', e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price_yearly">{t('form.priceYearly')} (₺)</Label>
                    <Input
                      id="price_yearly"
                      type="number"
                      min={0}
                      step={0.01}
                      value={formData.price_yearly}
                      onChange={(e) => handleChange('price_yearly', e.target.value)}
                      disabled={isLoading}
                      placeholder={t('form.priceYearlyPlaceholder')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="display_order">{t('form.displayOrder')}</Label>
                    <Input
                      id="display_order"
                      type="number"
                      min={0}
                      value={formData.display_order}
                      onChange={(e) => handleChange('display_order', Number(e.target.value))}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(v) => handleChange('is_active', v)}
                      disabled={isLoading}
                    />
                    <Label htmlFor="is_active" className="cursor-pointer">{t('form.isActive')}</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="is_default"
                      checked={formData.is_default}
                      onCheckedChange={(v) => handleChange('is_default', v)}
                      disabled={isLoading}
                    />
                    <Label htmlFor="is_default" className="cursor-pointer">
                      {t('form.isDefault')}
                      <span className="ml-1 text-xs text-muted-foreground">({t('form.isDefaultHint')})</span>
                    </Label>
                  </div>
                </div>

                {/* Yeni plan oluşturulurken feature'ları da burada göster */}
                {isNew && (
                  <div className="border rounded-lg p-4 space-y-4">
                    <div className="text-sm font-medium">{t('detail.featuresTab')}</div>
                    <FeatureEditor
                      features={features}
                      onValueChange={setFeatureValue}
                      onEnabledChange={setFeatureEnabled}
                      disabled={isLoading}
                    />
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => router.push('/admin/subscriptions')} disabled={isLoading}>
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

        {/* ── Features ── */}
        {!isNew && (
          <TabsContent value="features">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t('features.title')}</CardTitle>
                <CardDescription>{t('features.description')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FeatureEditor
                  features={features}
                  onValueChange={setFeatureValue}
                  onEnabledChange={setFeatureEnabled}
                  disabled={isLoading}
                />
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button onClick={handleSaveFeatures} disabled={isLoading}>
                    <Save className="h-4 w-4 mr-2" />
                    {t('features.save')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

// ------------------------------------------------------------------
// Feature Editor — yeniden kullanılabilir iç bileşen
// ------------------------------------------------------------------
interface FeatureEditorProps {
  features: FeatureItem[];
  onValueChange: (key: string, value: string) => void;
  onEnabledChange: (key: string, enabled: boolean) => void;
  disabled?: boolean;
}

function FeatureEditor({ features, onValueChange, onEnabledChange, disabled }: FeatureEditorProps) {
  return (
    <div className="space-y-4">
      {features.map((feat) => {
        const meta = FEATURE_META[feat.key];
        const label = meta?.label ?? feat.key;
        const hint  = meta?.hint;
        const isBool = meta?.type === 'bool';

        return (
          <div key={feat.key} className="flex items-center gap-4 p-3 border rounded-lg">
            <Switch
              checked={feat.is_enabled !== false}
              onCheckedChange={(v) => onEnabledChange(feat.key, v)}
              disabled={disabled}
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium">{label}</div>
              {hint && (
                <div className="text-xs text-muted-foreground">{hint}</div>
              )}
              <code className="text-[10px] text-muted-foreground">{feat.key}</code>
            </div>
            <div className="w-36">
              {isBool ? (
                <div className="flex items-center gap-2">
                  <Switch
                    checked={feat.value === 'true'}
                    onCheckedChange={(v) => onValueChange(feat.key, v ? 'true' : 'false')}
                    disabled={disabled || feat.is_enabled === false}
                  />
                  <Badge variant={feat.value === 'true' ? 'default' : 'secondary'} className="text-xs">
                    {feat.value === 'true' ? 'Evet' : 'Hayır'}
                  </Badge>
                </div>
              ) : (
                <Input
                  type="number"
                  value={feat.value}
                  onChange={(e) => onValueChange(feat.key, e.target.value)}
                  disabled={disabled || feat.is_enabled === false}
                  className="h-8 text-sm"
                  placeholder="-1"
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
