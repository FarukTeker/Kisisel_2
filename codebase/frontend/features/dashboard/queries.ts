"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store";
import {
  fetchDiscover,
  loadDashboard,
  saveDashboard,
  shareDashboard,
  type DashboardState,
} from "./api";

export const dashboardKeys = {
  dashboard: ["dashboard"] as const,
  discover: ["discover"] as const,
};

export function useDiscover() {
  return useQuery({
    queryKey: dashboardKeys.discover,
    queryFn: fetchDiscover,
    staleTime: 60 * 1000,
  });
}

export function useDashboard() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: dashboardKeys.dashboard,
    queryFn: loadDashboard,
    enabled: Boolean(token),
    staleTime: Infinity, // local edits are the source of truth after load
  });
}

export function useSaveDashboard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (state: DashboardState) => saveDashboard(state),
    // Keep the dashboard cache in sync with what we just saved, so navigating
    // away and back (which remounts and re-hydrates from cache) reflects edits.
    onSuccess: (_data, state) => {
      queryClient.setQueryData(dashboardKeys.dashboard, state);
    },
  });
}

export function useShareDashboard() {
  return useMutation({
    mutationFn: ({
      state,
      name,
      description,
    }: {
      state: DashboardState;
      name: string;
      description: string;
    }) => shareDashboard(state, name, description),
  });
}
