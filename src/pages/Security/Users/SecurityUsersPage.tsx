/**
 * -----------------------------------------------------------------------------
 * Project     : thenewstime.in
 * Page        : Security Users Management
 * -----------------------------------------------------------------------------
 */

import {
  Edit,
  Plus,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  deactivateSecurityUser,
  getSecurityUsers,
} from "@/api/security/users.api";

import { useAuth } from "@/auth/AuthContext";

import MainLayout from "@/layouts/MainLayout";

import type {
  SecurityUserListItem,
  UserStatus,
} from "@/types/security.types";

const SecurityUsersPage = () => {
  const navigate = useNavigate();

  const { hasPermissionCode } = useAuth();

  const canCreate = hasPermissionCode("users.create");
  const canUpdate = hasPermissionCode("users.update");
  const canDelete = hasPermissionCode("users.delete");

  const [users, setUsers] = useState<SecurityUserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionUserId, setActionUserId] = useState<number | null>(null);

  /*
   * ---------------------------------------------------------------------------
   * Load Users
   * ---------------------------------------------------------------------------
   */
  useEffect(() => {
    let cancelled = false;

    const loadUsers = async () => {
      try {
        const result = await getSecurityUsers();

        if (cancelled) {
          return;
        }

        setUsers(result);
        setError(null);
      } catch (requestError) {
        if (cancelled) {
          return;
        }

        console.error(
          "Failed to load security users:",
          requestError,
        );

        setError(
          "Unable to load users. Please try again.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadUsers();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * ---------------------------------------------------------------------------
   * Deactivate User
   * ---------------------------------------------------------------------------
   */
  const handleDeactivate = async (
    user: SecurityUserListItem,
  ) => {
    if (!canDelete) {
      setError(
        "You do not have permission to deactivate users.",
      );
      return;
    }

    if (user.status === "INACTIVE") {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to deactivate "${user.displayName || user.username}" ? `,
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionUserId(user.id);
      setError(null);

      const updatedUser = await deactivateSecurityUser(
        user.id,
      );

      setUsers((current) =>
        current.map((item) =>
          item.id === updatedUser.id
            ? {
                ...item,
                ...updatedUser,
              }
            : item,
        ),
      );
    } catch (requestError) {
      console.error(
        "Failed to deactivate user:",
        requestError,
      );

      setError(
        "Unable to deactivate the user. Please try again.",
      );
    } finally {
      setActionUserId(null);
    }
  };

  /*
   * ---------------------------------------------------------------------------
   * Loading
   * ---------------------------------------------------------------------------
   */
  if (loading) {
    return (
      <MainLayout>
        <main className="min-h-screen bg-gray-50">
          <div className="mx-auto flex min-h-[50vh] max-w-7xl items-center justify-center px-4 py-8 lg:px-6">
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
                Loading users...
              </p>
            </div>
          </div>
        </main>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
          {/* Page Header */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck
                  className="h-6 w-6 text-green-700"
                  aria-hidden="true"
                />

                <h1 className="text-2xl font-bold text-gray-900">
                  User Management
                </h1>
              </div>

              <p className="mt-1 text-sm text-gray-500">
                Manage authenticated users and their account status.
              </p>
            </div>

            {canCreate && (
              <Link
                to="/admin/security/users/create"
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-lg
                  bg-green-700
                  px-4
                  py-2.5
                  text-sm
                  font-medium
                  text-white
                  transition-colors
                  hover:bg-green-800
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-green-600
                  focus-visible:ring-offset-2
                "
              >
                <Plus
                  className="h-4 w-4"
                  aria-hidden="true"
                />

                Create User
              </Link>
            )}
          </div>

          {/* Error */}
          {error && (
            <div
              className="
                mb-6
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

          {/* Empty */}
          {!users.length ? (
            <div className="rounded-xl border border-gray-200 bg-white px-6 py-12 text-center">
              <UserCheck
                className="mx-auto h-10 w-10 text-gray-300"
                aria-hidden="true"
              />

              <h2 className="mt-4 text-base font-semibold text-gray-900">
                No users found
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                There are currently no security users to display.
              </p>

              {canCreate && (
                <Link
                  to="/admin/security/users/create"
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-800"
                >
                  <Plus
                    className="h-4 w-4"
                    aria-hidden="true"
                  />

                  Create User
                </Link>
              )}
            </div>
          ) : (
            <>
              {/* -----------------------------------------------------------------
               * Desktop Table
               * -----------------------------------------------------------------
               */}
              <div className="hidden overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm md:block">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
                        >
                          User
                        </th>

                        <th
                          scope="col"
                          className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
                        >
                          Username
                        </th>

                        <th
                          scope="col"
                          className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
                        >
                          Roles
                        </th>

                        <th
                          scope="col"
                          className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
                        >
                          Status
                        </th>

                        <th
                          scope="col"
                          className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200 bg-white">
                      {users.map((user) => (
                        <tr
                          key={user.id}
                          className="hover:bg-gray-50"
                        >
                          {/* User */}
                          <td className="whitespace-nowrap px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-green-50 text-sm font-semibold text-green-700">
                                {user.profileImageUrl ? (
                                  <img
                                    src={user.profileImageUrl}
                                    alt=""
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  getInitials(
                                    user.displayName ||
                                      user.fullName ||
                                      user.username,
                                  )
                                )}
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-gray-900">
                                  {user.displayName}
                                </p>

                                <p className="truncate text-xs text-gray-500">
                                  {user.fullName}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Username */}
                          <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-700">
                            {user.username}
                          </td>

                          {/* Roles */}
                          <td className="px-5 py-4">
                            {user.roles.length > 0 ? (
                              <div className="flex max-w-xs flex-wrap gap-1.5">
                                {user.roles.map((role) => (
                                  <span
                                    key={role.id}
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
                                    {role.displayName}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">
                                No role
                              </span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="whitespace-nowrap px-5 py-4">
                            <StatusBadge status={user.status} />
                          </td>

                          {/* Actions */}
                          <td className="whitespace-nowrap px-5 py-4">
                            <div className="flex items-center justify-end gap-2">
                              {canUpdate && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    navigate(
                                      `/admin/security/users/${ user.id }/edit`,
                                    )
                                  }
className="
            inline-flex
            items-center
            gap-1.5
            rounded-lg
            border
            border-gray-300
            bg-white
            px-3
            py-2
            text-xs
            font-medium
            text-gray-700
            hover: bg-gray-50
            hover: text-green-700
        ">
    <Edit
        className="h-3.5 w-3.5"
        aria-hidden="true"
    />

Edit
                                </button >
                              )}

{
    canDelete &&
    user.status !== "INACTIVE" && (
        <button
            type="button"
            disabled={
                actionUserId === user.id
            }
            onClick={() =>
                void handleDeactivate(user)
            }
            className="
                                      rounded-lg
                                      border
                                      border-red-200
                                      bg-white
                                      px-3
                                      py-2
                                      text-xs
                                      font-medium
                                      text-red-600
                                      hover:bg-red-50
                                      disabled:cursor-not-allowed
                                      disabled:opacity-50
                                    "
        >
            {actionUserId === user.id
                ? "Deactivating..."
                : "Deactivate"}
        </button>
    )
}
                            </div >
                          </td >
                        </tr >
                      ))}
                    </tbody >
                  </table >
                </div >
              </div >

{/* -----------------------------------------------------------------
               * Mobile Cards
               * -----------------------------------------------------------------
               */}
    < div className = "space-y-3 md:hidden" >
    {
        users.map((user) => (
            <div
                key={user.id}
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
                <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-green-50 text-sm font-semibold text-green-700">
                            {user.profileImageUrl ? (
                                <img
                                    src={user.profileImageUrl}
                                    alt=""
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                getInitials(
                                    user.displayName ||
                                    user.fullName ||
                                    user.username,
                                )
                            )}
                        </div>

                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-gray-900">
                                {user.displayName}
                            </p>

                            <p className="truncate text-xs text-gray-500">
                                @{user.username}
                            </p>
                        </div>
                    </div>

                    <StatusBadge status={user.status} />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-gray-100 pt-3">
                    <div>
                        <p className="text-xs text-gray-400">
                            Full Name
                        </p>

                        <p className="mt-0.5 truncate text-sm text-gray-700">
                            {user.fullName}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-gray-400">
                            Roles
                        </p>

                        {user.roles.length > 0 ? (
                            <div className="mt-1 flex flex-wrap gap-1">
                                {user.roles.map((role) => (
                                    <span
                                        key={role.id}
                                        className="
                                  inline-flex
                                  rounded-full
                                  border
                                  border-green-200
                                  bg-green-50
                                  px-2
                                  py-0.5
                                  text-xs
                                  font-medium
                                  text-green-700
                                "
                                    >
                                        {role.displayName}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="mt-0.5 text-sm text-gray-500">
                                No role
                            </p>
                        )}
                    </div>

                    <div>
                        <p className="text-xs text-gray-400">
                            Email
                        </p>

                        <p className="mt-0.5 truncate text-sm text-gray-700">
                            {user.email || "—"}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-gray-400">
                            Mobile
                        </p>

                        <p className="mt-0.5 truncate text-sm text-gray-700">
                            {user.mobile || "—"}
                        </p>
                    </div>
                </div>

                {(canUpdate ||
                    (canDelete &&
                        user.status !== "INACTIVE")) && (
                        <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-3">
                            {canUpdate && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate(
                                            `/admin/security/users/${user.id}/edit`,
                                        )
                                    }
                                    className="
                              inline-flex
                              items-center
                              gap-1.5
                              rounded-lg
                              border
                              border-gray-300
                              bg-white
                              px-3
                              py-2
                              text-xs
                              font-medium
                              text-gray-700
                              hover:bg-gray-50
                              hover:text-green-700
                            "
                                >
                                    <Edit
                                        className="h-3.5 w-3.5"
                                        aria-hidden="true"
                                    />

                                    Edit
                                </button>
                            )}

                            {canDelete &&
                                user.status !== "INACTIVE" && (
                                    <button
                                        type="button"
                                        disabled={
                                            actionUserId === user.id
                                        }
                                        onClick={() =>
                                            void handleDeactivate(user)
                                        }
                                        className="
                                rounded-lg
                                border
                                border-red-200
                                bg-white
                                px-3
                                py-2
                                text-xs
                                font-medium
                                text-red-600
                                hover:bg-red-50
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                              "
                                    >
                                        {actionUserId === user.id
                                            ? "Deactivating..."
                                            : "Deactivate"}
                                    </button>
                                )}
                        </div>
                    )}
            </div>
        ))
    }
              </div >
            </>
          )}
        </div >
      </main >
    </MainLayout >
  );
};

function StatusBadge({
    status,
}: {
    status: UserStatus;
}) {
    const className =
        status === "ACTIVE"
            ? "bg-green-50 text-green-700 border-green-200"
            : status === "SUSPENDED"
                ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                : status === "LOCKED"
                    ? "bg-red-50 text-red-700 border-red-200"
                    : "bg-gray-50 text-gray-600 border-gray-200";

    return (
        <span
            className={[
                "inline-flex rounded-full border px-2.5 py-1 text-xs font-medium",
                className,
            ].join(" ")}
        >
            {status}
        </span>
    );
}

function getInitials(value: string): string {
    const words = value
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (!words.length) {
        return "U";
    }

    if (words.length === 1) {
        return words[0].slice(0, 2).toUpperCase();
    }

    return (
        words[0][0] +
        words[words.length - 1][0]
    ).toUpperCase();
}

export default SecurityUsersPage;