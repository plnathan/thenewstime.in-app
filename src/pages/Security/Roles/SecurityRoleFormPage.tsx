/**
 * -----------------------------------------------------------------------------
 * Project     : thenewstime.in
 * Page        : SecurityRoleFormPage
 * Path        : src/pages/Security/Roles/SecurityRoleFormPage.tsx
 * -----------------------------------------------------------------------------
 */

import {
    ArrowLeft,
    Save,
    ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
    Link,
    useNavigate,
    useParams,
} from "react-router-dom";

import {
    createSecurityRole,
    getSecurityRole,
    updateSecurityRole,
} from "@/api/security/roles.api";
import MainLayout from "@/layouts/MainLayout";
import { useAuth } from "@/auth/AuthContext";
import type {
    CreateSecurityRoleInput,
    SecurityRole,
    UpdateSecurityRoleInput,
} from "@/types/security.types";

const SecurityRoleFormPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const { hasPermissionCode } = useAuth();

    const isEditMode = Boolean(id);

    const canCreate = hasPermissionCode("roles.create");
    const canUpdate = hasPermissionCode("roles.update");

    const [role, setRole] = useState<SecurityRole | null>(null);

    const [code, setCode] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [description, setDescription] = useState("");
    const [displayOrder, setDisplayOrder] = useState("0");
    const [status, setStatus] =
        useState<SecurityRole["status"]>("ACTIVE");

    const [loading, setLoading] = useState(isEditMode);
    const [saving, setSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        if (!isEditMode || !id) {
            return;
        }

        let mounted = true;

        const loadRole = async () => {
            try {
                setLoading(true);
                setErrorMessage("");

                const data = await getSecurityRole(Number(id));

                if (!mounted) {
                    return;
                }

                setRole(data);
                setCode(data.code);
                setDisplayName(data.displayName);
                setDescription(data.description ?? "");
                setDisplayOrder(String(data.displayOrder));
                setStatus(data.status);
            } catch (error) {
                console.error(
                    "Failed to load security role:",
                    error,
                );

                if (mounted) {
                    setErrorMessage(
                        "Unable to load the role. Please try again.",
                    );
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        void loadRole();

        return () => {
            mounted = false;
        };
    }, [id, isEditMode]);

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        setErrorMessage("");

        const normalizedCode = code.trim().toUpperCase();
        const normalizedDisplayName = displayName.trim();
        const normalizedDescription = description.trim();
        const parsedDisplayOrder = Number(displayOrder);

        if (!normalizedCode) {
            setErrorMessage("Role code is required.");
            return;
        }

        if (!normalizedDisplayName) {
            setErrorMessage("Role display name is required.");
            return;
        }

        if (
            !Number.isInteger(parsedDisplayOrder) ||
            parsedDisplayOrder < 0
        ) {
            setErrorMessage(
                "Display order must be a non-negative integer.",
            );
            return;
        }

        try {
            setSaving(true);

            if (isEditMode && id) {
                const input: UpdateSecurityRoleInput = {
                    displayName: normalizedDisplayName,
                    description:
                        normalizedDescription || undefined,
                    displayOrder: parsedDisplayOrder,
                    status,
                };

                await updateSecurityRole(Number(id), input);
            } else {
                const input: CreateSecurityRoleInput = {
                    code: normalizedCode,
                    displayName: normalizedDisplayName,
                    description:
                        normalizedDescription || undefined,
                    displayOrder: parsedDisplayOrder,
                };

                await createSecurityRole(input);
            }

            navigate("/admin/security/roles");
        } catch (error) {
            console.error(
                "Failed to save security role:",
                error,
            );

            setErrorMessage(
                "Unable to save the role. Please check the entered values and try again.",
            );
        } finally {
            setSaving(false);
        }
    };

    if (
        (isEditMode && !canUpdate) ||
        (!isEditMode && !canCreate)
    ) {
        return (
            <MainLayout>
                <div className="mx-auto w-full max-w-4xl">
                    <div className="rounded-lg border border-red-200 bg-red-50 p-6">
                        <h1 className="text-lg font-semibold text-red-800">
                            Access denied
                        </h1>

                        <p className="mt-1 text-sm text-red-700">
                            You do not have permission to{" "}
                            {isEditMode ? "update" : "create"} roles.
                        </p>

                        <Link
                            to="/admin/security/roles"
                            className="mt-4 inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            <ArrowLeft
                                className="h-4 w-4"
                                aria-hidden="true"
                            />
                            Back to Roles
                        </Link>
                    </div>
                </div>
            </MainLayout>
        );
    }

    if (loading) {
        return (
            <MainLayout>
                <div className="mx-auto w-full max-w-4xl">
                    <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
                        <p className="text-sm text-gray-500">
                            Loading role...
                        </p>
                    </div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="mx-auto w-full max-w-4xl">
                {/* Page Header */}
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <ShieldCheck
                                className="h-5 w-5 text-green-600"
                                aria-hidden="true"
                            />

                            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
                                {isEditMode
                                    ? "Edit Security Role"
                                    : "Create Security Role"}
                            </h1>
                        </div>

                        <p className="mt-1 text-sm text-gray-600">
                            {isEditMode
                                ? "Update the security role details."
                                : "Create a new security role."}
                        </p>
                    </div>

                    <Link
                        to="/admin/security/roles"
                        className="inline-flex items-center justify-center gap-2 self-start rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 sm:self-auto"
                    >
                        <ArrowLeft
                            className="h-4 w-4"
                            aria-hidden="true"
                        />
                        Back to Roles
                    </Link>
                </div>

                {/* Error */}
                {errorMessage && (
                    <div className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {errorMessage}
                    </div>
                )}

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
                >
                    <div className="space-y-5 p-5 sm:p-6">
                        {/* Role Code */}
                        <div>
                            <label
                                htmlFor="role-code"
                                className="mb-1.5 block text-sm font-medium text-gray-700"
                            >
                                Role Code
                            </label>

                            <input
                                id="role-code"
                                type="text"
                                value={code}
                                onChange={(event) =>
                                    setCode(
                                        event.target.value.toUpperCase(),
                                    )
                                }
                                disabled={isEditMode}
                                maxLength={30}
                                required
                                placeholder="e.g. REPORTER"
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm uppercase text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:ring-1 focus:ring-green-500 disabled:cursor-not-allowed disabled:bg-gray-100"
                            />

                            <p className="mt-1 text-xs text-gray-500">
                                Use uppercase letters, numbers and underscores
                                only.
                            </p>
                        </div>

                        {/* Display Name */}
                        <div>
                            <label
                                htmlFor="display-name"
                                className="mb-1.5 block text-sm font-medium text-gray-700"
                            >
                                Display Name
                            </label>

                            <input
                                id="display-name"
                                type="text"
                                value={displayName}
                                onChange={(event) =>
                                    setDisplayName(event.target.value)
                                }
                                maxLength={100}
                                required
                                placeholder="e.g. Reporter"
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:ring-1 focus:ring-green-500"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label
                                htmlFor="description"
                                className="mb-1.5 block text-sm font-medium text-gray-700"
                            >
                                Description
                            </label>

                            <textarea
                                id="description"
                                value={description}
                                onChange={(event) =>
                                    setDescription(event.target.value)
                                }
                                maxLength={300}
                                rows={3}
                                placeholder="Describe the purpose of this role."
                                className="w-full resize-y rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:ring-1 focus:ring-green-500"
                            />
                        </div>

                        {/* Display Order */}
                        <div>
                            <label
                                htmlFor="display-order"
                                className="mb-1.5 block text-sm font-medium text-gray-700"
                            >
                                Display Order
                            </label>

                            <input
                                id="display-order"
                                type="number"
                                min="0"
                                step="1"
                                value={displayOrder}
                                onChange={(event) =>
                                    setDisplayOrder(event.target.value)
                                }
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-green-500 focus:ring-1 focus:ring-green-500 sm:max-w-xs"
                            />

                            <p className="mt-1 text-xs text-gray-500">
                                Lower numbers appear first.
                            </p>
                        </div>

                        {/* Status */}
                        {isEditMode && (
                            <div>
                                <label
                                    htmlFor="role-status"
                                    className="mb-1.5 block text-sm font-medium text-gray-700"
                                >
                                    Status
                                </label>

                                <select
                                    id="role-status"
                                    value={status}
                                    onChange={(event) =>
                                        setStatus(
                                            event.target
                                                .value as SecurityRole["status"],
                                        )
                                    }
                                    disabled={
                                        role?.code === "SUPER_ADMIN"
                                    }
                                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-green-500 focus:ring-1 focus:ring-green-500 disabled:cursor-not-allowed disabled:bg-gray-100 sm:max-w-xs"
                                >
                                    <option value="ACTIVE">
                                        ACTIVE
                                    </option>

                                    <option value="INACTIVE">
                                        INACTIVE
                                    </option>

                                    <option value="SUSPENDED">
                                        SUSPENDED
                                    </option>
                                </select>

                                {role?.code === "SUPER_ADMIN" && (
                                    <p className="mt-1 text-xs text-gray-500">
                                        SUPER_ADMIN cannot be deactivated or
                                        suspended.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Form Actions */}
                    <div className="flex flex-col-reverse gap-3 border-t border-gray-200 bg-gray-50 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
                        <Link
                            to="/admin/security/roles"
                            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                        >
                            Cancel
                        </Link>

                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex items-center justify-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <Save
                                className="h-4 w-4"
                                aria-hidden="true"
                            />

                            {saving
                                ? "Saving..."
                                : isEditMode
                                    ? "Update Role"
                                    : "Create Role"}
                        </button>
                    </div>
                </form>
            </div>
        </MainLayout>
    );
};

export default SecurityRoleFormPage;