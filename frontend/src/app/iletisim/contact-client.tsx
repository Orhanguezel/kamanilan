"use client";

import { useState } from "react";
import Image from "next/image";
import Link from 'next/link';
import {
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle,
  Globe,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  MessageCircle,
} from "lucide-react";

interface ContactTranslations {
  contact: string;
  contact_subtitle: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  send: string;
  success: string;
  error: string;
  home: string;
  address: string;
  website: string;
  social_connect: string;
  name_placeholder: string;
  email_placeholder: string;
  phone_placeholder: string;
  message_placeholder: string;
  send_message: string;
}

interface ContactSocialLink {
  url: string;
  icon: string;
}

interface ContactPageClientProps {
  formSection: {
    title: string;
    subtitle: string;
  };
  detailsSection: {
    address: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
    imageUrl: string | null;
    social: ContactSocialLink[];
  };
  map: {
    lat: number | null;
    lng: number | null;
  };
  translations: ContactTranslations;
}

function normalizePhone(phoneCode: string, phone: string) {
  const trimmed = phone.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("+")) return trimmed;
  return `${phoneCode}${trimmed}`;
}

function SocialIcon({ icon }: { icon: string }) {
  const normalized = icon.trim().toLowerCase();
  const cls = "h-4 w-4 text-primary-foreground";

  if (normalized === "facebook") return <Facebook className={cls} />;
  if (normalized === "instagram") return <Instagram className={cls} />;
  if (normalized === "linkedin") return <Linkedin className={cls} />;
  if (normalized === "twitter" || normalized === "x") return <Twitter className={cls} />;
  if (normalized === "whatsapp") return <MessageCircle className={cls} />;

  return <Globe className={cls} />;
}

