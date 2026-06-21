import { z } from "zod";
import { apiRequest } from "@/lib/api/client";
import {
  authResponseSchema,
  profileSchema,
  type AuthResponse,
  type LoginInput,
  type Profile,
  type RegisterInput,
} from "./schemas";

export function registerRequest(input: RegisterInput): Promise<AuthResponse> {
  const { name, email, password } = input;
  return apiRequest("/auth/register", {
    method: "POST",
    body: { name, email, password },
    schema: authResponseSchema,
    auth: false,
  });
}

export function loginRequest(input: LoginInput): Promise<AuthResponse> {
  return apiRequest("/auth/login", {
    method: "POST",
    body: input,
    schema: authResponseSchema,
    auth: false,
  });
}

/** Step 1: confirm the email has an account (no email is sent). */
export function forgotPasswordRequest(email: string): Promise<{ ok: boolean }> {
  return apiRequest("/auth/forgot-password", {
    method: "POST",
    body: { email },
    schema: z.object({ ok: z.boolean() }),
    auth: false,
  });
}

/** Step 2: set a new password and receive a fresh session. */
export function resetPasswordRequest(
  email: string,
  password: string,
): Promise<AuthResponse> {
  return apiRequest("/auth/reset-password", {
    method: "POST",
    body: { email, password },
    schema: authResponseSchema,
    auth: false,
  });
}

export function fetchProfile(): Promise<Profile> {
  return apiRequest("/auth/me", { schema: profileSchema });
}
