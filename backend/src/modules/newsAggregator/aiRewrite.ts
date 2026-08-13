import { z } from "zod";
import { buildAiChain, callAi, extractJson } from "@/modules/_shared/aiChain";
import type { NewsSuggestionRow } from "./schema";

const outputSchema = z.object({
  title: z.string().min(10).max(500),
  excerpt: z.string().min(30).max(300),
  content: z.string().min(200),
  meta_title: z.string().min(10).max(60),
  meta_description: z.string().min(30).max(155),
  tags: z.array(z.string().min(2)).min(5).max(8),
  image_brief: z.string().min(40),
  internal_links: z.array(z.object({ label: z.string().min(2), url: z.string().startsWith("/") })).min(2),
});

export type NewsAiRewrite = z.infer<typeof outputSchema>;
export const parseNewsAiRewrite = (value: unknown): NewsAiRewrite => outputSchema.parse(value);

export async function rewriteSuggestionWithAi(suggestion: NewsSuggestionRow): Promise<NewsAiRewrite> {
  const chain = await buildAiChain();
  if (!chain.length) throw new Error("ai_not_configured");

  const system = `Kaman İlan için çalışan deneyimli bir Türkçe yerel haber editörüsün. Yalnız geçerli JSON döndür. Kaynaktaki cümleleri kopyalama; olguları değiştirmeden yapıyı ve ifadeyi özgünleştir. Kaman/Kırşehir bağlamını yalnız doğrulanabilir biçimde ekle. Kaynak adı ve bağlantısına atıf cümlesini gövdede koru.`;
  const prompt = `Ham haber:\nBaşlık: ${suggestion.title ?? ""}\nÖzet: ${suggestion.excerpt ?? ""}\nİçerik: ${(suggestion.content ?? "").slice(0, 8000)}\nKaynak: ${suggestion.source_name ?? "Kaynak"}\nKaynak URL: ${suggestion.source_url}\nKategori: ${suggestion.category ?? "genel"}\n\nŞu JSON şemasını eksiksiz üret: {"title":"...","excerpt":"en fazla 300 karakter","content":"semantik HTML; sonunda kaynak atıflı paragraf","meta_title":"en fazla 60 karakter","meta_description":"en fazla 155 karakter","tags":["5-8 etiket"],"image_brief":"foto-gerçekçi yerel haber sahnesi; üzerinde yazı/logo yok; dosya adı için uygun sahne; 1200x675 ve 1080x1080 kırpıma uygun","internal_links":[{"label":"...","url":"/haberler veya /ilanlar ile başlayan dahili yol"},{"label":"...","url":"/..."}]}. En az iki gerçek site içi bağlantı öner.`;

  let lastError: unknown;
  for (const provider of chain) {
    try {
      const raw = await callAi(provider.apiBase, provider.apiKey, provider.model, provider.provider, system, prompt);
      return parseNewsAiRewrite(extractJson(raw));
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("ai_rewrite_failed");
}
