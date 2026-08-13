import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Store } from "lucide-react";

import { fetchAPI } from "@/lib/api-server";

export const metadata: Metadata = {
  title: "Mağazalar — Kaman İlan",
  description: "Kaman ve Kırşehir'deki yerel işletmelerin mağazaları ve güncel ilanları.",
  alternates: { canonical: "/magazalar" },
};

type PublicStore = { id: string; name: string; slug: string; description: string | null; logo_url: string | null; banner_url: string | null; listing_count: number };

export default async function MagazalarPage() {
  const stores = await fetchAPI<{ items: PublicStore[] }>("/stores", {}, "tr").then((value) => value.items).catch(() => []);
  return (
    <main className="min-h-screen bg-paper py-16 md:py-24">
      <div className="container">
        <header className="max-w-3xl">
          <h1 className="font-fraunces text-5xl font-medium tracking-tight text-ink md:text-7xl">Kaman&apos;ın yerel <em className="text-saffron-2">mağazaları</em></h1>
          <p className="mt-6 text-lg leading-relaxed text-text-3">Aktif işletmeleri, mağaza profillerini ve güncel ilanlarını tek yerde keşfedin.</p>
        </header>
        {stores.length ? (
          <section className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {stores.map((store) => (
              <Link key={store.id} href={`/magazalar/${store.slug}`} className="group overflow-hidden rounded-[28px] border border-line bg-white shadow-editorial-2 transition hover:-translate-y-1">
                <div className="relative aspect-[16/7] bg-muted">{store.banner_url ? <Image src={store.banner_url} alt="" fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" /> : null}</div>
                <div className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="relative flex size-14 items-center justify-center overflow-hidden rounded-full border border-line bg-paper">{store.logo_url ? <Image src={store.logo_url} alt={`${store.name} logosu`} fill className="object-cover" sizes="56px" /> : <Store className="size-6" />}</div>
                    <div><h2 className="font-fraunces text-2xl text-ink">{store.name}</h2><p className="flex items-center gap-1 text-xs text-text-3"><MapPin className="size-3" /> Kaman, Kırşehir</p></div>
                  </div>
                  {store.description ? <p className="mt-5 line-clamp-2 text-sm leading-relaxed text-text-3">{store.description}</p> : null}
                  <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-saffron-2">{Number(store.listing_count)} aktif ilan</p>
                </div>
              </Link>
            ))}
          </section>
        ) : <div className="mt-14 rounded-[28px] border border-line bg-white p-12 text-center text-text-3">Henüz yayında mağaza bulunmuyor.</div>}
      </div>
    </main>
  );
}
