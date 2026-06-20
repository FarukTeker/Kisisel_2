import * as SecureStore from 'expo-secure-store';
import { useSyncExternalStore } from 'react';

import { fetchMe, login as loginRequest, register as registerRequest } from '@/lib/api/auth';
import type { AuthUser } from '@/lib/types';

const TOKEN_KEY = 'kisisel.token';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  status: AuthStatus;
}

let state: AuthState = { token: null, user: null, status: 'loading' };
const listeners = new Set<() => void>();

function setState(patch: Partial<AuthState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

/** Synchronous token access for the API client (no React, no await). */
export function getAuthToken(): string | null {
  return state.token;
}

async function persistToken(token: string | null) {
  if (token) await SecureStore.setItemAsync(TOKEN_KEY, token);
  else await SecureStore.deleteItemAsync(TOKEN_KEY);
}

/** Read the saved token on startup and validate it against /auth/me. */
export async function hydrateAuth(): Promise<void> {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  if (!token) {
    setState({ status: 'unauthenticated' });
    return;
  }
  setState({ token });
  try {
    const me = await fetchMe();
    setState({ user: { id: me.id, name: me.name, email: me.email }, status: 'authenticated' });
  } catch {
    await signOut();
  }
}

export async function signIn(email: string, password: string): Promise<void> {
  const { accessToken, user } = await loginRequest(email, password);
  await persistToken(accessToken);
  setState({ token: accessToken, user, status: 'authenticated' });
}

export async function signUp(name: string, email: string, password: string): Promise<void> {
  const { accessToken, user } = await registerRequest(name, email, password);
  await persistToken(accessToken);
  setState({ token: accessToken, user, status: 'authenticated' });
}

export async function signOut(): Promise<void> {
  await persistToken(null);
  setState({ token: null, user: null, status: 'unauthenticated' });
}

/** Called by the API client when a request returns 401. */
export async function handleUnauthorized(): Promise<void> {
  await signOut();
}

export function useAuth(): AuthState {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
    () => state,
  );
}
