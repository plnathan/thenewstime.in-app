/**
 * -----------------------------------------------------------------------------
 * Project     : thenewstime.in
 * Page        : SecurityRolesPage
 * Path        : src/pages/Security/Roles/SecurityRolesPage.tsx
 * -----------------------------------------------------------------------------
 */

import {
    Edit,
    KeyRound,
    Plus,
    ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import { getSecurityRoles } from "@/api/security/roles.api";
import MainLayout from "@/layouts/MainLayout";
import { useAuth } from "@/auth/AuthContext";
import type { SecurityRole } from "@/types/security.types";

const SecurityRolesPage = () => {
    const { hasPermissionCode } = useAuth();

    const [roles, setRoles] = useState<SecurityRole[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const canCreate = hasPermissionCode("roles.create");
    const canUpdate = hasPermissionCode("roles.update");
    const canAssign = hasPermissionCode("roles.assign");

    useEffect(() => {
        let mounted = true;

        const loadRoles = async () => {
            try {
                setLoading(true);
                setErrorMessage("");

                const data = await getSecurityRoles();

                if (mounted) {
                    setRoles(data);
                }
            } catch (error) {
                console.error(
                    "Failed to load security roles:",
                    error,
                );

                if (mounted) {
                    setErrorMessage(
                        "Unable to load roles. Please try again.",
                    );
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        void loadRoles();

        return () => {
            mounted = false;
        };
    }, []);

    return (
        <MainLayout>
            <div className="mx-auto w-full max-w-6xl">
                {/* Page Header */}
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <ShieldCheck
                                className="h-5 w-5 text-green-600"
                                aria-hidden="true"
                            />

                            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
                                Security Roles
                            </h1>
                        </div>

                        <p className="mt-1 text-sm text-gray-600">
                            Manage security roles and their status.
                        </p>
                    </div>

                    {canCreate && (
                        <Link
                            to="/admin/security/roles/create"
                            className="inline-flex items-center justify-center gap-2 self-start rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 sm:self-auto"
                        >
                            <Plus
                                className="h-4 w-4"
                                aria-hidden="true"
                            />
                            Add Role
                        </Link>
                    )}
                </div>

                {/* Error */}
                {errorMessage && (
                    <div className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {errorMessage}
                    </div>
                )}

                {/* Loading */}
                {loading ? (
                    <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
                        <p className="text-sm text-gray-500">
                            Loading roles...
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm md:block">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th
                                                scope="col"
                                                className="w-12 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600"
                                            >
                                                #
                                            </th>

                                            <th
                                                scope="col"
                                                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600"
                                            >
                                                Role
                                            </th>

                                            <th
                                                scope="col"
                                                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600"
                                            >
                                                Code
                                            </th>

                                            <th
                                                scope="col"
                                                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600"
                                            >
                                                Description
                                            </th>

                                            <th
                                                scope="col"
                                                className="w-24 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-600"
                                            >
                                                Order
                                            </th>

                                            <th
                                                scope="col"
                                                className="w-28 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-600"
                                            >
                                                Status
                                            </th>

                                            {(canUpdate || canAssign) && (
                                                <th
                                                    scope="col"
                                                    className="w-56 px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-600"
                                                >
                                                    Actions
                                                </th>
                                            )}
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-gray-200">
                                        {roles.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={
                                                        canUpdate ||
                                                            canAssign
                                                            ? 7
                                                            : 6
                                                    }
                                                    className="px-4 py-8 text-center text-sm text-gray-500"
                                                >
                                                    No roles found.
                                                </td>
                                            </tr>
                                        ) : (
                                            roles.map(
                                                (
                                                    role,
                                                    index,
                                                ) => (
                                                    <tr
                                                        key={
                                                            role.id
                                                        }
                                                        className="hover:bg-gray-50"
                                                    >
                                                        <td className="px-4 py-3 text-sm text-gray-500">
                                                            {
                                                                index +
                                                                1
                                                            }
                                                        </td>

                                                        <td className="px-4 py-3">
                                                            <div className="font-medium text-gray-900">
                                                                {
                                                                    role.displayName
                                                                }
                                                            </div>
                                                        </td>

                                                        <td className="px-4 py-3">
                                                            <span className="inline-flex rounded bg-gray-100 px-2 py-1 font-mono text-xs text-gray-700">
                                                                {
                                                                    role.code
                                                                }
                                                            </span>
                                                        </td>

                                                        <td className="max-w-sm px-4 py-3 text-sm text-gray-600">
                                                            <div className="line-clamp-2">
                                                                {
                                                                    role.description ||
                                                                    "—"
                                                                }
                                                            </div>
                                                        </td>

                                                        <td className="px-4 py-3 text-center text-sm text-gray-600">
                                                            {
                                                                role.displayOrder
                                                            }
                                                        </td>

                                                        <td className="px-4 py-3 text-center">
                                                            <span
                                                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${role.status ===
                                                                    "ACTIVE"
                                                                    ? "bg-green-100 text-green-700"
                                                                    : role.status ===
                                                                        "SUSPENDED"
                                                                        ? "bg-yellow-100 text-yellow-700"
                                                                        : "bg-gray-100 text-gray-700"
                                                                    }`}
                                                            >
                                                                {
                                                                    role.status
                                                                }
                                                            </span>
                                                        </td>

                                                        {(canUpdate ||
                                                            canAssign) && (
                                                                <td className="px-4 py-3">
                                                                    <div className="flex flex-wrap items-center justify-end gap-2">
                                                                        {canAssign && (
                                                                            <Link
                                                                                to={`/admin/security/roles/${role.id}/permissions`}
                                                                                className="inline-flex items-center gap-1 rounded-md border border-green-300 px-3 py-1.5 text-sm font-medium text-green-700 transition hover:bg-green-50"
                                                                            >
                                                                                <KeyRound
                                                                                    className="h-4 w-4"
                                                                                    aria-hidden="true"
                                                                                />
                                                                                Permissions
                                                                            </Link>
                                                                        )}

                                                                        {canUpdate && (
                                                                            <Link
                                                                                to={`/admin/security/roles/${role.id}/edit`}
                                                                                className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                                                                            >
                                                                                <Edit
                                                                                    className="h-4 w-4"
                                                                                    aria-hidden="true"
                                                                                />
                                                                                Edit
                                                                            </Link>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                            )}
                                                    </tr>
                                                ),
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Mobile Cards */}
                        <div className="space-y-3 md:hidden">
                            {roles.length === 0 ? (
                                <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
                                    No roles found.
                                </div>
                            ) : (
                                roles.map((role) => (
                                    <div
                                        key={role.id}
                                        className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <h2 className="truncate text-base font-semibold text-gray-900">
                                                    {
                                                        role.displayName
                                                    }
                                                </h2>

                                                <p className="mt-1 font-mono text-xs text-gray-500">
                                                    {
                                                        role.code
                                                    }
                                                </p>
                                            </div>

                                            <span
                                                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${role.status ===
                                                    "ACTIVE"
                                                    ? "bg-green-100 text-green-700"
                                                    : role.status ===
                                                        "SUSPENDED"
                                                        ? "bg-yellow-100 text-yellow-700"
                                                        : "bg-gray-100 text-gray-700"
                                                    }`}
                                            >
                                                {
                                                    role.status
                                                }
                                            </span>
                                        </div>

                                        <div className="mt-3">
                                            <p className="text-sm text-gray-600">
                                                {role.description ||
                                                    "No description"}
                                            </p>
                                        </div>

                                        <div className="mt-3 flex flex-col gap-3 border-t border-gray-100 pt-3">
                                            <span className="text-xs text-gray-500">
                                                Display order:{" "}
                                                {
                                                    role.displayOrder
                                                }
                                            </span>

                                            {(canUpdate ||
                                                canAssign) && (
                                                    <div className="flex flex-wrap gap-2">
                                                        {canAssign && (
                                                            <Link
                                                                to={`/admin/security/roles/${role.id}/permissions`}
                                                                className="inline-flex items-center gap-1 rounded-md border border-green-300 px-3 py-1.5 text-sm font-medium text-green-700 transition hover:bg-green-50"
                                                            >
                                                                <KeyRound
                                                                    className="h-4 w-4"
                                                                    aria-hidden="true"
                                                                />
                                                                Permissions
                                                            </Link>
                                                        )}

                                                        {canUpdate && (
                                                            <Link
                                                                to={`/admin/security/roles/${role.id}/edit`}
                                                                className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                                                            >
                                                                <Edit
                                                                    className="h-4 w-4"
                                                                    aria-hidden="true"
                                                                />
                                                                Edit
                                                            </Link>
                                                        )}
                                                    </div>
                                                )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                )}
            </div>
        </MainLayout>
    );
};

export default SecurityRolesPage;