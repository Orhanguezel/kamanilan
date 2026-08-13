export function normalizeContactPhone(phoneCode: string, phone: string): string {
  const trimmedPhone = phone.trim();

  if (!trimmedPhone) return "";
  if (trimmedPhone.startsWith("+")) return trimmedPhone;

  return `${phoneCode}${trimmedPhone}`;
}
