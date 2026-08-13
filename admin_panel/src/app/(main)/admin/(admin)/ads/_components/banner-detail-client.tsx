'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BASE_URL } from '@/integrations/apiBase';

type AdDetail = {
  id: number;
  title: string;
  advertiser: string | null;
  position: string;
  imageUrl: string | null;
  linkUrl: string | null;
  caption: string | null;
  ctaLabel: string | null;
};

export function BannerDetailClient({ id }: { id: string }) {
  const [item, setItem] = useState<AdDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void fetch(`${BASE_URL}/admin/banners/${encodeURIComponent(id)}`, { credentials: 'include' })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Reklam alınamadı (${response.status})`);
        return response.json() as Promise<{ item?: AdDetail; data?: AdDetail }>;
      })
      .then((payload) => setItem(payload.item ?? payload.data ?? null))
      .catch((reason: unknown) => toast.error(reason instanceof Error ? reason.message : 'Reklam alınamadı'))
      .finally(() => setLoading(false));
  }, [id]);

  async function save() {
    if (!item) return;
    setSaving(true);
    try {
      const response = await fetch(`${BASE_URL}/admin/banners/${encodeURIComponent(id)}`, {
        method: 'PATCH', credentials: 'include', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ title: item.title, advertiser: item.advertiser, imageUrl: item.imageUrl, linkUrl: item.linkUrl, caption: item.caption, ctaLabel: item.ctaLabel }),
      });
      if (!response.ok) throw new Error(`Kaydedilemedi (${response.status})`);
      toast.success('Reklam kaydedildi');
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : 'Kaydedilemedi');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm text-muted-foreground">Yükleniyor…</p>;
  if (!item) return <p role="alert" className="text-sm text-destructive">Reklam bulunamadı.</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Button asChild variant="ghost"><Link href="/admin/ads"><ArrowLeft className="mr-2 size-4" />Reklamlara dön</Link></Button>
        <Button onClick={() => void save()} disabled={saving}><Save className="mr-2 size-4" />{saving ? 'Kaydediliyor…' : 'Kaydet'}</Button>
      </div>
      <Card>
        <CardHeader><CardTitle>{item.title}</CardTitle></CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          {([
            ['Başlık', 'title'], ['Reklamveren', 'advertiser'], ['Görsel URL', 'imageUrl'],
            ['Hedef URL', 'linkUrl'], ['Açıklama', 'caption'], ['Buton metni', 'ctaLabel'],
          ] as const).map(([label, key]) => (
            <div className="space-y-2" key={key}><Label htmlFor={key}>{label}</Label><Input id={key} value={item[key] ?? ''} onChange={(event) => setItem((current) => current ? { ...current, [key]: event.target.value || null } : current)} /></div>
          ))}
          <div className="space-y-2"><Label>Slot</Label><Input value={item.position} disabled /></div>
        </CardContent>
      </Card>
    </div>
  );
}
