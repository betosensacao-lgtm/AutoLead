import { afterEach, describe, expect, it, vi } from "vitest";
import { isWebhookAuthorized } from "./webhook-auth";

function makeRequest(headers: Record<string, string> = {}): Request {
  return { headers: new Headers(headers) } as unknown as Request;
}

describe("isWebhookAuthorized", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("rejects requests when a secret is configured but no header is sent", () => {
    vi.stubEnv("WEBHOOK_SECRET", "correct-secret");
    expect(isWebhookAuthorized(makeRequest())).toBe(false);
  });

  it("rejects requests with a wrong secret", () => {
    vi.stubEnv("WEBHOOK_SECRET", "correct-secret");
    expect(
      isWebhookAuthorized(makeRequest({ "x-webhook-secret": "wrong-secret" }))
    ).toBe(false);
  });

  it("accepts requests with the matching secret", () => {
    vi.stubEnv("WEBHOOK_SECRET", "correct-secret");
    expect(
      isWebhookAuthorized(makeRequest({ "x-webhook-secret": "correct-secret" }))
    ).toBe(true);
  });

  it("rejects requests when no secret is configured and NODE_ENV is production", () => {
    vi.stubEnv("WEBHOOK_SECRET", "");
    vi.stubEnv("NODE_ENV", "production");
    expect(isWebhookAuthorized(makeRequest())).toBe(false);
  });

  it("allows requests when no secret is configured outside production", () => {
    vi.stubEnv("WEBHOOK_SECRET", "");
    vi.stubEnv("NODE_ENV", "development");
    expect(isWebhookAuthorized(makeRequest())).toBe(true);
  });
});
