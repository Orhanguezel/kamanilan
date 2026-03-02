// =============================================================
// FILE: src/app/(main)/admin/(admin)/categories/Categories.tsx
// Admin Categories — List + Create/Edit
// Ensotek
// =============================================================

'use client';

import * as React from 'react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdminT } from '@/app/(main)/admin/_components/common/useAdminT';

import CategoriesListPanel from './_components/categories-list-panel';

export default function CategoriesPage() {
  const t = useAdminT('admin.categories');

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('header.title')}</CardTitle>
          <CardDescription>{t('header.description')}</CardDescription>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="list" className="w-full">
        <TabsList>
          <TabsTrigger value="list">{t('tabs.list')}</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <CategoriesListPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
