import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    Check,
    KeyRound,
    Loader2,
    ShieldCheck,
    X,
} from "lucide-react";

import MainLayout from "@/layouts/MainLayout";
import { useAuth } from "@/auth/AuthContext";
import {
    assignSecurityPermissionToRole,
    getRoleSecurityPermissions,
    getSecurityPermissions,
    removeSecurityPermissionFromRole,
} from "@/api/security/permissions.api";
import {
    getSecurityRole,
} from "@/api/security/roles.api";
import type {
    SecurityPermission,
    SecurityRole,
} from "@/types/security.types";

interface PermissionGroup {
    module: string;
    permissions: SecurityPermission[];
}

const SecurityRolePermissionsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, hasPermissionCode } = useAuth();

    const roleId = Number(id);

    const isSuperAdmin =
        user?.roles?.some(
            (role) => role.code.trim().toUpperCase() === "SUPER_ADMIN",
        ) ?? false;

    const canAssign = isSuperAdmin || hasPermissionCode("roles.assign");

    const [role, setRole] = useState<SecurityRole | null>(null);
    const [permissions, setPermissions] = useState<SecurityPermission[]>([]);
    const [assignedPermissionIds, setAssignedPermissionIds] = useState<
        Set<number>
    >(new Set());

    const [loading, setLoading] = useState(true);
    const [processingPermissionId, setProcessingPermissionId] = useState<
        number | null
    >(null);

    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        if (!canAssign) {
            return;
        }

        if (!Number.isInteger(roleId) || roleId <= 0) {
            void Promise.resolve().then(() => {
                setLoading(false);
                setErrorMessage("Invalid role.");
            });
            return;
        }

        let mounted = true;

        const loadData = async () => {
            try {
                setLoading(true);
                setErrorMessage("");

                const [roleResponse, permissionsResponse, assignedResponse] =
                    await Promise.all([
                        getSecurityRole(roleId),
                        getSecurityPermissions(),
                        getRoleSecurityPermissions(roleId),
                    ]);

                if (!mounted) {
                    return;
                }

                setRole(roleResponse);
                setPermissions(permissionsResponse);

                const assignedIds = new Set(
                    assignedResponse.map((permission) => permission.id),
                );

                setAssignedPermissionIds(assignedIds);
            } catch (error) {
                console.error(
                    "Failed to load role permissions:",
                    error,
                );

                if (mounted) {
                    setErrorMessage(
                        "Failed to load role permissions. Please try again.",
                    );
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        void loadData();

        return () => {
            mounted = false;
        };
    }, [canAssign, roleId]);

    const permissionGroups = useMemo<PermissionGroup[]>(() => {
        const grouped = permissions.reduce<Record<string, SecurityPermission[]>>(
            (accumulator, permission) => {
                const moduleName =
                    permission.module?.trim() || "GENERAL";

                if (!accumulator[moduleName]) {
                    accumulator[moduleName] = [];
                }

                accumulator[moduleName].push(permission);

                return accumulator;
            },
            {},
        );

        return Object.entries(grouped)
            .map(([module, modulePermissions]) => ({
                module,
                permissions: [...modulePermissions].sort((a, b) => {
                    if (a.displayOrder !== b.displayOrder) {
                        return a.displayOrder - b.displayOrder;
                    }

                    return a.displayName.localeCompare(b.displayName);
                }),
            }))
            .sort((a, b) => a.module.localeCompare(b.module));
    }, [permissions]);

    const assignedCount = assignedPermissionIds.size;

    const activePermissionCount = useMemo(
        () =>
            permissions.filter(
                (permission) => permission.status === "ACTIVE",
            ).length,
        [permissions],
    );

    const handleTogglePermission = async (
        permission: SecurityPermission,
    ) => {
        if (!canAssign || processingPermissionId !== null) {
            return;
        }

        if (permission.status !== "ACTIVE") {
            return;
        }

        const isAssigned = assignedPermissionIds.has(permission.id);

        try {
            setProcessingPermissionId(permission.id);
            setErrorMessage("");
            setSuccessMessage("");

            if (isAssigned) {
                await removeSecurityPermissionFromRole(
                    roleId,
                    permission.id,
                );

                setAssignedPermissionIds((current) => {
                    const next = new Set(current);
                    next.delete(permission.id);
                    return next;
                });

                setSuccessMessage(
                    `"${permission.displayName}" permission removed from the role.`,
                );
            } else {
                await assignSecurityPermissionToRole(
                    roleId,
                    permission.id,
                );

                setAssignedPermissionIds((current) => {
                    const next = new Set(current);
                    next.add(permission.id);
                    return next;
                });

                setSuccessMessage(
                    `"${permission.displayName}" permission assigned to the role.`,
                );
            }
        } catch (error) {
            console.error(
                "Failed to update role permission:",
                error,
            );

            setErrorMessage(
                "Failed to update the permission. Please try again.",
            );
        } finally {
            setProcessingPermissionId(null);
        }
    };

    if (!canAssign) {
        return (
            <MainLayout>
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
                        <ShieldCheck className="mx-auto h-10 w-10 text-red-500" />

                        <h1 className="mt-3 text-lg font-semibold text-red-700">
                            Access Denied
                        </h1>

                        <p className="mt-2 text-sm text-red-600">
                            You do not have permission to assign permissions to
                            roles.
                        </p>

                        <button
                            type="button"
                            onClick={() => navigate("/admin/security/roles")}
                            className="mt-4 inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition hover:opacity-80"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Roles
                        </button>
                    </div>
                </div>
            </MainLayout>
        );
    }

    if (loading) {
        return (
            <MainLayout>
                <div className="flex min-h-[400px] items-center justify-center">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Loading role permissions...
                    </div>
                </div>
            </MainLayout>
        );
    }

    if (!role) {
        return (
            <MainLayout>
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    <div className="rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
                        <X className="mx-auto h-10 w-10 text-gray-400" />

                        <h1 className="mt-3 text-lg font-semibold text-gray-800">
                            Role Not Found
                        </h1>

                        <p className="mt-2 text-sm text-gray-600">
                            The requested role could not be found.
                        </p>

                        <button
                            type="button"
                            onClick={() => navigate("/admin/security/roles")}
                            className="mt-4 inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition hover:opacity-80"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Roles
                        </button>
                    </div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <Link
                        to="/admin/security/roles"
                        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-900"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Roles
                    </Link>

                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-gray-100 p-2">
                                    <KeyRound className="h-6 w-6 text-gray-700" />
                                </div>

                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">
                                        Role Permissions
                                    </h1>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Manage permissions assigned to this role.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
                            <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                Role
                            </div>

                            <div className="mt-1 flex items-center gap-2">
                                <span className="font-semibold text-gray-900">
                                    {role.displayName}
                                </span>

                                <span
                                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${role.status === "ACTIVE"
                                        ? "bg-green-100 text-green-700"
                                        : role.status === "INACTIVE"
                                            ? "bg-gray-100 text-gray-600"
                                            : "bg-red-100 text-red-700"
                                        }`}
                                >
                                    {role.status}
                                </span>
                            </div>

                            <div className="mt-1 text-xs text-gray-500">
                                {role.code}
                            </div>
                        </div>
                    </div>
                </div>

                {successMessage && (
                    <div className="mb-4 flex items-start gap-3 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                        <Check className="mt-0.5 h-4 w-4 shrink-0" />

                        <span>{successMessage}</span>
                    </div>
                )}

                {errorMessage && (
                    <div className="mb-4 flex items-start gap-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                        <X className="mt-0.5 h-4 w-4 shrink-0" />

                        <span>{errorMessage}</span>
                    </div>
                )}

                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="text-sm text-gray-500">
                            Total Permissions
                        </div>

                        <div className="mt-1 text-2xl font-bold text-gray-900">
                            {permissions.length}
                        </div>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="text-sm text-gray-500">
                            Active Permissions
                        </div>

                        <div className="mt-1 text-2xl font-bold text-gray-900">
                            {activePermissionCount}
                        </div>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="text-sm text-gray-500">
                            Assigned Permissions
                        </div>

                        <div className="mt-1 text-2xl font-bold text-gray-900">
                            {assignedCount}
                        </div>
                    </div>
                </div>

                {permissionGroups.length === 0 ? (
                    <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
                        <KeyRound className="mx-auto h-10 w-10 text-gray-400" />

                        <h2 className="mt-3 text-lg font-semibold text-gray-800">
                            No Permissions Found
                        </h2>

                        <p className="mt-2 text-sm text-gray-500">
                            There are no permissions available to assign.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {permissionGroups.map((group) => (
                            <section
                                key={group.module}
                                className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
                            >
                                <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2">
                                            <ShieldCheck className="h-5 w-5 text-gray-600" />

                                            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-800">
                                                {group.module}
                                            </h2>
                                        </div>

                                        <span className="text-xs text-gray-500">
                                            {group.permissions.length} permission
                                            {group.permissions.length === 1 ? "" : "s"}
                                        </span>
                                    </div>
                                </div>

                                <div className="hidden overflow-x-auto md:block">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-white">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Status
                                                </th>

                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Permission
                                                </th>

                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Resource / Action
                                                </th>

                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    State
                                                </th>

                                                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Action
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-gray-100 bg-white">
                                            {group.permissions.map((permission) => {
                                                const isAssigned = assignedPermissionIds.has(
                                                    permission.id,
                                                );

                                                const isProcessing =
                                                    processingPermissionId === permission.id;

                                                const isInactive =
                                                    permission.status !== "ACTIVE";

                                                return (
                                                    <tr key={permission.id}>
                                                        <td className="whitespace-nowrap px-4 py-3">
                                                            <span
                                                                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${permission.status === "ACTIVE"
                                                                    ? "bg-green-100 text-green-700"
                                                                    : "bg-gray-100 text-gray-600"
                                                                    }`}
                                                            >
                                                                {permission.status}
                                                            </span>
                                                        </td>

                                                        <td className="px-4 py-3">
                                                            <div className="font-medium text-gray-900">
                                                                {permission.displayName}
                                                            </div>

                                                            <div className="mt-1 text-xs text-gray-500">
                                                                {permission.code}
                                                            </div>

                                                            {permission.description && (
                                                                <div className="mt-1 max-w-xl text-xs text-gray-500">
                                                                    {permission.description}
                                                                </div>
                                                            )}
                                                        </td>

                                                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                                                            <div>
                                                                {permission.resource || "—"}
                                                            </div>

                                                            <div className="mt-1 text-xs text-gray-500">
                                                                {permission.action || "—"}
                                                            </div>
                                                        </td>

                                                        <td className="whitespace-nowrap px-4 py-3">
                                                            {isAssigned ? (
                                                                <span className="inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                                                                    Assigned
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                                                                    Not Assigned
                                                                </span>
                                                            )}
                                                        </td>

                                                        <td className="whitespace-nowrap px-4 py-3 text-right">
                                                            <button
                                                                type="button"
                                                                disabled={
                                                                    isProcessing || isInactive
                                                                }
                                                                onClick={() =>
                                                                    void handleTogglePermission(
                                                                        permission,
                                                                    )
                                                                }
                                                                className={`inline-flex min-w-24 items-center justify-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${isAssigned
                                                                    ? "bg-red-600 text-white hover:bg-red-700"
                                                                    : "bg-green-600 text-white hover:bg-green-700"
                                                                    }`}
                                                            >
                                                                {isProcessing ? (
                                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                                ) : isAssigned ? (
                                                                    <>
                                                                        <X className="h-4 w-4" />
                                                                        Remove
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Check className="h-4 w-4" />
                                                                        Assign
                                                                    </>
                                                                )}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="space-y-3 p-4 md:hidden">
                                    {group.permissions.map((permission) => {
                                        const isAssigned = assignedPermissionIds.has(
                                            permission.id,
                                        );

                                        const isProcessing =
                                            processingPermissionId === permission.id;

                                        const isInactive =
                                            permission.status !== "ACTIVE";

                                        return (
                                            <div
                                                key={permission.id}
                                                className="rounded-md border p-3"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <div className="font-medium text-gray-900">
                                                            {permission.displayName}
                                                        </div>

                                                        <div className="mt-1 break-all text-xs text-gray-500">
                                                            {permission.code}
                                                        </div>
                                                    </div>

                                                    <span
                                                        className={`shrink-0 rounded-full px-2 py-1 text-xs font-semibold ${permission.status === "ACTIVE"
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-gray-100 text-gray-600"
                                                            }`}
                                                    >
                                                        {permission.status}
                                                    </span>
                                                </div>

                                                {permission.description && (
                                                    <p className="mt-2 text-xs text-gray-500">
                                                        {permission.description}
                                                    </p>
                                                )}

                                                <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                                                    <div>
                                                        <div className="font-medium text-gray-500">
                                                            Resource
                                                        </div>

                                                        <div className="mt-1 text-gray-800">
                                                            {permission.resource || "—"}
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <div className="font-medium text-gray-500">
                                                            Action
                                                        </div>

                                                        <div className="mt-1 text-gray-800">
                                                            {permission.action || "—"}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-3">
                                                    {isAssigned ? (
                                                        <span className="inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                                                            Assigned
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                                                            Not Assigned
                                                        </span>
                                                    )}
                                                </div>

                                                <button
                                                    type="button"
                                                    disabled={isProcessing || isInactive}
                                                    onClick={() =>
                                                        void handleTogglePermission(permission)
                                                    }
                                                    className={`mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${isAssigned
                                                        ? "bg-red-600 text-white hover:bg-red-700"
                                                        : "bg-green-600 text-white hover:bg-green-700"
                                                        }`}
                                                >
                                                    {isProcessing ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : isAssigned ? (
                                                        <>
                                                            <X className="h-4 w-4" />
                                                            Remove Permission
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Check className="h-4 w-4" />
                                                            Assign Permission
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        ))}
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default SecurityRolePermissionsPage;