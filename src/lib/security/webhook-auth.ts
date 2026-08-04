import { timingSafeEqual } from "crypto";

export function isWebhookAuthorized(request: Request): boolean {
  const expected = process.env.WEBHOOK_SECRET;
  if (!expected) {
    // No shared secret configured — only allow this outside production (local/dev testing).
    return process.env.NODE_ENV !== "production";
  }

  const provided = request.headers.get("x-webhook-secret") || "";
  const expectedBuf = Buffer.from(expected);
  const providedBuf = Buffer.from(provided);
  if (expectedBuf.length !== providedBuf.length) return false;
  return timingSafeEqual(expectedBuf, providedBuf);
}
