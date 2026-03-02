"use client";

import { useState } from "react";
import { Mail, CheckCircle } from "lucide-react";
import { t } from "@/lib/t";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SectionConfig } from "@/modules/theme/theme.type";

interface Props {
  config?: SectionConfig;
}

export function NewsletterSection({ config }: Props) {
  const [email, setEmail]       = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    // Minimal gecikme — backend endpoint eklenince burada API çağrısı yapılacak
    await new Promise((r) => setTimeout(r, 600));
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <section
      className="relative overflow-hidden py-16"
      style={{ background: "hsl(var(--primary))" }}
    >
      {/* Dekoratif daireler */}
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-10"
        style={{ background: "hsl(var(--primary-foreground))" }}
      />
      <div
        className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full opacity-10"
        style={{ background: "hsl(var(--primary-foreground))" }}
      />

      <div className="container relative mx-auto px-4 text-center">
        <div
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
          style={{ background: "hsl(var(--primary-foreground) / 0.15)" }}
        >
          <Mail className="h-7 w-7" style={{ color: "hsl(var(--primary-foreground))" }} />
        </div>

        <h2
          className="mb-2 text-2xl font-bold lg:text-3xl"
          style={{ color: "hsl(var(--primary-foreground))" }}
        >
          {config?.label || t("home.newsletter_title")}
        </h2>
        <p
          className="mb-8 text-sm opacity-80"
          style={{ color: "hsl(var(--primary-foreground))" }}
        >
          {t("home.newsletter_subtitle")}
        </p>

        {submitted ? (
          <div
            className="mx-auto flex max-w-sm items-center justify-center gap-2 rounded-xl px-6 py-4"
            style={{ background: "hsl(var(--primary-foreground) / 0.15)" }}
          >
            <CheckCircle className="h-5 w-5" style={{ color: "hsl(var(--primary-foreground))" }} />
            <span className="font-medium" style={{ color: "hsl(var(--primary-foreground))" }}>
              {t("home.newsletter_success")}
            </span>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row"
          >
            <Input
              type="email"
              placeholder={t("home.newsletter_placeholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 border-0 bg-white/20 text-white placeholder:text-white/60 focus-visible:ring-white/40"
            />
            <Button
              type="submit"
              disabled={loading}
              className="shrink-0 font-semibold"
              style={{
                background: "hsl(var(--accent))",
                color: "hsl(var(--accent-foreground, var(--background)))",
              }}
            >
              {loading ? "..." : t("home.newsletter_button")}
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}
