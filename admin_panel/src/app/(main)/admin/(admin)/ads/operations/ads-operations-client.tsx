'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import { ArrowLeft, CalendarDays, RefreshCcw } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BASE_URL } from '@/integrations/apiBase';
import { ADS_OPERATION_TABS, asItems, dateOffset } from './ads-operations';
import type { AdsOperationTab } from './ads-operations';

const today = dateOffset(0);

function text(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

async function api(path: string, init?: RequestInit): Promise<unknown> {
  const response = await fetch(`${BASE_URL}/admin/ads${path}`, { credentials: 'include', ...init });
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(body?.error ?? `İstek başarısız (${response.status})`);
  }
  if (response.status === 204) return null;
  return response.json();
}

export default function AdsOperationsClient() {
  const [tab, setTab] = useState<AdsOperationTab>('slots');
  const [rows, setRows] = useState<Array<Record<string, unknown>>>([]);
  const [calendar, setCalendar] = useState<{ slots: Array<Record<string, unknown>>; bookings: Array<Record<string, unknown>> }>({ slots: [], bookings: [] });
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(dateOffset(30));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [packageDraft, setPackageDraft] = useState({ name: '', slug: '', durationDays: '7', price: '0' });

  const endpoint = useMemo(() => ({
    slots: '/banners/slots',
    packages: '/banners/packages',
    calendar: `/banners/calendar?from=${from}&to=${to}`,
    waitlist: '/banners-waitlist/suggestions',
    requests: '/banners/self-service-requests',
    reports: `/banners/metrics?from=${from}&to=${to}`,
  })[tab], [from, tab, to]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = await api(endpoint);
      if (tab === 'calendar' && payload && typeof payload === 'object') {
        const value = payload as { slots?: unknown; bookings?: unknown };
        setCalendar({ slots: Array.isArray(value.slots) ? value.slots as Array<Record<string, unknown>> : [], bookings: Array.isArray(value.bookings) ? value.bookings as Array<Record<string, unknown>> : [] });
        setRows([]);
      } else {
        setRows(asItems(payload));
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Veri alınamadı');
    } finally {
      setLoading(false);
    }
  }, [endpoint, tab]);

  useEffect(() => { void load(); }, [load]);

  async function updateSlot(slotKey: string, isActive: boolean) {
    await api(`/banners/slots/${encodeURIComponent(slotKey)}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ isActive }) });
    await load();
  }

  async function createPackage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    try {
      await api('/banners/packages', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...packageDraft, durationDays: Number(packageDraft.durationDays), price: Number(packageDraft.price), billingPeriod: 'custom', currency: 'TRY', devices: ['all'], discountPercent: 0, slotKeys: [] }) });
      setPackageDraft({ name: '', slug: '', durationDays: '7', price: '0' });
      await load();
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Paket oluşturulamadı'); }
  }

  async function setWaitlistStatus(id: number, status: 'offered' | 'cancelled') {
    await api(`/banners-waitlist/${id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ status }) });
    await load();
  }

  async function reviewRequest(id: number, status: 'approved' | 'rejected') {
    const reviewNote = window.prompt('İnceleme notu', status === 'approved' ? 'Talep onaylandı.' : 'Talep uygun bulunmadı.');
    if (!reviewNote) return;
    await api(`/banners/self-service-requests/${id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ status, reviewNote }) });
    await load();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="flex items-center gap-2 text-2xl font-semibold"><CalendarDays className="size-6" />Reklam operasyon merkezi</h1><p className="text-sm text-muted-foreground">Slot, fiyat, yayın takvimi, talep ve performans yönetimi.</p></div>
        <div className="flex gap-2"><Button asChild variant="outline"><Link href="/admin/ads"><ArrowLeft className="mr-2 size-4" />Kampanyalar</Link></Button><Button variant="outline" onClick={() => void load()} disabled={loading}><RefreshCcw className="mr-2 size-4" />Yenile</Button></div>
      </div>
      <Tabs value={tab} onValueChange={(value) => setTab(value as AdsOperationTab)}>
        <TabsList className="h-auto flex-wrap justify-start">{ADS_OPERATION_TABS.map((item) => <TabsTrigger key={item.key} value={item.key}>{item.label}</TabsTrigger>)}</TabsList>
        {ADS_OPERATION_TABS.map((item) => <TabsContent key={item.key} value={item.key} className="space-y-4">
          {(item.key === 'calendar' || item.key === 'reports') ? <Card><CardContent className="flex flex-wrap gap-3 pt-6"><label className="text-sm">Başlangıç<Input type="date" value={from} onChange={(event) => setFrom(event.target.value)} /></label><label className="text-sm">Bitiş<Input type="date" value={to} onChange={(event) => setTo(event.target.value)} /></label></CardContent></Card> : null}
          {item.key === 'packages' ? <Card><CardHeader><CardTitle>Yeni reklam paketi</CardTitle><CardDescription>Satış ekibinin kullanacağı temel fiyat paketini oluşturun.</CardDescription></CardHeader><CardContent><form className="grid gap-3 md:grid-cols-5" onSubmit={createPackage}><Input required placeholder="Paket adı" value={packageDraft.name} onChange={(e) => setPackageDraft((v) => ({ ...v, name: e.target.value }))} /><Input required pattern="[a-z0-9-]+" placeholder="paket-slug" value={packageDraft.slug} onChange={(e) => setPackageDraft((v) => ({ ...v, slug: e.target.value }))} /><Input required min="1" type="number" placeholder="Gün" value={packageDraft.durationDays} onChange={(e) => setPackageDraft((v) => ({ ...v, durationDays: e.target.value }))} /><Input required min="0" step="0.01" type="number" placeholder="Fiyat" value={packageDraft.price} onChange={(e) => setPackageDraft((v) => ({ ...v, price: e.target.value }))} /><Button type="submit">Paket oluştur</Button></form></CardContent></Card> : null}
          {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
          <OperationsTable tab={item.key} rows={item.key === 'calendar' ? calendar.bookings : rows} loading={loading} onSlot={updateSlot} onWaitlist={setWaitlistStatus} onRequest={reviewRequest} />
          {item.key === 'calendar' ? <p className="text-sm text-muted-foreground">{calendar.slots.length} slot, {calendar.bookings.length} planlı kampanya.</p> : null}
        </TabsContent>)}
      </Tabs>
    </div>
  );
}

function OperationsTable({ tab, rows, loading, onSlot, onWaitlist, onRequest }: { tab: AdsOperationTab; rows: Array<Record<string, unknown>>; loading: boolean; onSlot: (key: string, active: boolean) => Promise<void>; onWaitlist: (id: number, status: 'offered' | 'cancelled') => Promise<void>; onRequest: (id: number, status: 'approved' | 'rejected') => Promise<void> }) {
  const columns: Record<AdsOperationTab, Array<[string, string]>> = {
    slots: [['label', 'Slot'], ['slotKey', 'Anahtar'], ['pageType', 'Sayfa'], ['baseDailyPrice', 'Günlük fiyat'], ['desktopCapacity', 'Masaüstü'], ['mobileCapacity', 'Mobil']],
    packages: [['name', 'Paket'], ['billingPeriod', 'Dönem'], ['durationDays', 'Gün'], ['price', 'Fiyat'], ['devices', 'Cihazlar'], ['slotKeys', 'Slotlar']],
    calendar: [['title', 'Kampanya'], ['position', 'Slot'], ['advertiser', 'Reklam veren'], ['startAt', 'Başlangıç'], ['endAt', 'Bitiş'], ['device', 'Cihaz']],
    waitlist: [['title', 'Talep'], ['position', 'Slot'], ['advertiser', 'Reklam veren'], ['status', 'Durum'], ['requestedDate', 'Tarih'], ['requestedAvailable', 'Uygunluk']],
    requests: [['id', 'No'], ['requestType', 'Talep'], ['sellerId', 'Mağaza'], ['status', 'Durum'], ['requesterNote', 'Not'], ['createdAt', 'Tarih']],
    reports: [['metricDate', 'Gün'], ['bannerId', 'Kampanya'], ['position', 'Slot'], ['impressions', 'Gösterim'], ['clicks', 'Tıklama'], ['uniqueClicks', 'Tekil tıklama']],
  };
  return <Card><CardHeader><CardTitle>{ADS_OPERATION_TABS.find((item) => item.key === tab)?.label}</CardTitle><CardDescription>{rows.length} kayıt</CardDescription></CardHeader><CardContent><Table><TableHeader><TableRow>{columns[tab].map(([key, label]) => <TableHead key={key}>{label}</TableHead>)}<TableHead className="text-right">İşlem</TableHead></TableRow></TableHeader><TableBody>{rows.map((row, index) => <TableRow key={text(row.id ?? row.slotKey ?? index)}>{columns[tab].map(([key]) => <TableCell key={key}>{key === 'status' || key === 'lifecycleStatus' ? <Badge variant="secondary">{text(row[key])}</Badge> : text(row[key])}</TableCell>)}<TableCell className="space-x-2 text-right">{tab === 'slots' ? <Button size="sm" variant="outline" onClick={() => void onSlot(text(row.slotKey), !Boolean(row.isActive))}>{Boolean(row.isActive) ? 'Pasifleştir' : 'Aktifleştir'}</Button> : null}{tab === 'waitlist' && Number(row.id) ? <><Button size="sm" onClick={() => void onWaitlist(Number(row.id), 'offered')}>Teklif et</Button><Button size="sm" variant="outline" onClick={() => void onWaitlist(Number(row.id), 'cancelled')}>İptal</Button></> : null}{tab === 'requests' && row.status === 'pending' ? <><Button size="sm" onClick={() => void onRequest(Number(row.id), 'approved')}>Onayla</Button><Button size="sm" variant="outline" onClick={() => void onRequest(Number(row.id), 'rejected')}>Reddet</Button></> : null}</TableCell></TableRow>)}{!loading && !rows.length ? <TableRow><TableCell colSpan={columns[tab].length + 1} className="py-10 text-center text-muted-foreground">Kayıt yok.</TableCell></TableRow> : null}{loading ? <TableRow><TableCell colSpan={columns[tab].length + 1} className="py-10 text-center text-muted-foreground">Yükleniyor…</TableCell></TableRow> : null}</TableBody></Table></CardContent></Card>;
}
