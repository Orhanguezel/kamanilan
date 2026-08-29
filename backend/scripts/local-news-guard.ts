const LOCAL_DB_HOSTS = new Set(["127.0.0.1", "localhost", "mysql", "db"]);

export function assertLocalNewsPipeline(): void {
  if (process.env.NEWS_LOCAL_PIPELINE_ENABLED !== "true") {
    throw new Error("NEWS_LOCAL_PIPELINE_ENABLED=true olmadan yerel haber hattı çalışmaz.");
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("Yerel haber hattı production ortamında çalıştırılamaz.");
  }

  const dbHost = (process.env.DB_HOST ?? "127.0.0.1").trim().toLowerCase();
  if (!LOCAL_DB_HOSTS.has(dbHost)) {
    throw new Error(`Yerel haber hattı uzak DB_HOST kullanamaz: ${dbHost}`);
  }
}
