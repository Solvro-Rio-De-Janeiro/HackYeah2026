const API_URL = import.meta.env.VITE_API_URL || '';

const memoryStore = new Map<string, string>();

function getStorage(): Storage | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
    if (typeof localStorage !== 'undefined' && localStorage) {
      return localStorage;
    }
  } catch {}
  return null;
}

function safeGet(key: string): string | null {
  const s = getStorage();
  if (s) {
    try {
      const val = s.getItem(key);
      if (val !== null) return val;
    } catch {}
  }
  return memoryStore.get(key) ?? null;
}

function safeSet(key: string, value: string): void {
  const s = getStorage();
  if (s) {
    try {
      s.setItem(key, value);
    } catch {}
  }
  memoryStore.set(key, value);
}

function safeRemove(key: string): void {
  const s = getStorage();
  if (s) {
    try {
      s.removeItem(key);
    } catch {}
  }
  memoryStore.delete(key);
}

export function getStoredToken(): string | null {
  return safeGet('odnowa-auth-token');
}

export function setStoredToken(token: string | null): void {
  if (token) {
    safeSet('odnowa-auth-token', token);
  } else {
    safeRemove('odnowa-auth-token');
  }
}

export function isAuthenticated(): boolean {
  const token = getStoredToken();
  return Boolean(token && token.trim().length > 0);
}

export function clearStoredAuth(): void {
  safeRemove('odnowa-auth-token');
  safeRemove('odnowa-user');
}

export function getStoredUser(): CurrentUser | null {
  try {
    const raw = safeGet('odnowa-user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user: CurrentUser | null): void {
  if (user) {
    safeSet('odnowa-user', JSON.stringify(user));
  } else {
    safeRemove('odnowa-user');
  }
}

function authHeaders(): Record<string, string> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface TokenResponse {
  access_token: string;
  token_type?: string;
}

export interface AccountStatusResponse {
  stripe_account_id: string | null;
  details_submitted: boolean;
  transfers_active: boolean;
  requirements_due: string[];
}

export interface OnboardingResponse {
  stripe_account_id: string;
  onboarding_url: string;
}

export interface ApiGroup {
  id: string;
  name: string;
}

export interface ApiUserGroup {
  id: string;
  user_id: string;
  group_id: string;
  completions: boolean[];
  active: boolean;
}

export interface SubscriptionCheckoutResponse {
  subscription_id: string;
  checkout_url: string;
}

export const api = {
  async register(data: { name: string; email: string; password: string }): Promise<TokenResponse> {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || err.message || 'Błąd rejestracji');
    }
    return res.json();
  },

  async login(data: { email: string; password: string }): Promise<TokenResponse> {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('Nieprawidłowy adres e-mail lub hasło.');
      }
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || err.message || 'Błąd logowania');
    }
    return res.json();
  },

  async getMe(): Promise<CurrentUser> {
    const res = await fetch(`${API_URL}/api/auth/me`, {
      headers: authHeaders(),
    });
    if (!res.ok) {
      throw new Error('Nie można pobrać profilu.');
    }
    return res.json();
  },

  async getUserGroups(userId: string): Promise<ApiGroup[]> {
    const res = await fetch(`${API_URL}/api/user-group/user/${userId}`, {
      headers: authHeaders(),
    });
    if (!res.ok) {
      throw new Error('Nie udało się pobrać grup użytkownika.');
    }
    return res.json();
  },

  async createGroup(name: string): Promise<ApiGroup> {
    const res = await fetch(`${API_URL}/api/group`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ name }),
    });
    if (!res.ok) {
      throw new Error('Nie udało się utworzyć grupy.');
    }
    return res.json();
  },

  async addUserToGroup(userId: string, groupId: string): Promise<ApiUserGroup> {
    const res = await fetch(`${API_URL}/api/user-group`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ user_id: userId, group_id: groupId }),
    });
    if (!res.ok) {
      throw new Error('Nie udało się dołączyć do grupy.');
    }
    return res.json();
  },

  async addCompletion(userGroupId: string): Promise<ApiUserGroup> {
    const res = await fetch(`${API_URL}/api/user-group/${userGroupId}/completions`, {
      method: 'POST',
      headers: authHeaders(),
    });
    if (!res.ok) {
      throw new Error('Nie udało się dodać realizacji.');
    }
    return res.json();
  },

  async markCompletion(userGroupId: string, index: number): Promise<ApiUserGroup> {
    const res = await fetch(`${API_URL}/api/user-group/${userGroupId}/completions/${index}`, {
      method: 'PATCH',
      headers: authHeaders(),
    });
    if (!res.ok) {
      throw new Error('Nie udało się oznaczyć realizacji.');
    }
    return res.json();
  },

  async createSubscriptionCheckout(data: {
    goal_id: string;
    user_group_id: string;
    amount_pln: number;
  }): Promise<SubscriptionCheckoutResponse> {
    const res = await fetch(`${API_URL}/api/payments/subscriptions`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Błąd inicjowania płatności Stripe.');
    }
    return res.json();
  },

  async startUserOnboarding(userId: string): Promise<OnboardingResponse> {
    const res = await fetch(`${API_URL}/api/connect/users/${userId}/onboarding`, {
      method: 'POST',
      headers: authHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Nie udało się rozpocząć onboardingu Stripe Connect.');
    }
    return res.json();
  },

  async getUserAccountStatus(userId: string): Promise<AccountStatusResponse> {
    const res = await fetch(`${API_URL}/api/connect/users/${userId}/status`, {
      headers: authHeaders(),
    });
    if (!res.ok) {
      throw new Error('Nie udało się pobrać statusu konta Stripe Connect.');
    }
    return res.json();
  },
};
