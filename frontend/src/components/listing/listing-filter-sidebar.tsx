"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  SlidersHorizontal,
  X,
  Search,
  Plus,
  Minus,
} from "lucide-react";
import { t } from "@/lib/t";
import {
  useCategoriesQuery,
  useSubCategoriesQuery,
  useListingBrandsQuery,
  useListingTagsQuery,
  useListingMetaDistrictsQuery,
  useListingMetaCitiesQuery,
} from "@/modules/listing/listing.service";

const STATUSES = [
  { value: "satilik", label: t("listing.status_satilik") },
  { value: "kiralik", label: t("listing.status_kiralik") },
  { value: "takas", label: t("listing.status_takas") },
  { value: "ihtiyac", label: t("listing.status_ihtiyac") },
  { value: "ucretsiz", label: t("listing.status_ucretsiz") },
];

// URL params used for filtering (slug-based)
const SLUG_PARAMS = ["category", "sub_category", "brand", "tags", "status", "price_min", "price_max", "city", "district"];

type OpenSections = Record<string, boolean>;

function SectionHeader({
  label,
  open,
  onToggle,
  badge,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  badge?: number;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between rounded-lg border bg-card px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
    >
      <span className="flex items-center gap-2">
        {label}
        {!!badge && (
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
            {badge}
          </span>
        )}
      </span>
      {open ? (
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      ) : (
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      )}
    </button>
  );
}

