import { z } from "zod";

/**
 * Public runtime config. Only `NEXT_PUBLIC_*` vars are available in the browser,
 * so they must be referenced statically (not via a dynamic key) for Next to inline them.
 */
const publicEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.url().default("http://localhost:4000"),
});

export const env = publicEnvSchema.parse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
});
