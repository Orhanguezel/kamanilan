"use client";

import { useThemeQuery } from "./theme.service";

import type {
  ThemePopupSettingsPage,
  ThemeHomePage,
  ThemeLoginPage,
  ThemeRegisterPage,
  ThemeProductDetailsPage,
  ThemeBlogPage,
  ThemeSectionConfig,
} from "./theme.type";

const DEFAULT_HOME_SECTION_ORDER = [
  "slider",
  "category",
  "flash_sale",
  "product_featured",
  "banner_section",
  "product_latest",
  "product_top_selling",
  "popular_product_section",
  "blog_section",
  "top_stores_section",
  "newsletters_section",
  "all_products_section",
] as const;

const DEFAULT_HOME_LAYOUT_BLOCKS = DEFAULT_HOME_SECTION_ORDER.map((type, idx) => ({
  id: `${type}__${idx + 1}`,
  type,
  instance: 1,
  enabled_disabled: "on",
}));

export function useThemeConfig() {
  const { data: themeResponse, isLoading, error } = useThemeQuery();
  const themeData = (themeResponse as any)?.theme_data ?? (themeResponse as any);

  function firstOrNull<T>(value: T[] | undefined | null): T | null {
    if (Array.isArray(value)) return (value[0] as T) ?? null;
    if (value && typeof value === "object") return value as unknown as T;
    return null;
  }

  function toList<T>(value: T[] | undefined | null): T[] {
    if (Array.isArray(value)) return value;
    if (value && typeof value === "object") {
      return Object.values(value as unknown as Record<string, T>);
    }
    return [];
  }

  // Locale-aware theme_pages: If translation exists for current locale, use it
  // API returns: { theme_data: { theme_pages: [...TR...] }, translations: { en: { theme_data: { theme_pages: [...EN...] } } } }
  const defaultPages: any = firstOrNull((themeData as any)?.theme_pages);

  const translatedThemeData: any = null;
  const translatedPages: any = translatedThemeData ? firstOrNull((translatedThemeData as any).theme_pages) : null;

  // Use translated pages if available, otherwise fall back to default (Turkish)
  const pages: any = translatedPages || defaultPages;
  const defaultHomePage = firstOrNull<ThemeHomePage>(defaultPages?.theme_home_page);

  const homePage = firstOrNull<ThemeHomePage>(pages?.theme_home_page);
  const loginPage = firstOrNull<ThemeLoginPage>(pages?.theme_login_page);
  const registerPage = firstOrNull<ThemeRegisterPage>(pages?.theme_register_page);
  const productDetailsPage = firstOrNull<ThemeProductDetailsPage>(pages?.theme_product_details_page);
  const blogPage = firstOrNull<ThemeBlogPage>(pages?.theme_blog_page);
  const popupPagesRaw = (() => {
    const localized = toList<ThemePopupSettingsPage>(pages?.theme_popup_settings);
    if (localized.length) return localized;
    return toList<ThemePopupSettingsPage>(defaultPages?.theme_popup_settings);
  })();
  const sideBannerRaw: any = (() => {
    const localized = firstOrNull(pages?.theme_side_banner_settings);
    if (localized) return localized;
    return firstOrNull(defaultPages?.theme_side_banner_settings);
  })();
  const headerData: any = firstOrNull((themeData as any)?.theme_header);
  const footerData: any = firstOrNull((themeData as any)?.theme_footer);

  // Helper: Theme verisi yoksa varsayılan olarak göster
  const isOn = (section: Array<{ enabled_disabled?: string }> | undefined | null) =>
    !homePage
      ? true
      : section && section.length > 0
      ? section[0]?.enabled_disabled === "on"
      : false;

  const normalizedLayoutBlocks = (() => {
    const raw = Array.isArray(homePage?.layout_blocks)
      ? homePage!.layout_blocks!
      : Array.isArray(defaultHomePage?.layout_blocks)
        ? defaultHomePage!.layout_blocks!
        : [];

    if (!raw.length) {
      return DEFAULT_HOME_LAYOUT_BLOCKS;
    }

    const allowed = new Set(DEFAULT_HOME_SECTION_ORDER);
    const blocks = raw
      .filter((item) => item && typeof item === "object" && typeof item.type === "string")
      .filter((item) => allowed.has(item.type as (typeof DEFAULT_HOME_SECTION_ORDER)[number]))
      .map((item, idx: number) => ({
        id: String(item.id || `${item.type}__${idx + 1}`),
        type: item.type,
        instance: Number(item.instance || 1),
        enabled_disabled: item?.enabled_disabled === "off" ? "off" : "on",
        config: item.config || {},
      }));

    const uniqueIds = new Set<string>();
    const deduped = blocks.filter((item) => {
      if (uniqueIds.has(item.id)) return false;
      uniqueIds.add(item.id);
      return true;
    });

    return deduped.length ? deduped : DEFAULT_HOME_LAYOUT_BLOCKS;
  })();

  // Ana Sayfa Accessor'ları
  const homeConfig = {
    layoutBlocks: normalizedLayoutBlocks,
    sectionOrder: (() => {
      const configured: string[] = Array.isArray(homePage?.section_order)
        ? homePage!.section_order!.filter((item): item is string => typeof item === "string")
        : Array.isArray(defaultHomePage?.section_order)
        ? defaultHomePage!.section_order!.filter((item): item is string => typeof item === "string")
        : [];
      const seen = new Set<string>();
      const valid = configured.filter((item) => {
        const isKnown = DEFAULT_HOME_SECTION_ORDER.includes(
          item as (typeof DEFAULT_HOME_SECTION_ORDER)[number]
        );
        if (!isKnown || seen.has(item)) return false;
        seen.add(item);
        return true;
      });
      const missing = DEFAULT_HOME_SECTION_ORDER.filter((item) => !valid.includes(item));
      return [...valid, ...missing];
    })(),
    isSliderEnabled: isOn(homePage?.slider),
    sliderNumber: firstOrNull(homePage?.slider)?.slider_number || "1",
    isCategoriesEnabled: isOn(homePage?.category),
    categoriesTitle: firstOrNull(homePage?.category)?.title,
    categoriesSubtitle: firstOrNull(homePage?.category)?.subtitle,
    isFlashSaleEnabled: isOn(homePage?.flash_sale),
    flashSaleTitle: firstOrNull(homePage?.flash_sale)?.title,
    flashSaleSubtitle: firstOrNull(homePage?.flash_sale)?.subtitle,
    isFeaturedEnabled: isOn(homePage?.product_featured),
    featuredTitle: firstOrNull(homePage?.product_featured)?.title,
    featuredSubtitle: firstOrNull(homePage?.product_featured)?.subtitle,
    isBannerEnabled: isOn(homePage?.banner_section),
    isTopSellingEnabled: isOn(homePage?.product_top_selling),
    topSellingTitle: firstOrNull(homePage?.product_top_selling)?.title,
    topSellingSubtitle: firstOrNull(homePage?.product_top_selling)?.subtitle,
    isLatestEnabled: isOn(homePage?.product_latest),
    latestTitle: firstOrNull(homePage?.product_latest)?.title,
    latestSubtitle: firstOrNull(homePage?.product_latest)?.subtitle,
    isPopularEnabled: isOn(homePage?.popular_product_section),
    popularTitle: firstOrNull(homePage?.popular_product_section)?.title,
    popularSubtitle: firstOrNull(homePage?.popular_product_section)?.subtitle,
    isBlogEnabled: isOn(homePage?.blog_section),
    blogTitle: firstOrNull(homePage?.blog_section)?.title,
    blogSubtitle: firstOrNull(homePage?.blog_section)?.subtitle,
    isTopStoresEnabled: isOn(homePage?.top_stores_section),
    topStoresTitle: firstOrNull<ThemeSectionConfig>(homePage?.top_stores_section)?.title,
    isNewsletterEnabled: isOn(homePage?.newsletters_section),
    newsletterTitle: firstOrNull(homePage?.newsletters_section)?.title,
    newsletterSubtitle: firstOrNull(homePage?.newsletters_section)?.subtitle,
    isAllProductsEnabled: isOn(homePage?.all_products_section),
    allProductsTitle: firstOrNull(homePage?.all_products_section)?.title,
  };

  // Giriş Sayfası
  const loginConfig = {
    isEnabled: firstOrNull(loginPage?.customer)?.enabled_disabled === "on",
    title: firstOrNull(loginPage?.customer)?.title,
    subtitle: firstOrNull(loginPage?.customer)?.subtitle,
    imageUrl: firstOrNull(loginPage?.customer)?.img_url,
  };

  // Kayıt Sayfası
  const registerConfig = {
    title: registerPage?.title,
    subtitle: registerPage?.subtitle,
    description: registerPage?.description,
    termsPageTitle: registerPage?.terms_page_title,
    termsPageUrl: registerPage?.terms_page_url,
    isSocialLoginEnabled: registerPage?.social_login_enable_disable === "on",
    imageUrl: registerPage?.img_url,
  };

  // Ürün Detay
  const productDetailsConfig = {
    isDeliveryEnabled: productDetailsPage?.delivery_enabled_disabled === "on",
    deliveryTitle: productDetailsPage?.delivery_title,
    deliverySubtitle: productDetailsPage?.delivery_subtitle,
    deliveryUrl: productDetailsPage?.delivery_url,
    isRefundEnabled: productDetailsPage?.refund_enabled_disabled === "on",
    refundTitle: productDetailsPage?.refund_title,
    refundSubtitle: productDetailsPage?.refund_subtitle,
    refundUrl: productDetailsPage?.refund_url,
    relatedTitle: productDetailsPage?.related_title,
  };

  // Blog
  const blogGridSpanRaw = Number(blogPage?.posts_grid_section?.[0]?.column_span || 4);
  const blogGridSpan = blogGridSpanRaw === 6 || blogGridSpanRaw === 12 ? blogGridSpanRaw : 4;
  const blogConfig = {
    popularTitle: blogPage?.popular_title,
    relatedTitle: blogPage?.related_title,
    isPopularPostsEnabled:
      blogPage?.popular_posts_section?.[0]?.enabled_disabled !== "off",
    popularPostsSpan: (() => {
      const raw = Number(blogPage?.popular_posts_section?.[0]?.column_span || 4);
      return raw === 6 || raw === 12 ? raw : 4;
    })(),
    isRelatedPostsEnabled:
      blogPage?.related_posts_section?.[0]?.enabled_disabled !== "off",
    relatedPostsSpan: (() => {
      const raw = Number(blogPage?.related_posts_section?.[0]?.column_span || 4);
      return raw === 6 || raw === 12 ? raw : 4;
    })(),
    isListToolbarEnabled:
      blogPage?.list_toolbar_section?.[0]?.enabled_disabled !== "off",
    isPostsGridEnabled:
      blogPage?.posts_grid_section?.[0]?.enabled_disabled !== "off",
    postsGridSpan: blogGridSpan as 4 | 6 | 12,
  };

  const popupConfigs = popupPagesRaw
    .filter((item) => item && typeof item === "object")
    .map((item, idx: number) => ({
      id: String(item.id || `popup_${idx + 1}`),
      isEnabled: item?.enabled_disabled === "on",
      title: item?.title || "",
      subtitle: item?.subtitle || "",
      buttonText: item?.button_text || "",
      buttonUrl: item?.button_url || "",
      imageUrl: item?.image_id_url || item?.img_url || item?.image_url || "",
      couponCode: item?.coupon_code || "",
      sortOrder: Number(item?.sort_order ?? idx + 1),
      delaySeconds: Number(item?.delay_seconds ?? 3),
      frequencyDays: Number(item?.frequency_days ?? 3),
      pageTarget: (item?.page_target || "all") as "all" | "home",
      displayType: (item?.display_type || "modal_center") as
        | "modal_center"
        | "top_bar"
        | "bottom_bar",
      textBehavior: (item?.text_behavior || "static") as "static" | "marquee",
      popupBgColor: item?.popup_bg_color || "",
      popupTextColor: item?.popup_text_color || "",
      popupButtonBgColor: item?.popup_button_bg_color || "",
      popupButtonTextColor: item?.popup_button_text_color || "",
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const popupConfig = popupConfigs[0] || {
    id: "popup_default",
    isEnabled: false,
    title: "",
    subtitle: "",
    buttonText: "",
    buttonUrl: "",
    imageUrl: "",
    couponCode: "",
    sortOrder: 1,
    delaySeconds: 3,
    frequencyDays: 3,
    pageTarget: "all" as const,
    displayType: "modal_center" as const,
    textBehavior: "static" as const,
    popupBgColor: "",
    popupTextColor: "",
    popupButtonBgColor: "",
    popupButtonTextColor: "",
  };

  const sideBannerConfig = {
    id: String(sideBannerRaw?.id || "left_sticky_banner_1"),
    isEnabled: sideBannerRaw?.enabled_disabled === "on",
    title: sideBannerRaw?.title || "",
    linkUrl: sideBannerRaw?.link_url || "",
    openInNewTab: sideBannerRaw?.open_in_new_tab === "on",
    pageTarget: (sideBannerRaw?.page_target || "all") as "all" | "home" | "product",
    widthPx: Math.max(180, Number(sideBannerRaw?.width_px || 240)),
    topOffsetPx: Math.max(80, Number(sideBannerRaw?.top_offset_px || 200)),
    bannerOrder: Math.max(1, Number(sideBannerRaw?.banner_order || 1)),
    dismissible: sideBannerRaw?.dismissible !== "off",
    dismissPolicy: (sideBannerRaw?.dismiss_policy || "days") as "always" | "session" | "days",
    dismissDays: Math.max(1, Number(sideBannerRaw?.dismiss_days || 1)),
  };

  // Header
  const headerConfig = {
    headerNumber: headerData?.header_number || "1",
    // Light mode
    row1Bg: headerData?.row1_bg,
    row1Text: headerData?.row1_text,
    row2Bg: headerData?.row2_bg,
    row3Bg: headerData?.row3_bg,
    row3Text: headerData?.row3_text,
    row3ButtonBg: headerData?.row3_button_bg,
    row3ButtonText: headerData?.row3_button_text,
    // Dark mode
    darkRow1Bg: headerData?.dark_row1_bg,
    darkRow1Text: headerData?.dark_row1_text,
    darkRow2Bg: headerData?.dark_row2_bg,
    darkRow3Bg: headerData?.dark_row3_bg,
    darkRow3Text: headerData?.dark_row3_text,
    darkRow3ButtonBg: headerData?.dark_row3_button_bg,
    darkRow3ButtonText: headerData?.dark_row3_button_text,
  };

  // Footer
  const footerConfig = {
    backgroundColor: footerData?.background_color,
    textColor: footerData?.text_color,
    darkBackgroundColor: footerData?.dark_background_color,
    darkTextColor: footerData?.dark_text_color,
    layoutColumns: footerData?.layout_columns || 4,
  };

  return {
    themeData,
    isLoading,
    error,
    homeConfig,
    loginConfig,
    registerConfig,
    productDetailsConfig,
    blogConfig,
    popupConfigs,
    popupConfig,
    sideBannerConfig,
    headerConfig,
    footerConfig,
  };
}
