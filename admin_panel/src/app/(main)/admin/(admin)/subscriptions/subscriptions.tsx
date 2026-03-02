'use client';

import * as React from 'react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdminT } from '@/app/(main)/admin/_components/common/useAdminT';

import SubscriptionPlansPanel from './_components/subscription-plans-panel';
import SubscriptionUsersPanel from './_components/subscription-users-panel';

export default function SubscriptionsPage() {
  const t = useAdminT('admin.subscriptions');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('header.title')}</CardTitle>
          <CardDescription>{t('header.description')}</CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="plans" className="w-full">
        <TabsList>
          <TabsTrigger value="plans">{t('tabs.plans')}</TabsTrigger>
          <TabsTrigger value="users">{t('tabs.users')}</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-4">
          <SubscriptionPlansPanel />
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <SubscriptionUsersPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
