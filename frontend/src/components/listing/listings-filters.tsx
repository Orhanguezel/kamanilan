"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { Search } from "lucide-react";
import { t } from "@/lib/t";

const SORTS = [
  { sort: "created_at", orderDir: "desc", label: t("common.sort_newest") },
  { sort: "created_at", orderDir: "asc", label: t("common.sort_oldest") },
  { sort: "price", orderDir: "asc", label: t("common.sort_price_asc") },
  { sort: "price", orderDir: "desc", label: t("common.sort_price_desc") },
];

export function ListingsFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const get = (key: string) => searchParams.get(key) ?? "";

  const updateSort = useCallback(
    (sort: string, orderDir: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("sort", sort);
      params.set("orderDir", orderDir);
      params.delete("offset");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  const updateSearch = useCallback(
    (q: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (q) {
        params.set("q", q);
      } else {
        params.delete("q");
      }
      params.delete("offset");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      {/* Search */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          updateSearch(String(fd.get("q") ?? ""));
        }}
        className="relative flex-1"
      >
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          name="q"
          defaultValue={get("q")}
          placeholder={t("search.placeholder")}
          className="w-full rounded-xl border bg-card py-2.5 pl-9 pr-4 text-sm placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </form>

      {/* Sort */}
      <select
        value={`${get("sort") || "created_at"}|${get("orderDir") || "desc"}`}
        onChange={(e) => {
          const [sort, orderDir] = e.target.value.split("|");
          updateSort(sort, orderDir);
        }}
        className="rounded-xl border bg-card px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
      >
        {SORTS.map((s) => (
          <option key={`${s.sort}|${s.orderDir}`} value={`${s.sort}|${s.orderDir}`}>
            {s.label}
          </option>
        ))}
      </select>
    </div>
  );
}
