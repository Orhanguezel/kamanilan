"use client";

import { Button } from "@/components/ui/button";
import { useListNewsImageQueueAdminQuery } from "@/integrations/hooks";

function slugify(value: string) { return value.toLocaleLowerCase("tr-TR").replace(/[ğ]/g, "g").replace(/[ü]/g, "u").replace(/[ş]/g, "s").replace(/[ı]/g, "i").replace(/[ö]/g, "o").replace(/[ç]/g, "c").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 180); }

export default function NewsImageQueueClient() {
  const { data = [], isLoading } = useListNewsImageQueueAdminQuery();
  const markdown = data.map((item) => `## ${slugify(item.ai_title ?? item.title ?? `haber-${item.id}`)}\n\n${item.image_brief}\n\n- Kapak: 1200×675\n- Kare: 1080×1080\n- Dosya: \`${slugify(item.ai_title ?? item.title ?? `haber-${item.id}`)}.png\``).join("\n\n---\n\n");
  return <div className="space-y-4"><div className="flex items-center justify-between"><div><h1 className="text-xl font-semibold">Haber Görsel Kuyruğu</h1><p className="text-sm text-muted-foreground">Görseller API ile üretilmez; brifleri kopyalayıp dosyaları content-images/gelen klasörüne bırakın.</p></div><Button disabled={!data.length} onClick={() => navigator.clipboard.writeText(markdown)}>Brifleri panoya kopyala</Button></div>{isLoading ? <p>Yükleniyor…</p> : data.map((item) => <article key={item.id} className="rounded-lg border bg-card p-4"><h2 className="font-semibold">{item.ai_title ?? item.title}</h2><p className="mt-2 whitespace-pre-wrap text-sm">{item.image_brief}</p><code className="mt-3 block text-xs">{slugify(item.ai_title ?? item.title ?? `haber-${item.id}`)}.png</code></article>)}</div>;
}
