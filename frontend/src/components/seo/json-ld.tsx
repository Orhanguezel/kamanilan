// =============================================================
// FILE: src/components/seo/json-ld.tsx
// <JsonLd> — server component that emits <script type="application/ld+json">
// =============================================================
import type { JsonLdObject } from "@/lib/json-ld";

interface Props {
  /** Bir veya birden fazla JSON-LD objesi. Bos/null veya undefined gonderilebilir. */
  data: JsonLdObject | Array<JsonLdObject | null | undefined> | null | undefined;
  id?: string;
}

export function JsonLd({ data, id }: Props) {
  if (!data) return null;

  const objects: JsonLdObject[] = Array.isArray(data)
    ? data.filter((d): d is JsonLdObject => !!d)
    : [data];

  if (objects.length === 0) return null;

  // Birden fazla obje varsa her biri ayri <script> olarak basilir
  return (
    <>
      {objects.map((obj, idx) => (
        <script
          key={`${id ?? "ld"}-${idx}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(obj) }}
        />
      ))}
    </>
  );
}
