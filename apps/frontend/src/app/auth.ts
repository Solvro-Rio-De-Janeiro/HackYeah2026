export const AUTH_TOKEN_KEY = 'odnowa-auth-token';
export const AUTH_USER_KEY = 'odnowa-user';

let memoryToken: string | null = null;
let memoryUser: unknown = null;

export function getAuthToken(): string | null {
  try {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(AUTH_TOKEN_KEY);
      if (stored !== null) return stored;
    }
  } catch {}
  return memoryToken;
}

export function setAuthToken(token: string | null): void {
  memoryToken = token;
  try {
    if (typeof localStorage !== 'undefined') {
      if (token) {
        localStorage.setItem(AUTH_TOKEN_KEY, token);
      } else {
        localStorage.removeItem(AUTH_TOKEN_KEY);
      }
    }
  } catch {}
}

export function isAuthenticated(): boolean {
  const token = getAuthToken();
  return Boolean(token && token.trim().length > 0);
}

export function clearStoredAuth(): void {
  setAuthToken(null);
  memoryUser = null;
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(AUTH_USER_KEY);
    }
  } catch {}
}

export function getStoredUser<T = unknown>(): T | null {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(AUTH_USER_KEY);
      return raw ? JSON.parse(raw) : null;
    }
  } catch {}
  return (memoryUser as T) ?? null;
}

export function setStoredUser(user: unknown): void {
  memoryUser = user;
  try {
    if (typeof localStorage !== 'undefined') {
      if (user) {
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(AUTH_USER_KEY);
      }
    }
  } catch {}
}
