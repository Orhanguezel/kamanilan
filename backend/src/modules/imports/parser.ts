// =============================================================
// FILE: src/modules/imports/parser.ts
// Excel (.xlsx) ve CSV parse — tek fonksiyon, xlsx paketi her ikisini de ele alir.
// =============================================================
import * as XLSX from "xlsx";

export type ParsedFile = {
  source_type: "excel" | "csv";
  columns: string[];
  rows: Array<Record<string, string>>;
  total_rows: number;
};

export type ParseOptions = {
  max_rows?: number;       // guvenlik ust limiti
  trim_values?: boolean;
};

const DEFAULT_MAX_ROWS = 5000;

function isCsvMime(mime?: string | null, filename?: string | null): boolean {
  const m = (mime ?? "").toLowerCase();
  const f = (filename ?? "").toLowerCase();
  if (m.includes("csv") || m === "text/plain") return true;
  if (f.endsWith(".csv")) return true;
  return false;
}

function normalizeValue(v: unknown, trim: boolean): string {
  if (v == null) return "";
  if (typeof v === "string") return trim ? v.trim() : v;
  if (typeof v === "number") {
    // Excel cell rakam bazen 123.0 gibi gelebilir; Number.toString kisaltir
    return Number.isFinite(v) ? String(v) : "";
  }
  if (typeof v === "boolean") return v ? "true" : "false";
  if (v instanceof Date) return v.toISOString();
  return trim ? String(v).trim() : String(v);
}

/**
 * xlsx veya csv buffer'i → columns + rows
 * Rows: her satir bir Record<columnName, stringValue>
 */
export function parseSpreadsheet(
  buffer: Buffer,
  meta: { mime?: string | null; filename?: string | null },
  options: ParseOptions = {},
): ParsedFile {
  const maxRows = options.max_rows ?? DEFAULT_MAX_ROWS;
  const trim = options.trim_values !== false;

  const isCsv = isCsvMime(meta.mime, meta.filename);
  const source_type: "excel" | "csv" = isCsv ? "csv" : "excel";

  // xlsx paketi hem .xlsx hem .csv'yi destekler
  // CSV icin type:'string' daha guvenli ama Buffer'i dogrudan verebiliriz
  const wb = isCsv
    ? XLSX.read(buffer.toString("utf-8"), { type: "string", raw: false })
    : XLSX.read(buffer, { type: "buffer", raw: false, cellDates: true });

  const firstSheetName = wb.SheetNames[0];
  if (!firstSheetName) {
    return { source_type, columns: [], rows: [], total_rows: 0 };
  }

  const sheet = wb.Sheets[firstSheetName];

  // header:1 → 2D array, row 0 baslik
  const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    blankrows: false,
    defval: "",
    raw: false,
  });

  if (matrix.length === 0) {
    return { source_type, columns: [], rows: [], total_rows: 0 };
  }

  const headerRow = matrix[0] ?? [];
  const columns = headerRow
    .map((c) => normalizeValue(c, true))
    .filter((c, i, arr) => c.length > 0 && arr.indexOf(c) === i);

  // Duplicate kolon isimlerini deduplike et (ikinci "Fiyat" → "Fiyat (2)")
  const seen = new Map<string, number>();
  const finalColumns = headerRow.map((c) => {
    const base = normalizeValue(c, true) || "col";
    const count = (seen.get(base) ?? 0) + 1;
    seen.set(base, count);
    return count === 1 ? base : `${base} (${count})`;
  });

  const rows: Array<Record<string, string>> = [];
  for (let i = 1; i < matrix.length && rows.length < maxRows; i++) {
    const r = matrix[i];
    if (!r || r.every((v) => normalizeValue(v, true) === "")) continue;
    const obj: Record<string, string> = {};
    for (let j = 0; j < finalColumns.length; j++) {
      obj[finalColumns[j]] = normalizeValue(r[j], trim);
    }
    rows.push(obj);
  }

  return {
    source_type,
    columns: finalColumns.filter((c) => columns.includes(c) || true),
    rows,
    total_rows: rows.length,
  };
}
