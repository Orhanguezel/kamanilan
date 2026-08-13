import { describe, expect, it } from "bun:test";

import { createSellerApplicationBody, reviewSellerApplicationBody } from "./validation";

describe("seller application validation", () => {
  it("accepts a valid application", () => {
    expect(createSellerApplicationBody.parse({
      store_name: "Kaman Ceviz Pazarı",
      contact_phone: "05551234567",
    }).store_name).toBe("Kaman Ceviz Pazarı");
  });

  it("only allows an admin decision", () => {
    expect(reviewSellerApplicationBody.parse({ status: "approved" }).status).toBe("approved");
    expect(() => reviewSellerApplicationBody.parse({ status: "pending" })).toThrow();
  });
});
