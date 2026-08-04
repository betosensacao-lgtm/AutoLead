import { describe, expect, it } from "vitest";
import { chatRequestSchema, webhookRequestSchema } from "./schemas";

describe("chatRequestSchema", () => {
  it("accepts a valid message with no sessionId", () => {
    const result = chatRequestSchema.safeParse({ message: "hello" });
    expect(result.success).toBe(true);
  });

  it("accepts a valid message with a sessionId", () => {
    const result = chatRequestSchema.safeParse({
      message: "hello",
      sessionId: "abc-123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty message", () => {
    expect(chatRequestSchema.safeParse({ message: "" }).success).toBe(false);
  });

  it("rejects a missing message", () => {
    expect(chatRequestSchema.safeParse({}).success).toBe(false);
  });

  it("rejects a non-string message (object payload)", () => {
    expect(
      chatRequestSchema.safeParse({ message: { evil: "payload" } }).success
    ).toBe(false);
  });

  it("rejects a message over the length limit", () => {
    expect(
      chatRequestSchema.safeParse({ message: "a".repeat(4001) }).success
    ).toBe(false);
  });
});

describe("webhookRequestSchema", () => {
  it("accepts a body with a string message field", () => {
    expect(webhookRequestSchema.safeParse({ message: "hi" }).success).toBe(true);
  });

  it("accepts an arbitrary n8n-shaped payload with extra fields", () => {
    const result = webhookRequestSchema.safeParse({
      event: "workflow.completed",
      data: { id: "123" },
    });
    expect(result.success).toBe(true);
  });

  it("rejects a non-string message field", () => {
    expect(
      webhookRequestSchema.safeParse({ message: { nested: true } }).success
    ).toBe(false);
  });

  it("rejects a non-object top-level payload", () => {
    expect(webhookRequestSchema.safeParse("just a string").success).toBe(false);
  });
});
