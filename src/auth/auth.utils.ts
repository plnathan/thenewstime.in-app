/**
 * -----------------------------------------------------------------------------
 * Project     : thenewstime.in
 * Module      : Authentication Utilities
 * -----------------------------------------------------------------------------
 */

import type {
  AuthPermission,
  AuthRole,
  AuthUser,
} from "@/types/auth.types";

/**
 * Normalize a security value for comparison.
 *
 * The backend authorization layer treats
 * module/resource/action values case-insensitively.
 */
const normalizeSecurityValue = (
  value: string,
): string => {
  return value.trim().toUpperCase();
};

/**
 * Check whether a user has a particular role.
 */
export function hasRole(
  user: AuthUser | null,
  roleCode: string,
): boolean {
  if (!user || !roleCode.trim()) {
    return false;
  }

  const normalizedRole =
    normalizeSecurityValue(roleCode);

  return user.roles.some(
    (role: AuthRole) =>
      normalizeSecurityValue(role.code) ===
      normalizedRole,
  );
}

/**
 * Check whether the user is an administrator.
 *
 * ADMIN and SUPER_ADMIN are both treated as
 * administrator roles.
 */
export function isAdminUser(
  user: AuthUser | null,
): boolean {
  return (
    hasRole(user, "ADMIN") ||
    hasRole(user, "SUPER_ADMIN")
  );
}

/**
 * Check whether the user is a Reporter.
 */
export function isReporterUser(
  user: AuthUser | null,
): boolean {
  return hasRole(user, "REPORTER");
}

/**
 * Check whether a user has a specific permission.
 *
 * Permission is identified by:
 *
 * module + resource + action
 *
 * Example:
 *
 * SECURITY + USER + VIEW
 */
export function hasPermission(
  user: AuthUser | null,
  module: string,
  resource: string,
  action: string,
): boolean {
  if (
    !user ||
    !module.trim() ||
    !resource.trim() ||
    !action.trim()
  ) {
    return false;
  }

  const normalizedModule =
    normalizeSecurityValue(module);

  const normalizedResource =
    normalizeSecurityValue(resource);

  const normalizedAction =
    normalizeSecurityValue(action);

  return user.permissions.some(
    (permission: AuthPermission) =>
      permission.module !== null &&
      permission.resource !== null &&
      permission.action !== null &&
      normalizeSecurityValue(
        permission.module,
      ) === normalizedModule &&
      normalizeSecurityValue(
        permission.resource,
      ) === normalizedResource &&
      normalizeSecurityValue(
        permission.action,
      ) === normalizedAction,
  );
}

/**
 * Check whether the user has at least one
 * permission from the supplied list.
 */
export function hasAnyPermission(
  user: AuthUser | null,
  permissions: Array<{
    module: string;
    resource: string;
    action: string;
  }>,
): boolean {
  if (!user || permissions.length === 0) {
    return false;
  }

  return permissions.some(
    (permission) =>
      hasPermission(
        user,
        permission.module,
        permission.resource,
        permission.action,
      ),
  );
}

/**
 * Check whether the user has every permission
 * from the supplied list.
 */
export function hasAllPermissions(
  user: AuthUser | null,
  permissions: Array<{
    module: string;
    resource: string;
    action: string;
  }>,
): boolean {
  if (!user || permissions.length === 0) {
    return false;
  }

  return permissions.every(
    (permission) =>
      hasPermission(
        user,
        permission.module,
        permission.resource,
        permission.action,
      ),
  );
}

/**
 * Check whether the user has a permission by
 * permission code.
 *
 * Example:
 *
 * SECURITY.USER.VIEW
 *
 * This is useful for UI code where a single
 * permission identifier is more convenient.
 */
export function hasPermissionCode(
  user: AuthUser | null,
  permissionCode: string,
): boolean {
  if (!user || !permissionCode.trim()) {
    return false;
  }

  const normalizedCode =
    normalizeSecurityValue(permissionCode);

  return user.permissions.some(
    (permission: AuthPermission) =>
      normalizeSecurityValue(
        permission.code,
      ) === normalizedCode,
  );
}