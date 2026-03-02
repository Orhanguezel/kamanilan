'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Plus, RefreshCw, Pencil, Trash2, CheckCircle, Circle } from 'lucide-react';
import { toast } from 'sonner';

import { useAdminT } from '@/app/(main)/admin/_components/common/useAdminT';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  useListPlansAdminQuery,
  useDeletePlanAdminMutation,
  useUpdatePlanAdminMutation,
} from '@/integrations/endpoints/admin/subscriptions_admin.endpoints';
import type { SubscriptionPlanDto } from '@/integrations/shared';

export default function SubscriptionPlansPanel() {
  const t = useAdminT('admin.subscriptions');
  const router = useRouter();

  const { data: plans = [], isFetching, refetch } = useListPlansAdminQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const [deletePlan, { isLoading: isDeleting }] = useDeletePlanAdminMutation();
  const [updatePlan, { isLoading: isUpdating }] = useUpdatePlanAdminMutation();

  const busy = isFetching || isDeleting || isUpdating;

  const onDelete = async (plan: SubscriptionPlanDto) => {
    if (!window.confirm(t('messages.confirmDelete').replace('{name}', plan.name))) return;
    try {
      await deletePlan(plan.id).unwrap();
      toast.success(t('messages.deleted'));
      refetch();
    } catch {
      toast.error(t('messages.deleteError'));
    }
  };

  const onToggleActive = async (plan: SubscriptionPlanDto, value: boolean) => {
    try {
      await updatePlan({ id: plan.id, patch: { is_active: value } }).unwrap();
      toast.success(value ? t('list.activated') : t('list.deactivated'));
    } catch {
      toast.error(t('messages.updateError'));
    }
  };

  const onToggleDefault = async (plan: SubscriptionPlanDto, value: boolean) => {
    try {
      await updatePlan({ id: plan.id, patch: { is_default: value } }).unwrap();
      toast.success(t('messages.updated'));
    } catch {
      toast.error(t('messages.updateError'));
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              {t('list.plansTotal')}: <strong>{plans.length}</strong>
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => refetch()} disabled={busy}>
                <RefreshCw className={`h-4 w-4 ${busy ? 'animate-spin' : ''}`} />
              </Button>
              <Button size="sm" onClick={() => router.push('/admin/subscriptions/new')} disabled={busy}>
                <Plus className="h-4 w-4 mr-1" />
                {t('actions.create')}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {busy && plans.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">{t('list.loading')}</div>
          ) : plans.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">{t('list.noData')}</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>{t('table.name')}</TableHead>
                    <TableHead>{t('table.slug')}</TableHead>
                    <TableHead className="text-right">{t('table.priceMonthly')}</TableHead>
                    <TableHead className="text-right">{t('table.priceYearly')}</TableHead>
                    <TableHead className="w-20 text-center">{t('table.active')}</TableHead>
                    <TableHead className="w-24 text-center">{t('table.default')}</TableHead>
                    <TableHead className="w-36 text-right">{t('table.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plans.map((plan, index) => (
                    <TableRow key={plan.id}>
                      <TableCell className="text-muted-foreground text-sm">{index + 1}</TableCell>
                      <TableCell>
                        <div className="font-medium text-sm">{plan.name}</div>
                        {plan.description && (
                          <div className="text-xs text-muted-foreground line-clamp-1">{plan.description}</div>
                        )}
                        {plan.features && plan.features.length > 0 && (
                          <div className="flex gap-1 flex-wrap mt-1">
                            {plan.features.filter(f => f.is_enabled).slice(0, 3).map(f => (
                              <Badge key={f.feature_key} variant="outline" className="text-[10px] px-1 py-0">
                                {f.feature_key.replace(/_/g, ' ')}: {f.feature_value === '-1' ? '∞' : f.feature_value}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <code className="text-xs">{plan.slug}</code>
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {Number(plan.price_monthly) === 0
                          ? <Badge variant="secondary">Ücretsiz</Badge>
                          : <span>₺{Number(plan.price_monthly).toFixed(2)}</span>
                        }
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {plan.price_yearly ? `₺${Number(plan.price_yearly).toFixed(2)}` : '—'}
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={!!plan.is_active}
                          onCheckedChange={(v) => onToggleActive(plan, v)}
                          disabled={busy}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <button
                          className={`mx-auto block transition-colors ${
                            plan.is_default
                              ? 'text-emerald-500 hover:text-emerald-700'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                          onClick={() => onToggleDefault(plan, !plan.is_default)}
                          disabled={busy}
                          title={plan.is_default ? t('table.unsetDefault') : t('table.makeDefault')}
                        >
                          {plan.is_default
                            ? <CheckCircle className="h-4 w-4" />
                            : <Circle className="h-4 w-4" />}
                        </button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={busy}
                            onClick={() => router.push(`/admin/subscriptions/${plan.id}`)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={busy}
                            onClick={() => onDelete(plan)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
