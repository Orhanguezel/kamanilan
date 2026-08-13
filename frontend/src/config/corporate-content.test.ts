import { describe, expect, test } from "bun:test";
import {
  LEGACY_CORPORATE_REDIRECTS,
  QUALITY_PRINCIPLES,
} from "./corporate-content";

describe("corporate page consolidation", () => {
  test("redirects retired corporate pages permanently to about", () => {
    expect(LEGACY_CORPORATE_REDIRECTS).toEqual([
      { source: "/misyon-vizyon", destination: "/hakkimizda", permanent: true },
      {
        source: "/kalite-politikamiz",
        destination: "/hakkimizda",
        permanent: true,
      },
    ]);
  });

  test("keeps a concise quality policy inside the about page", () => {
    expect(QUALITY_PRINCIPLES).toHaveLength(4);
    expect(
      QUALITY_PRINCIPLES.every(
        (principle) => principle.title && principle.description,
      ),
    ).toBe(true);
  });
});
