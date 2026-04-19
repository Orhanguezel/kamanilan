"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronLeft, Check, Loader2, AlertCircle, LogIn, Tag, MapPin, FileText, ImagePlus, X, Upload } from "lucide-react";
import { toast } from "sonner";

import { ROUTES } from "@/config/routes";
import { useAuthStore } from "@/stores/auth-store";
import { useCategoriesQuery, useSubCategoriesQuery } from "@/modules/listing/listing.service";
import { useCreateListingMutation } from "@/modules/listing/my-listing.service";
import { useUploadMultipleImagesMutation } from "@/modules/storage/upload.service";
import type { ListingCategory, ListingSubCategory } from "@/modules/listing/listing.types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LocationAutocomplete, type ResolvedLocation } from "@/components/location/location-autocomplete";

const MAX_IMAGES = 8;
const MAX_FILE_SIZE_MB = 15;

interface LocalImage {
  id: string;
  file: File;
  preview: string;
}

/**
 * Safe filename for backend storage:
 *  - strip diacritics (Türkçe karakter, vs.)
 *  - keep only [a-zA-Z0-9.-_]
 *  - collapse spaces/dashes
 *  - prepend timestamp so aynı ad (ör. "screenshot.png") ile 409 çakışması yok
 */
function sanitizeFilename(original: string): string {
  const dotIdx = original.lastIndexOf(".");
  const name = dotIdx > 0 ? original.slice(0, dotIdx) : original;
  const extRaw = dotIdx > 0 ? original.slice(dotIdx + 1).toLowerCase() : "jpg";
  const ext = extRaw.replace(/[^a-z0-9]/g, "").slice(0, 5) || "jpg";

  const slug = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .toLowerCase() || "image";

  const stamp = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  return `${stamp}-${slug}.${ext}`;
}

