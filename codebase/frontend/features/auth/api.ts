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

export function fetchProfile(): Promise<Profile> {
  return apiRequest("/auth/me", { schema: profileSchema });
}
