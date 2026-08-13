import * as cron from "node-cron";
import type { FastifyInstance } from "fastify";

import {
  archiveExpiredBanners,
  auditBannerTargets,
  auditLiveBannerSources,
  optimizeBannerPerformance,
  processAdPaymentReminders,
  sendScheduledCampaignReports,
  syncBannerLifecycle,
} from "./repository";

type AdCronTask = {
  name: string;
  schedule: string;
  handler: () => Promise<void>;
};

export function startAdCron(app: FastifyInstance): void {
  const tasks: AdCronTask[] = [
    {
      name: "banner-lifecycle",
      schedule: "*/5 * * * *",
      handler: async () => {
        const lifecycle = await syncBannerLifecycle();
        const targets = await auditBannerTargets();
        const payments = await processAdPaymentReminders();
        app.log.info({ lifecycle, targets, payments }, "[cron:ads] lifecycle completed");
      },
    },
    {
      name: "banner-source-audit",
      schedule: "15 4 * * *",
      handler: async () => {
        app.log.info(await auditLiveBannerSources(), "[cron:ads] source audit completed");
      },
    },
    {
      name: "banner-performance",
      schedule: "45 4 * * *",
      handler: async () => {
        app.log.info(await optimizeBannerPerformance(), "[cron:ads] performance optimized");
      },
    },
    {
      name: "banner-reports",
      schedule: "15 5 * * *",
      handler: async () => {
        app.log.info(await sendScheduledCampaignReports(), "[cron:ads] reports sent");
      },
    },
    {
      name: "banner-archive",
      schedule: "30 5 * * *",
      handler: async () => {
        app.log.info(await archiveExpiredBanners(), "[cron:ads] campaigns archived");
      },
    },
  ];

  for (const task of tasks) {
    cron.schedule(task.schedule, () => {
      void task.handler().catch((error: unknown) => {
        app.log.error({ error, task: task.name }, "[cron:ads] task failed");
      });
    }, { timezone: "Europe/Istanbul" });
  }
}
