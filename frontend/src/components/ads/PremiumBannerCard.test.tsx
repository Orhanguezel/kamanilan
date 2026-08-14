import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "bun:test";
import type { BannerItem } from "@/modules/banner/banner.type";
import { PremiumBannerCard } from "./PremiumBannerCard";

afterEach(cleanup);

const banner = (patch: Partial<BannerItem> = {}): BannerItem => ({
  id: "52",
  title: "Haberler Üst Reklam Alanı",
  subtitle: "Bu Alana Reklam Verin",
  description: "Eski reklam açıklaması",
  image: "https://example.com/old-stock.jpg",
  thumbnail: null,
  alt: "Reklam alanı",
  background_color: "#fffbf0",
  title_color: "#78350f",
  description_color: "#92400e",
  button_text: "Reklam Ver",
  button_color: "#d97706",
  button_hover_color: "#b45309",
  button_text_color: "#fff",
  link_url: "/reklam-ver",
  link_target: "_self",
  order: 1,
  desktop_row: 0,
  desktop_columns: 1,
  ...patch,
});

describe("premium reklam kreatifi", () => {
  test("reklam satış alanını stok görsel yerine markalı panelle gösterir", () => {
    render(<PremiumBannerCard banner={banner()} variant="wide" />);
    expect(screen.getByTestId("premium-placeholder-visual")).toBeTruthy();
    expect(screen.queryByAltText("Reklam alanı")).toBeNull();
    expect(screen.getByText("Markanızı doğru yerde görünür kılın.")).toBeTruthy();
  });

  test("gerçek sponsor kampanyasında net görseli ve sponsor ilişkisini korur", () => {
    render(
      <PremiumBannerCard
        banner={banner({ subtitle: "Yeni sezon", link_url: "https://sponsor.example", title: "Kaman Cevizi", image: "https://example.com/ceviz.jpg" })}
      />,
    );
    expect(screen.getByAltText("Reklam alanı")).toBeTruthy();
    expect(screen.getByRole("link").getAttribute("rel")).toContain("sponsored");
    expect(screen.getByText("Kaman Cevizi")).toBeTruthy();
  });
});
