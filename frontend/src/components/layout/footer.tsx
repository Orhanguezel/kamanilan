"use client";

import Link from "next/link";
import { ROUTES } from "@/config/routes";
import { t } from "@/lib/t";
import { Phone, Mail, MapPin, MessageCircle, ArrowRight } from "lucide-react";
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
    <footer className="bg-ink text-parchment pt-24 pb-12 border-t border-white/5">
      <div className="container">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4 mb-20">

          {/* ── 1. MARKA ──────────────────────────────────────────── */}
          <div>
            <Link href={ROUTES.HOME} className="inline-block transition-transform hover:scale-105 mb-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {brandLogo ? <img src={brandLogo} alt={brandName} className="h-16 w-auto object-contain" /> : <div className="text-3xl font-fraunces font-bold text-saffron">{brandName}</div>}
            </Link>

            <p className="mt-4 text-sm leading-relaxed opacity-60 font-manrope">
              {t("seo.site_description")}
            </p>

            {/* ── Sosyal medya ── */}
            <div className="mt-8 flex gap-3">
              {facebookUrl && (
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white transition-all hover:bg-saffron hover:text-ink hover:border-transparent"
                  aria-label="Facebook"
                >
                  <IconFacebook className="h-4 w-4" />
                </a>
              )}
              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white transition-all hover:bg-saffron hover:text-ink hover:border-transparent"
                  aria-label="Instagram"
                >
                  <IconInstagram className="h-4 w-4" />
                </a>
              )}
              {twitterUrl && (
                <a
                  href={twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white transition-all hover:bg-saffron hover:text-ink hover:border-transparent"
                  aria-label="X (Twitter)"
                >
                  <IconX className="h-4 w-4" />
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
                    <h4 className="font-fraunces text-lg font-medium tracking-tight mb-8 text-saffron">
                      {section.title}
                    </h4>
                    <ul className="space-y-4 text-sm">
                      {items.map((item) => (
                        <li key={item.id}>
                          <Link href={item.url || "#"} className="opacity-70 hover:opacity-100 hover:text-saffron transition-all">
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
                  <h4 className="font-fraunces text-lg font-medium tracking-tight mb-8 text-saffron">
                    {t("footer.quick_links")}
                  </h4>
                  <ul className="space-y-4 text-sm">
                    <li><Link href={ROUTES.LISTINGS}      className="opacity-70 hover:opacity-100 hover:text-saffron transition-all">{t("nav.listings")}</Link></li>
                    <li><Link href={ROUTES.CATEGORIES}    className="opacity-70 hover:opacity-100 hover:text-saffron transition-all">{t("nav.categories")}</Link></li>
                    <li><Link href={ROUTES.POST_LISTING}  className="opacity-70 hover:opacity-100 hover:text-saffron transition-all">{t("footer.post_listing")}</Link></li>
                    <li><Link href={ROUTES.ANNOUNCEMENTS} className="opacity-70 hover:opacity-100 hover:text-saffron transition-all">Duyurular</Link></li>
                    <li><Link href={ROUTES.ADVERTISE}     className="opacity-70 hover:opacity-100 hover:text-saffron transition-all">Reklam Ver</Link></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-fraunces text-lg font-medium tracking-tight mb-8 text-saffron">
                    Yasal Bilgiler
                  </h4>
                  <ul className="space-y-4 text-sm">
                    <li><Link href={ROUTES.ABOUT}    className="opacity-70 hover:opacity-100 hover:text-saffron transition-all">{t("footer.about_us")}</Link></li>
                    <li><Link href={ROUTES.CONTACT}  className="opacity-70 hover:opacity-100 hover:text-saffron transition-all">{t("footer.contact_us")}</Link></li>
                    <li><Link href={ROUTES.TERMS}    className="opacity-70 hover:opacity-100 hover:text-saffron transition-all">{t("footer.terms")}</Link></li>
                    <li><Link href={ROUTES.PRIVACY}  className="opacity-70 hover:opacity-100 hover:text-saffron transition-all">{t("footer.privacy")}</Link></li>
                  </ul>
                </div>
              </>
            )}

          {/* ── 4. İLETİŞİM (site_settings'den) ──────────────────── */}
          <div>
            <h4 className="font-fraunces text-lg font-medium tracking-tight mb-8 text-saffron">
              İletişim
            </h4>
            <ul className="space-y-4 text-sm">
              {address && (
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-saffron" />
                  <span className="opacity-70 leading-relaxed max-w-[200px]">{address}</span>
                </li>
              )}
              {phoneDisplay && (
                <li className="flex items-center gap-3">
                  <Phone className="h-4 w-4 shrink-0 text-saffron" />
                  <a href={`tel:${phoneTel || phoneDisplay}`} className="opacity-70 hover:opacity-100 hover:text-saffron transition-all">
                    {phoneDisplay}
                  </a>
                </li>
              )}
              {email && (
                <li className="flex items-center gap-3">
                  <Mail className="h-4 w-4 shrink-0 text-saffron" />
                  <a href={`mailto:${email}`} className="opacity-70 hover:opacity-100 hover:text-saffron transition-all">
                    {email}
                  </a>
                </li>
              )}
              {whatsapp && (
                <li className="flex items-center gap-3">
                  <MessageCircle className="h-4 w-4 shrink-0 text-[#25D366]" />
                  <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="opacity-70 hover:opacity-100 hover:text-[#25D366] transition-all">
                    Destek Hattı (WhatsApp)
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* ── Alt copyright ─────────────────────────────────────── */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] font-mono uppercase tracking-[0.2em] opacity-40 hover:opacity-100 transition-opacity">
           <div className="flex items-center gap-2">
              &copy; {year} {brandDisplayName}. {t("footer.all_rights_reserved")}
           </div>
           <div className="flex items-center gap-2 group">
              <span>DESIGNED BY</span>
              <a 
                href="https://guezelwebdesign.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-saffron font-bold hover:brightness-125 transition-all flex items-center gap-1"
              >
                GWD TASARIM DİZAYN <ArrowRight className="h-3 w-3 -rotate-45" />
              </a>
           </div>
        </div>
      </div>
    </footer>
  );
}
