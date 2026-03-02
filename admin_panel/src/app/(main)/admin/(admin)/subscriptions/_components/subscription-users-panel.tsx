'use client';

import * as React from 'react';
import { RefreshCw, UserCog } from 'lucide-react';
import { toast } from 'sonner';

import { useAdminT } from '@/app/(main)/admin/_components/common/useAdminT';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  useListUserSubscriptionsAdminQuery,
  useListPlansAdminQuery,
  useAssignPlanAdminMutation,
} from '@/integrations/endpoints/admin/subscriptions_admin.endpoints';
import type { UserSubscriptionDto } from '@/integrations/shared';

function formatDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('tr-TR', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function SubscriptionUsersPanel() {
  const t = useAdminT('admin.subscriptions');

  const { data: subs = [], isFetching, refetch } = useListUserSubscriptionsAdminQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const { data: plans = [] } = useListPlansAdminQuery();
  const [assignPlan, { isLoading: isAssigning }] = useAssignPlanAdminMutation();

  const [search, setSearch] = React.useState('');
  const [assignDialog, setAssignDialog] = React.useState<{ userId: string; currentPlanId: number } | null>(null);
  const [selectedPlanId, setSelectedPlanId] = React.useState<string>('');

  const busy = isFetching || isAssigning;

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return subs;
    return subs.filter(s => s.user_id.toLowerCase().includes(q));
  }, [subs, search]);

  const openAssign = (sub: UserSubscriptionDto) => {
    setSelectedPlanId(String(sub.plan_id));
    setAssignDialog({ userId: sub.user_id, currentPlanId: sub.plan_id });
  };

  const handleAssign = async () => {
    if (!assignDialog || !selectedPlanId) return;
    try {
      await assignPlan({
        userId: assignDialog.userId,
        body:   { plan_id: Number(selectedPlanId) },
      }).unwrap();
      toast.success(t('messages.planAssigned'));
      setAssignDialog(null);
      refetch();
    } catch {
      toast.error(t('messages.updateError'));
    }
  };

  const getPlanName = (planId: number) =>
    plans.find(p => p.id === planId)?.name ?? `Plan #${planId}`;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row gap-3 justify-between items-start md:items-center">
            <div className="flex-1 max-w-sm">
              <Input
                placeholder={t('users.searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                disabled={busy}
              />
            </div>
            <div className="flex gap-2 items-center">
              <span className="text-sm text-muted-foreground">
                {t('list.usersTotal')}: <strong>{subs.length}</strong>
              </span>
              <Button variant="outline" size="sm" onClick={() => refetch()} disabled={busy}>
                <RefreshCw className={`h-4 w-4 ${busy ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {busy && subs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">{t('list.loading')}</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">{t('list.noData')}</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('users.userId')}</TableHead>
                    <TableHead>{t('users.plan')}</TableHead>
                    <TableHead>{t('users.startsAt')}</TableHead>
                    <TableHead>{t('users.expiresAt')}</TableHead>
                    <TableHead className="w-20 text-center">{t('users.status')}</TableHead>
                    <TableHead className="w-20 text-right">{t('table.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell>
                        <code className="text-xs">{sub.user_id}</code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{getPlanName(sub.plan_id)}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(sub.starts_at)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {sub.expires_at ? formatDate(sub.expires_at) : (
                          <Badge variant="secondary" className="text-xs">Sonsuz</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={sub.is_active ? 'default' : 'secondary'}>
                          {sub.is_active ? t('users.active') : t('users.inactive')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={busy}
                          title={t('users.assignPlan')}
                          onClick={() => openAssign(sub)}
                        >
                          <UserCog className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plan Atama Dialog */}
      <Dialog open={!!assignDialog} onOpenChange={(o) => !o && setAssignDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('users.assignPlan')}</DialogTitle>
            <DialogDescription>
              {assignDialog && (
                <code className="text-xs">{assignDialog.userId}</code>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>{t('users.selectPlan')}</Label>
              <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                <SelectTrigger>
                  <SelectValue placeholder={t('users.selectPlanPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.name}
                      {Number(p.price_monthly) === 0 ? ' (Ücretsiz)' : ` — ₺${Number(p.price_monthly).toFixed(2)}/ay`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialog(null)} disabled={isAssigning}>
              {t('actions.cancel')}
            </Button>
            <Button onClick={handleAssign} disabled={isAssigning || !selectedPlanId}>
              {t('users.assign')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
