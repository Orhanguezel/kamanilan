// =============================================================
// FILE: src/lib/json-ld.ts
// Schema.org JSON-LD builders — Product (ilan), NewsArticle (haber),
// Organization (site), BreadcrumbList, WebSite.
// Google Rich Results + AI Overview citability icin.
// =============================================================

export type JsonLdObject = Record<string, unknown>;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.kamanilan.com";

// -------------------------------------------------------------
// Organization (site-wide, Logo + sameAs + Address + AreaServed)
// AI entity recognition + Knowledge Graph icin maximum sinyal.
// -------------------------------------------------------------
export function buildOrganizationJsonLd(input: {
  name: string;
  url?: string;
  legalName?: string;
  description?: string;
  logoUrl?: string;
  sameAs?: string[];
  contactPhone?: string;
  contactEmail?: string;
  address?: {
    streetAddress?: string;
    addressLocality?: string;   // ilce (ornek: "Kaman")
    addressRegion?: string;     // il (ornek: "Kırşehir")
    addressCountry?: string;    // "TR"
    postalCode?: string;
  };
  foundingDate?: string;        // YYYY-MM-DD
  areaServed?: string[];        // ["Kaman", "Kırşehir"]
}): JsonLdObject {
  const url = input.url || SITE_URL;
  const doc: JsonLdObject = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${url}#organization`,
    name: input.name,
    url,
  };
  if (input.legalName) doc.legalName = input.legalName;
  if (input.description) doc.description = input.description;
  if (input.logoUrl) {
    doc.logo = {
      "@type": "ImageObject",
      url: input.logoUrl,
    };
    doc.image = input.logoUrl;
  }
  if (input.sameAs && input.sameAs.length > 0) doc.sameAs = input.sameAs;
  if (input.foundingDate) doc.foundingDate = input.foundingDate;
  if (input.areaServed && input.areaServed.length > 0) {
    doc.areaServed = input.areaServed.map((name) => ({
      "@type": "Place",
      name,
    }));
  }
  if (input.address && Object.keys(input.address).length > 0) {
    doc.address = {
      "@type": "PostalAddress",
      ...input.address,
    };
  }
  if (input.contactPhone || input.contactEmail) {
    doc.contactPoint = {
      "@type": "ContactPoint",
      contactType: "customer service",
      ...(input.contactPhone ? { telephone: input.contactPhone } : {}),
      ...(input.contactEmail ? { email: input.contactEmail } : {}),
      areaServed: "TR",
      availableLanguage: ["Turkish"],
    };
  }
  return doc;
}

// -------------------------------------------------------------
// FAQPage — SSS sayfasi / sayfa icinde SSS bolumu
// AI Overviews + Featured Snippets icin kritik (high citability)
// -------------------------------------------------------------
export function buildFaqPageJsonLd(input: {
  faqs: Array<{ question: string; answer: string }>;
  url?: string;
}): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    ...(input.url ? { url: input.url.startsWith("http") ? input.url : `${SITE_URL}${input.url}` } : {}),
    mainEntity: input.faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };
}

