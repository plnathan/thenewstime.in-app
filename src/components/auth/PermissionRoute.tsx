/**
 * -----------------------------------------------------------------------------
 * Project     : thenewstime.in
 * Module      : Permission Protected Route
 * -----------------------------------------------------------------------------
 */

import type { ReactNode } from "react";
import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "@/auth/AuthContext";

/**
 * Permission definition.
 */
export interface RoutePermission {
    module: string;
    resource: string;
    action: string;
}

/**
 * Props for PermissionRoute.
 *
 * If permissionCode is supplied, it is checked directly.
 *
 * If permissions are supplied:
 *
 * - match="any" → at least one permission is required.
 * - match="all" → every permission is required.
 */
interface PermissionRouteProps {
    permissionCode?: string;

    permissions?: RoutePermission[];

    match?: "any" | "all";

    children?: ReactNode;
}

/**
 * Permission-protected route.
 *
 * Authentication must already be handled by
 * ProtectedRoute.
 *
 * Unauthorized users are redirected to:
 *
 * /admin/access-denied
 */
export default function PermissionRoute({
    permissionCode,
    permissions = [],
    match = "any",
    children,
}: PermissionRouteProps) {
    const {
        isAuthenticated,
        isLoading,
        hasPermissionCode,
        hasAnyPermission,
        hasAllPermissions,
    } = useAuth();

    /**
     * Wait until authentication state has been
     * restored before checking authorization.
     */
    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
                <div className="text-center">
                    <div
                        className="
              mx-auto
              mb-4
              h-8
              w-8
              animate-spin
              rounded-full
              border-2
              border-gray-200
              border-t-green-700
            "
                        aria-hidden="true"
                    />

                    <p className="text-sm text-gray-500">
                        Checking access...
                    </p>
                </div>
            </div>
        );
    }

    /**
     * PermissionRoute should normally be nested
     * inside ProtectedRoute.
     *
     * Keep this guard here as a safety net so the
     * component remains safe when reused elsewhere.
     */
    if (!isAuthenticated) {
        return (
            <Navigate
                to="/admin/login"
                replace
            />
        );
    }

    let hasAccess = false;

    /**
     * Direct permission-code check.
     *
     * Example:
     *
     * users.read
     */
    if (permissionCode?.trim()) {
        hasAccess =
            hasPermissionCode(
                permissionCode,
            );
    } else if (permissions.length > 0) {
        /**
         * Structured module/resource/action check.
         */
        hasAccess =
            match === "all"
                ? hasAllPermissions(
                    permissions,
                )
                : hasAnyPermission(
                    permissions,
                );
    }

    /**
     * No permission definition means the route
     * configuration is incomplete.
     *
     * Fail closed rather than accidentally exposing
     * a protected route.
     */
    if (
        !permissionCode?.trim() &&
        permissions.length === 0
    ) {
        hasAccess = false;
    }

    if (!hasAccess) {
        return (
            <Navigate
                to="/admin/access-denied"
                replace
            />
        );
    }

    /**
     * Support both:
     *
     * <PermissionRoute>...</PermissionRoute>
     *
     * and nested route usage:
     *
     * <Route element={<PermissionRoute />}>
     *   ...
     * </Route>
     */
    if (children) {
        return <>{children}</>;
    }

    return <Outlet />;
}