import { readFile } from "node:fs/promises";
import mysql from "mysql2/promise";

type NewsItem = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  cover_image_url: string;
  alt: string;
  author: string;
  tags: string;
  reading_time: number;
  meta_title: string;
  meta_description: string;
};

const manifestPath = process.argv[2];
if (!manifestPath) throw new Error("manifest path required");

const items = JSON.parse(await readFile(manifestPath, "utf8")) as NewsItem[];
if (!Array.isArray(items) || items.length === 0) throw new Error("empty manifest");
if (new Set(items.map((item) => item.id)).size !== items.length) throw new Error("duplicate article id");

const connection = await mysql.createConnection({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  charset: "utf8mb4",
});

try {
  await connection.beginTransaction();
  for (const item of items) {
    if (!item.cover_image_url.startsWith("/uploads/news/") || !item.cover_image_url.endsWith(".webp")) {
      throw new Error(`article ${item.id}: invalid local cover path`);
    }
    if (/https?:\/\//i.test(item.content) || /<img\b/i.test(item.content)) {
      throw new Error(`article ${item.id}: external URL or image in content`);
    }
    const [result] = await connection.execute<mysql.ResultSetHeader>(
      `UPDATE articles SET
        title=?, slug=?, excerpt=?, content=?, category=?, cover_image_url=?, cover_asset_id=NULL,
        alt=?, author=?, tags=?, reading_time=?, meta_title=?, meta_description=?,
        is_published=1, is_featured=0, published_at=NOW(3), updated_at=NOW(3)
       WHERE id=? AND is_published=0`,
      [
        item.title, item.slug, item.excerpt, item.content, item.category, item.cover_image_url,
        item.alt, item.author, item.tags, item.reading_time, item.meta_title,
        item.meta_description, item.id,
      ],
    );
    if (result.affectedRows !== 1) throw new Error(`article ${item.id}: draft not found or already published`);
  }
  await connection.commit();
  console.log(`published=${items.map((item) => item.id).join(",")}`);
} catch (error) {
  await connection.rollback();
  throw error;
} finally {
  await connection.end();
}
