// =============================================================
// FILE: src/integrations/shared/article-seo-quality.ts
// Kaman İlan haber içeriği SEO + GEO kalite puanlaması (0-100).
// Kaynak: woody @shared/shared-backend/modules/blog/seo-quality.ts
// Yerel haber bağlamına uyarlandı (Kaman/Kırşehir varlık sinyali, haber için
// gerçekçi kelime eşikleri). Saf fonksiyon — istemcide canlı, backend'de kapı
// olarak AYNI mantıkla kullanılır.
// =============================================================

export type ArticleSeoQualityInput = {
  title?: string | null;
  excerpt?: string | null;
  content?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  image_url?: string | null;
  target_keyword?: string | null;
};

export type ArticleSeoQualityScore = {
  score: number;
  level: 'fail' | 'publishable' | 'ready';
  gate_passed: boolean;
  word_count: number;
  target_keyword: string;
  keyword_occurrences: number;
  keyword_density: number;
  checks: Record<string, boolean>;
  recommendations: string[];
};

// Haber içeriği blogdan kısa olur; eşikler yerel haber gerçekliğine göre.
const NEWS_MIN_WORDS = 350;
const NEWS_TARGET_MIN_WORDS = 600;
const KEYWORD_DENSITY_MIN = 0.004;
const KEYWORD_DENSITY_MAX = 0.02;

