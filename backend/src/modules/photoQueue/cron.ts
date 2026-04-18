// =============================================================
// FILE: src/modules/photoQueue/cron.ts
// 30 sn'de bir 5 paralel foto indir → Cloudinary → property_assets update
// Pattern: modules/newsAggregator/cron.ts
// =============================================================
import { pickPending, markDone, markFailed } from "./repository";
import { processQueueRow } from "./downloader";

const POLL_INTERVAL_MS = 30 * 1000;       // 30 sn
const FIRST_RUN_DELAY_MS = 45 * 1000;     // 45 sn sonra ilk tick
const BATCH_SIZE = 5;

let pollTimer: ReturnType<typeof setInterval> | null = null;
let firstRun: ReturnType<typeof setTimeout> | null = null;
let running = false;

async function tick() {
  if (running) return;
  running = true;
  try {
    const rows = await pickPending(BATCH_SIZE);
    if (rows.length === 0) return;

    const results = await Promise.allSettled(
      rows.map(async (row) => {
        const res = await processQueueRow(row);
        if (res.ok && res.asset_id) {
          await markDone(row.id, res.asset_id);
          return { ok: true, id: row.id };
        }
        await markFailed(row.id, res.error ?? "unknown");
        return { ok: false, id: row.id, error: res.error };
      }),
    );

    const ok = results.filter((r) => r.status === "fulfilled" && r.value.ok).length;
    const failed = rows.length - ok;
    console.log(`[photoQueue] Batch: ok=${ok} failed=${failed} total=${rows.length}`);
  } catch (err) {
    console.error("[photoQueue] Tick hatasi:", err);
  } finally {
    running = false;
  }
}

export function startPhotoDownloadCron() {
  if (pollTimer) return;

  console.log("[photoQueue] Cron baslatildi — 30 sn'de bir, batch 5.");

  firstRun = setTimeout(() => {
    console.log("[photoQueue] Ilk tarama...");
    void tick();
  }, FIRST_RUN_DELAY_MS);

  pollTimer = setInterval(() => {
    void tick();
  }, POLL_INTERVAL_MS);

  if (typeof process !== "undefined") {
    process.once("SIGTERM", () => stopPhotoDownloadCron());
    process.once("SIGINT", () => stopPhotoDownloadCron());
  }
}

export function stopPhotoDownloadCron() {
  if (firstRun) {
    clearTimeout(firstRun);
    firstRun = null;
  }
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
  console.log("[photoQueue] Cron durduruldu.");
}
