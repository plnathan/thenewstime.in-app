/**
 * -----------------------------------------------------------------------------
 * Project     : thenewstime.in
 * Page        : SecurityPermissionsPage
 * Path        : src/pages/Security/Permissions/SecurityPermissionsPage.tsx
 * -----------------------------------------------------------------------------
 */

import {
    Edit3,
    KeyRound,
    Plus,
    Power,
    X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
    getSecurityPermissions,
    updateSecurityPermission,
} from "@/api/security/permissions.api";
import { useAuth } from "@/auth/AuthContext";
import MainLayout from "@/layouts/MainLayout";
import type { SecurityPermission } from "@/types/security.types";

interface PermissionGroup {
    module: string;
    permissions: SecurityPermission[];
}

type PermissionAction =
    | "DEACTIVATE"
    | "REACTIVATE";

const SecurityPermissionsPage = () => {
    const {
        user,
        hasPermissionCode,
    } = useAuth();

    /**
     * SUPER_ADMIN must be able to manage permissions even when
     * permissions.update itself has been deactivated.
     *
     * This is intentionally handled here instead of changing
     * hasPermissionCode(), because inactive permissions must
     * remain inactive throughout the rest of the application.
     */
    const isSuperAdmin =
        user?.roles?.some(
            (role) =>
                role.code.trim().toUpperCase() ===
                "SUPER_ADMIN",
        ) ?? false;

    const canCreate =
        isSuperAdmin ||
        hasPermissionCode("permissions.create");

    const canUpdate =
        isSuperAdmin ||
        hasPermissionCode("permissions.update");

    const [permissions, setPermissions] =
        useState<SecurityPermission[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [errorMessage, setErrorMessage] =
        useState("");

    const [permissionToChange, setPermissionToChange] =
        useState<SecurityPermission | null>(null);

    const [permissionAction, setPermissionAction] =
        useState<PermissionAction | null>(null);

    const [changingStatus, setChangingStatus] =
        useState(false);

    useEffect(() => {
        let mounted = true;

        const loadPermissions = async () => {
            try {
                const data =
                    await getSecurityPermissions();

                if (!mounted) {
                    return;
                }

                setPermissions(data);
            } catch (error) {
                console.error(
                    "Failed to load security permissions:",
                    error,
                );

                if (mounted) {
                    setErrorMessage(
                        "Unable to load permissions. Please try again.",
                    );
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        void loadPermissions();

        return () => {
            mounted = false;
        };
    }, []);

    const permissionGroups =
        useMemo<PermissionGroup[]>(() => {
            const groups =
                new Map<
                    string,
                    SecurityPermission[]
                >();

            for (const permission of permissions) {
                const moduleName =
                    permission.module?.trim() ||
                    "Other";

                const existing =
                    groups.get(moduleName);

                if (existing) {
                    existing.push(permission);
                } else {
                    groups.set(moduleName, [
                        permission,
                    ]);
                }
            }

            return Array.from(groups.entries())
                .map(
                    ([
                        module,
                        modulePermissions,
                    ]) => ({
                        module,
                        permissions: [
                            ...modulePermissions,
                        ].sort(
                            (a, b) =>
                                a.displayOrder -
                                b.displayOrder ||
                                a.id - b.id,
                        ),
                    }),
                )
                .sort((a, b) =>
                    a.module.localeCompare(
                        b.module,
                        undefined,
                        {
                            sensitivity: "base",
                        },
                    ),
                );
        }, [permissions]);

    /**
     * Open the status confirmation dialog.
     */
    const handlePermissionActionClick = (
        permission: SecurityPermission,
    ) => {
        if (!canUpdate) {
            return;
        }

        /**
         * Active system permissions cannot be deactivated.
         */
        if (
            permission.status === "ACTIVE" &&
            permission.isSystemPermission
        ) {
            return;
        }

        setPermissionToChange(permission);

        setPermissionAction(
            permission.status === "ACTIVE"
                ? "DEACTIVATE"
                : "REACTIVATE",
        );
    };

    /**
     * Close the status confirmation dialog.
     */
    const handleCancelStatusChange = () => {
        if (changingStatus) {
            return;
        }

        setPermissionToChange(null);
        setPermissionAction(null);
    };

    /**
     * Confirm permission activation/deactivation.
     */
    const handleConfirmStatusChange =
        async () => {
            if (
                !permissionToChange ||
                !permissionAction ||
                changingStatus
            ) {
                return;
            }

            const permission =
                permissionToChange;

            const nextStatus =
                permissionAction === "DEACTIVATE"
                    ? "INACTIVE"
                    : "ACTIVE";

            setChangingStatus(true);
            setErrorMessage("");

            try {
                const updatedPermission =
                    await updateSecurityPermission(
                        permission.id,
                        {
                            status: nextStatus,
                        },
                    );

                setPermissions((current) =>
                    current.map((item) =>
                        item.id ===
                            updatedPermission.id
                            ? updatedPermission
                            : item,
                    ),
                );

                setPermissionToChange(null);
                setPermissionAction(null);
            } catch (error) {
                console.error(
                    "Failed to update permission status:",
                    error,
                );

                setErrorMessage(
                    `Unable to ${permissionAction ===
                        "DEACTIVATE"
                        ? "deactivate"
                        : "reactivate"
                    } the permission. Please try again.`,
                );
            } finally {
                setChangingStatus(false);
            }
        };

    const isConfirmationOpen =
        permissionToChange !== null &&
        permissionAction !== null;

    const confirmationTitle =
        permissionAction === "DEACTIVATE"
            ? "Deactivate Permission"
            : "Reactivate Permission";

    const confirmationDescription =
        permissionAction === "DEACTIVATE"
            ? "Are you sure you want to deactivate this permission? Users will no longer be able to use this permission until it is reactivated."
            : "Are you sure you want to reactivate this permission? The permission will become available again to roles that have it assigned.";

    const confirmationButtonLabel =
        permissionAction === "DEACTIVATE"
            ? "Deactivate"
            : "Reactivate";

    return (
        <MainLayout>
            <div className="mx-auto w-full max-w-6xl">
                {/* Page Header */}
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                        <KeyRound
                            className="h-5 w-5 text-green-600"
                            aria-hidden="true"
                        />

                        <div>
                            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
                                Permissions
                            </h1>

                            <p className="mt-0.5 text-sm text-gray-500">
                                Manage security permission
                                definitions.
                            </p>
                        </div>
                    </div>

                    {canCreate && (
                        <Link
                            to="/admin/security/permissions/create"
                            className="inline-flex items-center justify-center gap-2 self-start rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 sm:self-auto"
                        >
                            <Plus
                                className="h-4 w-4"
                                aria-hidden="true"
                            />
                            Add Permission
                        </Link>
                    )}
                </div>

                {/* Error */}
                {errorMessage && (
                    <div className="mb-5 flex items-start justify-between gap-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        <p>{errorMessage}</p>

                        <button
                            type="button"
                            onClick={() =>
                                setErrorMessage("")
                            }
                            className="shrink-0 rounded p-0.5 text-red-500 transition hover:bg-red-100 hover:text-red-700"
                            aria-label="Dismiss error"
                        >
                            <X
                                className="h-4 w-4"
                                aria-hidden="true"
                            />
                        </button>
                    </div>
                )}

                {/* Loading */}
                {loading ? (
                    <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
                        <p className="text-sm text-gray-500">
                            Loading permissions...
                        </p>
                    </div>
                ) : permissionGroups.length ===
                    0 ? (
                    <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
                        <p className="text-sm text-gray-500">
                            No permissions found.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {permissionGroups.map(
                            (group) => (
                                <section
                                    key={group.module}
                                    className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
                                >
                                    {/* Module Header */}
                                    <div className="flex items-center justify-between gap-3 border-b border-gray-200 bg-gray-50 px-4 py-3 sm:px-5">
                                        <div>
                                            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-800">
                                                {group.module}
                                            </h2>
                                        </div>
                                    </div>

                                    {/* Desktop Table */}
                                    <div className="hidden overflow-x-auto md:block">
                                        <table className="min-w-full">
                                            <thead className="border-b border-gray-100 bg-white">
                                                <tr>
                                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                        #
                                                    </th>

                                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                        Permission
                                                    </th>

                                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                        Code
                                                    </th>

                                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                        Resource
                                                    </th>

                                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                        Action
                                                    </th>

                                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                        Type
                                                    </th>

                                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                        Status
                                                    </th>

                                                    {canUpdate && (
                                                        <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                            Actions
                                                        </th>
                                                    )}
                                                </tr>
                                            </thead>

                                            <tbody className="divide-y divide-gray-100">
                                                {group.permissions.map(
                                                    (
                                                        permission,
                                                        index,
                                                    ) => (
                                                        <tr
                                                            key={
                                                                permission.id
                                                            }
                                                            className="transition hover:bg-gray-50"
                                                        >
                                                            <td className="whitespace-nowrap px-5 py-3 text-sm text-gray-500">
                                                                {index + 1}
                                                            </td>

                                                            <td className="px-5 py-3">
                                                                <div className="max-w-xs">
                                                                    <p className="text-sm font-medium text-gray-900">
                                                                        {
                                                                            permission.displayName
                                                                        }
                                                                    </p>

                                                                    {permission.description && (
                                                                        <p className="mt-0.5 truncate text-xs text-gray-500">
                                                                            {
                                                                                permission.description
                                                                            }
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </td>

                                                            <td className="px-5 py-3">
                                                                <span className="inline-flex rounded bg-gray-100 px-2 py-1 font-mono text-xs text-gray-700">
                                                                    {
                                                                        permission.code
                                                                    }
                                                                </span>
                                                            </td>

                                                            <td className="px-5 py-3 text-sm text-gray-600">
                                                                {
                                                                    permission.resource ||
                                                                    "—"
                                                                }
                                                            </td>

                                                            <td className="px-5 py-3 text-sm text-gray-600">
                                                                {
                                                                    permission.action ||
                                                                    "—"
                                                                }
                                                            </td>

                                                            <td className="px-5 py-3">
                                                                {permission.isSystemPermission ? (
                                                                    <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                                                                        System
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                                                                        Custom
                                                                    </span>
                                                                )}
                                                            </td>

                                                            <td className="px-5 py-3">
                                                                <span
                                                                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${permission.status ===
                                                                            "ACTIVE"
                                                                            ? "bg-green-50 text-green-700"
                                                                            : "bg-gray-100 text-gray-600"
                                                                        }`}
                                                                >
                                                                    {
                                                                        permission.status
                                                                    }
                                                                </span>
                                                            </td>

                                                            {canUpdate && (
                                                                <td className="whitespace-nowrap px-5 py-3 text-right">
                                                                    <div className="flex items-center justify-end gap-2">
                                                                        <Link
                                                                            to={`/admin/security/permissions/${permission.id}/edit`}
                                                                            className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
                                                                        >
                                                                            <Edit3
                                                                                className="h-3.5 w-3.5"
                                                                                aria-hidden="true"
                                                                            />
                                                                            Edit
                                                                        </Link>

                                                                        {permission.status ===
                                                                            "ACTIVE" ? (
                                                                            permission.isSystemPermission ? (
                                                                                <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700">
                                                                                    <KeyRound
                                                                                        className="h-3.5 w-3.5"
                                                                                        aria-hidden="true"
                                                                                    />
                                                                                    System permission
                                                                                </span>
                                                                            ) : (
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() =>
                                                                                        handlePermissionActionClick(
                                                                                            permission,
                                                                                        )
                                                                                    }
                                                                                    className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
                                                                                >
                                                                                    <Power
                                                                                        className="h-3.5 w-3.5"
                                                                                        aria-hidden="true"
                                                                                    />
                                                                                    Deactivate
                                                                                </button>
                                                                            )
                                                                        ) : (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() =>
                                                                                    handlePermissionActionClick(
                                                                                        permission,
                                                                                    )
                                                                                }
                                                                                className="inline-flex items-center gap-1.5 rounded-md border border-green-200 bg-white px-3 py-1.5 text-xs font-medium text-green-700 transition hover:bg-green-50"
                                                                            >
                                                                                <Power
                                                                                    className="h-3.5 w-3.5"
                                                                                    aria-hidden="true"
                                                                                />
                                                                                Reactivate
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                            )}
                                                        </tr>
                                                    ),
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Mobile Cards */}
                                    <div className="divide-y divide-gray-100 md:hidden">
                                        {group.permissions.map(
                                            (permission) => (
                                                <div
                                                    key={
                                                        permission.id
                                                    }
                                                    className="p-4"
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-sm font-semibold text-gray-900">
                                                                {
                                                                    permission.displayName
                                                                }
                                                            </p>

                                                            <p className="mt-1 break-all font-mono text-xs text-gray-600">
                                                                {
                                                                    permission.code
                                                                }
                                                            </p>
                                                        </div>

                                                        <span
                                                            className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${permission.status ===
                                                                    "ACTIVE"
                                                                    ? "bg-green-50 text-green-700"
                                                                    : "bg-gray-100 text-gray-600"
                                                                }`}
                                                        >
                                                            {
                                                                permission.status
                                                            }
                                                        </span>
                                                    </div>

                                                    {permission.description && (
                                                        <p className="mt-2 text-xs text-gray-500">
                                                            {
                                                                permission.description
                                                            }
                                                        </p>
                                                    )}

                                                    <div className="mt-3 flex flex-wrap gap-2">
                                                        {permission.resource && (
                                                            <span className="rounded bg-gray-100 px-2 py-1 text-[11px] text-gray-600">
                                                                Resource:{" "}
                                                                {
                                                                    permission.resource
                                                                }
                                                            </span>
                                                        )}

                                                        {permission.action && (
                                                            <span className="rounded bg-gray-100 px-2 py-1 text-[11px] text-gray-600">
                                                                Action:{" "}
                                                                {
                                                                    permission.action
                                                                }
                                                            </span>
                                                        )}

                                                        {permission.isSystemPermission ? (
                                                            <span className="rounded-full bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-700">
                                                                System
                                                            </span>
                                                        ) : (
                                                            <span className="rounded-full bg-gray-100 px-2 py-1 text-[11px] font-semibold text-gray-600">
                                                                Custom
                                                            </span>
                                                        )}
                                                    </div>

                                                    {canUpdate && (
                                                        <div className="mt-3 flex flex-wrap justify-end gap-2">
                                                            <Link
                                                                to={`/admin/security/permissions/${permission.id}/edit`}
                                                                className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
                                                            >
                                                                <Edit3
                                                                    className="h-3.5 w-3.5"
                                                                    aria-hidden="true"
                                                                />
                                                                Edit
                                                            </Link>

                                                            {permission.status ===
                                                                "ACTIVE" ? (
                                                                permission.isSystemPermission ? (
                                                                    <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700">
                                                                        <KeyRound
                                                                            className="h-3.5 w-3.5"
                                                                            aria-hidden="true"
                                                                        />
                                                                        System permission
                                                                    </span>
                                                                ) : (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            handlePermissionActionClick(
                                                                                permission,
                                                                            )
                                                                        }
                                                                        className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
                                                                    >
                                                                        <Power
                                                                            className="h-3.5 w-3.5"
                                                                            aria-hidden="true"
                                                                        />
                                                                        Deactivate
                                                                    </button>
                                                                )
                                                            ) : (
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handlePermissionActionClick(
                                                                            permission,
                                                                        )
                                                                    }
                                                                    className="inline-flex items-center gap-1.5 rounded-md border border-green-200 bg-white px-3 py-1.5 text-xs font-medium text-green-700 transition hover:bg-green-50"
                                                                >
                                                                    <Power
                                                                        className="h-3.5 w-3.5"
                                                                        aria-hidden="true"
                                                                    />
                                                                    Reactivate
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </section>
                            ),
                        )}
                    </div>
                )}
            </div>

            {/* Permission Status Confirmation Modal */}
            {isConfirmationOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
                    role="presentation"
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            handleCancelStatusChange();
                        }
                    }}
                >
                    <div
                        className="w-full max-w-md rounded-lg bg-white shadow-xl"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="permission-status-dialog-title"
                    >
                        <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-5 py-4">
                            <div>
                                <h2
                                    id="permission-status-dialog-title"
                                    className="text-lg font-semibold text-gray-900"
                                >
                                    {confirmationTitle}
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Confirm the permission
                                    status change.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={
                                    handleCancelStatusChange
                                }
                                disabled={changingStatus}
                                className="rounded-md p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
                                aria-label="Close"
                            >
                                <X
                                    className="h-5 w-5"
                                    aria-hidden="true"
                                />
                            </button>
                        </div>

                        <div className="px-5 py-5">
                            <p className="text-sm leading-6 text-gray-600">
                                {confirmationDescription}
                            </p>

                            {permissionToChange && (
                                <div className="mt-4 rounded-md border border-gray-200 bg-gray-50 px-4 py-3">
                                    <p className="text-sm font-semibold text-gray-900">
                                        {
                                            permissionToChange.displayName
                                        }
                                    </p>

                                    <p className="mt-1 break-all font-mono text-xs text-gray-500">
                                        {
                                            permissionToChange.code
                                        }
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 border-t border-gray-200 px-5 py-4">
                            <button
                                type="button"
                                onClick={
                                    handleCancelStatusChange
                                }
                                disabled={changingStatus}
                                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    void handleConfirmStatusChange()
                                }
                                disabled={changingStatus}
                                className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${permissionAction ===
                                        "DEACTIVATE"
                                        ? "bg-red-600 hover:bg-red-700"
                                        : "bg-green-600 hover:bg-green-700"
                                    }`}
                            >
                                {changingStatus
                                    ? "Updating..."
                                    : confirmationButtonLabel}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </MainLayout>
    );
};

export default SecurityPermissionsPage;