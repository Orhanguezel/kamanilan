import type { Metadata } from "next";
import { t } from "@/lib/t";
import { fetchAPI } from "@/lib/api-server";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import { CustomPageClient } from "./about-client";
import { JsonLd } from "@/components/seo/json-ld";
import { buildFaqPageJsonLd, buildBreadcrumbJsonLd } from "@/lib/json-ld";

interface CustomPageData {
  id: string;
  title: string;
  slug: string;
  content: { html?: string } | null;
  image_url?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
}

async function getPageContent(slug: string): Promise<CustomPageData | null> {
  try {
    const data = await fetchAPI<any>(`${API_ENDPOINTS.PAGES}/by-slug/${slug}`, {}, "tr");
    if (!data) return null;
    // Backend stores content as JSON string — parse it
    if (typeof data.content === "string") {
      try { data.content = JSON.parse(data.content); } catch { data.content = null; }
    }
    return data as CustomPageData;
  } catch {
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const data = await getPageContent("hakkimizda");
  return {
    title: data?.meta_title || t("seo.about_title"),
    description: data?.meta_description || t("seo.about_description"),
    alternates: { canonical: "/hakkimizda" },
  };
}

// -------------------------------------------------------------
// FAQ icerik (AI Overviews + Featured Snippets hedefi)
// -------------------------------------------------------------
const ABOUT_FAQS: Array<{ question: string; answer: string }> = [
  {
    question: "Kamanilan nedir?",
    answer: "Kamanilan, Kaman (Kırşehir) ve çevresinde faaliyet gösteren yerel bir ilan ve haber platformudur. Emlak, araç, 2. el eşya, Kaman cevizi, hayvan/tarım ürünleri ve iş ilanlarını bir araya getirir; yerel esnafa vitrin, alıcılara güvenilir bir yerel pazar sunar.",
  },
  {
    question: "Kaman ilçesi nerede?",
    answer: "Kaman, Türkiye'nin İç Anadolu Bölgesi'nde, Kırşehir iline bağlı bir ilçedir. Ankara'ya yaklaşık 110 km, Kırşehir şehir merkezine 40 km mesafededir.",
  },
  {
    question: "Kamanilan sadece Kaman'a mı hizmet veriyor?",
    answer: "Platform öncelikle Kaman merkezli olsa da Kırşehir geneli ile birlikte Mucur, Akpınar, Boztepe, Çiçekdağı gibi çevre ilçelerden ilan ve haberler de barındırır. Hizmet bölgesi zamanla Kırşehir il geneline yayılmaktadır.",
  },
  {
    question: "İlan vermek ücretli mi?",
    answer: "Açılış döneminde (2026) ilan verme, XML feed entegrasyonu ve toplu import özellikleri tüm kullanıcılar için ücretsizdir. Bireysel ve emlakçı kayıtları açıktır; telefon doğrulaması ile ilan saniyeler içinde yayına girer.",
  },
  {
    question: "Kaman cevizi neden özel?",
    answer: "Kaman cevizi, Kaman ilçesine özgü coğrafi işaretli bir üründür. İnce kabuğu ve %55-60 oranındaki yüksek iç randımanı ile dünyada tanınır. Türk Patent ve Marka Kurumu tarafından tescilli bir üründür.",
  },
  {
    question: "Emlakçı olarak toplu ilan nasıl girebilirim?",
    answer: "Sahibinden-uyumlu XML feed URL'nizi admin panelinden ekleyerek otomatik periyodik çekim kurabilirsiniz. Alternatif olarak Excel/CSV dosyalarını toplu import fonksiyonu ile yükleyebilir, kolon eşleştirmesi sonrası tek tıkla ilanları yayına alabilirsiniz.",
  },
];

export default async function HakkimizdaPage() {
  const data = await getPageContent("hakkimizda");

  const jsonLd = [
    buildFaqPageJsonLd({
      faqs: ABOUT_FAQS,
      url:  "/hakkimizda",
    }),
    buildBreadcrumbJsonLd([
      { name: "Anasayfa", url: "/" },
      { name: data?.title || t("pages.about"), url: "/hakkimizda" },
    ]),
  ];

  return (
    <>
      <JsonLd data={jsonLd} id="about" />
      <CustomPageClient
        title={data?.title || t("pages.about")}
        htmlContent={data?.content?.html ?? null}
        imageUrl={data?.image_url ?? null}
        breadcrumbs={[
          { label: t("common.home"), href: "/" },
          { label: data?.title || t("pages.about") },
        ]}
      />

      {/* Gorunur FAQ (AI + SEO icin: hem icerik hem schema) */}
      <section className="container mx-auto px-4 pb-16 pt-8 max-w-3xl">
        <h2 className="font-fraunces text-2xl md:text-3xl font-medium tracking-tight mb-6 text-ink">
          Sık Sorulan Sorular
        </h2>
        <div className="space-y-6">
          {ABOUT_FAQS.map((faq, idx) => (
            <article key={idx} className="border-b border-line pb-5">
              <h3 className="font-fraunces text-lg font-medium text-ink mb-2">
                {faq.question}
              </h3>
              <p className="text-text-2 leading-relaxed">{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
