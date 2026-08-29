import { describe, expect, it } from "bun:test";
import { buildAdminSidebarItems } from "./sidebar-items";

describe("admin sidebar labels", () => {
  it("shows campaign and operation routes as separate Turkish entries", () => {
    const groups = buildAdminSidebarItems(null, (key) => key);
    const items = groups.flatMap((group) => group.items);

    expect(items.find((item) => item.url === "/admin/ads")?.title).toBe("Reklam Kampanyaları");
    expect(items.find((item) => item.url === "/admin/ads/operations")?.title).toBe("Reklam Operasyon Merkezi");
  });

  it("does not render untranslated i18n keys", () => {
    const groups = buildAdminSidebarItems(null, (key) => key);
    const titles = groups.flatMap((group) => group.items.map((item) => item.title));

    expect(titles).not.toContain("admin.dashboard.items.news_image_queue");
    expect(titles).toContain("Haber Görsel Kuyruğu");
  });
});
