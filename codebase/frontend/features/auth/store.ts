import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser } from "./schemas";

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  /** Persist a fresh session after login/register. */
  setSession: (token: string, user: AuthUser) => void;
  /** Keep the user object in sync (e.g. after a `/auth/me` refetch). */
  setUser: (user: AuthUser | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setSession: (token, user) => set({ token, user }),
      setUser: (user) => set({ user }),
      logout: () => set({ token: null, user: null }),
    }),
    {
      name: "kisisel-auth",
      // Only persist what we need; everything else is derived.
      partialize: (state) => ({ token: state.token, user: state.user }),
    },
  ),
);

/** Read the current token outside of React (used by the API client). */
export const getAuthToken = () => useAuthStore.getState().token;
