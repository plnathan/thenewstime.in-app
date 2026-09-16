/**
 * -----------------------------------------------------------------------------
 * Project     : thenewstime.in
 * Module      : Protected Admin Route
 * -----------------------------------------------------------------------------
 */

import {
    Navigate,
    Outlet,
    useLocation,
} from "react-router-dom";

import { useAuth } from "@/auth/AuthContext";

export default function ProtectedRoute() {
    const {
        isAuthenticated,
        isLoading,
    } = useAuth();

    const location =
        useLocation();

    /**
     * Wait until the stored session has been
     * checked before deciding where to redirect.
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
                        Checking authentication...
                    </p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <Navigate
                to="/admin/login"
                replace
                state={{
                    from: location,
                }}
            />
        );
    }

    return <Outlet />;
}