function renameFile(file: File, newName: string): File {
  return new File([file], newName, { type: file.type, lastModified: file.lastModified });
}

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
        group relative flex flex-col overflow-hidden rounded-[24px] border-2 transition-all duration-500
        ${
          selected
            ? "border-saffron bg-saffron/5 ring-8 ring-saffron/5 shadow-2xl scale-[1.02]"
            : "border-line bg-paper hover:border-saffron/40 hover:shadow-xl hover:scale-[1.01]"
        }
      `}
    >
      {/* İmaj Alanı */}
      <div className="relative aspect-[3/2] w-full overflow-hidden">
        {cat.image_url ? (
          <img
            src={cat.image_url}
            alt={cat.name}
            className={`h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 ${
              selected ? "scale-105 blur-[1px]" : ""
            }`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-cream/50 text-5xl">
            {cat.icon ?? "📦"}
          </div>
        )}
        
        {/* Seçili İndikatörü Overlay */}
        {selected && (
          <div className="absolute inset-0 bg-ink/30 backdrop-blur-[1px] flex items-center justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-saffron text-ink shadow-2xl animate-in zoom-in duration-300">
              <Check className="h-8 w-8 stroke-[3]" />
            </div>
          </div>
        )}

        {/* Gradient Overlay for Text Legibility (Optional, but looks premium) */}
        {!selected && (
          <div className="absolute inset-0 bg-gradient-to-t from-ink/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        )}
      </div>

      {/* Metin Alanı */}
      <div className="flex flex-col items-center justify-center p-5 text-center bg-white/50 backdrop-blur-sm">
        <span className={`font-fraunces text-lg md:text-xl tracking-tight transition-all duration-300 ${
          selected ? "text-ink font-bold" : "text-ink/80 group-hover:text-ink"
        }`}>
          {cat.name}
        </span>
      </div>
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
        relative flex items-center gap-2 rounded-full border-2 px-6 py-2 text-[13px] font-bold uppercase tracking-wider
        transition-all duration-300
        ${
          selected
            ? "border-saffron bg-ink text-saffron shadow-lg scale-105"
            : "border-line bg-white text-ink/60 hover:border-saffron/40 hover:text-ink hover:bg-ivory"
        }
      `}
    >
      {selected && <Check className="h-3.5 w-3.5" />}
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
  const subCategoriesRef = React.useRef<HTMLDivElement>(null);

  const [form, setForm] = React.useState({
    title: "",
    status: "satilik" as Status,
    price: "",
    city: "",
    district: "",
    address: "",
    lat: null as number | null,
    lng: null as number | null,
    description: "",
  });

  const [images, setImages] = React.useState<LocalImage[]>([]);
  const [submitState, setSubmitState] = React.useState<"idle" | "uploading" | "success" | "error">("idle");
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const { data: categories = [], isLoading: loadingCats } = useCategoriesQuery();
  const { data: subCategories = [], isLoading: loadingSubs } = useSubCategoriesQuery(
    selectedCategory?.id,
  );

  const createMutation = useCreateListingMutation();
  const uploadMutation = useUploadMultipleImagesMutation("listings");

  React.useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.preview));
    };
  }, [images]);

  const handleAddImages = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) {
      toast.error(`En fazla ${MAX_IMAGES} görsel ekleyebilirsin.`);
      return;
    }

    const accepted: LocalImage[] = [];
    const rejected: string[] = [];
    Array.from(files).slice(0, remaining).forEach((raw) => {
      if (!raw.type.startsWith("image/")) {
        rejected.push(`${raw.name}: geçerli bir görsel değil`);
        return;
      }
      if (raw.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        rejected.push(`${raw.name}: ${MAX_FILE_SIZE_MB}MB üzerinde`);
        return;
      }
      // Filename'i backend-safe hale getir + timestamp ekle (409 çakışmasını önler)
      const safeName = sanitizeFilename(raw.name);
      const file = renameFile(raw, safeName);
      accepted.push({
        id: `${safeName}-${Math.random().toString(36).slice(2, 8)}`,
        file,
        preview: URL.createObjectURL(file),
      });
    });

    if (rejected.length) toast.error(rejected.join("\n"));
    if (accepted.length) setImages((prev) => [...prev, ...accepted]);
  };

  const handleRemoveImage = (id: string) => {
    setImages((prev) => {
      const gone = prev.find((p) => p.id === id);
      if (gone) URL.revokeObjectURL(gone.preview);
      return prev.filter((p) => p.id !== id);
    });
  };

  const handleSelectCategory = (cat: ListingCategory) => {
    if (selectedCategory?.id === cat.id) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(cat);
      setSelectedSubCategory(null);
      // Kategori seçildikten sonra alt kategori bölümüne kaydır
      setTimeout(() => {
        subCategoriesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
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

  const handleLocationPick = React.useCallback((loc: ResolvedLocation) => {
    setForm((prev) => ({
      ...prev,
      city: loc.city || prev.city,
      district: loc.district || prev.district,
      address: loc.address || prev.address,
      lat: loc.lat,
      lng: loc.lng,
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    setLimitError(false);
    setSubmitError(null);

    try {
      let uploadedUrls: string[] = [];
      if (images.length > 0) {
        setSubmitState("uploading");
        try {
          const results = await uploadMutation.mutateAsync(images.map((i) => i.file));
          uploadedUrls = results.map((r) => r.url);
        } catch (uploadErr) {
          console.error("image upload failed", uploadErr);
          const errObj = uploadErr as {
            response?: { status?: number; data?: { message?: string; error?: { code?: string; message?: string } } };
            message?: string;
          };
          const status = errObj?.response?.status;
          const backendMsg =
            errObj?.response?.data?.error?.message ??
            errObj?.response?.data?.message ??
            errObj?.message;

          const reason =
            status === 501
              ? "Sunucuda depolama servisi yapılandırılmamış. Destek ekibine bildirin."
              : status === 413
              ? `Dosya çok büyük. Max ${MAX_FILE_SIZE_MB}MB.`
              : status === 409
              ? "Aynı isimli dosya daha önce yüklenmiş. Sayfayı yenileyip tekrar deneyin."
              : status === 401
              ? "Oturumunuz sona erdi. Tekrar giriş yapın."
              : backendMsg || "Görseller yüklenemedi. Lütfen tekrar deneyin.";

          setSubmitState("error");
          setSubmitError(reason);
          toast.error(reason);
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }
      }

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
        coordinates:
          form.lat !== null && form.lng !== null ? { lat: form.lat, lng: form.lng } : null,
        description:     form.description.trim() || null,
        cover_image_url: uploadedUrls[0] ?? null,
        images:          uploadedUrls,
      });

      setSubmitState("success");
      toast.success(tr.success_create);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 403) {
        setLimitError(true);
        setSubmitState("idle");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (status === 401) {
        router.push(ROUTES.LOGIN);
      } else {
        const msg =
          (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ??
          (err as { message?: string })?.message ??
          tr.error;
        setSubmitState("error");
        setSubmitError(msg);
        toast.error(msg);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  // ── Not authenticated ──────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center gap-8 rounded-[32px] border-2 border-line bg-paper p-16 text-center shadow-2xl">
        <div className="h-20 w-20 flex items-center justify-center rounded-full bg-ivory text-text-3">
          <LogIn className="h-10 w-10" />
        </div>
        <div className="space-y-4">
          <h2 className="font-fraunces text-3xl text-ink">{tr.login_required}</h2>
          <p className="text-text-2 max-w-sm mx-auto">İlan vermek ve topluluğumuza katılmak için lütfen giriş yapın.</p>
        </div>
        <Button asChild className="btn-editorial h-14 px-10">
          <Link href={ROUTES.LOGIN}>{tr.login_now}</Link>
        </Button>
      </div>
    );
  }

  // ── Limit exceeded banner ──────────────────────────────────
  const limitBanner = limitError && (
    <div className="mb-10 flex items-start gap-4 rounded-3xl border-2 border-destructive/20 bg-destructive/5 p-6 text-destructive shadow-lg animate-in fade-in slide-in-from-top-4">
      <AlertCircle className="mt-0.5 h-6 w-6 shrink-0" />
      <div className="space-y-1">
        <p className="font-bold uppercase tracking-widest text-[10px]">İşlem Kısıtlandı</p>
        <p className="text-sm font-medium">{tr.limit_exceeded}</p>
      </div>
    </div>
  );

  // ── Success screen ──────────────────────────────────────────
  if (submitState === "success") {
    return (
      <div className="flex flex-col items-center justify-center gap-8 rounded-[32px] border-2 border-saffron/30 bg-paper p-12 md:p-16 text-center shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-saffron text-ink shadow-xl">
          <Check className="h-12 w-12" strokeWidth={3} />
        </div>

        <div className="space-y-4 max-w-xl">
          <div className="eyebrow mx-auto uppercase text-saffron-2">Başarılı</div>
          <h2 className="font-fraunces text-4xl md:text-5xl text-ink tracking-tight">
            İlanınız <em className="italic font-normal text-saffron-2">alındı!</em>
          </h2>
          <p className="text-text-2 text-base md:text-lg leading-relaxed">
            İlanınız başarıyla oluşturuldu. Ekip tarafından incelendikten sonra yayına alınacak.
            İnceleme genellikle kısa sürmektedir.
          </p>
          <p className="text-[12px] font-mono uppercase tracking-[0.2em] text-walnut opacity-60">
            Admin onayından sonra ilanınız yayınlanacak
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Button
            type="button"
            onClick={() => router.push(ROUTES.MY_LISTINGS)}
            className="btn-editorial h-14 px-10"
          >
            <span>İlanlarıma Git <ChevronRight className="h-4 w-4" /></span>
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setSubmitState("idle");
              setSubmitError(null);
              setForm({
                title: "", status: "satilik", price: "",
                city: "", district: "", address: "",
                lat: null, lng: null, description: "",
              });
              setImages([]);
              setSelectedCategory(null);
              setSelectedSubCategory(null);
              setStep(1);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="h-14 px-10"
          >
            Yeni İlan Ver
          </Button>
        </div>
      </div>
    );
  }

  // ── Error banner (inline, above form) ────────────────────────
  const errorBanner = submitState === "error" && submitError && (
    <div className="mb-10 flex items-start gap-4 rounded-3xl border-2 border-destructive/30 bg-destructive/5 p-6 text-destructive shadow-lg animate-in fade-in slide-in-from-top-4">
      <AlertCircle className="mt-0.5 h-6 w-6 shrink-0" />
      <div className="space-y-1 flex-1">
        <p className="font-bold uppercase tracking-widest text-[10px]">Başarısız</p>
        <p className="text-sm font-medium">{submitError}</p>
        <p className="text-[11px] opacity-70">
          Bağlantınızı kontrol edip tekrar deneyin. Sorun devam ederse destek ekibiyle iletişime geçin.
        </p>
      </div>
      <button
        type="button"
        onClick={() => { setSubmitState("idle"); setSubmitError(null); }}
        className="shrink-0 text-destructive/60 hover:text-destructive transition-colors"
        aria-label="Kapat"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );

  // ── Step 1: Kategori seçimi ───────────────────────────────
  if (step === 1) {
    return (
      <div className="space-y-12 mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {limitBanner}

        {/* Header */}
        <div className="text-center space-y-4">
          <div className="eyebrow mx-auto uppercase">Adım 01</div>
          <h2 className="font-fraunces text-4xl md:text-5xl text-ink tracking-tight italic">{tr.step1_title}</h2>
          <p className="text-text-2 text-lg max-w-lg mx-auto">{tr.step1_subtitle}</p>
        </div>

        {/* Categories grid */}
        {loadingCats ? (
          <div className="flex flex-col items-center justify-center py-24 text-text-3 gap-4">
            <Loader2 className="h-10 w-10 animate-spin opacity-20" />
            <span className="font-mono text-[10px] uppercase tracking-widest">{tr.loading_categories}</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
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
          <div
            ref={subCategoriesRef}
            className="space-y-8 rounded-[40px] border-2 border-line bg-ivory/50 p-10 md:p-14 animate-in zoom-in-95 duration-500 shadow-inner scroll-mt-24"
          >
            <div className="flex flex-col gap-3 text-center mb-8">
              <div className="h-px w-20 bg-saffron/40 mx-auto" />
              <h4 className="font-fraunces text-2xl text-ink">{selectedCategory.name} <em className="italic opacity-60">Alt Kategorileri</em></h4>
              {loadingSubs && <Loader2 className="h-5 w-5 animate-spin mx-auto text-saffron" />}
            </div>
            
            {!loadingSubs && subCategories.length === 0 && (
              <p className="text-center text-text-3 italic font-fraunces">
                {tr.subcategory_placeholder}
              </p>
            )}
            
            <div className="flex flex-wrap justify-center gap-4">
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
        <div className="flex justify-center pt-8">
          <Button
            onClick={handleNext}
            disabled={!selectedCategory}
            className={`btn-editorial h-16 px-16 text-lg transition-all duration-500 ${!selectedCategory ? 'opacity-20 grayscale cursor-not-allowed' : 'shadow-3xl hover:scale-105 active:scale-95'}`}
          >
            <span>
              {tr.next}
              <ChevronRight className="ml-2 h-5 w-5" />
            </span>
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
    <form onSubmit={handleSubmit} className="space-y-12 mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {limitBanner}
      {errorBanner}

      {/* Breadcrumb / Nav */}
      <div className="flex flex-col items-center gap-6">
        <div className="eyebrow uppercase">Adım 02</div>
        <div className="flex items-center gap-4 px-8 py-3 rounded-full bg-paper border-2 border-line shadow-sm">
           <span className="font-fraunces text-ink font-medium">{selectedCategory?.name}</span>
           {selectedSubCategory && (
             <>
               <ChevronRight className="h-4 w-4 text-saffron" />
               <span className="font-fraunces text-ink font-medium">{selectedSubCategory.name}</span>
             </>
           )}
           <button
             type="button"
             onClick={handleBack}
             className="ml-4 pl-4 border-l border-line font-mono text-[9px] uppercase tracking-widest text-text-3 hover:text-ink transition-colors"
           >
             Değiştir
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-12 items-start">
        <div className="space-y-8">
          {/* Main Info */}
          <section className="space-y-8 rounded-[32px] border-2 border-line bg-white p-8 md:p-12 shadow-xl">
            <h3 className="font-fraunces text-3xl text-ink tracking-tight mb-8">İlani <em className="italic opacity-60">Detaylandırın</em></h3>

            <div className="space-y-2">
              <Label className="font-mono text-[10px] uppercase tracking-[0.2em] text-walnut ml-1">{tr.title_label}</Label>
              <Input
                placeholder={tr.title_placeholder}
                value={form.title}
                onChange={(e) => handleChange("title", e.target.value)}
                required
                className="h-14 bg-ivory/30 border-2 border-line rounded-2xl focus:border-saffron focus:ring-4 focus:ring-saffron/5 px-6 font-medium text-lg placeholder:text-text-3"
                disabled={createMutation.isPending}
              />
            </div>

            <div className="space-y-4">
              <Label className="font-mono text-[10px] uppercase tracking-[0.2em] text-walnut ml-1">{tr.status_label}</Label>
              <div className="flex flex-wrap gap-3">
                {statusOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleChange("status", opt.value)}
                    disabled={createMutation.isPending}
                    className={`
                      rounded-full border-2 px-6 py-2.5 text-[12px] font-bold uppercase tracking-wider transition-all duration-300
                      ${
                        form.status === opt.value
                          ? "border-saffron bg-ink text-saffron shadow-lg scale-105"
                          : "border-line bg-paper text-ink/60 hover:text-ink"
                      }
                    `}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {form.status !== "ucretsiz" && form.status !== "ihtiyac" && (
              <div className="space-y-2">
                <Label className="font-mono text-[10px] uppercase tracking-[0.2em] text-walnut ml-1">{tr.price_label}</Label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder={tr.price_placeholder}
                    value={form.price}
                    onChange={(e) => handleChange("price", e.target.value)}
                    className="h-14 bg-ivory/30 border-2 border-line rounded-2xl focus:border-saffron focus:ring-4 focus:ring-saffron/5 pl-12 pr-6 font-medium text-lg"
                    disabled={createMutation.isPending}
                  />
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 font-fraunces text-xl text-saffron-2">₺</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="font-mono text-[10px] uppercase tracking-[0.2em] text-walnut ml-1">{tr.description_label}</Label>
              <Textarea
                placeholder={tr.description_placeholder}
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={6}
                className="bg-ivory/30 border-2 border-line rounded-3xl focus:border-saffron focus:ring-4 focus:ring-saffron/5 p-6 font-medium text-lg placeholder:text-text-3 resize-none"
                disabled={createMutation.isPending}
              />
            </div>
          </section>
        </div>

        <div className="space-y-8">
          {/* Location Info */}
          <section className="space-y-8 rounded-[32px] border-2 border-line bg-paper p-8 md:p-12 shadow-xl">
             <h3 className="font-fraunces text-2xl text-ink tracking-tight mb-8">Konum <em className="italic opacity-60">Bilgileri</em></h3>

             <div className="space-y-6">
                <div className="space-y-2">
                   <Label className="font-mono text-[10px] uppercase tracking-[0.2em] text-walnut ml-1">Hızlı Konum Ara</Label>
                   <LocationAutocomplete
                     onChange={handleLocationPick}
                     disabled={createMutation.isPending}
                     placeholder="Örn. Kaman, Kırşehir"
                   />
                   <p className="text-[11px] font-mono text-walnut opacity-60 ml-1">
                     Arama sonucunu seçince il, ilçe ve adres otomatik dolar. İstersen aşağıdan düzenleyebilirsin.
                   </p>
                   {form.lat !== null && form.lng !== null && (
                     <p className="text-[10px] font-mono text-saffron-2 ml-1">
                       Koordinat kaydedildi: {form.lat.toFixed(5)}, {form.lng.toFixed(5)}
                     </p>
                   )}
                </div>

                <div className="space-y-2">
                   <Label className="font-mono text-[10px] uppercase tracking-[0.2em] text-walnut ml-1">{tr.city_label}</Label>
                   <Input
                     placeholder={tr.city_placeholder}
                     value={form.city}
                     onChange={(e) => handleChange("city", e.target.value)}
                     required
                     className="bg-white border-2 border-line rounded-2xl h-12 px-5"
                     disabled={createMutation.isPending}
                   />
                </div>
                <div className="space-y-2">
                   <Label className="font-mono text-[10px] uppercase tracking-[0.2em] text-walnut ml-1">{tr.district_label}</Label>
                   <Input
                     placeholder={tr.district_placeholder}
                     value={form.district}
                     onChange={(e) => handleChange("district", e.target.value)}
                     required
                     className="bg-white border-2 border-line rounded-2xl h-12 px-5"
                     disabled={createMutation.isPending}
                   />
                </div>
                <div className="space-y-2">
                   <Label className="font-mono text-[10px] uppercase tracking-[0.2em] text-walnut ml-1">{tr.address_label}</Label>
                   <Textarea
                     placeholder={tr.address_placeholder}
                     value={form.address}
                     onChange={(e) => handleChange("address", e.target.value)}
                     required
                     className="bg-white border-2 border-line rounded-2xl min-h-[100px] p-5"
                     disabled={createMutation.isPending}
                   />
                </div>
             </div>
          </section>

          {/* Images */}
          <section className="space-y-6 rounded-[32px] border-2 border-line bg-paper p-8 md:p-12 shadow-xl">
             <div className="flex items-center justify-between mb-2">
                <h3 className="font-fraunces text-2xl text-ink tracking-tight">
                  Görseller <em className="italic opacity-60">({images.length}/{MAX_IMAGES})</em>
                </h3>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-walnut opacity-60">
                  max {MAX_FILE_SIZE_MB}MB / dosya
                </span>
             </div>

             {images.length > 0 && (
               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                 {images.map((img, idx) => (
                   <div
                     key={img.id}
                     className="group relative aspect-square overflow-hidden rounded-2xl border-2 border-line bg-ivory shadow-sm"
                   >
                     {/* eslint-disable-next-line @next/next/no-img-element */}
                     <img
                       src={img.preview}
                       alt={`Görsel ${idx + 1}`}
                       className="absolute inset-0 h-full w-full object-cover transition-transform group-hover:scale-105"
                     />
                     {idx === 0 && (
                       <span className="absolute left-2 top-2 rounded-full bg-saffron px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.15em] text-ink shadow-md">
                         Kapak
                       </span>
                     )}
                     <button
                       type="button"
                       onClick={() => handleRemoveImage(img.id)}
                       disabled={createMutation.isPending || uploadMutation.isPending}
                       aria-label="Görseli kaldır"
                       className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-ink/80 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive focus-visible:opacity-100"
                     >
                       <X className="h-4 w-4" />
                     </button>
                   </div>
                 ))}
               </div>
             )}

             {images.length < MAX_IMAGES && (
               <label
                 htmlFor="ilan-ver-upload"
                 className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-line bg-ivory/50 p-10 cursor-pointer hover:border-saffron hover:bg-ivory transition-colors ${
                   createMutation.isPending || uploadMutation.isPending ? "pointer-events-none opacity-60" : ""
                 }`}
               >
                 <div className="flex h-14 w-14 items-center justify-center rounded-full bg-saffron/10 text-saffron-2">
                   <ImagePlus className="h-6 w-6" />
                 </div>
                 <div className="text-center space-y-1">
                   <p className="font-fraunces text-lg text-ink">Görsel ekle</p>
                   <p className="text-[12px] text-text-2">
                     Birden çok seçebilirsin · İlki kapak görseli olur
                   </p>
                 </div>
                 <input
                   id="ilan-ver-upload"
                   type="file"
                   accept="image/*"
                   multiple
                   className="sr-only"
                   disabled={createMutation.isPending || uploadMutation.isPending}
                   onChange={(e) => {
                     handleAddImages(e.target.files);
                     e.target.value = "";
                   }}
                 />
               </label>
             )}
          </section>

          {/* Submit Actions */}
          <div className="flex flex-col gap-4">
             <Button
               type="submit"
               disabled={
                 createMutation.isPending ||
                 uploadMutation.isPending ||
                 !form.title.trim() ||
                 !form.city.trim() ||
                 !form.district.trim() ||
                 !form.address.trim()
               }
               className="btn-editorial h-20 w-full text-xl shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all"
             >
               {uploadMutation.isPending ? (
                 <>
                   <Upload className="mr-3 h-6 w-6 animate-pulse" />
                   Görseller yükleniyor...
                 </>
               ) : createMutation.isPending ? (
                 <>
                   <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                   {tr.submitting}
                 </>
               ) : (
                 <>
                   {tr.submit_create}
                   <ChevronRight className="ml-2 h-6 w-6" />
                 </>
               )}
             </Button>
             
             <button
               type="button"
               onClick={handleBack}
               disabled={createMutation.isPending}
               className="h-14 font-mono text-[11px] uppercase tracking-[0.3em] text-text-3 hover:text-ink transition-colors flex items-center justify-center gap-2"
             >
               <ChevronLeft className="h-4 w-4" />
               {tr.back}
             </button>
          </div>
        </div>
      </div>
    </form>
  );
}
