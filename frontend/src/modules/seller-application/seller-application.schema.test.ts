import { describe, expect, it } from "bun:test";

import { sellerApplicationSchema } from "./seller-application.schema";

describe("sellerApplicationSchema", () => {
  it("accepts valid seller application data", () => {
    expect(sellerApplicationSchema.parse({
      store_name: "Kaman Yerel Ürünler",
      contact_phone: "05551234567",
      note: "Yerel ürünler için mağaza başvurusu",
    }).store_name).toBe("Kaman Yerel Ürünler");
  });

  it("rejects short phone numbers", () => {
    expect(() => sellerApplicationSchema.parse({
      store_name: "Kaman Mağaza",
      contact_phone: "123",
    })).toThrow();
  });
});
