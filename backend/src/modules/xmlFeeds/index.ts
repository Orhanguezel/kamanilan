// =============================================================
// FILE: src/modules/xmlFeeds/index.ts
// =============================================================
export * from "./schema";
export { registerXmlFeedsAdmin } from "./admin.routes";
export { startXmlFeedCron, stopXmlFeedCron } from "./cron";
