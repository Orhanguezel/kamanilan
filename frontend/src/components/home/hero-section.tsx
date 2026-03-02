"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { SectionConfig } from "@/modules/theme/theme.type";
import { useSlidersQuery } from "@/modules/site/site.service";
import type { SliderItem } from "@/modules/site/site.type";

interface Props {
  config?: SectionConfig;
}

const DEFAULT_GRADIENT =
  "linear-gradient(130deg, hsl(153, 42%, 12%) 0%, hsl(153, 39%, 28%) 55%, hsl(155, 38%, 38%) 100%)";

export function HeroSection({ config: _config }: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const isHovered = useRef(false);

  const { data: slides = [], isPending } = useSlidersQuery();
  const items = slides as SliderItem[];

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    const timer = setInterval(() => {
      if (!isHovered.current) emblaApi.scrollNext();
    }, 4000);
    return () => {
      clearInterval(timer);
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  if (isPending) {
    return (
      <section className="mt-2 py-2">
        <div className="container mx-auto px-4 md:px-6">
          <div
            className="h-[260px] md:h-[300px] animate-pulse rounded-2xl"
            style={{ background: DEFAULT_GRADIENT }}
          />
        </div>
      </section>
    );
  }

  if (!items.length) return null;

  return (
    <section className="mt-2 py-2">
      <div className="container mx-auto px-4 md:px-6">
        {/* Carousel wrapper — relative for abs nav buttons */}
        <div
          className="relative"
          onMouseEnter={() => { isHovered.current = true; }}
          onMouseLeave={() => { isHovered.current = false; }}
        >
          <div ref={emblaRef} className="overflow-hidden rounded-2xl shadow-lg">
            <div className="flex">
              {items.map((slide) => {
                const gradient = slide.gradient ?? DEFAULT_GRADIENT;
                const badgeColor = slide.badgeColor ?? "hsl(var(--accent))";
                const badgeTextColor = badgeColor.includes("38% 41%") ? "#fff" : "#2A1505";

                return (
                  <div
                    key={slide.id}
                    className="relative min-w-full"
                    style={{ background: gradient }}
                  >
                    {/* Arka plan resmi — düşük opaklık */}
                    {slide.image && (
                      <div
                        className="pointer-events-none absolute inset-0"
                        style={{
                          backgroundImage: `url(${slide.image})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          opacity: 0.1,
                        }}
                      />
                    )}

                    {/* Dekoratif blob'lar */}
                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                      <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
                      <div className="absolute -left-10 bottom-0 h-48 w-48 rounded-full bg-black/10 blur-3xl" />
                    </div>

                    {/* İçerik: sol metin + sağ görsel */}
                    <div className="relative flex items-center gap-6 px-8 py-8 md:px-12 md:py-10 min-h-[220px] md:min-h-[280px]">

                      {/* Sol: Metin */}
                      <div className="flex-1 min-w-0">
                        {slide.badgeText && (
                          <span
                            className="mb-3 inline-block rounded-full px-4 py-1 text-xs font-bold"
                            style={{ background: badgeColor, color: badgeTextColor }}
                          >
                            {slide.badgeText}
                          </span>
                        )}

                        <h1
                          className="font-playfair text-2xl font-bold text-white md:text-4xl"
                          style={{ whiteSpace: "pre-line", lineHeight: 1.25 }}
                        >
                          {slide.title}
                        </h1>

                        {slide.description && (
                          <p className="mt-3 max-w-sm text-sm text-white/75 md:text-base">
                            {slide.description}
                          </p>
                        )}

                        {slide.buttonLink && (
                          <Link
                            href={slide.buttonLink}
                            className="mt-5 inline-block rounded-lg px-6 py-2.5 text-sm font-bold shadow-lg transition-all hover:opacity-90 active:scale-95"
                            style={{ background: "hsl(var(--accent))", color: "#2A1505" }}
                          >
                            {slide.buttonText || "İncele"}
                          </Link>
                        )}
                      </div>

                      {/* Sağ: Ön plan görseli */}
                      {slide.image2 && (
                        <div className="hidden md:block flex-shrink-0 w-[260px] lg:w-[320px]">
                          <div className="relative h-[190px] lg:h-[230px] overflow-hidden rounded-xl shadow-2xl ring-2 ring-white/10">
                            <Image
                              src={slide.image2}
                              alt={slide.alt ?? slide.title}
                              fill
                              className="object-cover"
                              sizes="(max-width: 1024px) 260px, 320px"
                              priority={slide.order === 1}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Prev/Next okları */}
          {emblaApi && items.length > 1 && (
            <>
              <button
                onClick={() => emblaApi.scrollPrev()}
                className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full text-white transition-all hover:scale-110"
                style={{ background: "hsla(153, 42%, 5%, 0.5)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "hsl(var(--accent))";
                  e.currentTarget.style.color = "#2A1505";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "hsla(153, 42%, 5%, 0.5)";
                  e.currentTarget.style.color = "white";
                }}
                aria-label="Önceki"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => emblaApi.scrollNext()}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full text-white transition-all hover:scale-110"
                style={{ background: "hsla(153, 42%, 5%, 0.5)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "hsl(var(--accent))";
                  e.currentTarget.style.color = "#2A1505";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "hsla(153, 42%, 5%, 0.5)";
                  e.currentTarget.style.color = "white";
                }}
                aria-label="Sonraki"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}
        </div>

        {/* Slide noktaları */}
        {items.length > 1 && (
          <div className="mt-3 flex justify-center gap-2">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => emblaApi?.scrollTo(i)}
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: i === selectedIndex ? 20 : 6,
                  background:
                    i === selectedIndex
                      ? "hsl(var(--accent))"
                      : "hsl(var(--muted-foreground) / 0.3)",
                }}
                aria-label={`Slayt ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
