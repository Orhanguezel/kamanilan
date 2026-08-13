"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle,
  ChevronRight,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/config/routes";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import { getApiBaseUrl } from "@/lib/api-url";
import { normalizeContactPhone } from "./contact.utils";
import { trackAttributedConversion } from "@/lib/conversion-tracking";

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

export function ContactPageClient({
  formSection,
  detailsSection,
  translations: t,
}: ContactPageClientProps) {
  const [listingReference] = useState(() => {
    if (typeof window === "undefined") return null;
    return new URLSearchParams(window.location.search).get("ilan")?.trim() || null;
  });
  const [form, setForm] = useState(() => ({
    name: "",
    email: "",
    phone: "",
    message: listingReference
      ? `${listingReference} referanslı ilan hakkında bilgi almak istiyorum.`
      : "",
  }));
  const [phoneCode, setPhoneCode] = useState("+90");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("loading");

    try {
      const response = await fetch(`${getApiBaseUrl()}${API_ENDPOINTS.CONTACTS}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: normalizeContactPhone(phoneCode, form.phone),
          subject: "İletişim formu",
          message: form.message,
        }),
      });

      if (!response.ok) {
        setStatus("error");
        return;
      }

      setStatus("success");
      trackAttributedConversion("generate_lead", {
        lead_type: "contact_form",
        listing_reference: listingReference || undefined,
      }, listingReference ? {
        eventType: "offer_submit",
        entityType: "listing",
        entityId: listingReference,
      } : undefined);
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch {
      setStatus("error");
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="flex min-h-[calc(100vh-150px)] flex-col lg:flex-row">
        <section className="hidden items-center justify-center border-r border-black/5 bg-white p-12 lg:flex lg:w-1/2 xl:p-20">
          <div className="relative aspect-square w-full max-w-[620px]">
            <Image
              src="/images/auth/contact-kaman-v2.webp"
              alt="Kaman İlan iletişim destek ekibi"
              fill
              sizes="(min-width: 1024px) 50vw, 0px"
              className="object-contain transition-transform duration-700 hover:scale-[1.02]"
              priority
            />
          </div>
        </section>

        <section className="flex flex-1 items-center justify-center bg-[hsl(var(--col-paper))] px-6 py-12 sm:px-8 lg:px-16 lg:py-16 xl:px-24">
          <div className="w-full max-w-[560px]">
            <nav className="mb-8 flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[hsl(var(--col-ink))] opacity-30 lg:mb-10">
              <Link href={ROUTES.HOME} className="transition-colors hover:text-[hsl(var(--col-saffron-2))]">
                {t.home}
              </Link>
              <ChevronRight className="h-3 w-3" />
              <span>{t.contact}</span>
            </nav>

            <header className="mb-8 space-y-3 lg:mb-10">
              <h1 className="font-fraunces text-5xl font-medium leading-none tracking-tight text-[hsl(var(--col-ink))] lg:text-6xl">
                {formSection.title || t.contact}
              </h1>
              <p className="max-w-lg font-manrope text-sm leading-relaxed text-[hsl(var(--col-walnut))]/60 sm:text-base">
                {formSection.subtitle || t.contact_subtitle}
              </p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contact-name">{t.name}</Label>
                <div className="relative">
                  <MessageSquare className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="contact-name"
                    required
                    autoComplete="name"
                    value={form.name}
                    onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                    placeholder={t.name_placeholder}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contact-email">{t.email}</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="contact-email"
                      type="email"
                      required
                      autoComplete="email"
                      value={form.email}
                      onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                      placeholder={t.email_placeholder}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-phone">{t.phone}</Label>
                  <div className="flex rounded-md border border-input bg-background shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50">
                    <select
                      aria-label="Ülke telefon kodu"
                      value={phoneCode}
                      onChange={(event) => setPhoneCode(event.target.value)}
                      className="border-r border-input bg-transparent px-3 text-xs font-semibold text-[hsl(var(--col-walnut))] outline-none"
                    >
                      <option value="+90">+90</option>
                      <option value="+49">+49</option>
                      <option value="+1">+1</option>
                    </select>
                    <div className="relative min-w-0 flex-1">
                      <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        id="contact-phone"
                        type="tel"
                        required
                        autoComplete="tel"
                        value={form.phone}
                        onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                        placeholder={t.phone_placeholder}
                        className="h-9 w-full bg-transparent pl-10 pr-3 text-sm outline-none placeholder:text-muted-foreground"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-message">{t.message}</Label>
                <textarea
                  id="contact-message"
                  required
                  rows={4}
                  value={form.message}
                  onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
                  placeholder={t.message_placeholder}
                  className="flex min-h-28 w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus:border-ring focus:ring-[3px] focus:ring-ring/50"
                />
              </div>

              {status === "success" ? (
                <div role="status" className="flex items-center gap-2 rounded-md bg-[#F2F4E9] p-3 text-sm font-medium text-[#59603E]">
                  <CheckCircle className="h-4 w-4" />
                  {t.success}
                </div>
              ) : null}

              {status === "error" ? (
                <div role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {t.error}
                </div>
              ) : null}

              <Button type="submit" className="w-full" disabled={status === "loading"}>
                {status === "loading" ? "Gönderiliyor..." : "Mesaj Gönder"}
                <Send className="h-4 w-4" />
              </Button>
            </form>

            {(detailsSection.phone || detailsSection.email || detailsSection.address) ? (
              <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 border-t border-black/10 pt-5 text-xs text-[hsl(var(--col-walnut))]/65">
                {detailsSection.phone ? (
                  <a
                    href={`tel:${detailsSection.phone}`}
                    onClick={() => trackAttributedConversion("phone_click", { source: "contact_page" })}
                    className="flex items-center gap-1.5 hover:text-[hsl(var(--col-saffron-2))]"
                  >
                    <Phone className="h-3.5 w-3.5" /> {detailsSection.phone}
                  </a>
                ) : null}
                {detailsSection.email ? (
                  <a href={`mailto:${detailsSection.email}`} className="flex items-center gap-1.5 hover:text-[hsl(var(--col-saffron-2))]">
                    <Mail className="h-3.5 w-3.5" /> {detailsSection.email}
                  </a>
                ) : null}
                {detailsSection.address ? (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> {detailsSection.address}
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
