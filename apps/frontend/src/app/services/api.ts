import {
  clearStoredAuth as clearAuthSession,
  getAuthToken,
  getStoredUser as readStoredUser,
  setAuthToken,
  setStoredUser as writeStoredUser,
} from "../auth";

const API_URL = import.meta.env.VITE_API_URL || "";

export function getStoredToken(): string | null {
  return getAuthToken();
}

export function setStoredToken(token: string | null): void {
  setAuthToken(token);
}

export function clearStoredAuth(): void {
  clearAuthSession();
}

export function getStoredUser(): CurrentUser | null {
  return readStoredUser<CurrentUser>();
}

export function setStoredUser(user: CurrentUser | null): void {
  writeStoredUser(user);
}

function authHeaders(): Record<string, string> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export class UnauthorizedError extends Error {
  constructor() {
    super("Sesja wygasła. Zaloguj się ponownie.");
    this.name = "UnauthorizedError";
  }
}

export async function fetchMe(): Promise<CurrentUser> {
  const res = await fetch(`${API_URL}/api/auth/me`, {
    headers: authHeaders(),
  });
  if (res.status === 401 || res.status === 403) {
    throw new UnauthorizedError();
  }
  if (!res.ok) {
    throw new Error("Nie można pobrać profilu");
  }
  return res.json();
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

async function getApiError(response: Response, fallback: string): Promise<string> {
  try {
    const body = await response.json();
    return body.detail || body.message || fallback;
  } catch {
    return fallback;
  }
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
  async register(data: {
    name: string;
    email: string;
    password: string;
  }): Promise<TokenResponse> {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || err.message || "Błąd rejestracji");
    }
    return res.json();
  },

  async login(data: {
    email: string;
    password: string;
  }): Promise<TokenResponse> {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      if (res.status === 401) {
        throw new Error("Nieprawidłowy adres e-mail lub hasło.");
      }
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || err.message || "Błąd logowania");
    }
    return res.json();
  },

  async getUserGroups(userId: string): Promise<ApiGroup[]> {
    const res = await fetch(`${API_URL}/api/user-group/user/${userId}`, {
      headers: authHeaders(),
    });
    if (!res.ok) {
      throw new Error(
        await getApiError(res, "Nie udało się pobrać grup użytkownika."),
      );
    }
    return res.json();
  },

  async getGroup(groupId: string): Promise<ApiGroup> {
    const res = await fetch(`${API_URL}/api/group/${groupId}`, {
      headers: authHeaders(),
    });
    if (!res.ok) {
      throw new Error(await getApiError(res, "Nie znaleziono takiej grupy."));
    }
    return res.json();
  },

  async createGroup(name: string): Promise<ApiGroup> {
    const res = await fetch(`${API_URL}/api/group`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ name }),
    });
    if (!res.ok) {
      throw new Error(await getApiError(res, "Nie udało się utworzyć grupy."));
    }
    return res.json();
  },

  async addUserToGroup(userId: string, groupId: string): Promise<ApiUserGroup> {
    const res = await fetch(`${API_URL}/api/user-group`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ user_id: userId, group_id: groupId }),
    });
    if (!res.ok) {
      throw new Error(await getApiError(res, "Nie udało się dołączyć do grupy."));
    }
    return res.json();
  },

  async addCompletion(userGroupId: string): Promise<ApiUserGroup> {
    const res = await fetch(
      `${API_URL}/api/user-group/${userGroupId}/completions`,
      {
        method: "POST",
        headers: authHeaders(),
      },
    );
    if (!res.ok) {
      throw new Error("Nie udało się dodać realizacji.");
    }
    return res.json();
  },

  async markCompletion(
    userGroupId: string,
    index: number,
  ): Promise<ApiUserGroup> {
    const res = await fetch(
      `${API_URL}/api/user-group/${userGroupId}/completions/${index}`,
      {
        method: "PATCH",
        headers: authHeaders(),
      },
    );
    if (!res.ok) {
      throw new Error("Nie udało się oznaczyć realizacji.");
    }
    return res.json();
  },

  async createSubscriptionCheckout(data: {
    goal_id: string;
    user_group_id: string;
    amount_pln: number;
  }): Promise<SubscriptionCheckoutResponse> {
    const res = await fetch(`${API_URL}/api/payments/subscriptions`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Błąd inicjowania płatności Stripe.");
    }
    return res.json();
  },

  async startUserOnboarding(userId: string): Promise<OnboardingResponse> {
    console.log("AAAAAAA");
    const res = await fetch(
      `${API_URL}/api/connect/users/${userId}/onboarding`,
      {
        method: "POST",
        headers: authHeaders(),
      },
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(
        err.detail || "Nie udało się rozpocząć onboardingu Stripe Connect.",
      );
    }
    return res.json();
  },

  async getUserAccountStatus(userId: string): Promise<AccountStatusResponse> {
    const res = await fetch(`${API_URL}/api/connect/users/${userId}/status`, {
      headers: authHeaders(),
    });
    if (!res.ok) {
      throw new Error("Nie udało się pobrać statusu konta Stripe Connect.");
    }
    return res.json();
  },
};
