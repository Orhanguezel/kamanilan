'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { useExportModuleSqlMutation } from '@/integrations/hooks';
import { buildDownloadName, triggerDownload } from '../shared/download';
import { errorText } from '../shared/errorText';
import { useAdminT } from '@/app/(main)/admin/_components/common/useAdminT';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Download } from 'lucide-react';

export type ModuleExportPanelProps = {
  module: string;
  disabled: boolean;
};

export const ModuleExportPanel: React.FC<ModuleExportPanelProps> = ({ module, disabled }) => {
  const t = useAdminT('admin.db.modules.export');
  const [upsert, setUpsert] = useState(true);
  const [exportModule, { isLoading }] = useExportModuleSqlMutation();

  const handleExport = async () => {
    try {
      const blob = await exportModule({ module, upsert }).unwrap();
      triggerDownload(blob, buildDownloadName(`module_${module}`, 'sql'));
      toast.success(t('success', { module, format: 'SQL' }));
    } catch (err: unknown) {
      toast.error(errorText(err, t('error')));
    }
  };

  return (
    <Card className="bg-muted/30">
      <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="font-semibold text-sm">{t('title')}</div>
          <div className="text-muted-foreground text-xs">
            {t('description', { module })}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="module-export-upsert"
              checked={upsert}
              onCheckedChange={(checked) => setUpsert(!!checked)}
              disabled={disabled || isLoading}
            />
            <Label
              htmlFor="module-export-upsert"
              className="text-xs font-normal cursor-pointer whitespace-nowrap"
            >
              UPSERT
            </Label>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleExport}
            disabled={disabled || isLoading}
            className="h-8 text-xs"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
            ) : (
              <Download className="mr-2 h-3 w-3" />
            )}
            {isLoading ? t('preparing') : t('downloadButton')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
