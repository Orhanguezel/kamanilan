import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { t } from "@/lib/t";
import { ROUTES } from "@/config/routes";
import { PostListingClient } from "./post-listing-client";

export const metadata: Metadata = {
  title: t("seo.post_listing_title"),
};

export default function PostListingPage() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href={ROUTES.HOME} className="hover:text-foreground">
          {t("common.home")}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium">{t("listing_form.create_title")}</span>
      </nav>

      <h1 className="mb-6 text-2xl font-bold">{t("listing_form.create_title")}</h1>

      <Suspense fallback={null}>
        <PostListingClient
          translations={{
            home:                   t("common.home"),
            create_title:           t("listing_form.create_title"),
            step1_title:            t("listing_form.step1_title"),
            step1_subtitle:         t("listing_form.step1_subtitle"),
            step2_title:            t("listing_form.step2_title"),
            back:                   t("listing_form.back"),
            next:                   t("listing_form.next"),
            category_label:         t("listing_form.category_label"),
            subcategory_label:      t("listing_form.subcategory_label"),
            subcategory_placeholder:t("listing_form.subcategory_placeholder"),
            title_label:            t("listing_form.title_label"),
            title_placeholder:      t("listing_form.title_placeholder"),
            status_label:           t("listing_form.status_label"),
            status_satilik:         t("listing_form.status_satilik"),
            status_kiralik:         t("listing_form.status_kiralik"),
            status_takas:           t("listing_form.status_takas"),
            status_ihtiyac:         t("listing_form.status_ihtiyac"),
            status_ucretsiz:        t("listing_form.status_ucretsiz"),
            price_label:            t("listing_form.price_label"),
            price_placeholder:      t("listing_form.price_placeholder"),
            city_label:             t("listing_form.city_label"),
            city_placeholder:       t("listing_form.city_placeholder"),
            district_label:         t("listing_form.district_label"),
            district_placeholder:   t("listing_form.district_placeholder"),
            address_label:          t("listing_form.address_label"),
            address_placeholder:    t("listing_form.address_placeholder"),
            description_label:      t("listing_form.description_label"),
            description_placeholder:t("listing_form.description_placeholder"),
            submit_create:          t("listing_form.submit_create"),
            submitting:             t("listing_form.submitting"),
            success_create:         t("listing_form.success_create"),
            error:                  t("listing_form.error"),
            limit_exceeded:         t("listing_form.limit_exceeded"),
            login_required:         t("listing_form.login_required"),
            login_now:              t("listing_form.login_now"),
            loading_categories:     t("listing_form.loading_categories"),
          }}
        />
      </Suspense>
    </div>
  );
}
