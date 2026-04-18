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
  ArrowRight,
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
  const cls = "h-4 w-4";

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
    <div className="bg-[hsl(var(--col-paper))] min-h-screen">
      {/* ── Hero ── */}
      <div className="bg-[hsl(var(--col-ink))] py-20 lg:py-32 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/4 h-full bg-[hsl(var(--col-saffron))] opacity-5 skew-x-[-15deg] translate-x-12" />
        <div className="container relative z-10">
           <nav className="mb-8 flex items-center gap-3 text-[10px] font-mono uppercase tracking-[0.2em] text-white opacity-40">
             <Link href="/" className="hover:text-[hsl(var(--col-saffron))] transition-colors">{t.home}</Link>
             <span className="opacity-20">/</span>
             <span className="text-white">{t.contact}</span>
           </nav>
           <h1 className="font-fraunces text-4xl lg:text-7xl font-medium tracking-tight text-white mb-6 leading-none">
             Bize <em>Ulaşın</em>
           </h1>
           <p className="text-[hsl(var(--col-parchment))] opacity-50 text-sm md:text-base max-w-xl leading-relaxed">
             {formSection.subtitle || t.contact_subtitle}
           </p>
        </div>
      </div>

      <div className="container py-20 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 items-start">
          
          {/* ── Information ── */}
          <div className="space-y-16">
            <div className="section-header">
               <div className="eyebrow mb-6">İletişim Bilgileri</div>
               <h2 className="font-fraunces text-3xl md:text-4xl font-medium text-[hsl(var(--col-ink))]">Size Bir Adım <br /><em>Kadar Yakınız</em></h2>
            </div>

            <div className="grid gap-10">
              {detailsSection.address && (
                <div className="flex gap-6 group">
                   <div className="h-14 w-14 shrink-0 rounded-2xl bg-white shadow-xl flex items-center justify-center text-[hsl(var(--col-saffron-2))] group-hover:bg-[hsl(var(--col-saffron-2))] group-hover:text-white transition-all duration-500">
                     <MapPin className="h-6 w-6" />
                   </div>
                   <div>
                      <h4 className="font-mono text-[10px] font-bold uppercase tracking-widest opacity-40 mb-2">{t.address}</h4>
                      <p className="text-[hsl(var(--col-ink))] font-medium leading-relaxed max-w-xs">{detailsSection.address}</p>
                   </div>
                </div>
              )}
              {detailsSection.phone && (
                <div className="flex gap-6 group">
                  <div className="h-14 w-14 shrink-0 rounded-2xl bg-white shadow-xl flex items-center justify-center text-[hsl(var(--col-saffron-2))] group-hover:bg-[hsl(var(--col-saffron-2))] group-hover:text-white transition-all duration-500">
                     <Phone className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-mono text-[10px] font-bold uppercase tracking-widest opacity-40 mb-2">{t.phone}</h4>
                    <a href={`tel:${detailsSection.phone}`} className="text-[hsl(var(--col-ink))] text-xl font-fraunces hover:text-[hsl(var(--col-saffron-2))] transition-colors">{detailsSection.phone}</a>
                  </div>
                </div>
              )}
              {detailsSection.email && (
                <div className="flex gap-6 group">
                  <div className="h-14 w-14 shrink-0 rounded-2xl bg-white shadow-xl flex items-center justify-center text-[hsl(var(--col-saffron-2))] group-hover:bg-[hsl(var(--col-saffron-2))] group-hover:text-white transition-all duration-500">
                     <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-mono text-[10px] font-bold uppercase tracking-widest opacity-40 mb-2">{t.email}</h4>
                    <a href={`mailto:${detailsSection.email}`} className="text-[hsl(var(--col-ink))] text-xl font-fraunces hover:text-[hsl(var(--col-saffron-2))] transition-colors underline underline-offset-8 decoration-black/10">{detailsSection.email}</a>
                  </div>
                </div>
              )}
            </div>

            {/* Social */}
            {detailsSection.social.length > 0 && (
              <div className="pt-10 border-t border-black/5">
                 <h4 className="font-mono text-[10px] font-bold uppercase tracking-widest opacity-40 mb-6 uppercase">{t.social_connect}</h4>
                 <div className="flex gap-3">
                    {detailsSection.social.map((item, idx) => (
                      <a
                        key={`${item.url}-${idx}`}
                        href={item.url || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-12 w-12 rounded-full bg-[hsl(var(--col-ink))] text-white flex items-center justify-center hover:bg-[hsl(var(--col-saffron))] hover:text-[hsl(var(--col-ink))] transition-all shadow-lg"
                      >
                         <SocialIcon icon={item.icon} />
                      </a>
                    ))}
                 </div>
              </div>
            )}
          </div>

          {/* ── Form ── */}
          <div className="bg-white rounded-[48px] p-8 md:p-14 shadow-3xl border border-black/5 relative">
            <h3 className="font-fraunces text-2xl md:text-3xl font-medium text-[hsl(var(--col-ink))] mb-10">Bize Mesaj Gönderin</h3>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2">
                <label className="font-mono text-[10px] font-bold uppercase tracking-widest opacity-60 ml-1">{t.name}</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder={t.name_placeholder}
                  className="w-full bg-[hsl(var(--col-paper))] border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-[hsl(var(--col-saffron-2))] transition-all outline-none text-sm"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="font-mono text-[10px] font-bold uppercase tracking-widest opacity-60 ml-1">{t.email}</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    placeholder={t.email_placeholder}
                    className="w-full bg-[hsl(var(--col-paper))] border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-[hsl(var(--col-saffron-2))] transition-all outline-none text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-mono text-[10px] font-bold uppercase tracking-widest opacity-60 ml-1">{t.phone}</label>
                  <div className="flex bg-[hsl(var(--col-paper))] rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-[hsl(var(--col-saffron-2))] transition-all">
                     <select
                        value={phoneCode}
                        onChange={(e) => setPhoneCode(e.target.value)}
                        className="bg-black/5 px-4 outline-none text-xs font-bold"
                     >
                       <option value="+90">+90</option>
                       <option value="+49">+49</option>
                       <option value="+1">+1</option>
                     </select>
                     <input
                       type="tel"
                       required
                       value={form.phone}
                       onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                       placeholder={t.phone_placeholder}
                       className="w-full bg-transparent border-none py-4 px-6 outline-none text-sm"
                     />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-mono text-[10px] font-bold uppercase tracking-widest opacity-60 ml-1">{t.message}</label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                  placeholder={t.message_placeholder}
                  className="w-full bg-[hsl(var(--col-paper))] border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-[hsl(var(--col-saffron-2))] transition-all outline-none text-sm resize-none"
                />
              </div>

              {status === "success" && (
                <div className="flex items-center gap-3 p-4 bg-green-50 text-green-700 rounded-2xl text-sm font-medium animate-in fade-in slide-in-from-bottom-2">
                  <CheckCircle className="h-5 w-5" /> {t.success}
                </div>
              )}
              {status === "error" && (
                <div className="p-4 bg-red-50 text-red-700 rounded-2xl text-sm font-medium">{t.error}</div>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className="btn-editorial w-full py-5 justify-center mt-4 bg-[hsl(var(--col-ink))] text-white group"
              >
                <span>
                  {status === "loading" ? "Gönderiliyor..." : (t.send_message || t.send)}
                  <Send className="h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </span>
              </button>
            </form>
          </div>
        </div>

        {/* Map */}
        {mapUrl && (
          <div className="mt-20 lg:mt-32 rounded-[48px] overflow-hidden shadow-2xl border-8 border-white">
            <iframe
              src={mapUrl}
              title="Kaman İlan Konum"
              className="h-[400px] md:h-[600px] w-full border-0 grayscale hover:grayscale-0 transition-all duration-1000"
              loading="lazy"
            />
          </div>
        )}
      </div>
    </div>
  );
}
