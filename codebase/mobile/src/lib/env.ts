import Constants from 'expo-constants';

/**
 * Resolves the backend base URL. Precedence:
 *  1. EXPO_PUBLIC_API_URL (inlined at build time) — explicit override.
 *  2. expo.extra.apiUrl from app.json — committed default.
 *  3. The Metro/dev host IP (so a physical device or emulator reaches the API
 *     running on the dev machine — `localhost` would point at the device itself).
 *  4. http://localhost:4000 as a last resort.
 */
function resolveApiUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) return fromEnv;

  const fromExtra = (Constants.expoConfig?.extra as { apiUrl?: string } | undefined)?.apiUrl;
  if (fromExtra) return fromExtra;

  const hostUri =
    Constants.expoConfig?.hostUri ?? Constants.expoGoConfig?.debuggerHost ?? undefined;
  const host = hostUri?.split(':')[0];
  if (host) return `http://${host}:4000`;

  return 'http://localhost:4000';
}

export const API_URL = resolveApiUrl();
