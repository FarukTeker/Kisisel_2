import { z } from "zod";
import { env } from "@/lib/env";
import { getAuthToken, useAuthStore } from "@/features/auth/store";

/** Error thrown for any non-2xx API response, carrying the parsed message. */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface RequestOptions<TResponse> {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  /** Zod schema used to validate (and type) the JSON response. */
  schema: z.ZodType<TResponse>;
  /** Attach the bearer token. Defaults to true. */
  auth?: boolean;
}

const errorBodySchema = z.object({
  message: z.union([z.string(), z.array(z.string())]).optional(),
});

function extractErrorMessage(status: number, raw: unknown): string {
  const parsed = errorBodySchema.safeParse(raw);
  const message = parsed.success ? parsed.data.message : undefined;
  if (Array.isArray(message)) return message.join(", ");
  if (message) return message;
  return `Request failed with status ${status}`;
}

/**
 * Single typed entry point for talking to the API. Injects the bearer token,
 * parses errors into `ApiError`, and validates the response with a zod schema.
 */
export async function apiRequest<TResponse>(
  path: string,
  { method = "GET", body, schema, auth = true }: RequestOptions<TResponse>,
): Promise<TResponse> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";

  if (auth) {
    const token = getAuthToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${env.NEXT_PUBLIC_API_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = res.status === 204 ? null : await res.json().catch(() => null);

  if (!res.ok) {
    // A 401 means our token is stale — clear it so the UI can react.
    if (res.status === 401) useAuthStore.getState().logout();
    throw new ApiError(res.status, extractErrorMessage(res.status, data));
  }

  return schema.parse(data);
}
