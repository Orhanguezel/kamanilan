import { describe, expect, it } from "bun:test";
import { parseNewsAiRewrite } from "../src/modules/newsAggregator/aiRewrite";

const valid = { title: "Kaman'da yerel gündemin bugünkü önemli gelişmesi", excerpt: "Kaman ve Kırşehir'i ilgilendiren gelişmenin ayrıntıları, doğrulanmış kaynak bilgileriyle yerel okurlar için derlendi.", content: "<p>Bu içerik özgün bir yerel haber metnidir ve kaynak atfını korur.</p>".repeat(5), meta_title: "Kaman'da yerel gündemin önemli gelişmesi", meta_description: "Kaman ve Kırşehir gündemindeki gelişmenin ayrıntıları, yerel etkileri ve doğrulanmış kaynak bilgileri Kaman İlan haberinde.", tags: ["kaman", "kırşehir", "yerel", "gündem", "haber"], image_brief: "Kaman kent merkezinde doğal ışıkta, foto-gerçekçi ve yazısız yerel haber sahnesi; iki kırpıma uygun kompozisyon.", internal_links: [{ label: "Kaman haberleri", url: "/haberler" }, { label: "Yerel ilanlar", url: "/ilanlar" }] };

describe("news AI rewrite contract", () => {
  it("accepts the required SEO, image and internal-link payload", () => expect(parseNewsAiRewrite(valid).internal_links).toHaveLength(2));
  it("rejects fewer than two internal links", () => expect(() => parseNewsAiRewrite({ ...valid, internal_links: valid.internal_links.slice(0, 1) })).toThrow());
  it("rejects external internal-link suggestions", () => expect(() => parseNewsAiRewrite({ ...valid, internal_links: [{ label: "x", url: "https://example.com" }, valid.internal_links[1]] })).toThrow());
});
