"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronLeft, Check, Loader2, AlertCircle, LogIn, Tag, MapPin, FileText } from "lucide-react";
import { toast } from "sonner";

import { ROUTES } from "@/config/routes";
import { useAuthStore } from "@/stores/auth-store";
import { useCategoriesQuery, useSubCategoriesQuery } from "@/modules/listing/listing.service";
import { useCreateListingMutation } from "@/modules/listing/my-listing.service";
import type { ListingCategory, ListingSubCategory } from "@/modules/listing/listing.types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface Translations {
  home: string;
  create_title: string;
  step1_title: string;
  step1_subtitle: string;
  step2_title: string;
  back: string;
  next: string;
  category_label: string;
  subcategory_label: string;
  subcategory_placeholder: string;
  title_label: string;
  title_placeholder: string;
  status_label: string;
  status_satilik: string;
  status_kiralik: string;
  status_takas: string;
  status_ihtiyac: string;
  status_ucretsiz: string;
  price_label: string;
  price_placeholder: string;
  city_label: string;
  city_placeholder: string;
  district_label: string;
  district_placeholder: string;
  address_label: string;
  address_placeholder: string;
  description_label: string;
  description_placeholder: string;
  submit_create: string;
  submitting: string;
  success_create: string;
  error: string;
  limit_exceeded: string;
  login_required: string;
  login_now: string;
  loading_categories: string;
}

interface Props {
  translations: Translations;
}

// ─────────────────────────────────────────────────────────────
// Status options
// ─────────────────────────────────────────────────────────────

type Status = "satilik" | "kiralik" | "takas" | "ihtiyac" | "ucretsiz";

// ─────────────────────────────────────────────────────────────
// CategoryCard
// ─────────────────────────────────────────────────────────────

