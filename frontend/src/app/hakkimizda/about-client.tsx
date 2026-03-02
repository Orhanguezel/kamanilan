"use client";

import Link from 'next/link';
import { ChevronRight } from "lucide-react";
import Image from "next/image";

/* ── Types ── */

interface AboutSection {
  title?: string;
  subtitle?: string;
  description?: string;
  image?: number;
  image_url?: string | null;
}

interface StepItem {
  title?: string;
  subtitle?: string | null;
  description?: string;
  image?: number;
  image_url?: string | null;
}

interface SectionWithSteps {
  title?: string;
  subtitle?: string;
  steps?: StepItem[];
}

interface AboutContent {
  about_section?: AboutSection;
  story_section?: SectionWithSteps;
  mission_and_vision_section?: SectionWithSteps;
  testimonial_and_success_section?: SectionWithSteps;
}

interface Breadcrumb {
  label: string;
  href?: string;
}

interface AboutPageClientProps {
  title: string;
  content: AboutContent | null;
  breadcrumbs: Breadcrumb[];
}

/* ── Helpers ── */

function HighlightTitle({ text, tag: Tag = "h2", className = "" }: { text: string; tag?: "h1" | "h2"; className?: string }) {
  const words = text.split(" ");
  if (words.length <= 1) return <Tag className={className}>{text}</Tag>;
  const last = words.pop()!;
  return (
    <Tag className={className}>
      {words.join(" ")} <span className="text-primary">{last}</span>
    </Tag>
  );
}

function WaveTop() {
  return (
    <div className="w-full overflow-hidden leading-[0]">
      <svg viewBox="0 0 1440 120" className="w-full h-[60px] md:h-[80px]" preserveAspectRatio="none">
        <path d="M0,60 C360,120 720,0 1080,60 C1260,90 1380,80 1440,60 L1440,120 L0,120 Z" className="fill-primary/[0.04]" />
      </svg>
    </div>
  );
}

function WaveBottom() {
  return (
    <div className="w-full overflow-hidden leading-[0] rotate-180">
      <svg viewBox="0 0 1440 120" className="w-full h-[60px] md:h-[80px]" preserveAspectRatio="none">
        <path d="M0,60 C360,120 720,0 1080,60 C1260,90 1380,80 1440,60 L1440,120 L0,120 Z" className="fill-primary/[0.04]" />
      </svg>
    </div>
  );
}

/* ── Main Component ── */

