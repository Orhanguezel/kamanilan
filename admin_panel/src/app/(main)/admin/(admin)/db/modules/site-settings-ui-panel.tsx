'use client';

import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  useExportSiteSettingsUiJsonQuery,
  useBootstrapSiteSettingsUiLocaleMutation,
} from '@/integrations/hooks';
import { buildDownloadName, triggerDownload } from '../shared/download';
import { errorText } from '../shared/errorText';
import { askConfirm } from '../shared/confirm';
import { useAdminT } from '@/app/(main)/admin/_components/common/useAdminT';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Loader2, Download, Zap } from 'lucide-react';
import { AVAILABLE_LOCALE_CODES, getDefaultLocaleCode } from '@/i18n/localeCatalog';

const LOCALES = AVAILABLE_LOCALE_CODES;

export type SiteSettingsUiPanelProps = {
  disabled: boolean;
};

export const SiteSettingsUiPanel: React.FC<SiteSettingsUiPanelProps> = ({ disabled }) => {
  const t = useAdminT('admin.db.modules.ui');

  const [exportLocale, setExportLocale] = useState(getDefaultLocaleCode());
  const [onlyUiKeys, setOnlyUiKeys] = useState(true);

  const prefixes = useMemo(() => (onlyUiKeys ? ['ui_'] : []), [onlyUiKeys]);

  const { data, isLoading, isFetching } = useExportSiteSettingsUiJsonQuery(
    { fromLocale: exportLocale, prefix: prefixes.length ? prefixes : undefined },
    { skip: disabled },
  );

  const [targetLocale, setTargetLocale] = useState(LOCALES[1] || getDefaultLocaleCode());
  const [sourceLocale, setSourceLocale] = useState(getDefaultLocaleCode());
  const [overwrite, setOverwrite] = useState(false);

  const [bootstrap, { isLoading: isBootstrapping }] = useBootstrapSiteSettingsUiLocaleMutation();

  const busy = disabled || isLoading || isFetching || isBootstrapping;

  const handleDownloadJson = () => {
    if (!data?.items) return toast.error(t('downloadError'));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    triggerDownload(blob, buildDownloadName('site_settings_ui', 'json'));
    toast.success(t('downloadSuccess'));
  };

  const handleBootstrap = async () => {
    if (sourceLocale === targetLocale) {
      return toast.warning('Kaynak ve hedef locale aynı olamaz.');
    }
    if (!askConfirm(`${sourceLocale} → ${targetLocale} locale bootstrap uygulanacak. Devam?`)) return;

    try {
      const res = await bootstrap({
        sourceLocale,
        targetLocale,
        prefixes: onlyUiKeys ? ['ui_'] : undefined,
        overwrite,
      }).unwrap();

      if (!res?.ok) return toast.error(res?.error || t('bootstrapError'));
      toast.success(`${t('bootstrapSuccess')} (${res.insertedOrUpdated} kayıt)`);
    } catch (err: unknown) {
      toast.error(errorText(err, t('bootstrapErrorGeneric')));
    }
  };

  return (
    <Card className="bg-muted/30">
      <CardContent className="p-4 space-y-4">
        {/* Header + Download */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="font-semibold text-sm">{t('title')}</div>
            <div className="text-muted-foreground text-xs">
              {t('description')}
            </div>
            {data && (
              <Badge variant="outline" className="text-[10px] h-5 mt-1">
                {data.count} key ({data.fromLocale})
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={exportLocale}
              onValueChange={setExportLocale}
              disabled={busy}
            >
              <SelectTrigger className="h-8 w-20 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LOCALES.map((l) => (
                  <SelectItem key={l} value={l} className="text-xs">{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDownloadJson}
              disabled={busy || !data?.items}
              className="h-8 text-xs shrink-0"
            >
              {(isLoading || isFetching) ? (
                <Loader2 className="mr-2 size-3.5 animate-spin" />
              ) : (
                <Download className="mr-2 size-3.5" />
              )}
              {t('downloadButton')}
            </Button>
          </div>
        </div>

        <Separator />

        {/* Bootstrap Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="space-y-2">
            <Label className="text-xs">{t('sourceLocale')}</Label>
            <Select
              value={sourceLocale}
              onValueChange={setSourceLocale}
              disabled={busy}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LOCALES.map((l) => (
                  <SelectItem key={l} value={l} className="text-xs">{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">{t('targetLocale')}</Label>
            <Select
              value={targetLocale}
              onValueChange={setTargetLocale}
              disabled={busy}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LOCALES.map((l) => (
                  <SelectItem key={l} value={l} className="text-xs">{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-3 pb-1">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="ui-overwrite"
                checked={overwrite}
                onCheckedChange={(checked) => setOverwrite(!!checked)}
                disabled={busy}
              />
              <Label htmlFor="ui-overwrite" className="text-xs font-normal cursor-pointer">
                {t('overwrite')}
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="ui-onlyUi"
                checked={onlyUiKeys}
                onCheckedChange={(checked) => setOnlyUiKeys(!!checked)}
                disabled={busy}
              />
              <Label htmlFor="ui-onlyUi" className="text-xs font-normal cursor-pointer">
                {t('onlyUiKeys')}
              </Label>
            </div>
          </div>

          <Button
            size="sm"
            variant="secondary"
            onClick={handleBootstrap}
            disabled={busy}
            className="h-8 text-xs w-full sm:w-auto ml-auto bg-yellow-500 hover:bg-yellow-600 text-black border-none"
          >
            {isBootstrapping ? (
              <Loader2 className="mr-2 size-3.5 animate-spin" />
            ) : (
              <Zap className="mr-2 size-3.5" />
            )}
            {isBootstrapping ? t('applying') : t('bootstrapButton')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