// -------------------------------------------------------------
// WebSite (sitelink searchbox)
// -------------------------------------------------------------
export function buildWebSiteJsonLd(input: { name: string; url?: string }): JsonLdObject {
  const url = input.url || SITE_URL;
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: input.name,
    url,
    potentialAction: {
      "@type": "SearchAction",
      target: `${url}/ara?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

// -------------------------------------------------------------
// Product + Offer (ilan detay)
// Emlak/arac/esya ilanlari icin — Google Rich Results desteklenir.
// -------------------------------------------------------------
export function buildPropertyJsonLd(input: {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  price?: number | string | null;
  currency?: string | null;
  images?: string[];
  city?: string | null;
  district?: string | null;
  neighborhood?: string | null;
  address?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  categoryName?: string | null;
}): JsonLdObject {
  const url = `${SITE_URL}/ilan/${input.slug}`;
  const priceNum = input.price != null ? Number(input.price) : null;
  const images = (input.images || []).filter((u) => typeof u === "string" && u.length > 0);

  const doc: JsonLdObject = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": url,
    name: input.title,
    url,
    ...(input.description ? { description: input.description } : {}),
    ...(images.length > 0 ? { image: images } : {}),
    ...(input.categoryName ? { category: input.categoryName } : {}),
  };

  if (priceNum != null && Number.isFinite(priceNum) && priceNum > 0) {
    doc.offers = {
      "@type": "Offer",
      url,
      priceCurrency: input.currency || "TRY",
      price: priceNum.toFixed(2),
      availability: "https://schema.org/InStock",
      areaServed: "TR",
      ...(input.updatedAt ? { priceValidUntil: addYearsIso(input.updatedAt, 1) } : {}),
    };
  }

  // Adres (Place)
  const addressParts = [input.address, input.neighborhood, input.district, input.city]
    .filter((s): s is string => typeof s === "string" && s.length > 0);
  if (addressParts.length > 0) {
    doc.offers = doc.offers || {
      "@type": "Offer",
      url,
      priceCurrency: input.currency || "TRY",
      availability: "https://schema.org/InStock",
    };
    (doc.offers as JsonLdObject).availableAtOrFrom = {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressCountry: "TR",
        ...(input.city ? { addressRegion: input.city } : {}),
        ...(input.district ? { addressLocality: input.district } : {}),
        ...(input.address ? { streetAddress: input.address } : {}),
      },
    };
  }

  return doc;
}

// -------------------------------------------------------------
// NewsArticle (haber detay)
// -------------------------------------------------------------
export function buildNewsArticleJsonLd(input: {
  slug: string;
  title: string;
  description?: string | null;
  body?: string | null;
  coverImageUrl?: string | null;
  author?: string | null;
  publishedAt?: string | null;
  updatedAt?: string | null;
  category?: string | null;
  siteName: string;
  siteLogoUrl?: string;
}): JsonLdObject {
  const url = `${SITE_URL}/haberler/${input.slug}`;
  const doc: JsonLdObject = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: input.title,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    ...(input.description ? { description: input.description } : {}),
    ...(input.coverImageUrl ? { image: [input.coverImageUrl] } : {}),
    ...(input.publishedAt ? { datePublished: toIsoString(input.publishedAt) } : {}),
    ...(input.updatedAt ? { dateModified: toIsoString(input.updatedAt) } : {}),
    ...(input.category ? { articleSection: input.category } : {}),
    author: {
      "@type": input.author ? "Person" : "Organization",
      name: input.author || input.siteName,
    },
    publisher: {
      "@type": "Organization",
      name: input.siteName,
      ...(input.siteLogoUrl
        ? { logo: { "@type": "ImageObject", url: input.siteLogoUrl } }
        : {}),
    },
  };
  return doc;
}

// -------------------------------------------------------------
// BreadcrumbList
// items: [{ name, url }]
// -------------------------------------------------------------
export function buildBreadcrumbJsonLd(items: Array<{ name: string; url: string }>): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

// -------------------------------------------------------------
// CollectionPage — kategori + sehir landing sayfalari
// -------------------------------------------------------------
export function buildCollectionPageJsonLd(input: {
  name: string;
  description?: string | null;
  url: string;
  itemCount?: number;
}): JsonLdObject {
  const absoluteUrl = input.url.startsWith("http") ? input.url : `${SITE_URL}${input.url}`;
  const doc: JsonLdObject = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: input.name,
    url: absoluteUrl,
    ...(input.description ? { description: input.description } : {}),
    ...(typeof input.itemCount === "number" ? { numberOfItems: input.itemCount } : {}),
    isPartOf: { "@type": "WebSite", "@id": SITE_URL, url: SITE_URL },
  };
  return doc;
}

// -------------------------------------------------------------
// ItemList — kategori/sehir listesinde ilanlar
// items: { name, url }[] — sirali liste
// -------------------------------------------------------------
export function buildItemListJsonLd(items: Array<{ name: string; url: string }>): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    numberOfItems: items.length,
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      url: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

// -------------------------------------------------------------
// Helpers
// -------------------------------------------------------------
function toIsoString(raw: string | Date): string {
  try {
    return new Date(raw).toISOString();
  } catch {
    return String(raw);
  }
}

function addYearsIso(raw: string | Date, years: number): string {
  try {
    const d = new Date(raw);
    d.setFullYear(d.getFullYear() + years);
    return d.toISOString();
  } catch {
    return toIsoString(raw);
  }
}