function stripHtml(html: string) {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[^;]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function wordsOf(text: string) {
  return text.split(/\s+/).filter(Boolean);
}

function countOccurrences(text: string, needle: string) {
  const kw = needle.trim().toLocaleLowerCase('tr');
  if (!kw) return 0;
  const hay = text.toLocaleLowerCase('tr');
  let count = 0;
  let index = 0;
  while ((index = hay.indexOf(kw, index)) !== -1) {
    count += 1;
    index += kw.length;
  }
  return count;
}

function safeStr(value: unknown) {
  return String(value ?? '').trim();
}

function inferTargetKeyword(input: ArticleSeoQualityInput) {
  const explicit = safeStr(input.target_keyword);
  if (explicit) return explicit;

  const metaTitle = safeStr(input.meta_title).split('|')[0]?.trim();
  if (metaTitle) return metaTitle;

  return safeStr(input.title)
    .replace(/\([^)]*\)/g, '')
    .replace(/\b(nedir|nasıl|rehber|detaylı|güncel|son dakika|açıklama)\b/gi, '')
    .replace(/[?—|-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function scoreChecks(checks: Record<string, { ok: boolean; points: number }>) {
  return Object.values(checks).reduce((sum, check) => sum + (check.ok ? check.points : 0), 0);
}

export function scoreArticleSeoQuality(input: ArticleSeoQualityInput): ArticleSeoQualityScore {
  const html = safeStr(input.content);
  const text = stripHtml(html);
  const wordCount = wordsOf(text).length;
  const targetKeyword = inferTargetKeyword(input);
  const occurrences = countOccurrences([safeStr(input.title), safeStr(input.excerpt), text].join(' '), targetKeyword);
  const density = wordCount ? occurrences / wordCount : 0;
  const h2Count = (html.match(/<h2\b/gi) || []).length;
  const linkCount = (html.match(/<a\s/gi) || []).length;
  const hasFaq = /sıkça sorulan|sss|faq/i.test(html);
  const hasList = /<ul\b|<ol\b|<table\b/i.test(html);
  const hasCleanHtml = !/<span\b|style=/i.test(html);
  const metaTitle = safeStr(input.meta_title);
  const metaDescription = safeStr(input.meta_description);

  const checks = {
    A1_content_not_empty: { ok: wordCount > 0, points: 10 },
    A2_keyword_present: { ok: occurrences >= 1, points: 10 },
    A3_minimum_length: { ok: wordCount >= NEWS_MIN_WORDS, points: 10 },
    A4_natural_density: {
      ok: density >= KEYWORD_DENSITY_MIN && density <= KEYWORD_DENSITY_MAX,
      points: 10,
    },
    B1_title_keyword: {
      ok: safeStr(input.title).toLocaleLowerCase('tr').includes(targetKeyword.toLocaleLowerCase('tr')),
      points: 5,
    },
    B2_heading_structure: { ok: h2Count >= 2, points: 4 },
    B3_schema_ready: { ok: true, points: 6 },
    B4_internal_links: { ok: linkCount >= 2, points: 3 },
    B5_image_present: { ok: Boolean(safeStr(input.image_url)), points: 4 },
    B6_meta_ready: {
      ok:
        metaTitle.length >= 30 &&
        metaTitle.length <= 65 &&
        metaDescription.length >= 110 &&
        metaDescription.length <= 170,
      points: 3,
    },
    C1_clean_original_html: { ok: hasCleanHtml, points: 5 },
    C2_depth: { ok: wordCount >= NEWS_TARGET_MIN_WORDS || h2Count >= 4, points: 4 },
    C3_readability: { ok: (html.match(/<p\b/gi) || []).length >= 4, points: 4 },
    C4_experience_signal: {
      ok: /kaman|kırşehir|mahalle|köy|esnaf|belediye|muhtar|kaymakam|yerel|çiftçi/i.test(text),
      points: 4,
    },
    C5_freshness: { ok: /2026|güncel|bugün|dün|son dakika/i.test([safeStr(input.title), text].join(' ')), points: 3 },
    D1_self_contained_answer: {
      ok: text
        .slice(0, 500)
        .toLocaleLowerCase('tr')
        .includes(targetKeyword.toLocaleLowerCase('tr')),
      points: 5,
    },
    D2_faq_block: { ok: hasFaq, points: 4 },
    D3_list_or_definition: { ok: hasList || /nedir|nasıl|kontrol listesi/i.test(html), points: 3 },
    D4_entity_consistency: { ok: /Kaman İlan|Kaman|Kırşehir/i.test(text), points: 3 },
  };

  const boolChecks = Object.fromEntries(Object.entries(checks).map(([key, check]) => [key, check.ok]));
  const score = scoreChecks(checks);
  const gatePassed =
    checks.A1_content_not_empty.ok &&
    checks.A2_keyword_present.ok &&
    checks.A3_minimum_length.ok &&
    checks.A4_natural_density.ok;

  const recommendations: string[] = [];
  if (!checks.A3_minimum_length.ok) recommendations.push(`İçeriği en az ${NEWS_MIN_WORDS} kelimeye çıkar.`);
  if (!checks.A4_natural_density.ok) {
    recommendations.push('Odak kelime yoğunluğunu doğal aralığa (%0.4-%2.0) getir.');
  }
  if (!checks.B2_heading_structure.ok) recommendations.push('En az 2 adet H2 ara başlık ekle.');
  if (!checks.B4_internal_links.ok) recommendations.push('En az 2 ilgili site içi bağlantı (ilan/kategori/haber) ekle.');
  if (!checks.B5_image_present.ok) recommendations.push('Kapak görseli ekle.');
  if (!checks.B6_meta_ready.ok) recommendations.push('Meta başlık (30-65) ve açıklama (110-170) uzunluğunu düzenle.');
  if (!checks.C4_experience_signal.ok) recommendations.push('Yerel bağlam ekle (Kaman/Kırşehir, mahalle, esnaf vb.).');
  if (!checks.D2_faq_block.ok) recommendations.push('Kısa bir SSS bölümü, alıntılanabilirliği artırır.');

  return {
    score,
    level: !gatePassed || score < 60 ? 'fail' : score < 80 ? 'publishable' : 'ready',
    gate_passed: gatePassed,
    word_count: wordCount,
    target_keyword: targetKeyword,
    keyword_occurrences: occurrences,
    keyword_density: Number((density * 100).toFixed(2)),
    checks: boolChecks,
    recommendations,
  };
}

export const ARTICLE_SEO_CHECK_META: Record<string, { label: string; group: string; points: number }> = {
  A1_content_not_empty: { label: 'İçerik boş değil', group: 'A · Temel SEO', points: 10 },
  A2_keyword_present: { label: 'Odak kelime geçiyor', group: 'A · Temel SEO', points: 10 },
  A3_minimum_length: { label: 'En az 350 kelime', group: 'A · Temel SEO', points: 10 },
  A4_natural_density: { label: 'Doğal yoğunluk (%0.4-2.0)', group: 'A · Temel SEO', points: 10 },
  B1_title_keyword: { label: 'Başlıkta odak kelime', group: 'B · Yapı & Teknik', points: 5 },
  B2_heading_structure: { label: 'En az 2 H2 başlık', group: 'B · Yapı & Teknik', points: 4 },
  B3_schema_ready: { label: 'Şema (NewsArticle) hazır', group: 'B · Yapı & Teknik', points: 6 },
  B4_internal_links: { label: 'En az 2 iç bağlantı', group: 'B · Yapı & Teknik', points: 3 },
  B5_image_present: { label: 'Kapak görseli var', group: 'B · Yapı & Teknik', points: 4 },
  B6_meta_ready: { label: 'Meta başlık/açıklama uygun', group: 'B · Yapı & Teknik', points: 3 },
  C1_clean_original_html: { label: 'Temiz HTML', group: 'C · İçerik Kalitesi', points: 5 },
  C2_depth: { label: 'Derinlik (600+ söz / 4+ H2)', group: 'C · İçerik Kalitesi', points: 4 },
  C3_readability: { label: 'Okunabilirlik (4+ paragraf)', group: 'C · İçerik Kalitesi', points: 4 },
  C4_experience_signal: { label: 'Yerel deneyim sinyali', group: 'C · İçerik Kalitesi', points: 4 },
  C5_freshness: { label: 'Güncellik sinyali', group: 'C · İçerik Kalitesi', points: 3 },
  D1_self_contained_answer: { label: 'Net cevap pasajı (ilk 500)', group: 'D · GEO / Alıntılanabilirlik', points: 5 },
  D2_faq_block: { label: 'SSS bölümü', group: 'D · GEO / Alıntılanabilirlik', points: 4 },
  D3_list_or_definition: { label: 'Liste / tanım', group: 'D · GEO / Alıntılanabilirlik', points: 3 },
  D4_entity_consistency: { label: 'Yerel varlık tutarlılığı', group: 'D · GEO / Alıntılanabilirlik', points: 3 },
};
