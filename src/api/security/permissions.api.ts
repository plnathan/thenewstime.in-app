/**
 * -----------------------------------------------------------------------------
 * Project     : thenewstime.in
 * Module      : Security Permissions API
 * -----------------------------------------------------------------------------
 */

import apiClient from "@/api/axios";

import type { AuthApiResponse } from "@/types/auth.types";

import type {
  CreateSecurityPermissionInput,
  SecurityPermission,
  UpdateSecurityPermissionInput,
} from "@/types/security.types";

/**
 * Backend Security Permissions endpoint.
 *
 * /api/v1/security/permissions
 *
 * apiClient already contains the /api/v1 base URL.
 */
const PERMISSIONS_ENDPOINT = "/security/permissions";

/**
 * Get all permissions.
 *
 * GET /security/permissions
 */
export const getSecurityPermissions = async (): Promise<
  SecurityPermission[]
> => {
  const response =
    await apiClient.get<AuthApiResponse<SecurityPermission[]>>(
      PERMISSIONS_ENDPOINT,
    );

  return response.data.data;
};

/**
 * Get a single permission.
 *
 * GET /security/permissions/:id
 */
export const getSecurityPermission = async (
  id: number,
): Promise<SecurityPermission> => {
  const response = await apiClient.get<AuthApiResponse<SecurityPermission>>(
    `${PERMISSIONS_ENDPOINT}/${id}`,
  );

  return response.data.data;
};

/**
 * Create a permission.
 *
 * POST /security/permissions
 */
export const createSecurityPermission = async (
  input: CreateSecurityPermissionInput,
): Promise<SecurityPermission> => {
  const response = await apiClient.post<AuthApiResponse<SecurityPermission>>(
    PERMISSIONS_ENDPOINT,
    input,
  );

  return response.data.data;
};

/**
 * Update a permission.
 *
 * PATCH /security/permissions/:id
 */
export const updateSecurityPermission = async (
  id: number,
  input: UpdateSecurityPermissionInput,
): Promise<SecurityPermission> => {
  const response = await apiClient.patch<AuthApiResponse<SecurityPermission>>(
    `${PERMISSIONS_ENDPOINT}/${id}`,
    input,
  );

  return response.data.data;
};

/**
 * Get permissions assigned to a role.
 *
 * GET /security/permissions/role/:roleId
 */
export const getRoleSecurityPermissions = async (
  roleId: number,
): Promise<SecurityPermission[]> => {
  const response = await apiClient.get<AuthApiResponse<SecurityPermission[]>>(
    `${PERMISSIONS_ENDPOINT}/role/${roleId}`,
  );

  return response.data.data;
};

/**
 * Assign a permission to a role.
 *
 * POST /security/permissions/role/:roleId/:permissionId
 *
 * The backend uses path parameters.
 * There is intentionally no request body.
 */
export const assignSecurityPermissionToRole = async (
  roleId: number,
  permissionId: number,
): Promise<void> => {
  await apiClient.post<AuthApiResponse<null>>(
    `${PERMISSIONS_ENDPOINT}/role/${roleId}/${permissionId}`,
  );
};

/**
 * Remove a permission from a role.
 *
 * DELETE /security/permissions/role/:roleId/:permissionId
 */
export const removeSecurityPermissionFromRole = async (
  roleId: number,
  permissionId: number,
): Promise<void> => {
  await apiClient.delete<AuthApiResponse<null>>(
    `${PERMISSIONS_ENDPOINT}/role/${roleId}/${permissionId}`,
  );
};
