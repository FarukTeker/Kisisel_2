"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store";
import {
  loadDashboard,
  saveDashboard,
  shareDashboard,
  type DashboardState,
} from "./api";

export const dashboardKeys = {
  dashboard: ["dashboard"] as const,
};

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
  return useMutation({
    mutationFn: (state: DashboardState) => saveDashboard(state),
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
