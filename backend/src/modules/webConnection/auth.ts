import { timingSafeEqual } from "node:crypto";

export function isValidContentApiKey(expected: string | undefined, authorization: unknown, apiKey: unknown): boolean {
  const bearer = typeof authorization === "string"
    ? authorization.replace(/^Bearer\s+/i, "").trim()
    : "";
  const supplied = bearer || (typeof apiKey === "string" ? apiKey.trim() : "");

  if (!expected || !supplied) return false;
  const expectedBuffer = Buffer.from(expected);
  const suppliedBuffer = Buffer.from(supplied);
  return expectedBuffer.length === suppliedBuffer.length
    && timingSafeEqual(expectedBuffer, suppliedBuffer);
}
