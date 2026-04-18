// =============================================================
// FILE: src/modules/xmlFeeds/cron.ts
// Her 5 dakikada bir cekim zamani gelmis XML feed'leri isler.
// Pattern: modules/newsAggregator/cron.ts
// =============================================================
import { listDueFeeds } from "./repository";
import { runFeed } from "./fetcher";

const POLL_INTERVAL_MS = 5 * 60 * 1000;    // 5 dakika
const FIRST_RUN_DELAY_MS = 60 * 1000;      // 60 saniye sonra ilk tarama

let pollTimer: ReturnType<typeof setInterval> | null = null;
let firstRun: ReturnType<typeof setTimeout> | null = null;
let running = false;

async function tick() {
  if (running) return; // overlapping runs onle
  running = true;
  try {
    const due = await listDueFeeds();
    if (due.length === 0) return;
    console.log(`[xmlFeeds] ${due.length} feed tetiklendi.`);
    for (const feed of due) {
      try {
        const r = await runFeed(feed);
        console.log(
          `[xmlFeeds] ${feed.name} (${feed.id.slice(0, 8)}): +${r.items_added} ~${r.items_updated} =${r.items_skipped} ✗${r.items_failed} status=${r.status}`,
        );
      } catch (err) {
        console.error(`[xmlFeeds] ${feed.name} calismasi hata:`, err);
      }
    }
  } catch (err) {
    console.error("[xmlFeeds] Tick hatasi:", err);
  } finally {
    running = false;
  }
}

export function startXmlFeedCron() {
  if (pollTimer) return;

  console.log("[xmlFeeds] Cron baslatildi — her 5 dk'da bir tarama.");

  firstRun = setTimeout(() => {
    console.log("[xmlFeeds] Ilk tarama...");
    void tick();
  }, FIRST_RUN_DELAY_MS);

  pollTimer = setInterval(() => {
    void tick();
  }, POLL_INTERVAL_MS);

  if (typeof process !== "undefined") {
    process.once("SIGTERM", () => stopXmlFeedCron());
    process.once("SIGINT", () => stopXmlFeedCron());
  }
}

export function stopXmlFeedCron() {
  if (firstRun) {
    clearTimeout(firstRun);
    firstRun = null;
  }
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
  console.log("[xmlFeeds] Cron durduruldu.");
}
