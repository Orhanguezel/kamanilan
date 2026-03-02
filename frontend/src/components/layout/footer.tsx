"use client";

import Link from "next/link";
import { ROUTES } from "@/config/routes";
import { t } from "@/lib/t";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import {
  useSiteSettingsQuery,
  useMenuItemsQuery,
  useFooterSectionsQuery,
  extractMediaUrl,
} from "@/modules/site/site.service";
import type { MenuItemDto, FooterSectionDto } from "@/modules/site/site.type";

/* ── Inline SVG marka ikonları (lucide-react deprecated) ── */
function IconFacebook({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}
function IconInstagram({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function IconX({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function Footer() {
  const year = new Date().getFullYear();

  /* ── Site settings: logo + marka + iletişim + sosyal ─── */
  const { data: cfg } = useSiteSettingsQuery([
    "site_logo_dark",
    "site_logo",
    "brand_logo_text",
    "brand_name",
    "brand_display_name",
    "contact_phone_display",
    "contact_phone_tel",
    "contact_email",
    "contact_address",
    "contact_whatsapp_link",
    "social_facebook_url",
    "social_instagram_url",
    "social_twitter_url",
  ]);

  const brandLogo        = extractMediaUrl(cfg?.site_logo_dark ?? cfg?.site_logo);
  const brandLogoText    = cfg?.brand_logo_text        as string | undefined;
  const brandName        = (cfg?.brand_name            as string) ?? "Kaman İlan";
  const brandDisplayName = (cfg?.brand_display_name    as string) ?? brandName;
  const phoneDisplay     = cfg?.contact_phone_display  as string | undefined;
  const phoneTel         = (cfg?.contact_phone_tel     as string) ?? phoneDisplay;
  const email            = cfg?.contact_email          as string | undefined;
  const address          = cfg?.contact_address        as string | undefined;
  const whatsapp         = cfg?.contact_whatsapp_link  as string | undefined;
  const facebookUrl      = cfg?.social_facebook_url    as string | undefined;
  const instagramUrl     = cfg?.social_instagram_url   as string | undefined;
  const twitterUrl       = cfg?.social_twitter_url     as string | undefined;

  /* ── Footer bölümleri + linkleri (DB'den) ─────────────── */
  const { data: rawSections = [] } = useFooterSectionsQuery();
  const { data: rawItems    = [] } = useMenuItemsQuery("footer");

  const sections = (rawSections as FooterSectionDto[])
    .filter((s) => s.is_active)
    .sort((a, b) => a.display_order - b.display_order);

  const allItems = (rawItems as MenuItemDto[])
    .filter((i) => i.is_active)
    .sort((a, b) => a.order_num - b.order_num);

  const itemsBySection = (sectionId: string) =>
    allItems.filter((i) => i.section_id === sectionId && !i.parent_id);

  const showStaticLinks = sections.length === 0;

  return (
    <footer
      style={{
        backgroundColor: "hsl(var(--footer-bg))",
        color: "hsl(var(--footer-fg))",
      }}
    >
      <div className="container py-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">

          {/* ── 1. MARKA ──────────────────────────────────────────── */}
          <div>
            <Link href={ROUTES.HOME} className="inline-flex flex-col gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {brandLogo && <img src={brandLogo} alt={brandName} className="h-28 w-auto object-contain" />}
              {brandLogoText && (
                <span className="font-black text-3xl tracking-tight leading-none" style={{ color: "hsl(var(--footer-fg))" }}>
                  {brandLogoText}
                </span>
              )}
            </Link>

            <p className="mt-3 text-sm leading-relaxed opacity-65 max-w-[22ch]">
              {t("seo.site_description")}
            </p>

            {/* ── Sosyal medya ── */}
            <div className="mt-4 flex gap-2">
              {facebookUrl && (
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1877F2] text-white transition-opacity hover:opacity-85"
                  aria-label="Facebook"
                >
                  <IconFacebook className="h-3.5 w-3.5" />
                </a>
              )}
              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#833AB4] via-[#E1306C] to-[#F77737] text-white transition-opacity hover:opacity-85"
                  aria-label="Instagram"
                >
                  <IconInstagram className="h-3.5 w-3.5" />
                </a>
              )}
              {twitterUrl && (
                <a
                  href={twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white transition-opacity hover:opacity-85"
                  aria-label="X (Twitter)"
                >
                  <IconX className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </div>

          {/* ── 2-3. DB FOOTER BÖLÜMLERİ (dinamik) ───────────────── */}
          {sections.length > 0
            ? sections.slice(0, 2).map((section) => {
                const items = itemsBySection(section.id);
                if (items.length === 0) return null;
                return (
                  <div key={section.id}>
                    <h4
                      className="mb-4 text-sm font-semibold uppercase tracking-wider opacity-50"
                      style={{ color: "hsl(var(--footer-fg))" }}
                    >
                      {section.title}
                    </h4>
                    <ul className="space-y-2 text-sm">
                      {items.map((item) => (
                        <li key={item.id}>
                          <Link href={item.url} className="opacity-65 hover:opacity-100 transition-opacity">
                            {item.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })
            : showStaticLinks && (
              <>
                <div>
                  <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider opacity-50" style={{ color: "hsl(var(--footer-fg))" }}>
                    {t("footer.quick_links")}
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li><Link href={ROUTES.LISTINGS}      className="opacity-65 hover:opacity-100 transition-opacity">{t("nav.listings")}</Link></li>
                    <li><Link href={ROUTES.CATEGORIES}    className="opacity-65 hover:opacity-100 transition-opacity">{t("nav.categories")}</Link></li>
                    <li><Link href={ROUTES.POST_LISTING}  className="opacity-65 hover:opacity-100 transition-opacity">{t("footer.post_listing")}</Link></li>
                    <li><Link href={ROUTES.ANNOUNCEMENTS} className="opacity-65 hover:opacity-100 transition-opacity">Duyurular</Link></li>
                    <li><Link href={ROUTES.ADVERTISE}     className="opacity-65 hover:opacity-100 transition-opacity">Reklam Ver</Link></li>
                  </ul>
                </div>
                <div>
                  <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider opacity-50" style={{ color: "hsl(var(--footer-fg))" }}>
                    Yasal
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li><Link href={ROUTES.ABOUT}    className="opacity-65 hover:opacity-100 transition-opacity">{t("footer.about_us")}</Link></li>
                    <li><Link href={ROUTES.CONTACT}  className="opacity-65 hover:opacity-100 transition-opacity">{t("footer.contact_us")}</Link></li>
                    <li><Link href={ROUTES.TERMS}    className="opacity-65 hover:opacity-100 transition-opacity">{t("footer.terms")}</Link></li>
                    <li><Link href={ROUTES.PRIVACY}  className="opacity-65 hover:opacity-100 transition-opacity">{t("footer.privacy")}</Link></li>
                  </ul>
                </div>
              </>
            )}

          {/* ── 4. İLETİŞİM (site_settings'den) ──────────────────── */}
          <div>
            <h4
              className="mb-4 text-sm font-semibold uppercase tracking-wider opacity-50"
              style={{ color: "hsl(var(--footer-fg))" }}
            >
              İletişim
            </h4>
            <ul className="space-y-3 text-sm">
              {address && (
                <li className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "hsl(var(--accent))" }} />
                  <span className="opacity-70 leading-snug">{address}</span>
                </li>
              )}
              {phoneDisplay && (
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0" style={{ color: "hsl(var(--accent))" }} />
                  <a href={`tel:${phoneTel || phoneDisplay}`} className="opacity-70 hover:opacity-100 transition-opacity">
                    {phoneDisplay}
                  </a>
                </li>
              )}
              {email && (
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0" style={{ color: "hsl(var(--accent))" }} />
                  <a href={`mailto:${email}`} className="opacity-70 hover:opacity-100 transition-opacity">
                    {email}
                  </a>
                </li>
              )}
              {whatsapp && (
                <li className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 shrink-0" style={{ color: "#25D366" }} />
                  <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="opacity-70 hover:opacity-100 transition-opacity">
                    WhatsApp
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* ── Alt copyright ─────────────────────────────────────── */}
        <div
          className="mt-8 border-t pt-6 text-center text-xs opacity-40"
          style={{ borderColor: "hsl(var(--footer-fg) / 0.15)" }}
        >
          &copy; {year} {brandDisplayName}. {t("footer.all_rights_reserved")}
        </div>
      </div>
    </footer>
  );
}
