/**
 * -----------------------------------------------------------------------------
 * Project     : thenewstime.in
 * Module      : Authentication API
 * -----------------------------------------------------------------------------
 */

import apiClient from "./axios";

import type {
  AuthApiResponse,
  AuthTokens,
  AuthUser,
  LoginInput,
  LoginResult,
} from "@/types/auth.types";

/**
 * Login
 *
 * POST /api/v1/auth/login
 */
export const login = async (input: LoginInput): Promise<LoginResult> => {
  const response = await apiClient.post<AuthApiResponse<LoginResult>>(
    "/auth/login",
    input,
  );

  return response.data.data;
};

/**
 * Get current authenticated user
 *
 * GET /api/v1/auth/me
 */
export const getCurrentUser = async (): Promise<AuthUser> => {
  const response = await apiClient.get<AuthApiResponse<AuthUser>>("/auth/me");

  return response.data.data;
};

/**
 * Refresh access token
 *
 * POST /api/v1/auth/refresh
 */
export const refreshToken = async (
  refreshTokenValue: string,
): Promise<{
  user: AuthUser;
  tokens: AuthTokens;
}> => {
  const response = await apiClient.post<
    AuthApiResponse<{
      user: AuthUser;
      tokens: AuthTokens;
    }>
  >("/auth/refresh", {
    refreshToken: refreshTokenValue,
  });

  return response.data.data;
};

/**
 * Logout
 *
 * POST /api/v1/auth/logout
 */
export const logout = async (refreshTokenValue: string): Promise<void> => {
  await apiClient.post<AuthApiResponse<null>>("/auth/logout", {
    refreshToken: refreshTokenValue,
  });
};
