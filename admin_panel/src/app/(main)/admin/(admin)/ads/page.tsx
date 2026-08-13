'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Megaphone, RefreshCcw } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BASE_URL } from '@/integrations/apiBase';

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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold"><Megaphone className="size-6" /> Reklamlar</h1>
          <p className="text-sm text-muted-foreground">Kaman İlan reklam kampanyaları ve yayın durumları.</p>
        </div>
        <Button variant="outline" onClick={() => void load()} disabled={loading}><RefreshCcw className="mr-2 size-4" />Yenile</Button>
      </div>
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
                  <TableCell className="text-right"><Button asChild size="sm" variant="outline"><Link href={`/admin/ads/${item.id}`}>İncele</Link></Button></TableCell>
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
