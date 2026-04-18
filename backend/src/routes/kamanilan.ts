import type { FastifyInstance } from 'fastify';

// --- Kamanilan project-specific public routers ---
import { registerProperties } from '@/modules/proporties/router';
import { registerCategories } from '@/modules/categories/router';
import { registerSubCategories } from '@/modules/subcategories/router';
import { registerUnits } from '@/modules/units/router';
import { registerVariants } from '@/modules/variants/router';
import { registerListingBrands } from '@/modules/listingBrands/router';
import { registerListingTags } from '@/modules/listingTags/router';
import { registerBanners } from '@/modules/banner/router';
import { registerMyListings } from '@/modules/myListings/router';
import { registerArticles } from '@/modules/articles/router';
import { registerNews } from '@/modules/news/router';
import { registerCartItems } from '@/modules/cart/router';
import { registerSeller } from '@/modules/seller/router';
import { registerSubscription } from '@/modules/subscription/router';
import { registerIntegrationSettings } from '@/modules/integrationSettings/router';

// --- Kamanilan project-specific admin routers ---
import { registerImportsAdmin } from '@/modules/imports/admin.routes';
import { registerXmlFeedsAdmin } from '@/modules/xmlFeeds/admin.routes';
import { registerPhotoQueueAdmin } from '@/modules/photoQueue/admin.routes';
import { registerPropertiesAdmin } from '@/modules/proporties/admin.routes';
import { registerCategoriesAdmin } from '@/modules/categories/admin.routes';
import { registerSubCategoriesAdmin } from '@/modules/subcategories/admin.routes';
import { registerUnitsAdmin } from '@/modules/units/admin.routes';
import { registerVariantsAdmin } from '@/modules/variants/admin.routes';
import { registerListingBrandsAdmin } from '@/modules/listingBrands/admin.routes';
import { registerListingTagsAdmin } from '@/modules/listingTags/admin.routes';
import { registerBannersAdmin } from '@/modules/banner/admin.routes';
import { registerArticlesAdmin } from '@/modules/articles/admin.routes';
import { registerCartAdmin } from '@/modules/cart/admin.routes';
import { registerSubscriptionAdmin } from '@/modules/subscription/admin.routes';
import { registerIntegrationSettingsAdmin } from '@/modules/integrationSettings/admin.routes';
import { registerNewsAggregatorAdmin } from '@/modules/newsAggregator/admin.routes';

export async function registerKamanilanRoutes(api: FastifyInstance) {
  await registerProperties(api);
  await registerCategories(api);
  await registerSubCategories(api);
  await registerUnits(api);
  await registerVariants(api);
  await registerListingBrands(api);
  await registerListingTags(api);
  await registerBanners(api);
  await registerMyListings(api);
  await registerArticles(api);
  await registerNews(api);
  await registerCartItems(api);
  await registerSeller(api);
  await registerSubscription(api);
  await registerIntegrationSettings(api);
}

export async function registerKamanilanAdmin(adminApi: FastifyInstance) {
  for (const reg of [
    registerImportsAdmin,
    registerXmlFeedsAdmin,
    registerPhotoQueueAdmin,
    registerPropertiesAdmin,
    registerCategoriesAdmin,
    registerSubCategoriesAdmin,
    registerUnitsAdmin,
    registerVariantsAdmin,
    registerListingBrandsAdmin,
    registerListingTagsAdmin,
    registerBannersAdmin,
    registerArticlesAdmin,
    registerCartAdmin,
    registerSubscriptionAdmin,
    registerIntegrationSettingsAdmin,
    registerNewsAggregatorAdmin,
  ]) {
    await adminApi.register(reg);
  }
}
