import type { FastifyInstance } from 'fastify';

// --- @vps/shared-backend public routers ---
import { registerAuth } from '@vps/shared-backend/modules/auth/router';
import { registerStorage } from '@vps/shared-backend/modules/storage/router';
import { registerProfiles } from '@vps/shared-backend/modules/profiles/router';
import { registerSiteSettings } from '@vps/shared-backend/modules/siteSettings/router';
import { registerUserRoles } from '@vps/shared-backend/modules/userRoles/router';
import { registerNotifications } from '@vps/shared-backend/modules/notifications/router';
import { registerAudit } from '@vps/shared-backend/modules/audit/router';
import { registerContacts } from '@vps/shared-backend/modules/contact/router';
import { registerCustomPages } from '@vps/shared-backend/modules/customPages/router';
import { registerHealth } from '@vps/shared-backend/modules/health/router';
import { registerTelegram } from '@vps/shared-backend/modules/telegram/router';
import { registerMail } from '@vps/shared-backend/modules/mail/router';
import { registerNewsletter } from '@vps/shared-backend/modules/newsletter/router';
import { registerEmailTemplates } from '@vps/shared-backend/modules/emailTemplates/router';
import { registerFaqs } from '@vps/shared-backend/modules/faqs/router';
import { registerMenuItems } from '@vps/shared-backend/modules/menuItems/router';
import { registerSlider } from '@vps/shared-backend/modules/slider/router';
import { registerFooterSections } from '@vps/shared-backend/modules/footerSections/router';
import { registerReviews } from '@vps/shared-backend/modules/review/router';
import { registerChat } from '@vps/shared-backend/modules/chat/router';
import { registerAiChat } from '@vps/shared-backend/modules/ai_chat/router';
import { registerPopups } from '@vps/shared-backend/modules/popups/router';
import { registerAnnouncements } from '@vps/shared-backend/modules/announcements/router';
import { registerFlashSale } from '@vps/shared-backend/modules/flashSale/router';
import { registerOrders } from '@vps/shared-backend/modules/orders/router';
import { registerWallet } from '@vps/shared-backend/modules/wallet/router';
import { registerSupport } from '@vps/shared-backend/modules/support/router';
import { registerCoupons } from '@vps/shared-backend/modules/coupons/router';
import { registerTheme } from '@vps/shared-backend/modules/theme/router';

// --- @vps/shared-backend admin routers ---
import { registerUserAdmin } from '@vps/shared-backend/modules/auth/admin.routes';
import { registerStorageAdmin } from '@vps/shared-backend/modules/storage/admin.routes';
import { registerSiteSettingsAdmin } from '@vps/shared-backend/modules/siteSettings/admin.routes';
import { registerContactsAdmin } from '@vps/shared-backend/modules/contact/admin.routes';
import { registerCustomPagesAdmin } from '@vps/shared-backend/modules/customPages/admin.routes';
import { registerAuditAdmin } from '@vps/shared-backend/modules/audit/admin.routes';
import { registerTelegramAdmin } from '@vps/shared-backend/modules/telegram/admin.routes';
import { registerEmailTemplatesAdmin } from '@vps/shared-backend/modules/emailTemplates/admin.routes';
import { registerNewsletterAdmin } from '@vps/shared-backend/modules/newsletter/admin.routes';
import { registerFaqsAdmin } from '@vps/shared-backend/modules/faqs/admin.routes';
import { registerMenuItemsAdmin } from '@vps/shared-backend/modules/menuItems/admin.routes';
import { registerSliderAdmin } from '@vps/shared-backend/modules/slider/admin.routes';
import { registerFooterSectionsAdmin } from '@vps/shared-backend/modules/footerSections/admin.routes';
import { registerReviewsAdmin } from '@vps/shared-backend/modules/review/admin.routes';
import { registerPopupsAdmin } from '@vps/shared-backend/modules/popups/admin.routes';
import { registerAnnouncementsAdmin } from '@vps/shared-backend/modules/announcements/admin.routes';
import { registerFlashSaleAdmin } from '@vps/shared-backend/modules/flashSale/admin.routes';
import { registerThemeAdmin } from '@vps/shared-backend/modules/theme/admin.routes';
import { registerWalletAdmin } from '@vps/shared-backend/modules/wallet/admin.routes';
import { registerSupportAdmin } from '@vps/shared-backend/modules/support/admin.routes';
import { registerCouponsAdmin } from '@vps/shared-backend/modules/coupons/admin.routes';
import { registerChatAdmin } from '@vps/shared-backend/modules/chat/admin.routes';
import { registerDashboardAdmin } from '@vps/shared-backend/modules/dashboard/admin.routes';
import { registerDbAdmin } from '@vps/shared-backend/modules/db_admin/admin.routes';

export async function registerSharedPublic(api: FastifyInstance) {
  await registerAuth(api);
  await registerHealth(api);
  await registerStorage(api);
  await registerProfiles(api);
  await registerSiteSettings(api);
  await registerUserRoles(api);
  await registerNotifications(api);
  await registerAudit(api);
  await registerContacts(api);
  await registerCustomPages(api);
  await registerTelegram(api);
  await registerMail(api);
  await registerNewsletter(api);
  await registerEmailTemplates(api);
  await registerFaqs(api);
  await registerMenuItems(api);
  await registerSlider(api);
  await registerFooterSections(api);
  await registerReviews(api);
  await registerChat(api);
  await registerAiChat(api);
  await registerPopups(api);
  await registerAnnouncements(api);
  await registerFlashSale(api);
  await registerOrders(api);
  await registerWallet(api);
  await registerSupport(api);
  await registerCoupons(api);
  await registerTheme(api);
}

export async function registerSharedAdmin(adminApi: FastifyInstance) {
  for (const reg of [
    registerUserAdmin,
    registerStorageAdmin,
    registerSiteSettingsAdmin,
    registerContactsAdmin,
    registerCustomPagesAdmin,
    registerAuditAdmin,
    registerTelegramAdmin,
    registerEmailTemplatesAdmin,
    registerNewsletterAdmin,
    registerFaqsAdmin,
    registerMenuItemsAdmin,
    registerSliderAdmin,
    registerFooterSectionsAdmin,
    registerReviewsAdmin,
    registerPopupsAdmin,
    registerAnnouncementsAdmin,
    registerFlashSaleAdmin,
    registerThemeAdmin,
    registerWalletAdmin,
    registerSupportAdmin,
    registerCouponsAdmin,
    registerChatAdmin,
    registerDashboardAdmin,
    registerDbAdmin,
  ]) {
    await adminApi.register(reg);
  }
}
