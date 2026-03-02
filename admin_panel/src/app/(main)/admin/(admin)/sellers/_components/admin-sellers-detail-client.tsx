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
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { UserRoleName } from '@/integrations/shared';
import {
  useGetUserAdminQuery,
  useSetUserActiveAdminMutation,
  useSetUserPasswordAdminMutation,
  useSetUserRolesAdminMutation,
  useUpdateUserAdminMutation,
} from '@/integrations/hooks';

type Props = { mode: 'edit'; id: string };
type SellerPlan = 'basic' | 'standard' | 'pro';

function readPlan(userId: string): SellerPlan {
  try {
    const v = localStorage.getItem(`seller_subscription:${userId}`) || '';
    if (v === 'standard' || v === 'pro' || v === 'basic') return v;
  } catch {}
  return 'basic';
}

function savePlan(userId: string, plan: SellerPlan) {
  try {
    localStorage.setItem(`seller_subscription:${userId}`, plan);
  } catch {}
}

export default function AdminSellersDetailClient(props: Props) {
  const t = useAdminT('admin.sellers');
  const router = useRouter();

  const id = props.id;
  const userQ = useGetUserAdminQuery({ id });

  const [updateUser, updateState] = useUpdateUserAdminMutation();
  const [setActive, setActiveState] = useSetUserActiveAdminMutation();
  const [setRoles, setRolesState] = useSetUserRolesAdminMutation();
  const [setPassword, setPasswordState] = useSetUserPasswordAdminMutation();

  const [fullName, setFullName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [isActive, setIsActive] = React.useState(true);
  const [role, setRole] = React.useState<UserRoleName>('seller');
  const [password, setPasswordLocal] = React.useState('');
  const [plan, setPlan] = React.useState<SellerPlan>('basic');

  React.useEffect(() => {
    const u = userQ.data;
    if (!u) return;
    setFullName(u.full_name || '');
    setPhone(u.phone || '');
    setEmail(u.email || '');
    setIsActive(u.is_active);
    setRole(u.roles[0] || 'seller');
    setPlan(readPlan(u.id));
  }, [userQ.data]);

  const busy =
    userQ.isFetching ||
    updateState.isLoading ||
    setActiveState.isLoading ||
    setRolesState.isLoading ||
    setPasswordState.isLoading;

  const onSaveProfile = async () => {
    try {
      await updateUser({
        id,
        full_name: fullName.trim() || null,
        phone: phone.trim() || null,
        email: email.trim() || null,
      }).unwrap();
      toast.success(t('messages.saved'));
      userQ.refetch();
    } catch (e: any) {
      toast.error(e?.data?.error?.message || e?.message || t('messages.saveError'));
    }
  };

  const onSaveAccount = async () => {
    try {
      await setActive({ id, is_active: isActive }).unwrap();
      await setRoles({ id, roles: [role] }).unwrap();
      savePlan(id, plan);
      toast.success(t('messages.accountSaved'));
      userQ.refetch();
    } catch (e: any) {
      toast.error(e?.data?.error?.message || e?.message || t('messages.saveError'));
    }
  };

  const onUpdatePassword = async () => {
    if (password.trim().length < 8) {
      toast.error(t('messages.passwordMin')); return;
    }
    try {
      await setPassword({ id, password: password.trim() }).unwrap();
      setPasswordLocal('');
      toast.success(t('messages.passwordSaved'));
    } catch (e: any) {
      toast.error(e?.data?.error?.message || e?.message || t('messages.saveError'));
    }
  };

  const u = userQ.data;
  if (!u && userQ.isLoading) {
    return <Card><CardContent className="py-8 text-center text-muted-foreground">{t('detail.loading')}</CardContent></Card>;
  }
  if (!u) {
    return <Card><CardContent className="py-8 text-center text-muted-foreground">{t('detail.notFound')}</CardContent></Card>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold">{t('detail.title')}</h1>
          <p className="text-sm text-muted-foreground">{u.full_name || u.email}</p>
        </div>
        <Button variant="outline" onClick={() => router.push('/admin/sellers')} disabled={busy}>
          <ArrowLeft className="mr-2 size-4" />
          {t('actions.back')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('detail.profile.title')}</CardTitle>
          <CardDescription>{t('detail.profile.description')}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>{t('detail.profile.fullName')}</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={busy} />
          </div>
          <div className="space-y-2">
            <Label>{t('detail.profile.email')}</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} disabled={busy} />
          </div>
          <div className="space-y-2">
            <Label>{t('detail.profile.phone')}</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} disabled={busy} />
          </div>
          <div className="md:col-span-3 flex justify-end">
            <Button onClick={onSaveProfile} disabled={busy}>
              <Save className="mr-2 size-4" />
              {t('actions.save')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('detail.account.title')}</CardTitle>
          <CardDescription>{t('detail.account.description')}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>{t('detail.account.role')}</Label>
            <Select value={role} onValueChange={(v) => setRole(v as UserRoleName)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">{t('detail.account.roles.admin')}</SelectItem>
                <SelectItem value="seller">{t('detail.account.roles.seller')}</SelectItem>
                <SelectItem value="user">{t('detail.account.roles.user')}</SelectItem>
                <SelectItem value="moderator">{t('detail.account.roles.moderator')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t('detail.account.plan')}</Label>
            <Select value={plan} onValueChange={(v) => setPlan(v as SellerPlan)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">{t('subscription.plans.basic.title')}</SelectItem>
                <SelectItem value="standard">{t('subscription.plans.standard.title')}</SelectItem>
                <SelectItem value="pro">{t('subscription.plans.pro.title')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end gap-2">
            <Switch checked={isActive} onCheckedChange={setIsActive} />
            <Label>{t('detail.account.active')}</Label>
          </div>
          <div className="md:col-span-3 flex justify-end">
            <Button onClick={onSaveAccount} disabled={busy}>
              <Save className="mr-2 size-4" />
              {t('actions.saveSettings')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('detail.password.title')}</CardTitle>
          <CardDescription>{t('detail.password.description')}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>{t('detail.password.label')}</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPasswordLocal(e.target.value)}
              placeholder={t('detail.password.placeholder')}
              disabled={busy}
            />
          </div>
          <div className="flex items-end justify-end">
            <Button onClick={onUpdatePassword} disabled={busy}>
              <Save className="mr-2 size-4" />
              {t('detail.password.save')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
