import { describe, expect, it } from "bun:test";
import type { CategoryItem } from "@/modules/site/site.type";
import { formatListingPrice, pickHomeCategories } from "./marketplace-home.utils";

function category(id: string, slug: string, order: number, isActive = true): CategoryItem {
  return {
    id,
    slug,
    name: slug,
    description: null,
    image_url: null,
    alt: null,
    icon: null,
    is_active: isActive,
    is_featured: false,
    is_unlimited: false,
    display_order: order,
    whatsapp_number: null,
    phone_number: null,
  };
}

describe("marketplace home helpers", () => {
  it("puts concept categories first and excludes inactive records", () => {
    const result = pickHomeCategories([
      category("other", "genel-satis", 1),
      category("farm", "hayvan-tarim", 9),
      category("home", "emlak-kira", 10),
      category("car", "arac-motosiklet", 11, false),
    ]);

    expect(result.map((item) => item.id)).toEqual(["home", "farm", "other"]);
  });

  it("formats real prices and keeps contact-only listings explicit", () => {
    expect(formatListingPrice("125000", "TRY")).toContain("125.000");
    expect(formatListingPrice(null, "TRY")).toBe("Fiyat için iletişime geçin");
  });
});