function CategoryCard({
  cat,
  selected,
  onClick,
}: {
  cat: ListingCategory;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center
        transition-all duration-150 hover:border-primary hover:shadow-sm
        ${selected ? "border-primary bg-primary/5 shadow-sm" : "border-border bg-card"}
      `}
    >
      {selected && (
        <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="h-3 w-3" />
        </span>
      )}
      {cat.image_url ? (
        <img
          src={cat.image_url}
          alt={cat.name}
          className="h-10 w-10 rounded-md object-cover"
        />
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted text-2xl">
          {cat.icon ?? "📦"}
        </div>
      )}
      <span className="text-sm font-medium leading-tight">{cat.name}</span>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// SubCategoryCard
// ─────────────────────────────────────────────────────────────

function SubCategoryCard({
  sub,
  selected,
  onClick,
}: {
  sub: ListingSubCategory;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        relative flex items-center gap-2 rounded-lg border-2 px-4 py-2.5 text-sm font-medium
        transition-all duration-150 hover:border-primary
        ${selected ? "border-primary bg-primary/5" : "border-border bg-card"}
      `}
    >
      {selected && <Check className="h-3.5 w-3.5 text-primary" />}
      {sub.name}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────

export function PostListingClient({ translations: tr }: Props) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const [step, setStep] = React.useState<1 | 2>(1);
  const [selectedCategory, setSelectedCategory] = React.useState<ListingCategory | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = React.useState<ListingSubCategory | null>(null);
  const [limitError, setLimitError] = React.useState(false);

  const [form, setForm] = React.useState({
    title: "",
    status: "satilik" as Status,
    price: "",
    city: "",
    district: "",
    address: "",
    description: "",
  });

  const { data: categories = [], isLoading: loadingCats } = useCategoriesQuery();
  const { data: subCategories = [], isLoading: loadingSubs } = useSubCategoriesQuery(
    selectedCategory?.id,
  );

  const createMutation = useCreateListingMutation();

  // When category changes, reset subcategory
  const handleSelectCategory = (cat: ListingCategory) => {
    if (selectedCategory?.id === cat.id) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(cat);
      setSelectedSubCategory(null);
    }
  };

  const handleNext = () => {
    if (!selectedCategory) return;
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    setStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleChange = (field: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    setLimitError(false);

    try {
      await createMutation.mutateAsync({
        title:           form.title.trim(),
        type:            "ilan",
        status:          form.status,
        category_id:     selectedCategory?.id ?? null,
        sub_category_id: selectedSubCategory?.id ?? null,
        price:           form.price ? Number(form.price) : null,
        city:            form.city.trim(),
        district:        form.district.trim(),
        address:         form.address.trim(),
        description:     form.description.trim() || null,
      });
      toast.success(tr.success_create);
      router.push(ROUTES.MY_LISTINGS);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 403) {
        setLimitError(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (status === 401) {
        router.push(ROUTES.LOGIN);
      } else {
        toast.error(tr.error);
      }
    }
  };

  // ── Not authenticated ──────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border bg-card p-10 text-center">
        <LogIn className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">{tr.login_required}</p>
        <Button asChild>
          <Link href={ROUTES.LOGIN}>{tr.login_now}</Link>
        </Button>
      </div>
    );
  }

  // ── Limit exceeded banner ──────────────────────────────────
  const limitBanner = limitError && (
    <div className="mb-6 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
      <span>{tr.limit_exceeded}</span>
    </div>
  );

  // ── Step 1: Kategori seçimi ───────────────────────────────
  if (step === 1) {
    return (
      <div className="space-y-6">
        {limitBanner}

        {/* Header */}
        <div>
          <h2 className="text-xl font-semibold">{tr.step1_title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{tr.step1_subtitle}</p>
        </div>

        {/* Categories grid */}
        {loadingCats ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            {tr.loading_categories}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {categories.map((cat) => (
              <CategoryCard
                key={cat.id}
                cat={cat}
                selected={selectedCategory?.id === cat.id}
                onClick={() => handleSelectCategory(cat)}
              />
            ))}
          </div>
        )}

        {/* Sub-categories (shown after category selected) */}
        {selectedCategory && (
          <div className="space-y-3 rounded-xl border bg-muted/30 p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Tag className="h-4 w-4 text-primary" />
              {tr.subcategory_label}
              {loadingSubs && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
            </div>
            {!loadingSubs && subCategories.length === 0 && (
              <p className="text-xs text-muted-foreground">
                {tr.subcategory_placeholder}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {subCategories.map((sub) => (
                <SubCategoryCard
                  key={sub.id}
                  sub={sub}
                  selected={selectedSubCategory?.id === sub.id}
                  onClick={() =>
                    setSelectedSubCategory((prev) =>
                      prev?.id === sub.id ? null : sub,
                    )
                  }
                />
              ))}
            </div>
          </div>
        )}

        {/* Next button */}
        <div className="flex justify-end pt-2">
          <Button
            onClick={handleNext}
            disabled={!selectedCategory}
            className="min-w-32"
          >
            {tr.next}
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // ── Step 2: Form ──────────────────────────────────────────
  const statusOptions: { value: Status; label: string }[] = [
    { value: "satilik", label: tr.status_satilik },
    { value: "kiralik", label: tr.status_kiralik },
    { value: "takas",   label: tr.status_takas },
    { value: "ihtiyac", label: tr.status_ihtiyac },
    { value: "ucretsiz",label: tr.status_ucretsiz },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {limitBanner}

      {/* Selected category breadcrumb */}
      <div className="flex flex-wrap items-center gap-1.5 rounded-lg bg-muted/40 px-4 py-2.5 text-sm">
        <span className="text-muted-foreground">{tr.category_label}:</span>
        <span className="font-medium">{selectedCategory?.name}</span>
        {selectedSubCategory && (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-medium">{selectedSubCategory.name}</span>
          </>
        )}
        <button
          type="button"
          onClick={handleBack}
          className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          {tr.back}
        </button>
      </div>

      {/* ── Temel Bilgiler ── */}
      <section className="space-y-4 rounded-xl border bg-card p-5">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <FileText className="h-4 w-4 text-primary" />
          {tr.step2_title}
        </div>

        {/* Başlık */}
        <div className="space-y-1.5">
          <Label htmlFor="title">{tr.title_label} *</Label>
          <Input
            id="title"
            placeholder={tr.title_placeholder}
            value={form.title}
            onChange={(e) => handleChange("title", e.target.value)}
            required
            maxLength={255}
            disabled={createMutation.isPending}
          />
        </div>

        {/* İlan Durumu */}
        <div className="space-y-1.5">
          <Label>{tr.status_label} *</Label>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleChange("status", opt.value)}
                disabled={createMutation.isPending}
                className={`
                  rounded-lg border px-4 py-2 text-sm font-medium transition-colors
                  ${
                    form.status === opt.value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background hover:border-primary"
                  }
                `}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Fiyat */}
        {form.status !== "ucretsiz" && form.status !== "ihtiyac" && (
          <div className="space-y-1.5">
            <Label htmlFor="price">{tr.price_label}</Label>
            <Input
              id="price"
              type="number"
              min={0}
              step={0.01}
              placeholder={tr.price_placeholder}
              value={form.price}
              onChange={(e) => handleChange("price", e.target.value)}
              disabled={createMutation.isPending}
            />
          </div>
        )}

        {/* Açıklama */}
        <div className="space-y-1.5">
          <Label htmlFor="description">{tr.description_label}</Label>
          <Textarea
            id="description"
            placeholder={tr.description_placeholder}
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            rows={4}
            disabled={createMutation.isPending}
          />
        </div>
      </section>

      {/* ── Konum ── */}
      <section className="space-y-4 rounded-xl border bg-card p-5">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <MapPin className="h-4 w-4 text-primary" />
          {tr.address_label}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="city">{tr.city_label} *</Label>
            <Input
              id="city"
              placeholder={tr.city_placeholder}
              value={form.city}
              onChange={(e) => handleChange("city", e.target.value)}
              required
              disabled={createMutation.isPending}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="district">{tr.district_label} *</Label>
            <Input
              id="district"
              placeholder={tr.district_placeholder}
              value={form.district}
              onChange={(e) => handleChange("district", e.target.value)}
              required
              disabled={createMutation.isPending}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="address">{tr.address_label} *</Label>
          <Input
            id="address"
            placeholder={tr.address_placeholder}
            value={form.address}
            onChange={(e) => handleChange("address", e.target.value)}
            required
            disabled={createMutation.isPending}
          />
        </div>
      </section>

      {/* ── Actions ── */}
      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={handleBack}
          disabled={createMutation.isPending}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          {tr.back}
        </Button>

        <Button
          type="submit"
          disabled={
            createMutation.isPending ||
            !form.title.trim() ||
            !form.city.trim() ||
            !form.district.trim() ||
            !form.address.trim()
          }
          className="min-w-36"
        >
          {createMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {tr.submitting}
            </>
          ) : (
            tr.submit_create
          )}
        </Button>
      </div>
    </form>
  );
}
