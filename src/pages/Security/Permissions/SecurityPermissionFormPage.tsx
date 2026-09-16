/**

* ---
* Project     : thenewstime.in
* Page        : SecurityPermissionFormPage
* Path        : src/pages/Security/Permissions/SecurityPermissionFormPage.tsx
* ---

*/

import {
    ArrowLeft,
    KeyRound,
    Save,
} from "lucide-react";
import {
    useEffect,
    useMemo,
    useState,
} from "react";
import type {
    FormEvent,
} from "react";
import {
    Link,
    useNavigate,
    useParams,
} from "react-router-dom";

import {
    createSecurityPermission,
    getSecurityPermission,
    updateSecurityPermission,
} from "@/api/security/permissions.api";

import MainLayout from "@/layouts/MainLayout";

import { useAuth } from "@/auth/AuthContext";

type PermissionStatus = "ACTIVE" | "INACTIVE";

interface PermissionFormState {
    module: string;
    resource: string;
    action: string;
    code: string;
    displayName: string;
    description: string;
    displayOrder: string;
    status: PermissionStatus;
    isSystemPermission: boolean;
}

const INITIAL_FORM: PermissionFormState = {
    module: "",
    resource: "",
    action: "",
    code: "",
    displayName: "",
    description: "",
    displayOrder: "0",
    status: "ACTIVE",
    isSystemPermission: false,
};

const SecurityPermissionFormPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    
const { hasPermissionCode } = useAuth();

const isEditMode = Boolean(id);
const permissionId = Number(id);

const canCreate = hasPermissionCode("permissions.create");
const canUpdate = hasPermissionCode("permissions.update");

const [form, setForm] =
    useState<PermissionFormState>(INITIAL_FORM);

const [loading, setLoading] = useState(isEditMode);
const [saving, setSaving] = useState(false);

const [errorMessage, setErrorMessage] = useState("");
const [successMessage, setSuccessMessage] = useState("");

useEffect(() => {
    if (!isEditMode) {
        return;
    }

    let mounted = true;

    const loadPermission = async () => {
        try {
            if (
                !Number.isInteger(permissionId) ||
                permissionId <= 0
            ) {
                await Promise.resolve();

                if (!mounted) {
                    return;
                }

                setLoading(false);
                setErrorMessage("Invalid permission.");
                return;
            }

            const permission =
                await getSecurityPermission(permissionId);

            if (!mounted) {
                return;
            }

            setForm({
                module: permission.module ?? "",
                resource: permission.resource ?? "",
                action: permission.action ?? "",
                code: permission.code ?? "",
                displayName: permission.displayName ?? "",
                description: permission.description ?? "",
                displayOrder: String(
                    permission.displayOrder ?? 0,
                ),
                status:
                    permission.status === "INACTIVE"
                        ? "INACTIVE"
                        : "ACTIVE",
                isSystemPermission:
                    Boolean(permission.isSystemPermission),
            });

            setErrorMessage("");
        } catch (error) {
            console.error(
                "Failed to load security permission:",
                error,
            );

            if (mounted) {
                setErrorMessage(
                    "Unable to load permission. Please try again.",
                );
            }
        } finally {
            if (mounted) {
                setLoading(false);
            }
        }
    };

    void loadPermission();

    return () => {
        mounted = false;
    };
}, [isEditMode, permissionId]);

const hasAccess = isEditMode
    ? canUpdate
    : canCreate;

const codeReadOnly = isEditMode;

const validationError = useMemo(() => {
    if (!form.module.trim()) {
        return "Module is required.";
    }

    if (!form.resource.trim()) {
        return "Resource is required.";
    }

    if (!form.action.trim()) {
        return "Action is required.";
    }

    if (!form.code.trim()) {
        return "Permission code is required.";
    }

    if (!form.displayName.trim()) {
        return "Display name is required.";
    }

    const displayOrder = Number(form.displayOrder);

    if (
        !Number.isInteger(displayOrder) ||
        displayOrder < 0
    ) {
        return "Display order must be a non-negative integer.";
    }

    return "";
}, [form]);

const handleChange = <
    K extends keyof PermissionFormState,
>(
    field: K,
    value: PermissionFormState[K],
) => {
    setErrorMessage("");
    setSuccessMessage("");

    setForm((current) => ({
        ...current,
        [field]: value,
    }));
};

