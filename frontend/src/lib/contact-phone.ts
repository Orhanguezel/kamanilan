export function normalizeContactPhone(value: string | null | undefined): string | null {
  if (!value) return null;

  const digits = value.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("00")) return `+${digits.slice(2)}`;
  if (digits.startsWith("0")) return `+90${digits.slice(1)}`;
  if (digits.startsWith("90")) return `+${digits}`;
  return `+${digits}`;
}