function FilterContent({
  searchParams,
  onApply,
}: {
  searchParams: URLSearchParams;
  onApply: (params: URLSearchParams) => void;
}) {
  const get = (k: string) => searchParams.get(k) ?? "";
  const getArray = (k: string) =>
    (searchParams.get(k) ?? "").split(",").filter(Boolean);

  // ── Local state (slug-based) ──────────────────────────────
  const [openSections, setOpenSections] = useState<OpenSections>({
    categories: true,
    status: false,
    price: false,
    location: false,
    brands: false,
    tags: false,
  });

  // slugs stored in state (not IDs)
  const [selectedCatSlug, setSelectedCatSlug] = useState(get("category"));
  const [selectedSubCatSlug, setSelectedSubCatSlug] = useState(get("sub_category"));
  const [selectedBrandSlug, setSelectedBrandSlug] = useState(get("brand"));
  const [selectedTagSlugs, setSelectedTagSlugs] = useState<string[]>(getArray("tags"));
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(getArray("status"));
  const [minPrice, setMinPrice] = useState(get("price_min"));
  const [maxPrice, setMaxPrice] = useState(get("price_max"));
  const [selectedCity, setSelectedCity] = useState(get("city"));
  const [selectedDistrict, setSelectedDistrict] = useState(get("district"));
  const [brandSearch, setBrandSearch] = useState("");
  const [expandedCats, setExpandedCats] = useState<Set<string>>(
    get("category") ? new Set([get("category")]) : new Set()
  );

  // ── Queries ───────────────────────────────────────────────
  const { data: categories = [] } = useCategoriesQuery();

  // Derive category/subcategory IDs from slugs (for data fetching)
  const selectedCat = categories.find((c) => c.slug === selectedCatSlug);
  const selectedCatId = selectedCat?.id;

  const { data: subCategories = [] } = useSubCategoriesQuery(selectedCatId);
  const selectedSubCat = subCategories.find((sc) => sc.slug === selectedSubCatSlug);
  const selectedSubCatId = selectedSubCat?.id;

  const { data: brands = [] } = useListingBrandsQuery(selectedCatId, selectedSubCatId);
  const { data: tags = [] } = useListingTagsQuery(selectedCatId, selectedSubCatId);
  const { data: cities = [] } = useListingMetaCitiesQuery();
  const { data: districts = [] } = useListingMetaDistrictsQuery();

  const filteredBrands = useMemo(() => {
    if (!brandSearch.trim()) return brands;
    const s = brandSearch.toLowerCase();
    return brands.filter((b) => b.name.toLowerCase().includes(s));
  }, [brands, brandSearch]);

  // ── Handlers ─────────────────────────────────────────────
  const toggleSection = (key: string) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const toggleStatus = (v: string) =>
    setSelectedStatuses((prev) =>
      prev.includes(v) ? prev.filter((s) => s !== v) : [...prev, v]
    );

  const toggleTagSlug = (slug: string) =>
    setSelectedTagSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );

  const selectCategory = (slug: string) => {
    const next = selectedCatSlug === slug ? "" : slug;
    setSelectedCatSlug(next);
    setSelectedSubCatSlug("");
    setSelectedBrandSlug("");
    setSelectedTagSlugs([]);
    if (next) {
      setExpandedCats((prev) => {
        const s = new Set(prev);
        s.has(slug) ? s.delete(slug) : s.add(slug);
        return s;
      });
    }
  };

  const selectSubCategory = (slug: string) => {
    setSelectedSubCatSlug(selectedSubCatSlug === slug ? "" : slug);
    setSelectedBrandSlug("");
    setSelectedTagSlugs([]);
  };

  const activeCount =
    (selectedCatSlug ? 1 : 0) +
    (selectedSubCatSlug ? 1 : 0) +
    selectedStatuses.length +
    (selectedBrandSlug ? 1 : 0) +
    selectedTagSlugs.length +
    (minPrice ? 1 : 0) +
    (maxPrice ? 1 : 0) +
    (selectedCity ? 1 : 0) +
    (selectedDistrict ? 1 : 0);

  function applyFilters() {
    const params = new URLSearchParams();
    // Preserve search and sort
    const q = searchParams.get("q");
    const sort = searchParams.get("sort");
    const orderDir = searchParams.get("orderDir");
    if (q) params.set("q", q);
    if (sort) params.set("sort", sort);
    if (orderDir) params.set("orderDir", orderDir);

    // Slug-based filter params
    if (selectedCatSlug)          params.set("category",     selectedCatSlug);
    if (selectedSubCatSlug)       params.set("sub_category", selectedSubCatSlug);
    if (selectedBrandSlug)        params.set("brand",        selectedBrandSlug);
    if (selectedTagSlugs.length)  params.set("tags",         selectedTagSlugs.join(","));
    if (selectedStatuses.length)  params.set("status",       selectedStatuses.join(","));
    if (minPrice)                 params.set("price_min",    minPrice);
    if (maxPrice)                 params.set("price_max",    maxPrice);
    if (selectedCity)             params.set("city",         selectedCity);
    if (selectedDistrict)         params.set("district",     selectedDistrict);

    onApply(params);
  }

  function clearFilters() {
    const params = new URLSearchParams();
    const q = searchParams.get("q");
    const sort = searchParams.get("sort");
    const orderDir = searchParams.get("orderDir");
    if (q) params.set("q", q);
    if (sort) params.set("sort", sort);
    if (orderDir) params.set("orderDir", orderDir);

    setSelectedCatSlug("");
    setSelectedSubCatSlug("");
    setSelectedStatuses([]);
    setSelectedBrandSlug("");
    setSelectedTagSlugs([]);
    setMinPrice("");
    setMaxPrice("");
    setSelectedCity("");
    setSelectedDistrict("");
    setBrandSearch("");
    setExpandedCats(new Set());

    onApply(params);
  }

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="space-y-2">
      {/* --- Kategoriler --- */}
      {categories.length > 0 && (
        <div>
          <SectionHeader
            label={t("listing.filter_category")}
            open={openSections.categories}
            onToggle={() => toggleSection("categories")}
            badge={selectedCatSlug || selectedSubCatSlug ? 1 : 0}
          />
          {openSections.categories && (
            <div className="mt-1.5 space-y-0.5 pb-2">
              {categories.map((cat) => {
                const isSelected = selectedCatSlug === cat.slug;
                const isExpanded = expandedCats.has(cat.slug);
                const showChildren = isSelected && subCategories.length > 0;

                return (
                  <div key={cat.id}>
                    <div className="flex items-center gap-1">
                      <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted">
                        <input
                          type="radio"
                          name="category"
                          checked={isSelected}
                          onChange={() => selectCategory(cat.slug)}
                          className="h-3.5 w-3.5 accent-primary"
                        />
                        <span className={isSelected ? "font-medium text-primary" : ""}>
                          {cat.name}
                        </span>
                      </label>
                      {isSelected && subCategories.length > 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedCats((prev) => {
                              const s = new Set(prev);
                              s.has(cat.slug) ? s.delete(cat.slug) : s.add(cat.slug);
                              return s;
                            })
                          }
                          className="shrink-0 rounded border bg-card p-0.5"
                        >
                          {isExpanded ? (
                            <Minus className="h-3 w-3" />
                          ) : (
                            <Plus className="h-3 w-3" />
                          )}
                        </button>
                      )}
                    </div>

                    {showChildren && isExpanded && (
                      <div className="ml-6 mt-0.5 space-y-0.5">
                        {subCategories.map((sc) => (
                          <label
                            key={sc.id}
                            className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted"
                          >
                            <input
                              type="radio"
                              name="subcategory"
                              checked={selectedSubCatSlug === sc.slug}
                              onChange={() => selectSubCategory(sc.slug)}
                              className="h-3.5 w-3.5 accent-primary"
                            />
                            <span
                              className={
                                selectedSubCatSlug === sc.slug
                                  ? "font-medium text-primary"
                                  : "text-muted-foreground"
                              }
                            >
                              {sc.name}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* --- Durum --- */}
      <div>
        <SectionHeader
          label={t("listing.filter_status")}
          open={openSections.status}
          onToggle={() => toggleSection("status")}
          badge={selectedStatuses.length}
        />
        {openSections.status && (
          <div className="mt-1.5 space-y-0.5 pb-2">
            {STATUSES.map((s) => (
              <label
                key={s.value}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted"
              >
                <input
                  type="checkbox"
                  checked={selectedStatuses.includes(s.value)}
                  onChange={() => toggleStatus(s.value)}
                  className="h-3.5 w-3.5 accent-primary rounded"
                />
                <span>{s.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* --- Fiyat Aralığı --- */}
      <div>
        <SectionHeader
          label={t("listing.filter_price")}
          open={openSections.price}
          onToggle={() => toggleSection("price")}
          badge={minPrice || maxPrice ? 1 : 0}
        />
        {openSections.price && (
          <div className="mt-1.5 pb-2">
            <div className="flex items-center gap-2 px-1">
              <input
                type="number"
                min={0}
                placeholder={t("listing.filter_price_min")}
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="h-9 w-full rounded-md border bg-card px-2 text-sm placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
              <span className="shrink-0 text-muted-foreground">–</span>
              <input
                type="number"
                min={0}
                placeholder={t("listing.filter_price_max")}
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="h-9 w-full rounded-md border bg-card px-2 text-sm placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
            </div>
          </div>
        )}
      </div>

      {/* --- Konum --- */}
      <div>
        <SectionHeader
          label={t("listing.filter_location")}
          open={openSections.location}
          onToggle={() => toggleSection("location")}
          badge={selectedCity || selectedDistrict ? 1 : 0}
        />
        {openSections.location && (
          <div className="mt-1.5 space-y-2 pb-2 px-1">
            {cities.length > 0 && (
              <select
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value);
                  setSelectedDistrict("");
                }}
                className="h-9 w-full rounded-md border bg-card px-2 text-sm text-foreground focus:border-primary focus:outline-none"
              >
                <option value="">{t("listing.filter_city_all")}</option>
                {cities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            )}
            {districts.length > 0 && (
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="h-9 w-full rounded-md border bg-card px-2 text-sm text-foreground focus:border-primary focus:outline-none"
              >
                <option value="">{t("listing.filter_district_all")}</option>
                {districts.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            )}
          </div>
        )}
      </div>

      {/* --- Markalar --- */}
      {brands.length > 0 && (
        <div>
          <SectionHeader
            label={t("listing.filter_brand")}
            open={openSections.brands}
            onToggle={() => toggleSection("brands")}
            badge={selectedBrandSlug ? 1 : 0}
          />
          {openSections.brands && (
            <div className="mt-1.5 space-y-2 pb-2">
              <div className="relative px-1">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={brandSearch}
                  onChange={(e) => setBrandSearch(e.target.value)}
                  placeholder={t("listing.filter_brand_search")}
                  className="h-8 w-full rounded-md border bg-card pl-8 pr-3 text-sm placeholder-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>
              <div className="max-h-40 space-y-0.5 overflow-y-auto">
                {filteredBrands.map((b) => (
                  <label
                    key={b.id}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted"
                  >
                    <input
                      type="radio"
                      name="brand"
                      checked={selectedBrandSlug === b.slug}
                      onChange={() =>
                        setSelectedBrandSlug(selectedBrandSlug === b.slug ? "" : b.slug)
                      }
                      className="h-3.5 w-3.5 accent-primary"
                    />
                    <span className={selectedBrandSlug === b.slug ? "font-medium text-primary" : ""}>
                      {b.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- Etiketler --- */}
      {tags.length > 0 && (
        <div>
          <SectionHeader
            label={t("listing.filter_tags")}
            open={openSections.tags}
            onToggle={() => toggleSection("tags")}
            badge={selectedTagSlugs.length}
          />
          {openSections.tags && (
            <div className="mt-1.5 flex flex-wrap gap-1.5 pb-2 px-1">
              {tags.map((tag) => {
                const active = selectedTagSlugs.includes(tag.slug);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTagSlug(tag.slug)}
                    style={
                      active && tag.color
                        ? { backgroundColor: tag.color, borderColor: tag.color, color: "#fff" }
                        : {}
                    }
                    className={`rounded-full border px-2.5 py-0.5 text-xs transition-colors ${
                      active
                        ? "bg-primary border-primary text-primary-foreground"
                        : "bg-card text-foreground hover:bg-muted"
                    }`}
                  >
                    {tag.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* --- Uygula / Temizle --- */}
      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={clearFilters}
          className="flex flex-1 items-center justify-center gap-1 rounded-lg border bg-card px-3 py-2 text-sm transition-colors hover:border-destructive hover:text-destructive"
        >
          <X className="h-3.5 w-3.5" />
          {t("listing.filter_clear")}
        </button>
        <button
          type="button"
          onClick={applyFilters}
          className="flex flex-1 items-center justify-center rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          {t("listing.filter_apply")}
          {activeCount > 0 && (
            <span className="ml-1.5 rounded-full bg-white/20 px-1.5 text-xs font-bold">
              {activeCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

// ── Public export ─────────────────────────────────────────────

/** mobileOnly=true → sadece mobile trigger + overlay göster, desktop sidebar yok */
export function ListingFilterSidebar({ mobileOnly = false }: { mobileOnly?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeFilterCount = SLUG_PARAMS.filter((k) => searchParams.has(k)).length;

  function handleApply(params: URLSearchParams) {
    router.push(`${pathname}?${params.toString()}`);
    setMobileOpen(false);
  }

  return (
    <>
      {/* Mobile trigger */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm transition-colors hover:bg-muted lg:hidden"
      >
        <SlidersHorizontal className="h-4 w-4" />
        {t("listing.filter_options")}
        {activeFilterCount > 0 && (
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-80 overflow-y-auto bg-background p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">{t("listing.filter_options")}</h2>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-md p-1 hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <FilterContent searchParams={searchParams} onApply={handleApply} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      {!mobileOnly && (
        <div className="hidden lg:block">
          <FilterContent searchParams={searchParams} onApply={handleApply} />
        </div>
      )}
    </>
  );
}