const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!hasAccess) {
        setErrorMessage(
            isEditMode
                ? "You do not have permission to update permissions."
                : "You do not have permission to create permissions.",
        );
        return;
    }

    if (validationError) {
        setErrorMessage(validationError);
        return;
    }

    const displayOrder = Number(form.displayOrder);
    const description = form.description.trim();

    try {
        setSaving(true);

        if (isEditMode) {
            await updateSecurityPermission(permissionId, {
                module: form.module.trim(),
                resource: form.resource.trim(),
                action: form.action.trim(),
                displayName: form.displayName.trim(),
                ...(description ? { description } : {}),
                displayOrder,
                status: form.status,
            });

            setSuccessMessage(
                "Permission updated successfully.",
            );
        } else {
            await createSecurityPermission({
                module: form.module.trim(),
                resource: form.resource.trim(),
                action: form.action.trim(),
                code: form.code.trim(),
                displayName: form.displayName.trim(),
                ...(description ? { description } : {}),
                displayOrder,
                isSystemPermission:
                    form.isSystemPermission,
            });

            setSuccessMessage(
                "Permission created successfully.",
            );
        }

        navigate("/admin/security/permissions");
    } catch (error) {
        console.error(
            isEditMode
                ? "Failed to update security permission:"
                : "Failed to create security permission:",
            error,
        );

        setErrorMessage(
            isEditMode
                ? "Unable to update permission. Please check the entered values and try again."
                : "Unable to create permission. Please check the entered values and try again.",
        );
    } finally {
        setSaving(false);
    }
};

