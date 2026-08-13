import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Store } from "lucide-react";

import BannerSlot from "@/components/ads/BannerSlot";
import { ListingCard } from "@/components/listing/listing-card";
import { fetchAPI } from "@/lib/api-server";
import type { Listing } from "@/modules/listing/listing.types";

type StoreDetail = { id: string; name: string; slug: string; description: string | null; logo_url: string | null; banner_url: string | null };
type Payload = { store: StoreDetail; listings: Listing[] };
type Props = { params: Promise<{ slug: string }> };

async function load(slug: string) { return fetchAPI<Payload>(`/stores/${encodeURIComponent(slug)}`, {}, "tr").catch(() => null); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params; const data = await load(slug);
  return { title: data?.store.name ?? "Mağaza", description: data?.store.description ?? "Kaman İlan yerel mağaza profili", alternates: { canonical: `/magazalar/${slug}` } };
}

export default async function StorePage({ params }: Props) {
  const { slug } = await params; const data = await load(slug); if (!data) notFound();
  return (
    <main className="bg-paper pb-20">
      <div className="relative h-56 bg-ink md:h-80">{data.store.banner_url ? <Image src={data.store.banner_url} alt={`${data.store.name} kapak görseli`} fill priority className="object-cover" sizes="100vw" /> : null}</div>
      <div className="container relative -mt-12">
        <section className="rounded-[32px] border border-line bg-white p-7 shadow-editorial-3 md:p-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-paper shadow-xl">{data.store.logo_url ? <Image src={data.store.logo_url} alt={`${data.store.name} logosu`} fill className="object-cover" sizes="96px" /> : <Store className="size-10" />}</div>
            <div><h1 className="font-fraunces text-4xl text-ink md:text-5xl">{data.store.name}</h1><p className="mt-2 flex items-center gap-2 text-sm text-text-3"><MapPin className="size-4" /> Kaman, Kırşehir</p>{data.store.description ? <p className="mt-4 max-w-3xl leading-relaxed text-text-3">{data.store.description}</p> : null}</div>
          </div>
        </section>
        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_320px]">
          <section><div className="mb-7 flex items-end justify-between"><h2 className="font-fraunces text-3xl text-ink">Mağaza ilanları</h2><Link href="/ilanlar" className="ghost-link">Tüm ilanlar</Link></div>{data.listings.length ? <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{data.listings.map((listing) => <ListingCard key={listing.id} listing={listing} />)}</div> : <p className="rounded-2xl bg-white p-8 text-text-3">Bu mağazanın aktif ilanı bulunmuyor.</p>}</section>
          <aside><BannerSlot position="store_detail_sidebar" context={{ seller: data.store.id }} /></aside>
        </div>
      </div>
    </main>
  );
}
