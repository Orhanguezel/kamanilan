import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pool } from "../src/db/client";
import { fetchAllSources } from "../src/modules/newsAggregator/fetchService";
import { rewriteSuggestionWithAi } from "../src/modules/newsAggregator/aiRewrite";
import {
  repoListImageQueue,
  repoListSuggestions,
  repoSetSuggestionAiStatus,
} from "../src/modules/newsAggregator/repository";
import { assertLocalNewsPipeline } from "./local-news-guard";

assertLocalNewsPipeline();

const batchSize = Math.max(1, Math.min(Number(process.env.NEWS_LOCAL_BATCH_SIZE ?? 5), 25));
const fetched = await fetchAllSources();
const candidates = await repoListSuggestions({
  status: "pending",
  limit: 200,
  offset: 0,
});
const pending = candidates.filter((suggestion) => suggestion.ai_status !== "done").slice(0, batchSize);

function slugify(value: string): string {
  return value.toLocaleLowerCase("tr-TR")
    .replace(/[ğ]/g, "g").replace(/[ü]/g, "u").replace(/[ş]/g, "s")
    .replace(/[ı]/g, "i").replace(/[ö]/g, "o").replace(/[ç]/g, "c")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 180);
}

let rewritten = 0;
let failed = 0;
for (const suggestion of pending) {
  if (suggestion.ai_status === "done") continue;
  await repoSetSuggestionAiStatus(suggestion.id, "queued");
  try {
    const value = await rewriteSuggestionWithAi(suggestion);
    await repoSetSuggestionAiStatus(suggestion.id, "done", {
      ai_title: value.title,
      ai_excerpt: value.excerpt,
      ai_content: value.content,
      ai_meta_title: value.meta_title,
      ai_meta_description: value.meta_description,
      ai_tags: value.tags.join(", "),
      image_brief: value.image_brief,
      internal_links: JSON.stringify(value.internal_links),
      image_url: null,
      image_status: "waiting",
    });
    rewritten += 1;
  } catch (error) {
    await repoSetSuggestionAiStatus(suggestion.id, "failed");
    console.error(`[haber-local] #${suggestion.id}:`, error instanceof Error ? error.message : String(error));
    failed += 1;
  }
}

const queue = await repoListImageQueue();
const briefDirectory = path.resolve(process.cwd(), "content-images/briefler");
await mkdir(briefDirectory, { recursive: true });
const markdown = queue.map((item) => {
  const title = item.ai_title ?? item.title ?? `haber-${item.id}`;
  const fileName = `${slugify(title)}.png`;
  return `## ${title}\n\n${item.image_brief ?? ""}\n\n- Kapak: 1200×675\n- Kare: 1080×1080\n- Dosya: \`${fileName}\`\n- Kaynak görsel kullanılmayacak.\n- Gerçek kişi veya olay anı taklit edilmeyecek.\n`;
}).join("\n---\n\n");
await writeFile(path.join(briefDirectory, "haber-gorsel-briefleri.md"), markdown, "utf8");

console.info(JSON.stringify({ fetched, processed: pending.length, rewritten, failed, imageQueue: queue.length }));
await pool.end();
