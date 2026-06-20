const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface PrototypeUser {
  id: string;
  name: string;
  email: string;
  role: 'reader' | 'curator' | 'commentator';
}

export async function getCurrentUser(): Promise<PrototypeUser | null> {
  try {
    const res = await fetch(`${API_BASE}/auth/me`, { credentials: 'include' });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user as PrototypeUser;
  } catch {
    return null;
  }
}

export async function loginUser(email: string, password: string): Promise<PrototypeUser | null> {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user as PrototypeUser;
  } catch {
    return null;
  }
}

export async function registerUser(name: string, email: string, password: string): Promise<{ user?: PrototypeUser; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
      credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error || 'Registration failed' };
    return { user: data.user as PrototypeUser };
  } catch (err) {
    return { error: 'Network error' };
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await fetch(`${API_BASE}/auth/logout`, { method: 'POST', credentials: 'include' });
  } catch {}
}

export function initializePrototypeState() {
  // Deprecated - no longer needed for localStorage setup
}

export function isFollowingSlug(slug: string) {
  // Deprecated stub
  return false;
}

export function toggleFollowSlug(slug: string) {
  // Deprecated stub
  return null;
}
