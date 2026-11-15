import { useSyncExternalStore } from "react";

export const AUTH_STORAGE_KEY = "kanban_token";
export const USER_STORAGE_KEY = "kanban_user";

export interface AuthUser {
  username: string;
}

export interface LoginResult {
  success: boolean;
  token?: string;
  user?: AuthUser;
  error?: string;
}

export const VALID_CREDENTIALS = {
  username: "user",
  password: "password",
};

let listeners: Array<() => void> = [];

function notifyListeners(): void {
  for (const listener of listeners) {
    listener();
  }
}

/**
 * Validates credentials and generates a session token for valid user.
 */
export function authenticateUser(username: string, password: string): LoginResult {
  const cleanUsername = username.trim();
  const cleanPassword = password.trim();

  if (
    cleanUsername === VALID_CREDENTIALS.username &&
    cleanPassword === VALID_CREDENTIALS.password
  ) {
    const token = `token-${cleanUsername}-${Date.now()}`;
    return {
      success: true,
      token,
      user: { username: cleanUsername },
    };
  }

  return {
    success: false,
    error: "invalid_credentials",
  };
}

/**
 * Stores the authentication token and user in localStorage.
 */
export function saveAuthSession(token: string, user: AuthUser): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    notifyListeners();
  } catch {
    // Ignore storage errors in restricted contexts
  }
}

/**
 * Retrieves the stored token if present.
 */
export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(AUTH_STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * Retrieves the stored user if present.
 */
export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

/**
 * Clears the stored session on logout.
 */
export function clearAuthSession(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    notifyListeners();
  } catch {
    // Ignore storage errors
  }
}

/**
 * Checks whether an active valid session exists.
 */
export function isAuthenticatedSession(): boolean {
  const token = getStoredToken();
  return Boolean(token && token.startsWith("token-"));
}

function subscribeAuth(callback: () => void): () => void {
  listeners.push(callback);
  if (typeof window !== "undefined") {
    window.addEventListener("storage", callback);
  }
  return () => {
    listeners = listeners.filter((l) => l !== callback);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", callback);
    }
  };
}

function getAuthSnapshot(): string | null {
  return getStoredToken();
}

function getServerAuthSnapshot(): string | null {
  return null;
}

/**
 * React hook using useSyncExternalStore to subscribe to auth state changes cleanly.
 */
export function useAuthSession(): {
  isAuthenticated: boolean;
  user: AuthUser | null;
  logout: () => void;
} {
  const token = useSyncExternalStore(subscribeAuth, getAuthSnapshot, getServerAuthSnapshot);
  const isAuthenticated = Boolean(token && token.startsWith("token-"));
  const user = isAuthenticated ? getStoredUser() || { username: "user" } : null;

  return {
    isAuthenticated,
    user,
    logout: clearAuthSession,
  };
}
