import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  message: z.string().trim().min(10).max(2000),
  // Honeypot: real users leave this empty. Bots tend to fill every field.
  website: z.string().max(0).optional().default(""),
  // Time-trap: ms elapsed between form mount and submit. Bots submit instantly.
  elapsedMs: z.number().int().min(1500).max(1000 * 60 * 60),
});

export const sendContactMessage = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => contactSchema.parse(data))
  .handler(async ({ data }) => {
    // Honeypot/time-trap have already been validated above.
    // Log the inquiry server-side. Wire up email/storage later.
    console.log("[contact] new message", {
      name: data.name,
      email: data.email,
      length: data.message.length,
      elapsedMs: data.elapsedMs,
      at: new Date().toISOString(),
    });
    return { ok: true as const };
  });