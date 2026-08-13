'use client';

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import { CalendarDays, Megaphone, RefreshCcw } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BASE_URL } from '@/integrations/apiBase';
import { Input } from '@/components/ui/input';

type AdSummary = {
  id: number;
  title: string;
  position: string;
  advertiser: string | null;
  lifecycleStatus: string;
  isActive: number;
  impressions: number;
  clicks: number;
};

export default function AdsPage() {
  const [items, setItems] = useState<AdSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState({ title: '', position: 'global_top', imageUrl: '', linkUrl: '', alt: '' });

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BASE_URL}/admin/ads/banners?limit=100`, { credentials: 'include' });
      if (!response.ok) throw new Error(`Reklamlar alınamadı (${response.status})`);
      const payload = (await response.json()) as { items?: AdSummary[] };
      setItems(payload.items ?? []);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Reklamlar alınamadı');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function createAd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch(`${BASE_URL}/admin/ads/banners`, { method: 'POST', credentials: 'include', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...draft, sourceType: 'custom', type: 'image', lifecycleStatus: 'draft' }) });
    if (!response.ok) { setError(`Reklam oluşturulamadı (${response.status})`); return; }
    setDraft({ title: '', position: 'global_top', imageUrl: '', linkUrl: '', alt: '' });
    await load();
  }

  async function removeAd(id: number) {
    if (!window.confirm('Bu reklam kampanyası silinsin mi?')) return;
    const response = await fetch(`${BASE_URL}/admin/ads/banners/${id}`, { method: 'DELETE', credentials: 'include' });
    if (!response.ok) { setError(`Reklam silinemedi (${response.status})`); return; }
    await load();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold"><Megaphone className="size-6" /> Reklamlar</h1>
          <p className="text-sm text-muted-foreground">Kaman İlan reklam kampanyaları ve yayın durumları.</p>
        </div>
        <div className="flex gap-2"><Button asChild variant="outline"><Link href="/admin/ads/operations"><CalendarDays className="mr-2 size-4" />Operasyon merkezi</Link></Button><Button variant="outline" onClick={() => void load()} disabled={loading}><RefreshCcw className="mr-2 size-4" />Yenile</Button></div>
      </div>
      <Card>
        <CardHeader><CardTitle>Yeni kampanya</CardTitle><CardDescription>Önce taslak oluşturun, ardından detay ekranından yayın ayarlarını tamamlayın.</CardDescription></CardHeader>
        <CardContent><form onSubmit={createAd} className="grid gap-3 md:grid-cols-2 lg:grid-cols-5"><Input required placeholder="Kampanya başlığı" value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} /><select aria-label="Reklam slotu" value={draft.position} onChange={(event) => setDraft((current) => ({ ...current, position: event.target.value }))} className="h-10 rounded-md border bg-background px-3 text-sm">{['global_top','global_footer','home_hero_below','home_mid','listings_top','listings_sidebar','listing_detail_below','category_inline','news_top','news_detail_inline','news_detail_sidebar','announcements_top','listing_detail_sidebar','store_detail_sidebar'].map((slot) => <option key={slot}>{slot}</option>)}</select><Input required type="url" placeholder="Görsel URL" value={draft.imageUrl} onChange={(event) => setDraft((current) => ({ ...current, imageUrl: event.target.value }))} /><Input required placeholder="Alternatif metin" value={draft.alt} onChange={(event) => setDraft((current) => ({ ...current, alt: event.target.value }))} /><Button type="submit">Taslak oluştur</Button></form></CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Kampanyalar</CardTitle><CardDescription>{items.length} kayıt</CardDescription></CardHeader>
        <CardContent>
          {error ? <p role="alert" className="mb-4 text-sm text-destructive">{error}</p> : null}
          <Table>
            <TableHeader><TableRow><TableHead>Başlık</TableHead><TableHead>Slot</TableHead><TableHead>Durum</TableHead><TableHead>Gösterim</TableHead><TableHead>Tıklama</TableHead><TableHead /></TableRow></TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell><div className="font-medium">{item.title}</div><div className="text-xs text-muted-foreground">{item.advertiser ?? '—'}</div></TableCell>
                  <TableCell>{item.position}</TableCell>
                  <TableCell><Badge variant={item.isActive ? 'default' : 'secondary'}>{item.lifecycleStatus}</Badge></TableCell>
                  <TableCell>{item.impressions.toLocaleString('tr-TR')}</TableCell>
                  <TableCell>{item.clicks.toLocaleString('tr-TR')}</TableCell>
                  <TableCell className="space-x-2 text-right"><Button asChild size="sm" variant="outline"><Link href={`/admin/ads/${item.id}`}>İncele</Link></Button><Button size="sm" variant="destructive" onClick={() => void removeAd(item.id)}>Sil</Button></TableCell>
                </TableRow>
              ))}
              {!loading && !items.length ? <TableRow><TableCell colSpan={6} className="py-10 text-center text-muted-foreground">Henüz reklam kampanyası yok.</TableCell></TableRow> : null}
              {loading ? <TableRow><TableCell colSpan={6} className="py-10 text-center text-muted-foreground">Yükleniyor…</TableCell></TableRow> : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