export function AboutPageClient({ title, content, breadcrumbs }: AboutPageClientProps) {
  if (!content) {
    return (
      <div className="container py-6">
        <h1 className="mb-6 text-2xl font-bold tracking-tight">{title}</h1>
        <div className="rounded-lg border p-8 text-center text-muted-foreground">
          <p>Bu sayfa henüz hazırlanıyor.</p>
        </div>
      </div>
    );
  }

  const { about_section, story_section, mission_and_vision_section, testimonial_and_success_section } = content;
  const hasAboutImage = !!about_section?.image_url;

  return (
    <div>
      {/* ── Hero / About Section ── */}
      <section className="bg-background">
        <div className="container px-4 py-8">
          {/* Breadcrumb */}
          <nav className="mb-8 flex items-center gap-1.5 text-sm text-muted-foreground">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="h-3.5 w-3.5" />}
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-primary transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="font-medium text-primary">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>

          {about_section && (
            <div className={`flex flex-col gap-10 ${hasAboutImage ? "items-center lg:flex-row lg:items-start" : ""}`}>
              {/* Image — only render if API provides one */}
              {hasAboutImage && (
                <div className="relative h-[300px] w-full max-w-[500px] shrink-0 overflow-hidden rounded-2xl lg:h-[380px] lg:w-[480px]">
                  <Image src={about_section.image_url!} alt={about_section.title ?? ""} fill className="object-cover" />
                </div>
              )}

              {/* Text */}
              <div className={`flex-1 ${!hasAboutImage ? "mx-auto max-w-3xl" : ""}`}>
                {about_section.title && (
                  <HighlightTitle text={about_section.title} tag="h1" className="text-3xl font-bold tracking-tight md:text-4xl" />
                )}
                {about_section.subtitle && (
                  <p className="mt-3 text-lg font-semibold text-foreground">{about_section.subtitle}</p>
                )}
                {about_section.description && (
                  <p className="mt-4 leading-relaxed text-muted-foreground">{about_section.description}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Story Section ── */}
      {story_section?.steps && story_section.steps.length > 0 && (
        <>
          <WaveTop />
          <section className="bg-primary/[0.04]">
            <div className="container px-4 py-12">
              {(story_section.title || story_section.subtitle) && (
                <div className="mx-auto max-w-2xl text-center">
                  {story_section.title && (
                    <HighlightTitle text={story_section.title} className="text-2xl font-bold tracking-tight md:text-3xl" />
                  )}
                  {story_section.subtitle && (
                    <p className="mt-3 text-muted-foreground">{story_section.subtitle}</p>
                  )}
                </div>
              )}

              <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {story_section.steps.map((step, i) => {
                  const hasImage = !!step.image_url;
                  return (
                    <div key={i} className="flex flex-col items-center text-center">
                      {hasImage && (
                        <div className="relative mb-5 h-[220px] w-full overflow-hidden rounded-xl">
                          <Image src={step.image_url!} alt={step.title ?? ""} fill className="object-cover" />
                        </div>
                      )}
                      {step.title && <h3 className="text-lg font-bold text-foreground">{step.title}</h3>}
                      {step.subtitle && (
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.subtitle}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
          <WaveBottom />
        </>
      )}

      {/* ── Mission & Vision Section ── */}
      {mission_and_vision_section?.steps && mission_and_vision_section.steps.length > 0 && (
        <section className="bg-background">
          <div className="container px-4 py-12">
            {(mission_and_vision_section.title || mission_and_vision_section.subtitle) && (
              <div className="mx-auto max-w-2xl text-center">
                {mission_and_vision_section.title && (
                  <HighlightTitle text={mission_and_vision_section.title} className="text-2xl font-bold tracking-tight md:text-3xl" />
                )}
                {mission_and_vision_section.subtitle && (
                  <p className="mt-3 text-muted-foreground">{mission_and_vision_section.subtitle}</p>
                )}
              </div>
            )}

            <div className="mx-auto mt-10 max-w-4xl space-y-6">
              {mission_and_vision_section.steps.map((step, i) => {
                const hasImage = !!step.image_url;
                return (
                  <div
                    key={i}
                    className={`overflow-hidden rounded-xl border bg-card shadow-sm ${hasImage ? "flex flex-col sm:flex-row" : ""}`}
                  >
                    {hasImage && (
                      <div className="relative h-[200px] w-full shrink-0 sm:h-auto sm:w-[240px]">
                        <Image src={step.image_url!} alt={step.title ?? ""} fill className="object-cover" />
                      </div>
                    )}
                    <div className="flex flex-1 flex-col justify-center p-6">
                      {step.title && <h3 className="text-lg font-bold text-foreground">{step.title}</h3>}
                      {step.description && (
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Testimonials & Success Stories ── */}
      {testimonial_and_success_section?.steps && testimonial_and_success_section.steps.length > 0 && (
        <>
          <WaveTop />
          <section className="bg-primary/[0.04]">
            <div className="container px-4 py-12 pb-16">
              {(testimonial_and_success_section.title || testimonial_and_success_section.subtitle) && (
                <div className="mx-auto max-w-2xl text-center">
                  {testimonial_and_success_section.title && (
                    <HighlightTitle text={testimonial_and_success_section.title} className="text-2xl font-bold tracking-tight md:text-3xl" />
                  )}
                  {testimonial_and_success_section.subtitle && (
                    <p className="mt-3 text-muted-foreground">{testimonial_and_success_section.subtitle}</p>
                  )}
                </div>
              )}

              <div className="mx-auto mt-10 grid max-w-4xl gap-6 sm:grid-cols-2">
                {testimonial_and_success_section.steps.map((step, i) => (
                  <div key={i} className="rounded-xl border bg-card p-6 shadow-sm">
                    {/* Avatar + Name + Role */}
                    <div className="mb-4 flex items-center gap-3">
                      {step.image_url ? (
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full">
                          <Image src={step.image_url} alt={step.title ?? ""} fill className="object-cover" />
                        </div>
                      ) : step.title ? (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                          {step.title.charAt(0)}
                        </div>
                      ) : null}
                      <div>
                        {step.title && <p className="font-bold text-primary">{step.title}</p>}
                        {step.subtitle && <p className="text-sm text-muted-foreground">{step.subtitle}</p>}
                      </div>
                    </div>

                    {step.description && (
                      <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
          <WaveBottom />
        </>
      )}
    </div>
  );
}
