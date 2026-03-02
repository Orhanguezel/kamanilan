import type { Metadata } from "next";
import { t } from "@/lib/t";
import { notFound } from "next/navigation";
import { ListingDetail } from "@/components/listing/listing-detail";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: t("seo.listing_detail_title", { title: slug }),
    description: t("seo.listings_description"),
  };
}

export default async function ListingDetailPage({ params }: Props) {
  const { slug } = await params;

  if (!slug) notFound();

  return (
    <div className="container mx-auto px-4 py-8">
      <ListingDetail slug={slug} />
    </div>
  );
}
