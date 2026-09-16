/**
 * -----------------------------------------------------------------------------
 * Project     : thenewstime.in
 * Module      : Authentication Storage
 * -----------------------------------------------------------------------------
 */

import type {
  AuthTokens,
  AuthUser,
} from "@/types/auth.types";

export interface AuthSession {
  user: AuthUser;
  tokens: AuthTokens;
}

const STORAGE_KEY = "thenewstime.auth.session";

export const getAuthSession = (): AuthSession | null => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as AuthSession;

    if (
      !parsed?.user ||
      !parsed?.tokens?.accessToken ||
      !parsed?.tokens?.refreshToken
    ) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return parsed;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

export const setAuthSession = (
  session: AuthSession,
): void => {
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(session),
  );
};

export const updateAuthTokens = (
  tokens: AuthTokens,
): void => {
  const current = getAuthSession();

  if (!current) {
    return;
  }

  setAuthSession({
    ...current,
    tokens,
  });
};

export const clearAuthSession = (): void => {
  window.localStorage.removeItem(STORAGE_KEY);
};

export const getAccessToken = (): string | null => {
  return getAuthSession()?.tokens.accessToken ?? null;
};

export const getRefreshToken = (): string | null => {
  return getAuthSession()?.tokens.refreshToken ?? null;
};