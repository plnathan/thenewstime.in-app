import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

import {
  clearAuthSession,
  getAccessToken,
  getAuthSession,
  setAuthSession,
} from "@/auth/auth.storage";

import type { AuthApiResponse, AuthTokens, AuthUser } from "@/types/auth.types";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
  headers: {
    Accept: "application/json",
  },
});

/**
 * Separate refresh state prevents multiple simultaneous
 * 401 responses from creating multiple refresh requests.
 */
let refreshPromise: Promise<string | null> | null = null;

interface RefreshResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

/**
 * Attach access token to authenticated requests.
 */
apiClient.interceptors.request.use((config) => {
  const accessToken = getAccessToken();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

/**
 * Refresh the access token using the stored refresh token.
 */
const performTokenRefresh = async (): Promise<string | null> => {
  const session = getAuthSession();

  if (!session?.tokens.refreshToken) {
    return null;
  }

  try {
    /**
     * Use the base Axios instance directly here.
     *
     * We intentionally do NOT use apiClient because apiClient
     * itself has the 401 interceptor.
     */
    const response = await axios.post<AuthApiResponse<RefreshResponse>>(
      `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
      {
        refreshToken: session.tokens.refreshToken,
      },
      {
        timeout: 30000,
        headers: {
          Accept: "application/json",
        },
      },
    );

    const data = response.data.data;

    setAuthSession({
      user: data.user,
      tokens: data.tokens,
    });

    return data.tokens.accessToken;
  } catch (error) {
    clearAuthSession();

    console.error("Authentication refresh failed:", error);

    return null;
  }
};

apiClient.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    /**
     * Keep the existing error logging behavior.
     */
    if (error.response) {
      console.error("API Error:", error.response.data);
    } else {
      console.error("Network Error:", error.message);
    }

    /**
     * No response config means this isn't retryable.
     */
    if (!originalRequest) {
      return Promise.reject(error);
    }

    const requestUrl = originalRequest.url ?? "";

    /**
     * Never attempt token refresh for authentication
     * endpoints themselves.
     *
     * Otherwise a failed login/refresh could cause a loop.
     */
    const isAuthEndpoint =
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/refresh") ||
      requestUrl.includes("/auth/logout");

    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      isAuthEndpoint
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    /**
     * Reuse one refresh request if several API calls
     * receive 401 at approximately the same time.
     */
    if (!refreshPromise) {
      refreshPromise = performTokenRefresh().finally(() => {
        refreshPromise = null;
      });
    }

    const newAccessToken = await refreshPromise;

    if (!newAccessToken) {
      /**
       * The session is no longer valid.
       *
       * Redirect only when the user is actually inside
       * the Admin application.
       */
      if (
        window.location.pathname.startsWith("/admin") &&
        window.location.pathname !== "/admin/login"
      ) {
        window.location.assign(`/admin/login?reason=session-expired`);
      }

      return Promise.reject(error);
    }

    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

    return apiClient.request(originalRequest);
  },
);

export default apiClient;
