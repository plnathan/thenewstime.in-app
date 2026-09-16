/**
 * -----------------------------------------------------------------------------
 * Project     : thenewstime.in
 * Module      : Security Roles API
 * -----------------------------------------------------------------------------
 */

import apiClient from "@/api/axios";

import type { AuthApiResponse } from "@/types/auth.types";

import type {
  CreateSecurityRoleInput,
  SecurityRole,
  UpdateSecurityRoleInput,
} from "@/types/security.types";

/**
 * Backend Security Roles endpoint.
 *
 * /api/v1/security/roles
 *
 * apiClient already contains the /api/v1 base URL.
 */
const ROLES_ENDPOINT = "/security/roles";

/**
 * Get all roles.
 *
 * GET /security/roles
 */
export const getSecurityRoles = async (): Promise<SecurityRole[]> => {
  const response =
    await apiClient.get<AuthApiResponse<SecurityRole[]>>(ROLES_ENDPOINT);

  return response.data.data;
};

/**
 * Get a single role.
 *
 * GET /security/roles/:id
 */
export const getSecurityRole = async (id: number): Promise<SecurityRole> => {
  const response = await apiClient.get<AuthApiResponse<SecurityRole>>(
    `${ROLES_ENDPOINT}/${id}`,
  );

  return response.data.data;
};

/**
 * Create a role.
 *
 * POST /security/roles
 */
export const createSecurityRole = async (
  input: CreateSecurityRoleInput,
): Promise<SecurityRole> => {
  const response = await apiClient.post<AuthApiResponse<SecurityRole>>(
    ROLES_ENDPOINT,
    input,
  );

  return response.data.data;
};

/**
 * Update a role.
 *
 * PATCH /security/roles/:id
 */
export const updateSecurityRole = async (
  id: number,
  input: UpdateSecurityRoleInput,
): Promise<SecurityRole> => {
  const response = await apiClient.patch<AuthApiResponse<SecurityRole>>(
    `${ROLES_ENDPOINT}/${id}`,
    input,
  );

  return response.data.data;
};

/**
 * Get roles assigned to a user.
 *
 * GET /security/roles/user/:userId
 */
export const getUserSecurityRoles = async (
  userId: number,
): Promise<SecurityRole[]> => {
  const response = await apiClient.get<AuthApiResponse<SecurityRole[]>>(
    `${ROLES_ENDPOINT}/user/${userId}`,
  );

  return response.data.data;
};

/**
 * Assign a role to a user.
 *
 * POST /security/roles/user/:userId/:roleId
 *
 * The backend uses path parameters.
 * There is intentionally no request body.
 */
export const assignUserSecurityRole = async (
  userId: number,
  roleId: number,
): Promise<void> => {
  await apiClient.post<AuthApiResponse<null>>(
    `${ROLES_ENDPOINT}/user/${userId}/${roleId}`,
  );
};

/**
 * Remove a role from a user.
 *
 * DELETE /security/roles/user/:userId/:roleId
 */
export const removeUserSecurityRole = async (
  userId: number,
  roleId: number,
): Promise<void> => {
  await apiClient.delete<AuthApiResponse<null>>(
    `${ROLES_ENDPOINT}/user/${userId}/${roleId}`,
  );
};
