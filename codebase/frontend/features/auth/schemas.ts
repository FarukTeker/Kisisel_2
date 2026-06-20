import { z } from "zod";

/** Mirrors the user object returned by the NestJS backend. */
export const authUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
});
export type AuthUser = z.infer<typeof authUserSchema>;

/** Shape of POST /auth/register and /auth/login responses. */
export const authResponseSchema = z.object({
  accessToken: z.string(),
  user: authUserSchema,
});
export type AuthResponse = z.infer<typeof authResponseSchema>;

/** GET /auth/me response (no token, includes createdAt). */
export const profileSchema = authUserSchema.extend({
  createdAt: z.string(),
});
export type Profile = z.infer<typeof profileSchema>;

// ---- Form schemas (client-side validation) ----

export const loginSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.email("Enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    repeatPassword: z.string(),
  })
  .refine((data) => data.password === data.repeatPassword, {
    message: "Passwords do not match",
    path: ["repeatPassword"],
  });
export type RegisterInput = z.infer<typeof registerSchema>;
