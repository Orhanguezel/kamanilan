import type { ReactNode } from 'react';

import SellerAuthGate from './_components/seller-auth-gate';
import SellerMenu from './_components/seller-menu';

export default function SellerLayout({ children }: { children: ReactNode }) {
  return (
    <SellerAuthGate>
      <div className="min-h-dvh bg-background">
        <div className="mx-auto grid w-full max-w-6xl gap-4 p-4 md:grid-cols-[240px_1fr] md:p-8">
          <SellerMenu />
          <main className="rounded-xl border bg-card p-5 md:p-6">{children}</main>
        </div>
      </div>
    </SellerAuthGate>
  );
}
