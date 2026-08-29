import { mkdir, readdir, rename } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { eq } from "drizzle-orm";
import { db, pool } from "../src/db/client";
import { newsSuggestions } from "../src/modules/newsAggregator/schema";
import { repoCreate as createArticle } from "../src/modules/articles/repository";
import { assertLocalNewsPipeline } from "./local-news-guard";

assertLocalNewsPipeline();

const incoming = path.resolve(process.cwd(), "content-images/gelen");
const processed = path.resolve(process.cwd(), "content-images/islendi");
const output = path.resolve(process.cwd(), "uploads/news");

function slugify(value: string) {
  return value.toLocaleLowerCase("tr-TR").replace(/[ğ]/g, "g").replace(/[ü]/g, "u").replace(/[ş]/g, "s").replace(/[ı]/g, "i").replace(/[ö]/g, "o").replace(/[ç]/g, "c").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 180);
}

await Promise.all([mkdir(incoming, { recursive: true }), mkdir(processed, { recursive: true }), mkdir(output, { recursive: true })]);
const suggestions = await db.select().from(newsSuggestions).where(eq(newsSuggestions.image_status, "waiting"));
const bySlug = new Map(suggestions.map((item) => [slugify(item.ai_title ?? item.title ?? `haber-${item.id}`), item]));
const files = (await readdir(incoming)).filter((name) => /\.(png|jpe?g|webp)$/i.test(name));
const [settingRows] = await pool.query<Array<{ value: string }>>("SELECT value FROM site_settings WHERE `key`='news_auto_publish' AND locale='*' LIMIT 1");
const autoPublish = settingRows[0]?.value === "true" || settingRows[0]?.value === "1";
let imported = 0;

for (const file of files) {
  const slug = slugify(path.parse(file).name);
  const suggestion = bySlug.get(slug);
  if (!suggestion) { console.warn(`Eşleşme yok: ${file}`); continue; }
  const source = path.join(incoming, file);
  await Promise.all([
    sharp(source).resize(1200, 675, { fit: "cover" }).webp({ quality: 84 }).toFile(path.join(output, `${slug}.webp`)),
    sharp(source).resize(1080, 1080, { fit: "cover" }).webp({ quality: 84 }).toFile(path.join(output, `${slug}-square.webp`)),
    sharp(source).resize(480, 270, { fit: "cover" }).webp({ quality: 80 }).toFile(path.join(output, `${slug}-thumb.webp`)),
  ]);
  await db.update(newsSuggestions).set({ image_url: `/uploads/news/${slug}.webp`, image_status: "received", updated_at: new Date() } as any).where(eq(newsSuggestions.id, suggestion.id));
  if (autoPublish && suggestion.ai_status === "done") {
    const article = await createArticle({ locale: "tr", title: suggestion.ai_title ?? suggestion.title ?? slug, slug: `${slug}-${suggestion.id}`, excerpt: suggestion.ai_excerpt ?? suggestion.excerpt ?? undefined, content: suggestion.ai_content ?? suggestion.content ?? undefined, category: (suggestion.category ?? "genel") as any, cover_image_url: `/uploads/news/${slug}.webp`, author: suggestion.author ?? undefined, source: suggestion.source_name ?? undefined, source_url: suggestion.source_url, tags: suggestion.ai_tags ?? suggestion.tags ?? undefined, meta_title: suggestion.ai_meta_title ?? undefined, meta_description: suggestion.ai_meta_description ?? undefined, is_published: 1 } as any);
    await db.update(newsSuggestions).set({ status: "approved", article_id: article.row.id, image_status: "attached", updated_at: new Date() } as any).where(eq(newsSuggestions.id, suggestion.id));
  }
  await rename(source, path.join(processed, file));
  imported++;
}

console.info(`${imported}/${files.length} görsel içe aktarıldı.`);
process.exit(0);
