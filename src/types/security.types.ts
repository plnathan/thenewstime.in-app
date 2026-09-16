export type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "LOCKED";

export type RoleStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

export type PermissionStatus = "ACTIVE" | "INACTIVE";

export interface SecurityRole {
  id: number;
  code: string;
  displayName: string;
  description: string | null;
  displayOrder: number;
  status: RoleStatus;
  createdBy: number | null;
  createdAt: string;
  updatedBy: number | null;
  updatedAt: string;
}

export interface CreateSecurityRoleInput {
  code: string;
  displayName: string;
  description?: string;
  displayOrder?: number;
}

export interface UpdateSecurityRoleInput {
  displayName?: string;
  description?: string;
  displayOrder?: number;
  status?: RoleStatus;
}

export interface SecurityUserRole {
  id: number;
  code: string;
  displayName: string;
  status: RoleStatus;
}

export interface SecurityUser {
  id: number;
  roleId: number | null;
  fullName: string;
  displayName: string;
  username: string;
  email: string | null;
  mobile: string | null;
  profileImageUrl: string | null;
  lastLoginAt: string | null;
  passwordChangedAt: string | null;
  mustChangePassword: boolean;
  passwordExpiresAt: string | null;
  failedLoginCount: number;
  status: UserStatus;
  createdBy: number | null;
  createdAt: string;
  updatedBy: number | null;
  updatedAt: string;
  roles: SecurityUserRole[];
}

export interface SecurityUserListItem extends SecurityUser {
  roles: SecurityUserRole[];
}

export interface CreateSecurityUserInput {
  fullName: string;
  displayName: string;
  username: string;
  email?: string;
  mobile?: string;
  password: string;
  roleIds: number[];
  profileImageUrl?: string;
  mustChangePassword?: boolean;
  passwordExpiresAt?: string;
}

export interface UpdateSecurityUserInput {
  fullName?: string;
  displayName?: string;
  email?: string;
  mobile?: string;
  profileImageUrl?: string;
  status?: UserStatus;
  roleIds?: number[];
  mustChangePassword?: boolean;
  password?: string;
  passwordExpiresAt?: string;
}

/*
 * ---------------------------------------------------------------------------
 * Security Permissions
 * ---------------------------------------------------------------------------
 */

export interface SecurityPermission {
  id: number;
  code: string;
  displayName: string;
  description: string | null;
  module: string | null;
  resource: string | null;
  action: string | null;
  displayOrder: number;
  isSystemPermission: boolean;
  status: PermissionStatus;
  createdBy: number | null;
  createdAt: string;
  updatedBy: number | null;
  updatedAt: string;
}

export interface CreateSecurityPermissionInput {
  code: string;
  displayName: string;
  description?: string;
  module?: string;
  resource?: string;
  action?: string;
  displayOrder?: number;
  isSystemPermission?: boolean;
}

export interface UpdateSecurityPermissionInput {
  displayName?: string;
  description?: string;
  module?: string;
  resource?: string;
  action?: string;
  displayOrder?: number;
  status?: PermissionStatus;
}
