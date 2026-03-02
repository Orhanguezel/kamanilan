import type { Metadata } from "next";
import { t } from "@/lib/t";
import { fetchAPI } from "@/lib/api-server";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import { ContactPageClient } from "./contact-client";

interface ContactSocialLink {
  url: string;
  icon: string;
}

interface ContactPageResponse {
  meta_title?: string;
  meta_description?: string;
  content?: unknown;
}

interface SiteInfoData {
  com_site_title?: string;
  com_site_email?: string;
  com_site_contact_number?: string;
  com_site_full_address?: string;
  com_site_website_url?: string;
}

interface SiteInfoResponse {
  site_settings?: SiteInfoData;
}

interface FooterData {
  com_social_links_facebook_url?: string;
  com_social_links_instagram_url?: string;
  com_social_links_linkedin_url?: string;
  com_social_links_twitter_url?: string;
}

interface FooterResponse {
  data?: {
    content?: FooterData;
  };
}

interface ContactContent {
  contact_form_section?: {
    title?: string;
    subtitle?: string;
  };
  contact_details_section?: {
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    image_url?: string;
    social?: ContactSocialLink[];
  };
  map_section?: {
    coordinates?: {
      lat?: number;
      lng?: number;
    };
  };
}

function toObjectContent(content: unknown): ContactContent {
  if (!content) return {};
  if (typeof content === "string") {
    try {
      return JSON.parse(content) as ContactContent;
    } catch {
      return {};
    }
  }
  if (typeof content === "object") {
    return content as ContactContent;
  }
  return {};
}

async function getPageContent() {
  try {
    return await fetchAPI<ContactPageResponse>(`${API_ENDPOINTS.PAGES}/contact`, {}, "tr");
  } catch {
    return null;
  }
}

async function getSiteInfo() {
  try {
    const res = await fetchAPI<SiteInfoResponse>(API_ENDPOINTS.SITE_GENERAL_INFO, {}, "tr");
    return res?.site_settings ?? null;
  } catch {
    return null;
  }
}

async function getFooterData() {
  try {
    const res = await fetchAPI<FooterResponse>(API_ENDPOINTS.FOOTER, {}, "tr");
    return res?.data?.content ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const data = await getPageContent();
  return {
    title: data?.meta_title || t("seo.contact_title"),
    description: data?.meta_description || t("seo.contact_description"),
    alternates: {
      canonical: "/iletisim",
    },
  };
}

export default async function ContactPage() {
  const [pageData, siteInfo, footerData] = await Promise.all([
    getPageContent(),
    getSiteInfo(),
    getFooterData(),
  ]);

  const content = toObjectContent(pageData?.content);

  const socialFromPage: ContactSocialLink[] = (content.contact_details_section?.social ?? [])
    .map((item) => ({
      url: item?.url?.trim() || "",
      icon: item?.icon?.trim() || "",
    }))
    .filter((item): item is ContactSocialLink => Boolean(item.url && item.icon));

  const fallbackSocial: ContactSocialLink[] = [
    { url: footerData?.com_social_links_facebook_url, icon: "Facebook" },
    { url: footerData?.com_social_links_instagram_url, icon: "Instagram" },
    { url: footerData?.com_social_links_linkedin_url, icon: "Linkedin" },
    { url: footerData?.com_social_links_twitter_url, icon: "Twitter" },
  ].filter((item): item is ContactSocialLink => Boolean(item.url));

  return (
    <ContactPageClient
      formSection={{
        title: content.contact_form_section?.title || siteInfo?.com_site_title || t("pages.contact"),
        subtitle: content.contact_form_section?.subtitle || t("pages.contact_subtitle"),
      }}
      detailsSection={{
        address: content.contact_details_section?.address || siteInfo?.com_site_full_address || null,
        phone: content.contact_details_section?.phone || siteInfo?.com_site_contact_number || null,
        email: content.contact_details_section?.email || siteInfo?.com_site_email || null,
        website: content.contact_details_section?.website || siteInfo?.com_site_website_url || null,
        imageUrl: content.contact_details_section?.image_url || null,
        social: socialFromPage.length > 0 ? socialFromPage : fallbackSocial,
      }}
      map={{
        lat: content.map_section?.coordinates?.lat ?? null,
        lng: content.map_section?.coordinates?.lng ?? null,
      }}
      translations={{
        contact: t("pages.contact"),
        contact_subtitle: t("pages.contact_subtitle"),
        name: t("pages.form_name"),
        email: t("pages.form_email"),
        phone: t("pages.form_phone"),
        message: t("pages.form_message"),
        send: t("pages.form_send"),
        success: t("pages.form_success"),
        error: t("pages.form_error"),
        home: t("common.home"),
        address: t("footer.address"),
        website: t("pages.website"),
        social_connect: t("footer.social_connect"),
        name_placeholder: t("pages.form_name_placeholder"),
        email_placeholder: t("pages.form_email_placeholder"),
        phone_placeholder: t("pages.form_phone_placeholder"),
        message_placeholder: t("pages.form_message_placeholder"),
        send_message: t("pages.form_send_message"),
      }}
    />
  );
}
