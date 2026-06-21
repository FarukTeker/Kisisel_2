"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchProfile,
  forgotPasswordRequest,
  loginRequest,
  registerRequest,
  resetPasswordRequest,
} from "./api";
import { useAuthStore } from "./store";
import type { AuthResponse } from "./schemas";

export const authKeys = {
  me: ["auth", "me"] as const,
};

/** Verifies the persisted token against the backend and keeps the user fresh. */
export function useProfile() {
  const token = useAuthStore((s) => s.token);
  const setUser = useAuthStore((s) => s.setUser);

  return useQuery({
    queryKey: authKeys.me,
    queryFn: async () => {
      const profile = await fetchProfile();
      setUser({ id: profile.id, name: profile.name, email: profile.email });
      return profile;
    },
    enabled: Boolean(token),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

function useAuthSuccess() {
  const setSession = useAuthStore((s) => s.setSession);
  const queryClient = useQueryClient();
  return (data: AuthResponse) => {
    setSession(data.accessToken, data.user);
    queryClient.invalidateQueries({ queryKey: authKeys.me });
  };
}

export function useLogin() {
  const onAuthSuccess = useAuthSuccess();
  return useMutation({
    mutationFn: loginRequest,
    onSuccess: onAuthSuccess,
  });
}

export function useRegister() {
  const onAuthSuccess = useAuthSuccess();
  return useMutation({
    mutationFn: registerRequest,
    onSuccess: onAuthSuccess,
  });
}

export function useForgotPassword() {
  return useMutation({ mutationFn: forgotPasswordRequest });
}

export function useResetPassword() {
  const onAuthSuccess = useAuthSuccess();
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      resetPasswordRequest(email, password),
    onSuccess: onAuthSuccess,
  });
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout);
  const queryClient = useQueryClient();
  return () => {
    logout();
    queryClient.removeQueries({ queryKey: authKeys.me });
  };
}
