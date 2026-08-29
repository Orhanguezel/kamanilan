export type EditorialPolicyReason = "non_local" | "political_propaganda" | "promotional";

export type EditorialCandidate = {
  title?: string | null;
  excerpt?: string | null;
  content?: string | null;
};

const LOCAL_TERMS = [
  "kaman",
  "kirsehir",
  "cacabey",
  "mucur",
  "akpinar",
  "akcakent",
  "boztepe",
  "cicekdagi",
  "kamanli",
  "kirsehirli",
];

// Kullanıcı kararı: AKP/AK Parti propagandası ve parti aktörlerini konu alan içerik yayınlanmaz.
const POLITICAL_BLOCK_TERMS = [
  "akp",
  "ak parti",
  "adalet ve kalkinma partisi",
  "recep tayyip erdogan",
  "cumhurbaskani erdogan",
  "erdogan",
];

const PROMOTIONAL_PATTERNS = [
  /\bsponsorlu\b/,
  /\breklam(?:dir|i|in)?\b/,
  /\btanitim(?:i|ini)?\b/,
  /\blansmana ozel\b/,
  /\bsadece bugune ozel\b/,
  /\bkacirilmayacak firsat\b/,
  /\bindirim kampanyasi\b/,
  /\bfenomenlerin (?:yeni )?(?:mekani|lezzet duragi)\b/,
  /\bhizmetinizde\b/,
  /\bsiparis ver\b/,
];

export function normalizeEditorialText(value: string): string {
  return value
    .toLocaleLowerCase("tr-TR")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/ş/g, "s")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/<[^>]+>/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function evaluateEditorialCandidate(candidate: EditorialCandidate): {
  allowed: boolean;
  reasons: EditorialPolicyReason[];
} {
  const text = normalizeEditorialText(
    [candidate.title, candidate.excerpt, candidate.content].filter(Boolean).join(" "),
  );
  const reasons: EditorialPolicyReason[] = [];

  if (!LOCAL_TERMS.some((term) => text.includes(term))) reasons.push("non_local");
  if (POLITICAL_BLOCK_TERMS.some((term) => text.includes(term))) reasons.push("political_propaganda");
  if (PROMOTIONAL_PATTERNS.some((pattern) => pattern.test(text))) reasons.push("promotional");

  return { allowed: reasons.length === 0, reasons };
}

function words(value: string): string[] {
  return normalizeEditorialText(value).split(" ").filter(Boolean);
}

/**
 * AI çıktısının kaynak metindeki uzun ifadeleri aynen taşımadığını denetler.
 * Olgular telif konusu değildir; korunan ifade ve cümle yapısını kopyalamayı engeller.
 */
export function assertCopyrightSafeRewrite(
  source: EditorialCandidate,
  rewritten: EditorialCandidate,
): void {
  const sourceWords = words([source.title, source.excerpt, source.content].filter(Boolean).join(" "));
  const rewrittenText = ` ${words([rewritten.title, rewritten.excerpt, rewritten.content].filter(Boolean).join(" ")).join(" ")} `;

  const windowSize = 12;
  for (let index = 0; index <= sourceWords.length - windowSize; index += 1) {
    const phrase = sourceWords.slice(index, index + windowSize).join(" ");
    if (rewrittenText.includes(` ${phrase} `)) {
      throw new Error("ai_output_too_similar_to_source");
    }
  }
}
