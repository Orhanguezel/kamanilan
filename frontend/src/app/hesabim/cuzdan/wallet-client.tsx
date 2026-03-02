"use client";

import { useState } from "react";
import { Wallet, TrendingUp, TrendingDown, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { useWalletInfoQuery, useWalletTransactionsQuery } from "@/modules/wallet/wallet.service";
import type { WalletTransaction } from "@/modules/wallet/wallet.type";

interface Props {
  translations: {
    wallet: string;
    wallet_balance: string;
    wallet_earnings: string;
    wallet_withdrawn: string;
    wallet_transactions: string;
    wallet_no_transactions: string;
    wallet_all: string;
    wallet_credit: string;
    wallet_debit: string;
    wallet_status_pending: string;
    wallet_status_completed: string;
    wallet_status_failed: string;
    wallet_status_refunded: string;
    wallet_suspended: string;
    wallet_closed: string;
    loading: string;
    error: string;
    previous: string;
    next: string;
  };
}

const STATUS_CLASSES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-blue-100 text-blue-800",
};

function fmt(amount: string, currency: string) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency }).format(
    parseFloat(amount) || 0
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function WalletClient({ translations: tr }: Props) {
  const [page, setPage] = useState(1);
  const [txType, setTxType] = useState<"" | "credit" | "debit">("");

  const { data: wallet, isLoading: walletLoading, isError: walletError } = useWalletInfoQuery();
  const { data: txData, isLoading: txLoading } = useWalletTransactionsQuery({ page, type: txType });

  if (walletLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <span>{tr.loading}</span>
      </div>
    );
  }

  if (walletError || !wallet) {
    return (
      <div className="flex items-center justify-center py-16 text-destructive">
        <span>{tr.error}</span>
      </div>
    );
  }

  if (wallet.status === "suspended") {
    return (
      <div className="rounded-lg border bg-card p-12 text-center text-muted-foreground">
        {tr.wallet_suspended}
      </div>
    );
  }

  if (wallet.status === "closed") {
    return (
      <div className="rounded-lg border bg-card p-12 text-center text-muted-foreground">
        {tr.wallet_closed}
      </div>
    );
  }

  const transactions: WalletTransaction[] = txData?.data ?? [];
  const hasMore = transactions.length === 20;

  return (
    <div className="space-y-6">
      {/* Balance Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-card p-5 flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Wallet className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{tr.wallet_balance}</p>
            <p className="text-2xl font-bold">{fmt(wallet.balance, wallet.currency)}</p>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-5 flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-100">
            <TrendingUp className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{tr.wallet_earnings}</p>
            <p className="text-2xl font-bold">{fmt(wallet.total_earnings, wallet.currency)}</p>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-5 flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-100">
            <TrendingDown className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{tr.wallet_withdrawn}</p>
            <p className="text-2xl font-bold">{fmt(wallet.total_withdrawn, wallet.currency)}</p>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="rounded-lg border bg-card">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-semibold">{tr.wallet_transactions}</h2>
          <div className="flex gap-2">
            {(["", "credit", "debit"] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTxType(t); setPage(1); }}
                className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                  txType === t
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "" ? tr.wallet_all : t === "credit" ? tr.wallet_credit : tr.wallet_debit}
              </button>
            ))}
          </div>
        </div>

        {txLoading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">{tr.loading}</div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">{tr.wallet_no_transactions}</div>
        ) : (
          <ul className="divide-y">
            {transactions.map((tx) => (
              <li key={tx.id} className="flex items-center gap-4 px-4 py-3">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                    tx.type === "credit" ? "bg-green-100" : "bg-red-100"
                  }`}
                >
                  {tx.type === "credit" ? (
                    <ArrowDownLeft className="h-4 w-4 text-green-600" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4 text-red-600" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{tx.purpose || (tx.type === "credit" ? tr.wallet_credit : tr.wallet_debit)}</p>
                  {tx.description && (
                    <p className="truncate text-xs text-muted-foreground">{tx.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground">{formatDate(tx.created_at)}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p
                    className={`font-semibold ${
                      tx.type === "credit" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {tx.type === "credit" ? "+" : "-"}
                    {fmt(tx.amount, tx.currency)}
                  </p>
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      STATUS_CLASSES[tx.payment_status] ?? "bg-muted text-muted-foreground"
                    }`}
                  >
                    {tr[`wallet_status_${tx.payment_status}` as keyof typeof tr] ?? tx.payment_status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Pagination */}
        {(page > 1 || hasMore) && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded px-3 py-1 text-sm font-medium disabled:opacity-40 hover:bg-muted"
            >
              {tr.previous}
            </button>
            <span className="text-sm text-muted-foreground">{page}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasMore}
              className="rounded px-3 py-1 text-sm font-medium disabled:opacity-40 hover:bg-muted"
            >
              {tr.next}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
