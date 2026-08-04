import { z } from "zod";

export const chatRequestSchema = z.object({
  message: z.string().min(1).max(4000),
  sessionId: z.string().max(200).optional(),
});

export const webhookRequestSchema = z
  .object({
    message: z.string().max(4000).optional(),
    prompt: z.string().max(4000).optional(),
  })
  .passthrough();
