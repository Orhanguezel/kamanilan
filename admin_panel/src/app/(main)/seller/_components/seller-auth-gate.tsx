'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

import { useStatusQuery } from '@/integrations/hooks';
import type { AuthStatusResponse } from '@/integrations/shared';
import { normalizeMeFromStatus } from '@/integrations/shared';

export default function SellerAuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const q = useStatusQuery();

  React.useEffect(() => {
    if (q.isFetching || q.isUninitialized) return;

    const data = q.data as AuthStatusResponse | undefined;
    const me = normalizeMeFromStatus(data);
    const allowed = !!me && (me.role === 'seller' || me.isAdmin === true);

    if (!allowed) {
      router.replace('/auth/seller/login');
    }
  }, [q.isFetching, q.isUninitialized, q.data, router]);

  if (q.isFetching || q.isUninitialized) {
    return (
      <div className="flex min-h-dvh items-center justify-center p-6">
        <div className="w-full max-w-md rounded-xl border bg-card p-5 text-center">
          <p className="text-sm text-muted-foreground">Satici paneli yukleniyor...</p>
        </div>
      </div>
    );
  }

  const me = normalizeMeFromStatus(q.data as AuthStatusResponse | undefined);
  const allowed = !!me && (me.role === 'seller' || me.isAdmin === true);
  if (!allowed) {
    return (
      <div className="flex min-h-dvh items-center justify-center p-6">
        <div className="w-full max-w-md rounded-xl border bg-card p-5 text-center">
          <p className="text-sm text-muted-foreground">Erisim izni kontrol ediliyor...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
