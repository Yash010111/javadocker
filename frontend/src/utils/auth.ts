import type { AuthResponse } from '../types';

const AUTH_KEY = 'stockpulse-auth';

export function saveAuthData(auth: AuthResponse) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
}

export function loadAuthData(): AuthResponse | null {
  const raw = localStorage.getItem(AUTH_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as AuthResponse;
  } catch {
    localStorage.removeItem(AUTH_KEY);
    return null;
  }
}

export function clearAuthData() {
  localStorage.removeItem(AUTH_KEY);
}

export function getAuthToken(): string | null {
  return loadAuthData()?.token ?? null;
}

export function isAdminUser(): boolean {
  const auth = loadAuthData();
  return auth?.roles.some((role) => role === 'ROLE_ADMIN') ?? false;
}
