/**
 * -----------------------------------------------------------------------------
 * Project     : thenewstime.in
 * Module      : Authentication Context
 * -----------------------------------------------------------------------------
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  getCurrentUser,
  login as loginApi,
  logout as logoutApi,
} from "@/api/auth.api";

import {
  clearAuthSession,
  getAuthSession,
  setAuthSession,
} from "@/auth/auth.storage";

import {
  hasAllPermissions as hasAllPermissionsUtil,
  hasAnyPermission as hasAnyPermissionUtil,
  hasPermission as hasPermissionUtil,
  hasPermissionCode as hasPermissionCodeUtil,
  hasRole as hasRoleUtil,
} from "@/auth/auth.utils";

import type {
  AuthUser,
  LoginInput,
} from "@/types/auth.types";

/**
 * Permission definition used by the frontend.
 */
export interface PermissionCheck {
  module: string;
  resource: string;
  action: string;
}

/**
 * Authentication context exposed to the application.
 */
interface AuthContextValue {
  user: AuthUser | null;

  isAuthenticated: boolean;

  isLoading: boolean;

  login: (
    input: LoginInput,
  ) => Promise<AuthUser>;

  logout: () => Promise<void>;

  hasRole: (
    roleCode: string,
  ) => boolean;

  hasPermission: (
    module: string,
    resource: string,
    action: string,
  ) => boolean;

  hasPermissionCode: (
    permissionCode: string,
  ) => boolean;

  hasAnyPermission: (
    permissions: PermissionCheck[],
  ) => boolean;

  hasAllPermissions: (
    permissions: PermissionCheck[],
  ) => boolean;
}

const AuthContext =
  createContext<AuthContextValue | undefined>(
    undefined,
  );

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Authentication provider.
 *
 * Responsibilities:
 *
 * - Restore an existing authentication session.
 * - Maintain the current authenticated user.
 * - Login.
 * - Logout.
 * - Expose role checks.
 * - Expose permission checks.
 */
export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] =
    useState<AuthUser | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  /**
   * Restore the authenticated session when
   * the application starts.
   */
  useEffect(() => {
    let mounted = true;

    const restoreSession = async () => {
      const session = getAuthSession();

      if (!session) {
        if (mounted) {
          setUser(null);
          setIsLoading(false);
        }

        return;
      }

      try {
        /**
         * Validate the stored authentication
         * session by requesting the current user.
         *
         * If the access token has expired,
         * axios.ts will attempt to refresh it.
         */
        const currentUser =
          await getCurrentUser();

        if (mounted) {
          /**
           * Keep the latest user information in
           * local storage as well.
           *
           * The existing tokens are preserved.
           */
          setAuthSession({
            user: currentUser,
            tokens: session.tokens,
          });

          setUser(currentUser);
        }
      } catch {
        /**
         * If authentication cannot be restored,
         * remove the invalid local session.
         */
        clearAuthSession();

        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    void restoreSession();

    return () => {
      mounted = false;
    };
  }, []);

  /**
   * Login.
   */
  const login = useCallback(
    async (
      input: LoginInput,
    ): Promise<AuthUser> => {
      const result =
        await loginApi(input);

      setAuthSession({
        user: result.user,
        tokens: result.tokens,
      });

      setUser(result.user);

      return result.user;
    },
    [],
  );

  /**
   * Logout.
   *
   * The local session is always removed,
   * even when the backend logout request fails.
   */
  const logout = useCallback(
    async (): Promise<void> => {
      const session =
        getAuthSession();

      try {
        if (
          session?.tokens.refreshToken
        ) {
          await logoutApi(
            session.tokens.refreshToken,
          );
        }
      } catch (error) {
        console.error(
          "Logout API failed:",
          error,
        );
      } finally {
        clearAuthSession();
        setUser(null);
      }
    },
    [],
  );

  /**
   * Check a role.
   */
  const hasRole = useCallback(
    (roleCode: string): boolean => {
      return hasRoleUtil(
        user,
        roleCode,
      );
    },
    [user],
  );

  /**
   * Check a specific permission.
   */
  const hasPermission = useCallback(
    (
      module: string,
      resource: string,
      action: string,
    ): boolean => {
      return hasPermissionUtil(
        user,
        module,
        resource,
        action,
      );
    },
    [user],
  );

  /**
   * Check a permission by permission code.
   */
  const hasPermissionCode =
    useCallback(
      (
        permissionCode: string,
      ): boolean => {
        return hasPermissionCodeUtil(
          user,
          permissionCode,
        );
      },
      [user],
    );

  /**
   * Check whether at least one permission
   * from the supplied list exists.
   */
  const hasAnyPermission =
    useCallback(
      (
        permissions: PermissionCheck[],
      ): boolean => {
        return hasAnyPermissionUtil(
          user,
          permissions,
        );
      },
      [user],
    );

  /**
   * Check whether all supplied permissions
   * exist.
   */
  const hasAllPermissions =
    useCallback(
      (
        permissions: PermissionCheck[],
      ): boolean => {
        return hasAllPermissionsUtil(
          user,
          permissions,
        );
      },
      [user],
    );

  const value =
    useMemo<AuthContextValue>(
      () => ({
        user,

        isAuthenticated:
          user !== null,

        isLoading,

        login,

        logout,

        hasRole,

        hasPermission,

        hasPermissionCode,

        hasAnyPermission,

        hasAllPermissions,
      }),
      [
        user,
        isLoading,
        login,
        logout,
        hasRole,
        hasPermission,
        hasPermissionCode,
        hasAnyPermission,
        hasAllPermissions,
      ],
    );

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Authentication context hook.
 */
export function useAuth(): AuthContextValue {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider.",
    );
  }

  return context;
}