export function ContactPageClient({
  formSection,
  detailsSection,
  map,
  translations: t,
}: ContactPageClientProps) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [phoneCode, setPhoneCode] = useState("+90");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");

    try {
      const baseUrl = process.env.NEXT_PUBLIC_REST_API_ENDPOINT || "";
      const apiBase = baseUrl.replace("/api/v1", "");
      const res = await fetch(`${apiBase}/api/contact-us`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: normalizePhone(phoneCode, form.phone),
          message: form.message,
        }),
      });

      if (res.ok) {
        setStatus("success");
        setForm({ name: "", email: "", phone: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  const mapUrl =
    map.lat != null && map.lng != null
      ? `https://maps.google.com/maps?q=${map.lat},${map.lng}&z=15&output=embed`
      : null;

  return (
    <div className="container py-6">
      <nav className="mb-5 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          {t.home}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">{t.contact}</span>
      </nav>

      <div className="grid gap-6 xl:grid-cols-[520px_minmax(0,1fr)]">
        <aside className="rounded-lg border border-border bg-card p-6">
          <div className="mb-7 overflow-hidden rounded-lg border border-border bg-muted">
            {detailsSection.imageUrl ? (
              <div className="relative h-[260px] w-full md:h-[420px]">
                <Image
                  src={detailsSection.imageUrl}
                  alt={formSection.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 520px"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex h-[260px] items-center justify-center text-5xl font-medium text-muted-foreground md:h-[420px]">
                538x475
              </div>
            )}
          </div>

          <div className="space-y-5">
            {detailsSection.address && (
              <div>
                <p className="mb-2 text-xl font-medium leading-none text-foreground">{t.address}</p>
                <div className="flex items-center gap-3 text-base text-foreground">
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
                    <MapPin className="h-4 w-4 text-primary-foreground" />
                  </span>
                  <span>{detailsSection.address}</span>
                </div>
              </div>
            )}

            {detailsSection.phone && (
              <div>
                <p className="mb-2 text-xl font-medium leading-none text-foreground">{t.phone}</p>
                <a
                  href={`tel:${detailsSection.phone}`}
                  className="flex items-center gap-3 text-base text-foreground hover:text-primary"
                >
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
                    <Phone className="h-4 w-4 text-primary-foreground" />
                  </span>
                  <span>{detailsSection.phone}</span>
                </a>
              </div>
            )}

            {detailsSection.email && (
              <div>
                <p className="mb-2 text-xl font-medium leading-none text-foreground">{t.email}</p>
                <a
                  href={`mailto:${detailsSection.email}`}
                  className="flex items-center gap-3 text-base text-foreground hover:text-primary"
                >
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
                    <Mail className="h-4 w-4 text-primary-foreground" />
                  </span>
                  <span>{detailsSection.email}</span>
                </a>
              </div>
            )}

            {detailsSection.website && (
              <div>
                <p className="mb-2 text-xl font-medium leading-none text-foreground">{t.website}</p>
                <a
                  href={detailsSection.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 break-all text-base text-foreground hover:text-primary"
                >
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
                    <Globe className="h-4 w-4 text-primary-foreground" />
                  </span>
                  <span>{detailsSection.website}</span>
                </a>
              </div>
            )}

            {detailsSection.social.length > 0 && (
              <div>
                <p className="mb-2 text-xl font-medium leading-none text-foreground">{t.social_connect}</p>
                <div className="flex flex-wrap items-center gap-3">
                  {detailsSection.social.map((item, idx) => (
                    <a
                      key={`${item.url}-${idx}`}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary transition-colors hover:bg-primary/90"
                    >
                      <SocialIcon icon={item.icon} />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        <section className="rounded-lg border border-border bg-card p-7">
          <h1 className="text-5xl font-semibold leading-none text-foreground md:text-6xl">
            {formSection.title || t.contact}
          </h1>
          <p className="mt-4 max-w-4xl text-base text-muted-foreground md:text-lg">
            {formSection.subtitle || t.contact_subtitle}
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-base font-medium text-foreground">{t.name}</label>
              <input
                type="text"
                required
                maxLength={255}
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder={t.name_placeholder}
                className="h-12 w-full rounded-md border border-input bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-base font-medium text-foreground">{t.email}</label>
                <input
                  type="email"
                  required
                  maxLength={255}
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder={t.email_placeholder}
                  className="h-12 w-full rounded-md border border-input bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-base font-medium text-foreground">{t.phone}</label>
                <div className="flex rounded-md border border-input focus-within:border-primary">
                  <select
                    value={phoneCode}
                    onChange={(e) => setPhoneCode(e.target.value)}
                    className="h-12 w-24 rounded-l-md border-r border-input bg-muted px-2 text-sm text-foreground outline-none"
                    aria-label="phone code"
                  >
                    <option value="+90">+90</option>
                    <option value="+1">+1</option>
                    <option value="+44">+44</option>
                    <option value="+49">+49</option>
                  </select>
                  <input
                    type="tel"
                    required
                    maxLength={20}
                    value={form.phone}
                    onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder={t.phone_placeholder}
                    className="h-12 flex-1 rounded-r-md bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-base font-medium text-foreground">{t.message}</label>
              <textarea
                required
                maxLength={2000}
                rows={7}
                value={form.message}
                onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
                placeholder={t.message_placeholder}
                className="w-full rounded-md border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>

            {status === "success" && (
              <div className="flex items-center gap-2 rounded-md bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-green-950/30 dark:text-green-400">
                <CheckCircle className="h-4 w-4" />
                {t.success}
              </div>
            )}
            {status === "error" && (
              <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-400">{t.error}</div>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="inline-flex h-12 min-w-[220px] items-center justify-center gap-2 rounded-md bg-primary px-6 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              <Send className="h-4 w-4" />
              {status === "loading" ? "..." : t.send_message || t.send}
            </button>
          </form>
        </section>
      </div>

      {mapUrl && (
        <div className="mt-6 overflow-hidden rounded-lg border border-border bg-card p-3">
          <iframe
            src={mapUrl}
            title="map"
            className="h-[340px] w-full rounded-md border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      )}
    </div>
  );
}
