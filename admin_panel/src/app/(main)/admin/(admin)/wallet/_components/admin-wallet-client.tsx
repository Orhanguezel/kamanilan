'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { RefreshCcw, Wallet, TrendingUp, TrendingDown, ChevronDown, ChevronUp } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import {
  useListWalletsAdminQuery,
  useUpdateWalletStatusAdminMutation,
  useAdjustWalletAdminMutation,
  useListWalletTransactionsAdminQuery,
  useUpdateTransactionStatusAdminMutation,
} from '@/integrations/hooks';
import type { WalletAdminView, WalletStatus, WalletTxType, WalletTxStatus } from '@/integrations/shared/wallet.types';

function fmt(amount: string, currency = 'TRY') {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency }).format(
    parseFloat(amount) || 0
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const STATUS_BADGE: Record<WalletStatus, string> = {
  active: 'bg-green-100 text-green-800',
  suspended: 'bg-yellow-100 text-yellow-800',
  closed: 'bg-red-100 text-red-800',
};

const TX_STATUS_BADGE: Record<WalletTxStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-blue-100 text-blue-800',
};

/* ===================== Transaction Drawer ===================== */
function WalletTransactions({ walletId, currency }: { walletId: string; currency: string }) {
  const [page, setPage] = React.useState(1);
  const { data, isLoading, refetch } = useListWalletTransactionsAdminQuery({ walletId, page, limit: 20 });
  const [updateTxStatus] = useUpdateTransactionStatusAdminMutation();

  const transactions = data?.data ?? [];
  const hasMore = transactions.length === 20;

  const handleStatusChange = async (id: string, payment_status: WalletTxStatus) => {
    try {
      await updateTxStatus({ id, body: { payment_status } }).unwrap();
      toast.success('İşlem durumu güncellendi');
      refetch();
    } catch {
      toast.error('Güncelleme başarısız');
    }
  };

  if (isLoading) return <p className="py-4 text-center text-sm text-muted-foreground">Yükleniyor...</p>;
  if (transactions.length === 0) return <p className="py-4 text-center text-sm text-muted-foreground">İşlem bulunamadı.</p>;

  return (
    <div className="space-y-3">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tarih</TableHead>
            <TableHead>Tür</TableHead>
            <TableHead>Tutar</TableHead>
            <TableHead>Amaç</TableHead>
            <TableHead>Durum</TableHead>
            <TableHead>İşlem</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => (
            <TableRow key={tx.id}>
              <TableCell className="text-xs">{formatDate(tx.created_at)}</TableCell>
              <TableCell>
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                  tx.type === 'credit' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {tx.type === 'credit' ? '↓ Yükleme' : '↑ Çekim'}
                </span>
              </TableCell>
              <TableCell className="font-medium">
                <span className={tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}>
                  {tx.type === 'credit' ? '+' : '-'}{fmt(tx.amount, tx.currency)}
                </span>
              </TableCell>
              <TableCell className="max-w-[140px] truncate text-xs">{tx.purpose}</TableCell>
              <TableCell>
                <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                  TX_STATUS_BADGE[tx.payment_status] ?? ''
                }`}>
                  {tx.payment_status}
                </span>
              </TableCell>
              <TableCell>
                <Select
                  value={tx.payment_status}
                  onValueChange={(v) => handleStatusChange(tx.id, v as WalletTxStatus)}
                >
                  <SelectTrigger className="h-7 w-28 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Bekliyor</SelectItem>
                    <SelectItem value="completed">Tamamlandı</SelectItem>
                    <SelectItem value="failed">Başarısız</SelectItem>
                    <SelectItem value="refunded">İade</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {(page > 1 || hasMore) && (
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
            Önceki
          </Button>
          <span className="text-sm text-muted-foreground">{page}</span>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={!hasMore}>
            Sonraki
          </Button>
        </div>
      )}
    </div>
  );
}

/* ===================== Main Component ===================== */
export default function AdminWalletClient() {
  const [page, setPage] = React.useState(1);
  const { data, isLoading, refetch } = useListWalletsAdminQuery({ page, limit: 20 });
  const [updateStatus] = useUpdateWalletStatusAdminMutation();
  const [adjustWallet, { isLoading: isAdjusting }] = useAdjustWalletAdminMutation();

  const [expandedWalletId, setExpandedWalletId] = React.useState<string | null>(null);
  const [adjustDialog, setAdjustDialog] = React.useState<WalletAdminView | null>(null);
  const [adjustForm, setAdjustForm] = React.useState({
    type: 'credit' as WalletTxType,
    amount: '',
    purpose: '',
    description: '',
  });

  const wallets = data?.data ?? [];
  const total = data?.total ?? 0;
  const hasMore = wallets.length === 20;

  const handleStatusChange = async (id: string, status: WalletStatus) => {
    try {
      await updateStatus({ id, body: { status } }).unwrap();
      toast.success('Durum güncellendi');
      refetch();
    } catch {
      toast.error('Güncelleme başarısız');
    }
  };

  const handleAdjust = async () => {
    if (!adjustDialog) return;
    const amount = parseFloat(adjustForm.amount);
    if (!amount || amount <= 0) {
      toast.error('Geçerli bir tutar girin');
      return;
    }
    try {
      await adjustWallet({
        user_id: adjustDialog.user_id,
        type: adjustForm.type,
        amount,
        purpose: adjustForm.purpose || (adjustForm.type === 'credit' ? 'Admin yüklemesi' : 'Admin çekimi'),
        description: adjustForm.description || undefined,
        payment_status: 'completed',
      }).unwrap();
      toast.success('Bakiye ayarlandı');
      setAdjustDialog(null);
      setAdjustForm({ type: 'credit', amount: '', purpose: '', description: '' });
      refetch();
    } catch {
      toast.error('İşlem başarısız');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" /> Cüzdan Yönetimi
            </CardTitle>
            <CardDescription>
              Toplam {total} cüzdan
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCcw className="mr-1 h-3 w-3" /> Yenile
          </Button>
        </CardHeader>
      </Card>

      {isLoading ? (
        <p className="py-8 text-center text-muted-foreground">Yükleniyor...</p>
      ) : wallets.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">Cüzdan bulunamadı.</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead></TableHead>
                <TableHead>Kullanıcı</TableHead>
                <TableHead>Bakiye</TableHead>
                <TableHead>Toplam Kazanç</TableHead>
                <TableHead>Toplam Çekim</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {wallets.map((w) => (
                <React.Fragment key={w.id}>
                  <TableRow
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setExpandedWalletId(expandedWalletId === w.id ? null : w.id)}
                  >
                    <TableCell className="w-8">
                      {expandedWalletId === w.id ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{w.full_name ?? '—'}</p>
                        <p className="text-xs text-muted-foreground">{w.email ?? w.user_id}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">{fmt(w.balance, w.currency)}</TableCell>
                    <TableCell className="text-green-600">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {fmt(w.total_earnings, w.currency)}
                      </span>
                    </TableCell>
                    <TableCell className="text-orange-600">
                      <span className="flex items-center gap-1">
                        <TrendingDown className="h-3 w-3" />
                        {fmt(w.total_withdrawn, w.currency)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[w.status]}`}>
                        {w.status}
                      </span>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setAdjustDialog(w);
                            setAdjustForm({ type: 'credit', amount: '', purpose: '', description: '' });
                          }}
                        >
                          Ayarla
                        </Button>
                        <Select
                          value={w.status}
                          onValueChange={(v) => handleStatusChange(w.id, v as WalletStatus)}
                        >
                          <SelectTrigger className="h-7 w-28 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Aktif</SelectItem>
                            <SelectItem value="suspended">Askıya Al</SelectItem>
                            <SelectItem value="closed">Kapat</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                  </TableRow>
                  {expandedWalletId === w.id && (
                    <TableRow>
                      <TableCell colSpan={7} className="bg-muted/30 p-4">
                        <p className="mb-2 text-sm font-medium text-muted-foreground">İşlem Geçmişi</p>
                        <WalletTransactions walletId={w.id} currency={w.currency} />
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {(page > 1 || hasMore) && (
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
            Önceki
          </Button>
          <span className="text-sm text-muted-foreground">Sayfa {page}</span>
          <Button variant="outline" onClick={() => setPage((p) => p + 1)} disabled={!hasMore}>
            Sonraki
          </Button>
        </div>
      )}

      {/* Adjust Balance Dialog */}
      <Dialog open={!!adjustDialog} onOpenChange={(o) => !o && setAdjustDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bakiye Ayarla</DialogTitle>
            <DialogDescription>
              {adjustDialog?.full_name ?? adjustDialog?.email} — Mevcut: {adjustDialog ? fmt(adjustDialog.balance, adjustDialog.currency) : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>İşlem Türü</Label>
              <Select
                value={adjustForm.type}
                onValueChange={(v) => setAdjustForm((f) => ({ ...f, type: v as WalletTxType }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit">Yükleme (Kredi)</SelectItem>
                  <SelectItem value="debit">Çekim (Debit)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tutar</Label>
              <Input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={adjustForm.amount}
                onChange={(e) => setAdjustForm((f) => ({ ...f, amount: e.target.value }))}
              />
            </div>
            <div>
              <Label>Amaç</Label>
              <Input
                placeholder="İşlem amacı"
                value={adjustForm.purpose}
                onChange={(e) => setAdjustForm((f) => ({ ...f, purpose: e.target.value }))}
              />
            </div>
            <div>
              <Label>Açıklama (opsiyonel)</Label>
              <Input
                placeholder="Ek açıklama"
                value={adjustForm.description}
                onChange={(e) => setAdjustForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdjustDialog(null)}>İptal</Button>
            <Button onClick={handleAdjust} disabled={isAdjusting}>
              {isAdjusting ? 'İşleniyor...' : 'Uygula'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
