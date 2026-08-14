"use client";

import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { useSiteSettingsQuery } from "@/modules/site/site.service";

function IconFacebook({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function IconInstagram({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconX({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function Footer() {
  const { data: settings } = useSiteSettingsQuery([
    "contact_phone_display",
    "contact_phone_tel",
    "contact_email",
    "social_facebook_url",
    "social_instagram_url",
    "social_twitter_url",
  ]);
  const phoneDisplay = settings?.contact_phone_display as string | undefined;
  const phoneTel = settings?.contact_phone_tel as string | undefined;
  const email = settings?.contact_email as string | undefined;
  const facebookUrl = settings?.social_facebook_url as string | undefined;
  const instagramUrl = settings?.social_instagram_url as string | undefined;
  const twitterUrl = settings?.social_twitter_url as string | undefined;

  return (
    <footer className="border-t border-white/10 bg-moss text-paper">
      <div className="container flex min-h-[55px] flex-col justify-center gap-5 px-6 py-5 text-[11px] lg:flex-row lg:items-center lg:justify-between lg:px-12 lg:py-0 xl:px-16">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          <span className="flex items-center gap-2 font-semibold">
            <MapPin className="h-3.5 w-3.5 text-saffron" /> Kaman, Kırşehir
          </span>
          <Link href={ROUTES.ABOUT} className="text-paper/75 hover:text-saffron">
            Hakkımızda
          </Link>
          <Link href={ROUTES.TERMS} className="text-paper/75 hover:text-saffron">
            Kullanım Koşulları
          </Link>
          <Link href={ROUTES.PRIVACY} className="text-paper/75 hover:text-saffron">
            Gizlilik Politikası
          </Link>
          <Link href={ROUTES.CONTACT} className="text-paper/75 hover:text-saffron">
            İletişim
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {facebookUrl ? (
            <a href={facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <IconFacebook className="h-4 w-4" />
            </a>
          ) : null}
          {instagramUrl ? (
            <a href={instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <IconInstagram className="h-4 w-4" />
            </a>
          ) : null}
          {twitterUrl ? (
            <a href={twitterUrl} target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)">
              <IconX className="h-4 w-4" />
            </a>
          ) : null}
          {phoneTel && phoneDisplay ? (
            <a href={`tel:${phoneTel}`} className="flex items-center gap-2 border-l border-white/20 pl-4 font-semibold">
              <Phone className="h-3.5 w-3.5 text-saffron" /> {phoneDisplay}
            </a>
          ) : email ? (
            <a href={`mailto:${email}`} className="flex items-center gap-2 border-l border-white/20 pl-4 font-semibold">
              <Mail className="h-3.5 w-3.5 text-saffron" /> {email}
            </a>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
