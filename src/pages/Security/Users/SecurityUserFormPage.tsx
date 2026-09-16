/**
 * -----------------------------------------------------------------------------
 * Project     : thenewstime.in
 * Page        : Security User Form
 * -----------------------------------------------------------------------------
 */

import {
    ArrowLeft,
    Check,
    Save,
    ShieldCheck,
} from "lucide-react";
import {
    useCallback,
    useEffect,
    useState,
} from "react";
import {
    useNavigate,
    useParams,
} from "react-router-dom";

import {
    createSecurityUser,
    getSecurityUser,
    updateSecurityUser,
} from "@/api/security/users.api";

import {
    getSecurityRoles,
} from "@/api/security/roles.api";

import { useAuth } from "@/auth/AuthContext";

import MainLayout from "@/layouts/MainLayout";

import type {
    CreateSecurityUserInput,
    SecurityRole,
    SecurityUser,
    UpdateSecurityUserInput,
    UserStatus,
} from "@/types/security.types";

const SecurityUserFormPage = () => {
    const navigate = useNavigate();

    const { id } = useParams<{
        id: string;
    }>();

    const isEdit = Boolean(id);

    const userId = Number(id);

    const { hasPermissionCode } = useAuth();

    const canCreate = hasPermissionCode(
        "users.create",
    );

    const canUpdate = hasPermissionCode(
        "users.update",
    );

    const [loading, setLoading] = useState(
        isEdit,
    );

    const [
        rolesLoading,
        setRolesLoading,
    ] = useState(true);

    const [saving, setSaving] = useState(false);

    const [error, setError] = useState<
        string | null
    >(null);

    const [
        successMessage,
        setSuccessMessage,
    ] = useState<string | null>(null);

    const [roles, setRoles] = useState<
        SecurityRole[]
    >([]);

    /*
     * --------------------------------------------------
     * Selected Roles
     * --------------------------------------------------
     *
     * user_roles is the authoritative role membership.
     *
     * The form sends all selected role IDs together
     * through the user create/update API.
     * --------------------------------------------------
     */
    const [
        selectedRoleIds,
        setSelectedRoleIds,
    ] = useState<number[]>([]);

    const [rolesDropdownOpen, setRolesDropdownOpen] =
        useState(false);

    const [form, setForm] = useState({
        fullName: "",
        displayName: "",
        username: "",
        email: "",
        mobile: "",
        password: "",
        profileImageUrl: "",
        mustChangePassword: true,
        passwordExpiresAt: "",
        status: "ACTIVE" as UserStatus,
    });

    const populateForm = useCallback(
        (user: SecurityUser) => {
            setForm({
                fullName: user.fullName,
                displayName: user.displayName,
                username: user.username,
                email: user.email ?? "",
                mobile: user.mobile ?? "",
                password: "",
                profileImageUrl:
                    user.profileImageUrl ?? "",
                mustChangePassword:
                    user.mustChangePassword,
                passwordExpiresAt:
                    user.passwordExpiresAt
                        ? toDateTimeLocal(
                            user.passwordExpiresAt,
                        )
                        : "",
                status: user.status,
            });

            setSelectedRoleIds(
                user.roles.map(
                    (role) => Number(role.id),
                ),
            );
        },
        [],
    );

    /*
     * --------------------------------------------------
     * Load Security Roles
     * --------------------------------------------------
     *
     * New users can only be assigned ACTIVE roles.
     *
     * Existing inactive roles remain available while
     * editing so that an existing assignment is not
     * silently removed from the form.
     * --------------------------------------------------
     */
    useEffect(() => {
        let cancelled = false;

        const loadRoles = async () => {
            try {
                const loadedRoles =
                    await getSecurityRoles();

                if (cancelled) {
                    return;
                }

                setRoles(loadedRoles);
            } catch (requestError) {
                if (cancelled) {
                    return;
                }

                console.error(
                    "Failed to load roles:",
                    requestError,
                );

                setError(
                    "Unable to load available roles.",
                );
            } finally {
                if (!cancelled) {
                    setRolesLoading(false);
                }
            }
        };

        void loadRoles();

        return () => {
            cancelled = true;
        };
    }, []);

    /*
     * --------------------------------------------------
     * Load Existing User
     * --------------------------------------------------
     */
    useEffect(() => {
        if (!isEdit) {
            return;
        }

        if (
            !Number.isInteger(userId) ||
            userId <= 0
        ) {
            return;
        }

        let cancelled = false;

        const loadUser = async () => {
            try {
                setError(null);

                const user =
                    await getSecurityUser(
                        userId,
                    );

                if (cancelled) {
                    return;
                }

                setError(null);
                populateForm(user);
            } catch (requestError) {
                if (cancelled) {
                    return;
                }

                console.error(
                    "Failed to load user:",
                    requestError,
                );

                setError(
                    "Unable to load the user.",
                );
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        void loadUser();

        return () => {
            cancelled = true;
        };
    }, [
        isEdit,
        userId,
        populateForm,
    ]);

    const handleChange = (
        event: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement
        >,
    ) => {
        const {
            name,
            value,
            type,
        } = event.target;

        setForm((current) => ({
            ...current,
            [name]:
                type === "checkbox"
                    ? (
                        event.target as HTMLInputElement
                    ).checked
                    : value,
        }));
    };

    /*
     * --------------------------------------------------
     * Role Selection
     * --------------------------------------------------
     */
    const toggleRole = (roleId: number) => {
        setSelectedRoleIds((current) => {
            if (current.includes(roleId)) {
                return current.filter(
                    (id) => id !== roleId,
                );
            }

            return [...current, roleId];
        });
    };

    /*
     * --------------------------------------------------
     * Available Roles
     * --------------------------------------------------
     *
     * ACTIVE roles are available for selection.
     *
     * During edit, currently assigned inactive roles
     * are also retained so they can be explicitly
     * removed if required.
     * --------------------------------------------------
     */
    const availableRoles = roles.filter(
        (role) =>
            role.status === "ACTIVE" ||
            selectedRoleIds.includes(
                Number(role.id),
            ),
    );

    const selectedRoles = roles.filter(
        (role) =>
            selectedRoleIds.includes(
                Number(role.id),
            ),
    );

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        setError(null);
        setSuccessMessage(null);

        if (isEdit && !canUpdate) {
            setError(
                "You do not have permission to update users.",
            );
            return;
        }

        if (!isEdit && !canCreate) {
            setError(
                "You do not have permission to create users.",
            );
            return;
        }

        if (selectedRoleIds.length === 0) {
            setError(
                "Please select at least one role.",
            );
            return;
        }

        try {
            setSaving(true);

            if (isEdit) {
                const input: UpdateSecurityUserInput =
                {
                    fullName:
                        form.fullName.trim(),

                    displayName:
                        form.displayName.trim(),

                    email:
                        form.email.trim() ||
                        undefined,

                    mobile:
                        form.mobile.trim() ||
                        undefined,

                    profileImageUrl:
                        form.profileImageUrl.trim() ||
                        undefined,

                    status:
                        form.status,

                    roleIds:
                        selectedRoleIds,

                    mustChangePassword:
                        form.mustChangePassword,

                    password:
                        form.password.trim() ||
                        undefined,

                    passwordExpiresAt:
                        form.passwordExpiresAt
                            ? new Date(
                                form.passwordExpiresAt,
                            ).toISOString()
                            : undefined,
                };

                await updateSecurityUser(
                    userId,
                    input,
                );

                setForm((current) => ({
                    ...current,
                    password: "",
                }));

                setSuccessMessage(
                    "User updated successfully.",
                );
            } else {
                if (
                    form.password.length < 8
                ) {
                    setError(
                        "Password must be at least 8 characters.",
                    );
                    return;
                }

                const input: CreateSecurityUserInput =
                {
                    fullName:
                        form.fullName.trim(),

                    displayName:
                        form.displayName.trim(),

                    username:
                        form.username.trim(),

                    email:
                        form.email.trim() ||
                        undefined,

                    mobile:
                        form.mobile.trim() ||
                        undefined,

                    password:
                        form.password,

                    roleIds:
                        selectedRoleIds,

                    profileImageUrl:
                        form.profileImageUrl.trim() ||
                        undefined,

                    mustChangePassword:
                        form.mustChangePassword,

                    passwordExpiresAt:
                        form.passwordExpiresAt
                            ? new Date(
                                form.passwordExpiresAt,
                            ).toISOString()
                            : undefined,
                };

                await createSecurityUser(
                    input,
                );

                navigate(
                    "/admin/security/users",
                    {
                        replace: true,
                    },
                );

                return;
            }
        } catch (requestError) {
            console.error(
                "Failed to save user:",
                requestError,
            );

            setError(
                "Unable to save the user. Please check the entered information and try again.",
            );
        } finally {
            setSaving(false);
        }
    };

    const invalidEditId =
        isEdit &&
        (
            !Number.isInteger(userId) ||
            userId <= 0
        );

    if (isEdit && !canUpdate) {
        return (
            <MainLayout>
                <main className="min-h-screen bg-gray-50 px-4 py-8">
                    <div className="mx-auto max-w-xl rounded-xl border border-red-200 bg-white p-8 text-center shadow-sm">
                        <ShieldCheck className="mx-auto h-10 w-10 text-red-500" />

                        <h1 className="mt-4 text-xl font-bold text-gray-900">
                            Access denied
                        </h1>

                        <p className="mt-2 text-sm text-gray-600">
                            You do not have permission to edit users.
                        </p>
                    </div>
                </main>
            </MainLayout>
        );
    }

    if (!isEdit && !canCreate) {
        return (
            <MainLayout>
                <main className="min-h-screen bg-gray-50 px-4 py-8">
                    <div className="mx-auto max-w-xl rounded-xl border border-red-200 bg-white p-8 text-center shadow-sm">
                        <ShieldCheck className="mx-auto h-10 w-10 text-red-500" />

                        <h1 className="mt-4 text-xl font-bold text-gray-900">
                            Access denied
                        </h1>

                        <p className="mt-2 text-sm text-gray-600">
                            You do not have permission to create users.
                        </p>
                    </div>
                </main>
            </MainLayout>
        );
    }

    if (invalidEditId) {
        return (
            <MainLayout>
                <main className="min-h-screen bg-gray-50 px-4 py-8">
                    <div className="mx-auto max-w-xl rounded-xl border border-red-200 bg-white p-8 text-center shadow-sm">
                        <ShieldCheck className="mx-auto h-10 w-10 text-red-500" />

                        <h1 className="mt-4 text-xl font-bold text-gray-900">
                            Invalid User ID
                        </h1>

                        <p className="mt-2 text-sm text-gray-600">
                            The requested user ID is invalid.
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/admin/security/users",
                                )
                            }
                            className="
                mt-5
                inline-flex
                items-center
                gap-2
                rounded-lg
                bg-green-700
                px-4
                py-2.5
                text-sm
                font-medium
                text-white
                hover:bg-green-800
              "
                        >
                            <ArrowLeft
                                className="h-4 w-4"
                                aria-hidden="true"
                            />

                            Back to Users
                        </button>
                    </div>
                </main>
            </MainLayout>
        );
    }

    if (loading) {
        return (
            <MainLayout>
                <main className="flex min-h-screen items-center justify-center bg-gray-50">
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
                            Loading user...
                        </p>
                    </div>
                </main>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <main className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-3xl">
                    {/* Header */}
                    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-center gap-3">
                            <ShieldCheck
                                className="h-6 w-6 shrink-0 text-green-700"
                                aria-hidden="true"
                            />

                            <div className="min-w-0">
                                <h1 className="text-2xl font-bold text-gray-900">
                                    {isEdit
                                        ? "Edit User"
                                        : "Create User"}
                                </h1>

                                <p className="mt-1 text-sm text-gray-500">
                                    {isEdit
                                        ? "Update the selected user account."
                                        : "Create a new authenticated user account."}
                                </p>
                            </div>
                        </div>

                        {/* Back to Users */}
                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/admin/security/users",
                                )
                            }
                            disabled={saving}
                            className="
                inline-flex
                items-center
                justify-center
                gap-2
                self-start
                rounded-lg
                border
                border-gray-300
                bg-white
                px-4
                py-2
                text-sm
                font-medium
                text-gray-700
                transition
                hover:bg-gray-50
                disabled:cursor-not-allowed
                disabled:opacity-60
                sm:self-auto
              "
                        >
                            <ArrowLeft
                                className="h-4 w-4"
                                aria-hidden="true"
                            />

                            Back to Users
                        </button>
                    </div>

                    {/* Messages */}
                    {error && (
                        <div
                            className="
                mb-5
                rounded-lg
                border
                border-red-200
                bg-red-50
                px-4
                py-3
                text-sm
                text-red-700
              "
                            role="alert"
                        >
                            {error}
                        </div>
                    )}

                    {successMessage && (
                        <div
                            className="
                mb-5
                rounded-lg
                border
                border-green-200
                bg-green-50
                px-4
                py-3
                text-sm
                text-green-700
              "
                            role="status"
                        >
                            {successMessage}
                        </div>
                    )}

                    <form
                        onSubmit={handleSubmit}
                        className="
              overflow-hidden
              rounded-xl
              border
              border-gray-200
              bg-white
              shadow-sm
            "
                    >
                        <div className="space-y-6 p-5 sm:p-7">
                            {/* Identity */}
                            <section>
                                <h2 className="text-base font-semibold text-gray-900">
                                    User Information
                                </h2>

                                <div className="mt-4 grid gap-5 sm:grid-cols-2">
                                    <FormField
                                        label="Full Name"
                                        name="fullName"
                                        value={
                                            form.fullName
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    />

                                    <FormField
                                        label="Display Name"
                                        name="displayName"
                                        value={
                                            form.displayName
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    />

                                    <FormField
                                        label="Username"
                                        name="username"
                                        value={
                                            form.username
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                        disabled={
                                            isEdit
                                        }
                                        hint={
                                            isEdit
                                                ? "Username cannot be changed."
                                                : "Letters, numbers, dots, underscores and hyphens."
                                        }
                                    />

                                    <FormField
                                        label="Email"
                                        name="email"
                                        type="email"
                                        value={
                                            form.email
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                    <FormField
                                        label="Mobile"
                                        name="mobile"
                                        value={
                                            form.mobile
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                    {/* Roles */}
                                    <div>
                                        <label
                                            htmlFor="security-roles"
                                            className="mb-1.5 block text-sm font-medium text-gray-700"
                                        >
                                            Roles

                                            <span className="ml-1 text-red-500">
                                                *
                                            </span>
                                        </label>

                                        <div
                                            id="security-roles"
                                            className="relative"
                                        >
                                            <button
                                                type="button"
                                                disabled={
                                                    rolesLoading ||
                                                    saving
                                                }
                                                onClick={() =>
                                                    setRolesDropdownOpen(
                                                        (
                                                            current,
                                                        ) =>
                                                            !current,
                                                    )
                                                }
                                                className="
                          flex
                          min-h-[44px]
                          w-full
                          items-center
                          justify-between
                          rounded-lg
                          border
                          border-gray-300
                          bg-white
                          px-3
                          py-2
                          text-left
                          text-sm
                          text-gray-900
                          outline-none
                          focus:border-green-600
                          focus:ring-2
                          focus:ring-green-100
                          disabled:cursor-not-allowed
                          disabled:bg-gray-100
                          disabled:text-gray-500
                        "
                                            >
                                                <span className="min-w-0">
                                                    {rolesLoading
                                                        ? "Loading roles..."
                                                        : selectedRoles.length ===
                                                            0
                                                            ? "Select roles"
                                                            : selectedRoles
                                                                .map(
                                                                    (
                                                                        role,
                                                                    ) =>
                                                                        role.displayName,
                                                                )
                                                                .join(
                                                                    ", ",
                                                                )}
                                                </span>

                                                <span className="ml-2 shrink-0 text-gray-400">
                                                    {rolesDropdownOpen
                                                        ? "▲"
                                                        : "▼"}
                                                </span>
                                            </button>

                                            {rolesDropdownOpen &&
                                                !rolesLoading && (
                                                    <div
                                                        className="
                            absolute
                            z-20
                            mt-1
                            max-h-64
                            w-full
                            overflow-y-auto
                            rounded-lg
                            border
                            border-gray-200
                            bg-white
                            p-1
                            shadow-lg
                          "
                                                    >
                                                        {availableRoles.length >
                                                            0 ? (
                                                            availableRoles.map(
                                                                (
                                                                    role,
                                                                ) => {
                                                                    const isSelected =
                                                                        selectedRoleIds.includes(
                                                                            Number(
                                                                                role.id,
                                                                            ),
                                                                        );

                                                                    return (
                                                                        <label
                                                                            key={
                                                                                role.id
                                                                            }
                                                                            className="
                                        flex
                                        cursor-pointer
                                        items-start
                                        gap-3
                                        rounded-md
                                        px-3
                                        py-2.5
                                        hover:bg-gray-50
                                      "
                                                                        >
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={
                                                                                    isSelected
                                                                                }
                                                                                onChange={() =>
                                                                                    toggleRole(
                                                                                        Number(
                                                                                            role.id,
                                                                                        ),
                                                                                    )
                                                                                }
                                                                                className="
                                          mt-0.5
                                          h-4
                                          w-4
                                          rounded
                                          border-gray-300
                                          text-green-700
                                          focus:ring-green-600
                                        "
                                                                            />

                                                                            <span className="min-w-0 flex-1">
                                                                                <span className="block text-sm font-medium text-gray-800">
                                                                                    {
                                                                                        role.displayName
                                                                                    }
                                                                                </span>

                                                                                <span className="block text-xs text-gray-500">
                                                                                    {
                                                                                        role.code
                                                                                    }

                                                                                    {role.status !==
                                                                                        "ACTIVE" &&
                                                                                        ` — ${role.status} `}
                                                                                </span>
                                                                            </span>

                                                                            {isSelected && (
                                                                                <Check
                                                                                    className="mt-0.5 h-4 w-4 shrink-0 text-green-700"
                                                                                    aria-hidden="true"
                                                                                />
                                                                            )}
                                                                        </label>
                                                                    );
                                                                },
                                                            )
                                                        ) : (
                                                            <p className="px-3 py-3 text-sm text-gray-500">
                                                                No active roles are available for assignment.
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                        </div>

                                        {selectedRoles.length >
                                            0 && (
                                                <div className="mt-2 flex flex-wrap gap-1.5">
                                                    {selectedRoles.map(
                                                        (
                                                            role,
                                                        ) => (
                                                            <span
                                                                key={
                                                                    role.id
                                                                }
                                                                className="
                                    inline-flex
                                    items-center
                                    rounded-full
                                    border
                                    border-green-200
                                    bg-green-50
                                    px-2.5
                                    py-1
                                    text-xs
                                    font-medium
                                    text-green-700
                                  "
                                                            >
                                                                {
                                                                    role.displayName
                                                                }
                                                            </span>
                                                        ),
                                                    )}
                                                </div>
                                            )}

                                        {!rolesLoading &&
                                            roles.length ===
                                            0 && (
                                                <p className="mt-1 text-xs text-red-600">
                                                    No roles are currently available.
                                                </p>
                                            )}

                                        {!rolesLoading &&
                                            roles.length >
                                            0 &&
                                            availableRoles.length ===
                                            0 && (
                                                <p className="mt-1 text-xs text-red-600">
                                                    No active roles are available for assignment.
                                                </p>
                                            )}

                                        {!rolesLoading &&
                                            availableRoles.length >
                                            0 && (
                                                <p className="mt-1 text-xs text-gray-500">
                                                    Select one or more roles for this user account.
                                                </p>
                                            )}
                                    </div>
                                </div>
                            </section>

                            {/* Password */}
                            <section className="border-t border-gray-100 pt-6">
                                <h2 className="text-base font-semibold text-gray-900">
                                    Password
                                </h2>

                                <div className="mt-4 grid gap-5 sm:grid-cols-2">
                                    <FormField
                                        label={
                                            isEdit
                                                ? "New Password"
                                                : "Password"
                                        }
                                        name="password"
                                        type="password"
                                        value={
                                            form.password
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required={
                                            !isEdit
                                        }
                                        hint="Minimum 8 characters."
                                    />

                                    <FormField
                                        label="Password Expires At"
                                        name="passwordExpiresAt"
                                        type="datetime-local"
                                        value={
                                            form.passwordExpiresAt
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />
                                </div>

                                <label className="mt-5 flex items-start gap-3">
                                    <input
                                        type="checkbox"
                                        name="mustChangePassword"
                                        checked={
                                            form.mustChangePassword
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        className="
                      mt-0.5
                      h-4
                      w-4
                      rounded
                      border-gray-300
                      text-green-700
                      focus:ring-green-600
                    "
                                    />

                                    <span>
                                        <span className="block text-sm font-medium text-gray-800">
                                            Require password change
                                        </span>

                                        <span className="mt-0.5 block text-xs text-gray-500">
                                            The user will be required to change
                                            their password when appropriate.
                                        </span>
                                    </span>
                                </label>
                            </section>

                            {/* Account status */}
                            {isEdit && (
                                <section className="border-t border-gray-100 pt-6">
                                    <h2 className="text-base font-semibold text-gray-900">
                                        Account Status
                                    </h2>

                                    <div className="mt-4 max-w-sm">
                                        <label
                                            htmlFor="status"
                                            className="mb-1.5 block text-sm font-medium text-gray-700"
                                        >
                                            Status
                                        </label>

                                        <select
                                            id="status"
                                            name="status"
                                            value={
                                                form.status
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            className="
                        w-full
                        rounded-lg
                        border
                        border-gray-300
                        bg-white
                        px-3
                        py-2.5
                        text-sm
                        text-gray-900
                        outline-none
                        focus:border-green-600
                        focus:ring-2
                        focus:ring-green-100
                      "
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

                                            <option value="LOCKED">
                                                LOCKED
                                            </option>
                                        </select>
                                    </div>
                                </section>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col-reverse gap-3 border-t border-gray-100 bg-gray-50 px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
                            <button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        "/admin/security/users",
                                    )
                                }
                                disabled={saving}
                                className="
                  rounded-lg
                  border
                  border-gray-300
                  bg-white
                  px-5
                  py-2.5
                  text-sm
                  font-medium
                  text-gray-700
                  hover:bg-gray-50
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={
                                    saving ||
                                    rolesLoading ||
                                    availableRoles.length ===
                                    0 ||
                                    selectedRoleIds.length ===
                                    0
                                }
                                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-lg
                  bg-green-700
                  px-5
                  py-2.5
                  text-sm
                  font-medium
                  text-white
                  hover:bg-green-800
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
                            >
                                <Save
                                    className="h-4 w-4"
                                    aria-hidden="true"
                                />

                                {saving
                                    ? "Saving..."
                                    : isEdit
                                        ? "Update User"
                                        : "Create User"}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </MainLayout>
    );
};

interface FormFieldProps {
    label: string;
    name: string;
    value: string;
    type?: string;
    required?: boolean;
    disabled?: boolean;
    hint?: string;
    onChange: (
        event: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement
        >,
    ) => void;
}

function FormField({
    label,
    name,
    value,
    type = "text",
    required = false,
    disabled = false,
    hint,
    onChange,
}: FormFieldProps) {
    return (
        <div>
            <label
                htmlFor={name}
                className="mb-1.5 block text-sm font-medium text-gray-700"
            >
                {label}

                {required && (
                    <span className="ml-1 text-red-500">
                        *
                    </span>
                )}
            </label>

            <input
                id={name}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                required={required}
                disabled={disabled}
                className="
          w-full
          rounded-lg
          border
          border-gray-300
          bg-white
          px-3
          py-2.5
          text-sm
          text-gray-900
          outline-none
          placeholder:text-gray-400
          focus:border-green-600
          focus:ring-2
          focus:ring-green-100
          disabled:cursor-not-allowed
          disabled:bg-gray-100
          disabled:text-gray-500
        "
            />

            {hint && (
                <p className="mt-1 text-xs text-gray-500">
                    {hint}
                </p>
            )}
        </div>
    );
}

function toDateTimeLocal(
    value: string,
): string {
    const date = new Date(value);

    if (
        Number.isNaN(
            date.getTime(),
        )
    ) {
        return "";
    }

    const offset =
        date.getTimezoneOffset();

    const localDate =
        new Date(
            date.getTime() -
            offset * 60 * 1000,
        );

    return localDate
        .toISOString()
        .slice(0, 16);
}

export default SecurityUserFormPage;