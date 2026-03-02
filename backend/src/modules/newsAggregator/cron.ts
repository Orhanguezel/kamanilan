// =============================================================
// FILE: src/modules/newsAggregator/cron.ts
// Her 30dk'da bir aktif kaynakları fetch et
// Her 24 saatte bir 7 günden eski önerileri sil
// =============================================================
import { fetchAllSources } from "./fetchService";
import { repoDeleteOldSuggestions } from "./repository";

const FETCH_INTERVAL_MS   = 30 * 60 * 1000;       // 30 dakika
const CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000;  // 24 saat
const OLD_AFTER_DAYS      = 7;

let fetchTimer:   ReturnType<typeof setInterval> | null = null;
let cleanupTimer: ReturnType<typeof setInterval> | null = null;

async function runCleanup() {
  try {
    const deleted = await repoDeleteOldSuggestions(OLD_AFTER_DAYS);
    if (deleted > 0) {
      console.log(`[newsAggregator] Temizlik: ${deleted} eski öneri silindi (>${OLD_AFTER_DAYS} gün).`);
    }
  } catch (err) {
    console.error("[newsAggregator] Temizlik hatası:", err);
  }
}

export function startNewsAggregatorCron() {
  if (fetchTimer) return; // already running

  console.log("[newsAggregator] Cron başlatıldı — fetch: 30 dk, temizlik: 24 saat.");

  // Sunucu açılışında 1 kez çalıştır (30 sn gecikme ile)
  const firstRun = setTimeout(async () => {
    console.log("[newsAggregator] İlk fetch başlıyor...");
    try {
      const r = await fetchAllSources();
      console.log(`[newsAggregator] İlk fetch tamamlandı: +${r.inserted} yeni, ${r.skipped} atlandı, ${r.errors} hata`);
    } catch (err) {
      console.error("[newsAggregator] İlk fetch hatası:", err);
    }
    // İlk fetch sonrası temizliği de çalıştır
    await runCleanup();
  }, 30_000);

  // Periyodik fetch
  fetchTimer = setInterval(async () => {
    console.log("[newsAggregator] Periyodik fetch başlıyor...");
    try {
      const r = await fetchAllSources();
      console.log(`[newsAggregator] Fetch tamamlandı: +${r.inserted} yeni, ${r.skipped} atlandı, ${r.errors} hata`);
    } catch (err) {
      console.error("[newsAggregator] Fetch hatası:", err);
    }
  }, FETCH_INTERVAL_MS);

  // Günlük temizlik
  cleanupTimer = setInterval(runCleanup, CLEANUP_INTERVAL_MS);

  // Bun / Node process temizliği
  if (typeof process !== "undefined") {
    process.once("SIGTERM", () => stopNewsAggregatorCron());
    process.once("SIGINT",  () => stopNewsAggregatorCron());
  }

  return () => {
    clearTimeout(firstRun);
    stopNewsAggregatorCron();
  };
}

export function stopNewsAggregatorCron() {
  if (fetchTimer) {
    clearInterval(fetchTimer);
    fetchTimer = null;
  }
  if (cleanupTimer) {
    clearInterval(cleanupTimer);
    cleanupTimer = null;
  }
  console.log("[newsAggregator] Cron durduruldu.");
}
