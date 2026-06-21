import { z } from 'zod';

import { apiRequest } from '@/lib/api/client';
import { authUserSchema } from '@/lib/types';

const authResponseSchema = z.object({
  accessToken: z.string(),
  user: authUserSchema,
});

const meSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  createdAt: z.string().optional(),
});

export function login(email: string, password: string) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: { email, password },
    schema: authResponseSchema,
    auth: false,
  });
}

export function register(name: string, email: string, password: string) {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: { name, email, password },
    schema: authResponseSchema,
    auth: false,
  });
}

export function fetchMe() {
  return apiRequest('/auth/me', { schema: meSchema });
}