if (!hasAccess) {
    return (
        <MainLayout>
            <div className="mx-auto w-full max-w-5xl">
                <div className="rounded-lg border border-red-200 bg-red-50 p-6">
                    <h1 className="text-lg font-semibold text-red-800">
                        Access denied
                    </h1>

                    <p className="mt-1 text-sm text-red-700">
                        {isEditMode
                            ? "You do not have permission to update security permissions."
                            : "You do not have permission to create security permissions."}
                    </p>

                    <div className="mt-4">
                        <Link
                            to="/admin/security/permissions"
                            className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                        >
                            <ArrowLeft
                                className="h-4 w-4"
                                aria-hidden="true"
                            />
                            Back to Permissions
                        </Link>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}

if (loading) {
    return (
        <MainLayout>
            <div className="mx-auto w-full max-w-5xl">
                <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
                    <p className="text-sm text-gray-500">
                        Loading permission...
                    </p>
                </div>
            </div>
        </MainLayout>
    );
}

return (
    <MainLayout>
        <div className="mx-auto w-full max-w-5xl">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                    <KeyRound
                        className="h-5 w-5 text-green-600"
                        aria-hidden="true"
                    />

                    <div>
                        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
                            {isEditMode
                                ? "Edit Permission"
                                : "Add Permission"}
                        </h1>

                        <p className="mt-0.5 text-sm text-gray-500">
                            {isEditMode
                                ? "Update the security permission definition."
                                : "Create a new security permission definition."}
                        </p>
                    </div>
                </div>

                <Link
                    to="/admin/security/permissions"
                    className="inline-flex items-center justify-center gap-2 self-start rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 sm:self-auto"
                >
                    <ArrowLeft
                        className="h-4 w-4"
                        aria-hidden="true"
                    />
                    Back
                </Link>
            </div>

            {errorMessage && (
                <div
                    className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                    role="alert"
                >
                    {errorMessage}
                </div>
            )}

            {successMessage && (
                <div
                    className="mb-5 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
                    role="status"
                >
                    {successMessage}
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
            >
                <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
                    <h2 className="text-base font-semibold text-gray-900">
                        Permission Definition
                    </h2>

                    <p className="mt-1 text-xs text-gray-500">
                        Define the module, resource, action and permission
                        identifier used by the authorization system.
                    </p>
                </div>

                <div className="space-y-5 px-4 py-5 sm:px-6">
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                        <div>
                            <label
                                htmlFor="permission-module"
                                className="mb-1.5 block text-sm font-medium text-gray-700"
                            >
                                Module
                            </label>

                            <input
                                id="permission-module"
                                type="text"
                                value={form.module}
                                onChange={(event) =>
                                    handleChange(
                                        "module",
                                        event.target.value,
                                    )
                                }
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-green-500 focus:ring-1 focus:ring-green-500"
                                placeholder="SECURITY"
                                disabled={saving}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="permission-resource"
                                className="mb-1.5 block text-sm font-medium text-gray-700"
                            >
                                Resource
                            </label>

                            <input
                                id="permission-resource"
                                type="text"
                                value={form.resource}
                                onChange={(event) =>
                                    handleChange(
                                        "resource",
                                        event.target.value,
                                    )
                                }
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-green-500 focus:ring-1 focus:ring-green-500"
                                placeholder="PERMISSIONS"
                                disabled={saving}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="permission-action"
                                className="mb-1.5 block text-sm font-medium text-gray-700"
                            >
                                Action
                            </label>

                            <input
                                id="permission-action"
                                type="text"
                                value={form.action}
                                onChange={(event) =>
                                    handleChange(
                                        "action",
                                        event.target.value,
                                    )
                                }
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-green-500 focus:ring-1 focus:ring-green-500"
                                placeholder="CREATE"
                                disabled={saving}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div>
                            <label
                                htmlFor="permission-code"
                                className="mb-1.5 block text-sm font-medium text-gray-700"
                            >
                                Permission Code
                            </label>

                            <input
                                id="permission-code"
                                type="text"
                                value={form.code}
                                onChange={(event) =>
                                    handleChange(
                                        "code",
                                        event.target.value,
                                    )
                                }
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-green-500 focus:ring-1 focus:ring-green-500 disabled:bg-gray-100 disabled:text-gray-500"
                                placeholder="permissions.create"
                                readOnly={codeReadOnly}
                                disabled={saving}
                            />

                            {isEditMode && (
                                <p className="mt-1 text-xs text-gray-500">
                                    Permission code cannot be changed after
                                    creation.
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="permission-display-name"
                                className="mb-1.5 block text-sm font-medium text-gray-700"
                            >
                                Display Name
                            </label>

                            <input
                                id="permission-display-name"
                                type="text"
                                value={form.displayName}
                                onChange={(event) =>
                                    handleChange(
                                        "displayName",
                                        event.target.value,
                                    )
                                }
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-green-500 focus:ring-1 focus:ring-green-500"
                                placeholder="Create Permission"
                                disabled={saving}
                            />
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="permission-description"
                            className="mb-1.5 block text-sm font-medium text-gray-700"
                        >
                            Description
                        </label>

                        <textarea
                            id="permission-description"
                            value={form.description}
                            onChange={(event) =>
                                handleChange(
                                    "description",
                                    event.target.value,
                                )
                            }
                            rows={4}
                            className="w-full resize-y rounded-md border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-green-500 focus:ring-1 focus:ring-green-500"
                            placeholder="Describe what this permission allows."
                            disabled={saving}
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                        <div>
                            <label
                                htmlFor="permission-display-order"
                                className="mb-1.5 block text-sm font-medium text-gray-700"
                            >
                                Display Order
                            </label>

                            <input
                                id="permission-display-order"
                                type="number"
                                min={0}
                                step={1}
                                value={form.displayOrder}
                                onChange={(event) =>
                                    handleChange(
                                        "displayOrder",
                                        event.target.value,
                                    )
                                }
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-green-500 focus:ring-1 focus:ring-green-500"
                                disabled={saving}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="permission-status"
                                className="mb-1.5 block text-sm font-medium text-gray-700"
                            >
                                Status
                            </label>

                            <select
                                id="permission-status"
                                value={form.status}
                                onChange={(event) =>
                                    handleChange(
                                        "status",
                                        event.target.value as PermissionStatus,
                                    )
                                }
                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-green-500 focus:ring-1 focus:ring-green-500"
                                disabled={saving}
                            >
                                <option value="ACTIVE">
                                    Active
                                </option>
                                <option value="INACTIVE">
                                    Inactive
                                </option>
                            </select>
                        </div>

                        <div className="flex items-end">
                            <div
                                className={`flex min - h - 10 w - full items - center gap - 2 rounded - md border px - 3 py - 2 ${
        isEditMode
            ? "cursor-not-allowed border-gray-200 bg-gray-100"
            : "border-gray-300"
    } `}
                            >
                                <input
                                    id="permission-system"
                                    type="checkbox"
                                    checked={form.isSystemPermission}
                                    onChange={(event) =>
                                        handleChange(
                                            "isSystemPermission",
                                            event.target.checked,
                                        )
                                    }
                                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500 disabled:cursor-not-allowed disabled:opacity-60"
                                    disabled={saving || isEditMode}
                                />

                                <div>
                                    <label
                                        htmlFor="permission-system"
                                        className={`text - sm ${
        isEditMode
            ? "cursor-not-allowed text-gray-500"
            : "cursor-pointer text-gray-700"
    } `}
                                    >
                                        System Permission
                                    </label>

                                    {isEditMode && (
                                        <p className="text-xs text-gray-500">
                                            Cannot be changed after creation.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-gray-200 bg-gray-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-6">
                    <Link
                        to="/admin/security/permissions"
                        className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                        Cancel
                    </Link>

                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center justify-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <Save
                            className="h-4 w-4"
                            aria-hidden="true"
                        />

                        {saving
                            ? "Saving..."
                            : isEditMode
                                ? "Update Permission"
                                : "Create Permission"}
                    </button>
                </div>
            </form>
        </div>
    </MainLayout>
);


};

export default SecurityPermissionFormPage;
