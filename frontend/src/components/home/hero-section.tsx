"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CarFront,
  MapPin,
  Search,
  Sprout,
  Store,
  Wrench,
} from "lucide-react";
import { ROUTES } from "@/config/routes";
import {
  useActiveListingCountQuery,
  useCategoriesQuery,
  useCategoryCountsQuery,
} from "@/modules/site/site.service";
import type { CategoryItem } from "@/modules/site/site.type";
import { pickHomeCategories } from "./marketplace-home.utils";

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "emlak-kira": Building2,
  "arac-motosiklet": CarFront,
  "hayvan-tarim": Sprout,
  "is-ilanlari": BriefcaseBusiness,
  "usta-hizmet": Wrench,
  "ikinci-el": Store,
};

const ORCHARD_IMAGE = "/images/home/kaman-walnut-orchard.webp";
const HOUSE_IMAGE = "/images/home/kaman-stone-house.webp";
const TRACTOR_IMAGE = "/images/home/kaman-tractor.webp";

function CategoryShortcut({
  category,
  count,
}: {
  category: CategoryItem;
  count: number;
}) {
  const Icon = CATEGORY_ICONS[category.slug] ?? Store;
  return (
    <Link
      href={ROUTES.CATEGORY(category.slug)}
      className="group flex min-h-[64px] items-center gap-3 border-r border-white/10 px-3 py-3 last:border-r-0 hover:bg-white/[0.06]"
    >
      <Icon className="h-4 w-4 shrink-0 text-saffron" />
      <span className="min-w-0">
        <span className="block truncate text-[10px] font-bold text-paper">{category.name}</span>
        <span className="mt-1 block font-mono text-[8px] uppercase tracking-[0.1em] text-paper/45">
          {count} ilan
        </span>
      </span>
    </Link>
  );
}

export function HeroSection() {
  const categoriesQuery = useCategoriesQuery();
  const categories: CategoryItem[] = categoriesQuery.data ?? [];
  const { data: categoryCounts = {} } = useCategoryCountsQuery();
  const { data: activeListingCount = 0 } = useActiveListingCountQuery();
  const shortcuts = pickHomeCategories(categories);
  const today = new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <>
      <section className="overflow-hidden border-b border-black/10 bg-ink">
        <div className="mx-auto grid min-h-[360px] max-w-[1536px] grid-cols-1 lg:grid-cols-[45%_29%_26%]">
          <div className="flex flex-col justify-center bg-ink px-6 py-10 text-paper sm:px-10 lg:px-[max(2.5rem,calc((100vw-1280px)/2))] lg:py-8">
            <p className="mb-4 flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.2em] text-saffron">
              <span className="h-px w-6 bg-saffron" />
              Kaman&apos;ın yerel pazarı
            </p>
            <h1 className="max-w-[520px] font-fraunces text-[clamp(38px,4.2vw,64px)] font-medium leading-[0.94] tracking-[-0.045em]">
              Aradığın<br />
              <em className="font-normal text-saffron">Kaman&apos;da.</em>
            </h1>
            <p className="mt-5 max-w-[500px] text-[13px] leading-6 text-paper/65">
              Kaman ve çevresindeki ilanları keşfet; doğrudan ilan sahibiyle iletişim kur.
            </p>

            <form action={ROUTES.LISTINGS} className="mt-6 max-w-[570px]">
              <div className="flex h-12 items-center bg-paper text-ink shadow-xl">
                <select
                  aria-label="Kategori seç"
                  name="category"
                  className="hidden h-full max-w-[145px] border-r border-black/10 bg-transparent px-4 text-[10px] font-bold outline-none sm:block"
                >
                  <option value="">Tüm kategoriler</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <input
                  name="q"
                  aria-label="İlanlarda ara"
                  placeholder="Ne arıyorsun?"
                  className="min-w-0 flex-1 bg-transparent px-4 text-[12px] outline-none placeholder:text-walnut/45"
                />
                <button
                  type="submit"
                  aria-label="Ara"
                  className="mr-1 flex h-10 w-10 items-center justify-center bg-saffron text-ink transition-colors hover:bg-ink hover:text-saffron"
                >
                  <Search aria-hidden="true" className="h-4 w-4" />
                </button>
              </div>
            </form>

            {shortcuts.length > 0 && (
              <div className="mt-5 grid max-w-[570px] grid-cols-2 border border-white/10 sm:grid-cols-5">
                {shortcuts.map((category) => (
                  <CategoryShortcut
                    key={category.id}
                    category={category}
                    count={categoryCounts[category.id] ?? 0}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="relative min-h-[300px] overflow-hidden lg:min-h-[360px]">
            <Image
              src={ORCHARD_IMAGE}
              alt="Kaman'da tarım ve yerel üretim"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 29vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/25 to-transparent" />
            <span className="absolute bottom-5 left-5 bg-paper px-3 py-2 font-mono text-[8px] uppercase tracking-[0.16em] text-ink">
              Kaman · Kırşehir
            </span>
          </div>

          <div className="hidden grid-rows-2 gap-px bg-paper lg:grid">
            <Link href={ROUTES.CATEGORY("emlak-kira")} className="group relative overflow-hidden">
              <Image
                src={HOUSE_IMAGE}
                alt="Kaman emlak ilanları"
                fill
                sizes="26vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-ink/80 to-transparent px-5 pb-4 pt-10 text-[11px] font-bold text-paper">
                Emlak İlanları <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
            <Link href={ROUTES.CATEGORY("arac-gerec")} className="group relative overflow-hidden">
              <Image
                src={TRACTOR_IMAGE}
                alt="Kaman araç ve tarım ilanları"
                fill
                sizes="26vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-ink/80 to-transparent px-5 pb-4 pt-10 text-[11px] font-bold text-paper">
                Araç & Tarım <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-black/10 bg-paper">
        <div className="container grid min-h-[66px] grid-cols-2 items-center gap-x-6 gap-y-3 py-4 md:grid-cols-[1.2fr_1fr_1fr_1fr] md:py-0">
          <div>
            <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-saffron">Bugün Kaman&apos;da</span>
            <p className="mt-1 font-fraunces text-[16px] font-medium text-ink">Yerel pazar açık</p>
          </div>
          <div className="border-l border-black/10 pl-5">
            <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-walnut/55">Tarih</span>
            <p className="mt-1 text-[11px] font-semibold text-ink">{today}</p>
          </div>
          <div className="border-l border-black/10 pl-5">
            <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-walnut/55">Konum</span>
            <p className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold text-ink">
              <MapPin className="h-3 w-3 text-saffron" /> Kaman, Kırşehir
            </p>
          </div>
          <div className="border-l border-black/10 pl-5">
            <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-walnut/55">Yayındaki ilan</span>
            <p className="mt-1 text-[11px] font-semibold text-ink">{activeListingCount} aktif ilan</p>
          </div>
        </div>
      </section>
    </>
  );
}
