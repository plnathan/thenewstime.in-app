/**
 * -----------------------------------------------------------------------------
 * Project     : thenewstime.in
 * Page        : Access Denied
 * -----------------------------------------------------------------------------
 */

import {
    ArrowLeft,
    Home,
    ShieldAlert,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

const AccessDeniedPage = () => {
    const navigate = useNavigate();

    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
            <section
                className="
          w-full
          max-w-lg
          rounded-2xl
          border
          border-gray-200
          bg-white
          p-8
          text-center
          shadow-sm
          sm:p-10
        "
                aria-labelledby="access-denied-title"
            >
                <div
                    className="
            mx-auto
            mb-6
            flex
            h-16
            w-16
            items-center
            justify-center
            rounded-full
            bg-red-50
            text-red-600
          "
                    aria-hidden="true"
                >
                    <ShieldAlert
                        className="h-8 w-8"
                    />
                </div>

                <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-green-700">
                    Access denied
                </p>

                <h1
                    id="access-denied-title"
                    className="
            text-2xl
            font-bold
            text-gray-900
            sm:text-3xl
          "
                >
                    You do not have permission
                </h1>

                <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-gray-600 sm:text-base">
                    Your account is authenticated, but
                    you do not have the required permission
                    to access this page.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-lg
              border
              border-gray-300
              bg-white
              px-5
              py-2.5
              text-sm
              font-medium
              text-gray-700
              transition
              hover:bg-gray-50
              focus:outline-none
              focus:ring-2
              focus:ring-green-600
              focus:ring-offset-2
            "
                    >
                        <ArrowLeft
                            className="h-4 w-4"
                        />

                        Go Back
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/admin/news")
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
              transition
              hover:bg-green-800
              focus:outline-none
              focus:ring-2
              focus:ring-green-600
              focus:ring-offset-2
            "
                    >
                        <Home
                            className="h-4 w-4"
                        />

                        News Management
                    </button>
                </div>
            </section>
        </main>
    );
};

export default AccessDeniedPage;