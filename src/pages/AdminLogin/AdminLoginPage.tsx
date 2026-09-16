/**
 * -----------------------------------------------------------------------------
 * Project     : thenewstime.in
 * Module      : Admin Login Page
 * -----------------------------------------------------------------------------
 */

import {
    Home,
    LockKeyhole,
    LogIn,
    Eye,
    EyeOff,
} from "lucide-react";

import {
    useEffect,
    useState,
} from "react";

import type {
    FormEvent,
} from "react";

import {
    useNavigate,
} from "react-router-dom";

import { isAxiosError } from "axios";

import { useAuth } from "@/auth/AuthContext";

const getApiErrorMessage = (
    error: unknown,
): string => {
    if (!isAxiosError(error)) {
        return "Unable to sign in. Please try again.";
    }

    const data =
        error.response?.data as
        | {
            message?: string;
            details?: Array<{
                message?: string;
            }>;
        }
        | undefined;

    const detailMessage =
        data?.details
            ?.map(
                (detail) =>
                    detail.message?.trim(),
            )
            .filter(Boolean)
            .join(" ");

    return (
        detailMessage ||
        data?.message?.trim() ||
        "Unable to sign in. Please check your username and password."
    );
};

export default function AdminLoginPage() {
    const navigate =
        useNavigate();

    const {
        user,
        isAuthenticated,
        isLoading,
        login,
    } = useAuth();

    const [username, setUsername] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [showPassword, setShowPassword] =
        useState(false);

    const [submitting, setSubmitting] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);

    /**
     * If an already authenticated user opens
     * /admin/login, always take them to
     * News Management.
     *
     * We intentionally do not restore the
     * previous requested Admin URL here.
     */
    useEffect(() => {
        if (
            !isLoading &&
            isAuthenticated &&
            user
        ) {
            navigate(
                "/admin/news",
                {
                    replace: true,
                },
            );
        }
    }, [
        isAuthenticated,
        isLoading,
        user,
        navigate,
    ]);

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        if (submitting) {
            return;
        }

        setError(null);

        const trimmedUsername =
            username.trim();

        if (!trimmedUsername) {
            setError(
                "Please enter your username.",
            );

            return;
        }

        if (!password) {
            setError(
                "Please enter your password.",
            );

            return;
        }

        try {
            setSubmitting(true);

            await login({
                username:
                    trimmedUsername,
                password,
            });

            /**
             * Every successful Admin login
             * starts at News Management.
             *
             * Permission-based access to individual
             * actions/pages will be handled separately.
             */
            navigate(
                "/admin/news",
                {
                    replace: true,
                },
            );
        } catch (err) {
            console.error(
                "Admin login failed:",
                err,
            );

            setError(
                getApiErrorMessage(err),
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (
        isLoading ||
        (isAuthenticated && user)
    ) {
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
                        Loading...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <main
            className="
        flex
        min-h-screen
        items-center
        justify-center
        bg-gray-50
        px-4
        py-10
      "
        >
            <div
                className="
          w-full
          max-w-md
        "
            >
                {/* Brand */}
                <div className="mb-8 text-center">
                    <div
                        className="
              mx-auto
              mb-4
              flex
              items-center
              justify-center
              gap-2
            "
                    >
                        {/* Lock */}
                        <div
                            className="
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-2xl
                bg-green-700
                text-white
                shadow-sm
              "
                        >
                            <LockKeyhole
                                size={26}
                                aria-hidden="true"
                            />
                        </div>

                        {/* Home */}
                        <button
                            type="button"
                            onClick={() =>
                                navigate("/")
                            }
                            className="
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-2xl
                bg-green-700
                text-white
                shadow-sm
                transition
                hover:bg-green-800
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-green-600
                focus-visible:ring-offset-2
              "
                            aria-label="Go to home page"
                            title="Home"
                        >
                            <Home
                                size={26}
                                aria-hidden="true"
                            />
                        </button>
                    </div>

                    <h1
                        className="
              text-2xl
              font-bold
              tracking-tight
              text-gray-900
            "
                    >
                        Admin Login
                    </h1>

                    <p
                        className="
              mt-2
              text-sm
              text-gray-500
            "
                    >
                        Sign in to manage The NewsTime.
                    </p>
                </div>

                {/* Login Card */}
                <div
                    className="
            rounded-2xl
            border
            border-gray-200
            bg-white
            p-6
            shadow-sm
            sm:p-8
          "
                >
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >
                        {/* Error */}
                        {error && (
                            <div
                                role="alert"
                                className="
                  rounded-lg
                  border
                  border-red-200
                  bg-red-50
                  px-4
                  py-3
                  text-sm
                  text-red-700
                "
                            >
                                {error}
                            </div>
                        )}

                        {/* Username */}
                        <div>
                            <label
                                htmlFor="admin-username"
                                className="
                  mb-1.5
                  block
                  text-sm
                  font-semibold
                  text-gray-800
                "
                            >
                                Username
                            </label>

                            <input
                                id="admin-username"
                                name="username"
                                type="text"
                                autoComplete="username"
                                value={username}
                                onChange={(event) =>
                                    setUsername(
                                        event.target.value,
                                    )
                                }
                                disabled={submitting}
                                className="
                  h-11
                  w-full
                  rounded-lg
                  border
                  border-gray-300
                  bg-white
                  px-3
                  text-sm
                  text-gray-900
                  outline-none
                  transition
                  placeholder:text-gray-400
                  focus:border-green-500
                  focus:ring-2
                  focus:ring-green-100
                  disabled:cursor-not-allowed
                  disabled:bg-gray-100
                "
                                placeholder="Enter username"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label
                                htmlFor="admin-password"
                                className="
                  mb-1.5
                  block
                  text-sm
                  font-semibold
                  text-gray-800
                "
                            >
                                Password
                            </label>

                            <div className="relative">
                                <input
                                    id="admin-password"
                                    name="password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(event) =>
                                        setPassword(
                                            event.target.value,
                                        )
                                    }
                                    disabled={submitting}
                                    className="
                    h-11
                    w-full
                    rounded-lg
                    border
                    border-gray-300
                    bg-white
                    px-3
                    pr-11
                    text-sm
                    text-gray-900
                    outline-none
                    transition
                    placeholder:text-gray-400
                    focus:border-green-500
                    focus:ring-2
                    focus:ring-green-100
                    disabled:cursor-not-allowed
                    disabled:bg-gray-100
                  "
                                    placeholder="Enter password"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(
                                            (current) =>
                                                !current,
                                        )
                                    }
                                    disabled={submitting}
                                    className="
                    absolute
                    right-2
                    top-1/2
                    -translate-y-1/2
                    rounded-md
                    p-1.5
                    text-gray-500
                    transition
                    hover:bg-gray-100
                    hover:text-gray-700
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-green-600
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                                    aria-label={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >
                                    {showPassword ? (
                                        <EyeOff
                                            size={18}
                                            aria-hidden="true"
                                        />
                                    ) : (
                                        <Eye
                                            size={18}
                                            aria-hidden="true"
                                        />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={submitting}
                            className="
                flex
                h-11
                w-full
                items-center
                justify-center
                gap-2
                rounded-lg
                bg-green-700
                px-4
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-green-800
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-green-600
                focus-visible:ring-offset-2
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
                        >
                            {submitting ? (
                                <>
                                    <span
                                        className="
                      h-4
                      w-4
                      animate-spin
                      rounded-full
                      border-2
                      border-white/40
                      border-t-white
                    "
                                        aria-hidden="true"
                                    />

                                    Signing in...
                                </>
                            ) : (
                                <>
                                    <LogIn
                                        size={17}
                                        aria-hidden="true"
                                    />

                                    Sign in
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p
                    className="
            mt-6
            text-center
            text-xs
            text-gray-400
          "
                >
                    The NewsTime · Administration
                </p>
            </div>
        </main>
    );
}