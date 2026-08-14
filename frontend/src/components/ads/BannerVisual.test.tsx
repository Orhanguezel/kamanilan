import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test } from "bun:test";
import type { PublicBanner } from "@/lib/banners";
import { bannerColumnsClass } from "./BannerSlot";
import ResilientAdImage from "./ResilientAdImage";
import TemplateBanner from "./TemplateBanner";

const banner = (patch: Partial<PublicBanner> = {}): PublicBanner => ({
  id: 99,
  position: "home_mid",
  type: "image",
  sourceType: "custom",
  title: "Profesyonel sponsor kampanyası",
  advertiser: "Örnek Mağaza",
  imageUrl: null,
  alt: "Sponsor reklamı",
  linkUrl: null,
  linkTarget: "_blank",
  rel: "sponsored nofollow noopener",
  code: null,
  caption: null,
  ctaLabel: "İncele",
  device: "all",
  creativeTemplate: "split",
  creativeConfig: {
    backgroundColor: "#123d2a",
    textColor: "#ffffff",
    accentColor: "#8ef05b",
  },
  ...patch,
});

describe("banner responsive düzeni", () => {
  test("masaüstü 1, 2 ve 3 sütun sınıflarını üretir", () => {
    expect(bannerColumnsClass(1)).toBe("grid-cols-1");
    expect(bannerColumnsClass(2)).toBe("md:grid-cols-2");
    expect(bannerColumnsClass(3)).toBe("md:grid-cols-3");
  });

  test("mobilde tek sütun tabanı korunur", () => {
    expect(bannerColumnsClass(3)).not.toContain("sm:grid-cols");
  });
});

describe("banner görsel dayanıklılığı", () => {
  test("kırık görsel yerine erişilebilir fallback gösterir", () => {
    render(<ResilientAdImage src="/broken.webp" alt="Erik kampanyası" />);
    // happy-dom kirik src icin error olayini kendiliginden atesleyebilir;
    // img hala duruyorsa olayi elle tetikle, dusmusse fallback zaten render olmustur.
    const img = screen.queryByAltText("Erik kampanyası");
    if (img) fireEvent.error(img);
    const fallback = screen.getByRole("img", { name: "Erik kampanyası" });
    expect(fallback.textContent).toContain("Görsel kullanılamıyor");
  });

  test("görselsiz mağaza metin ve çağrı alanıyla çalışır", () => {
    render(<TemplateBanner banner={banner({ creativeTemplate: "seller" })} href={null} sidebar={false} />);
    expect(screen.getByText("Sponsor mağaza")).toBeTruthy();
    expect(screen.getByText("Profesyonel sponsor kampanyası")).toBeTruthy();
    expect(screen.getByText(/İncele/)).toBeTruthy();
  });

  test("uzun başlık kontrollü satır ve kelime kırma sınıfları alır", () => {
    const title = "Çok uzun sponsor başlığı ".repeat(12);
    const { container } = render(<TemplateBanner banner={banner({ title })} href={null} sidebar={false} />);
    const heading = container.querySelector("strong");
    expect(heading?.className).toContain("line-clamp-3");
    expect(heading?.className).toContain("break-words");
  });

  test("animasyon yalnız motion-safe koşuluyla etkinleşir", () => {
    const { container } = render(
      <TemplateBanner banner={banner({ creativeConfig: { ...banner().creativeConfig, animation: true } })} href={null} sidebar={false} />,
    );
    expect(container.querySelector("a")?.className).toContain("motion-safe:animate-[pulse_5s_ease-in-out_infinite]");
  });
});
