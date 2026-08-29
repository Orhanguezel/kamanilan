import { describe, expect, it } from "bun:test";
import {
  assertCopyrightSafeRewrite,
  evaluateEditorialCandidate,
} from "../src/modules/newsAggregator/editorialPolicy";

describe("news editorial policy", () => {
  it("accepts relevant Kaman and Kırşehir reporting", () => {
    expect(evaluateEditorialCandidate({ title: "Kaman'da ceviz hasadı başladı" })).toEqual({
      allowed: true,
      reasons: [],
    });
  });

  it("rejects non-local national news", () => {
    expect(evaluateEditorialCandidate({ title: "İstanbul'da transfer görüşmeleri tamamlandı" }).reasons)
      .toContain("non_local");
  });

  it("rejects AKP and Erdoğan content even when local", () => {
    expect(evaluateEditorialCandidate({ title: "AK Parti Kaman ilçe toplantısı yapıldı" }).reasons)
      .toContain("political_propaganda");
    expect(evaluateEditorialCandidate({ title: "Kaman'da Erdoğan adına program düzenlendi" }).reasons)
      .toContain("political_propaganda");
  });

  it("rejects promotional copy", () => {
    expect(evaluateEditorialCandidate({ title: "Fenomenlerin yeni lezzet durağı Kaman" }).reasons)
      .toContain("promotional");
  });

  it("rejects a long verbatim phrase copied from the source", () => {
    const copied = "Kaman ilçe merkezinde sabah saatlerinde başlayan yoğun yağış çiftçilerin yüzünü güldürürken ekipler sahada çalışma yaptı";
    expect(() => assertCopyrightSafeRewrite(
      { content: copied },
      { content: `<p>${copied} ve incelemeler sürdü.</p>` },
    )).toThrow("ai_output_too_similar_to_source");
  });

  it("accepts an independently structured rewrite", () => {
    expect(() => assertCopyrightSafeRewrite(
      { content: "Kaman ilçe merkezinde sabah saatlerinde başlayan yoğun yağış çiftçilerin yüzünü güldürürken ekipler sahada çalışma yaptı" },
      { content: "<p>Sabah görülen yağmurun ardından Kaman'daki tarım alanlarında kontroller gerçekleştirildi.</p>" },
    )).not.toThrow();
  });
});
