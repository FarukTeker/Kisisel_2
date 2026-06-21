import { z } from 'zod';

import { apiRequest } from '@/lib/api/client';
import { discoverItemSchema, sharedNewspaperSchema, widgetSchema } from '@/lib/types';
import type { ReadingMode } from '@/features/store/types';

const discoverSchema = z.object({ newspapers: z.array(discoverItemSchema) });
const sharedSchema = z.object({ newspaper: sharedNewspaperSchema });

const dashboardNewspaperSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  readingMode: z.string().optional(),
  widgets: z.array(widgetSchema),
});
const dashboardSchema = z.object({ newspaper: dashboardNewspaperSchema });

export function fetchDiscover() {
  return apiRequest('/newspapers/discover', { schema: discoverSchema, auth: false }).then(
    (r) => r.newspapers,
  );
}

export function fetchSharedNewspaper(slug: string) {
  return apiRequest(`/newspapers/shared/${slug}`, { schema: sharedSchema, auth: false }).then(
    (r) => r.newspaper,
  );
}

export function fetchDashboard() {
  return apiRequest('/newspapers/dashboard', { schema: dashboardSchema }).then((r) => r.newspaper);
}

export interface SaveDashboardPayload {
  widgets: Record<string, unknown>[];
  readingMode?: ReadingMode;
}

export function saveDashboard(payload: SaveDashboardPayload) {
  return apiRequest('/newspapers/dashboard', {
    method: 'POST',
    body: payload,
    schema: dashboardSchema,
  });
}

export interface ShareDashboardPayload extends SaveDashboardPayload {
  name?: string;
  description?: string;
}

export function shareDashboard(payload: ShareDashboardPayload) {
  return apiRequest('/newspapers/share', {
    method: 'POST',
    body: payload,
    schema: z.object({ slug: z.string() }),
  });
}
