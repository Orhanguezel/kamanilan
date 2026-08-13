import { env } from "@/core/env";

export async function submitToIndexNow(paths: string[]): Promise<{ submitted: number; status: number } | null> {
  const key = (process.env.INDEXNOW_KEY ?? "").trim();
  const site = (process.env.INDEXNOW_SITE_URL || env.FRONTEND_URL || "").replace(/\/$/, "");
  if (!key || !site.startsWith("http")) return null;
  const urlList = [...new Set(paths)].map((value) => value.startsWith("http") ? value : `${site}${value}`);
  if (!urlList.length) return null;
  const response = await fetch("https://api.indexnow.org/indexnow", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ host: new URL(site).host, key, keyLocation: `${site}/indexnow-key.txt`, urlList }) });
  return { submitted: urlList.length, status: response.status };
}
