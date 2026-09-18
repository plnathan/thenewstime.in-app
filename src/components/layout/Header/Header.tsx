import {
    ChevronDown,
    Home,
    KeyRound,
    Menu,
    Search,
    ShieldCheck,
    Users,
    X,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import Logo from "./Logo";
import Navigation from "../Navigation";

import { useAuth } from "@/auth/AuthContext";

function getCurrentDate() {
    const date = new Date();

    const tamilDays = [
        "ஞாயிறு",
        "திங்கள்",
        "செவ்வாய்",
        "புதன்",
        "வியாழன்",
        "வெள்ளி",
        "சனி",
    ];

    const tamilMonths = [
        "ஜனவரி",
        "பிப்ரவரி",
        "மார்ச்",
        "ஏப்ரல்",
        "மே",
        "ஜூன்",
        "ஜூலை",
        "ஆகஸ்ட்",
        "செப்டம்பர்",
        "அக்டோபர்",
        "நவம்பர்",
        "டிசம்பர்",
    ];

    const dayName = tamilDays[date.getDay()];
    const day = date.getDate();
    const monthName = tamilMonths[date.getMonth()];
    const year = date.getFullYear();

    return `${dayName}, ${day} ${monthName} ${year} `;
}

export default function Header() {
    const currentDate = getCurrentDate();

    const {
        user,
        isAuthenticated,
        isLoading,
        logout,
        hasPermissionCode,
    } = useAuth();

    const [menuOpen, setMenuOpen] = useState(false);
    const [securityOpen, setSecurityOpen] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    const canReadUsers =
        isAuthenticated &&
        hasPermissionCode("users.read");

    const canReadRoles =
        isAuthenticated &&
        hasPermissionCode("roles.read");

    const canReadPermissions =
        isAuthenticated &&
        hasPermissionCode("permissions.read");

    const canAccessSecurity =
        canReadUsers ||
        canReadRoles ||
        canReadPermissions;

    const handleLogout = async () => {
        if (loggingOut) {
            return;
        }

        try {
            setLoggingOut(true);
            await logout();
        } catch (error) {
            console.error("Logout failed:", error);
        } finally {
            /*
             * Always refresh after logout.
             *
             * This ensures that:
             * - authentication UI is reset
             * - protected routes are re-evaluated
             * - stale component state is removed
             * - public-facing UI is rendered again
             */
            window.location.reload();
        }
    };

    const handleMenuItemClick = () => {
        setMenuOpen(false);
        setSecurityOpen(false);
    };

    const displayName =
        user?.displayName?.trim() ||
        user?.fullName?.trim() ||
        user?.username?.trim() ||
        "";

    return (
        <header
            className="
    sticky
    top-0
    z-50
    border-b
    bg-white
  "
        >
            {/* Top Header */}
            <div
                className="
      mx-auto
      flex
      h-20
      max-w-7xl
      items-center
      justify-between
      px-4
      lg:px-6
    "
            >
                {/* Menu */}
                <div className="relative z-[100]">
                    <button
                        type="button"
                        className="
          rounded
          p-2
          hover:bg-gray-100
          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-green-600
          focus-visible:ring-offset-2
        "
                        aria-label={
                            menuOpen
                                ? "Close menu"
                                : "Open menu"
                        }
                        aria-expanded={menuOpen}
                        aria-haspopup="menu"
                        onClick={() => {
                            setMenuOpen((open) => !open);
                        }}
                    >
                        {menuOpen ? (
                            <X
                                size={24}
                                aria-hidden="true"
                            />
                        ) : (
                            <Menu
                                size={24}
                                aria-hidden="true"
                            />
                        )}
                    </button>

                    {/* Responsive Menu */}
                    {menuOpen && (
                        <div
                            className="
            absolute
            left-0
            top-full
            z-[110]
            mt-2
            w-64
            overflow-hidden
            rounded-xl
            border
            border-gray-200
            bg-white
            shadow-lg
          "
                            role="menu"
                        >
                            {isLoading ? (
                                <div
                                    className="
                px-4
                py-3
                text-sm
                text-gray-500
              "
                                >
                                    Loading...
                                </div>
                            ) : isAuthenticated ? (
                                <div>
                                    {/* Logged-in User */}
                                    <div
                                        className="
                  border-b
                  border-gray-100
                  px-4
                  py-4
                "
                                    >
                                        <p
                                            className="
                    text-xs
                    font-medium
                    uppercase
                    tracking-wide
                    text-gray-400
                  "
                                        >
                                            Logged in as
                                        </p>

                                        <p
                                            className="
                    mt-1
                    truncate
                    text-sm
                    font-semibold
                    text-gray-900
                  "
                                        >
                                            {displayName}
                                        </p>
                                    </div>

                                    {/* News List Home */}
                                    <Link
                                        to="/admin/news"
                                        role="menuitem"
                                        onClick={handleMenuItemClick}
                                        className="
                  flex
                  items-center
                  gap-3
                  border-b
                  border-gray-100
                  px-4
                  py-3
                  text-sm
                  font-medium
                  text-gray-700
                  transition-colors
                  hover:bg-gray-50
                  hover:text-green-700
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-inset
                  focus-visible:ring-green-600
                "
                                    >
                                        <Home
                                            size={18}
                                            aria-hidden="true"
                                        />

                                        <span>
                                            News List Home
                                        </span>
                                    </Link>

                                    {/* Security */}
                                    {canAccessSecurity && (
                                        <div
                                            className="
                    border-b
                    border-gray-100
                  "
                                        >
                                            <button
                                                type="button"
                                                role="menuitem"
                                                aria-expanded={securityOpen}
                                                aria-haspopup="menu"
                                                onClick={() => {
                                                    setSecurityOpen(
                                                        (open) => !open,
                                                    );
                                                }}
                                                className="
                      flex
                      w-full
                      items-center
                      justify-between
                      px-4
                      py-3
                      text-left
                      text-sm
                      font-medium
                      text-gray-700
                      transition-colors
                      hover:bg-gray-50
                      hover:text-green-700
                      focus-visible:outline-none
                      focus-visible:ring-2
                      focus-visible:ring-inset
                      focus-visible:ring-green-600
                    "
                                            >
                                                <span className="flex items-center gap-3">
                                                    <ShieldCheck
                                                        size={18}
                                                        aria-hidden="true"
                                                    />

                                                    <span>
                                                        Security
                                                    </span>
                                                </span>

                                                <ChevronDown
                                                    size={16}
                                                    aria-hidden="true"
                                                    className={[
                                                        "transition-transform",
                                                        securityOpen
                                                            ? "rotate-180"
                                                            : "",
                                                    ].join(" ")}
                                                />
                                            </button>

                                            {/* Security Submenu */}
                                            {securityOpen && (
                                                <div
                                                    className="
                        border-t
                        border-gray-100
                        bg-gray-50
                        py-1
                      "
                                                    role="menu"
                                                >
                                                    {/* Users */}
                                                    {canReadUsers && (
                                                        <Link
                                                            to="/admin/security/users"
                                                            role="menuitem"
                                                            onClick={
                                                                handleMenuItemClick
                                                            }
                                                            className="
                            flex
                            items-center
                            gap-3
                            px-4
                            py-2.5
                            pl-11
                            text-sm
                            text-gray-600
                            transition-colors
                            hover:bg-gray-100
                            hover:text-green-700
                            focus-visible:outline-none
                            focus-visible:ring-2
                            focus-visible:ring-inset
                            focus-visible:ring-green-600
                          "
                                                        >
                                                            <Users
                                                                size={16}
                                                                aria-hidden="true"
                                                            />

                                                            <span>
                                                                Users
                                                            </span>
                                                        </Link>
                                                    )}

                                                    {/* Roles */}
                                                    {canReadRoles && (
                                                        <Link
                                                            to="/admin/security/roles"
                                                            role="menuitem"
                                                            onClick={
                                                                handleMenuItemClick
                                                            }
                                                            className="
                            flex
                            items-center
                            gap-3
                            px-4
                            py-2.5
                            pl-11
                            text-sm
                            text-gray-600
                            transition-colors
                            hover:bg-gray-100
                            hover:text-green-700
                            focus-visible:outline-none
                            focus-visible:ring-2
                            focus-visible:ring-inset
                            focus-visible:ring-green-600
                          "
                                                        >
                                                            <ShieldCheck
                                                                size={16}
                                                                aria-hidden="true"
                                                            />

                                                            <span>
                                                                Roles
                                                            </span>
                                                        </Link>
                                                    )}

                                                    {/* Permissions */}
                                                    {canReadPermissions && (
                                                        <Link
                                                            to="/admin/security/permissions"
                                                            role="menuitem"
                                                            onClick={
                                                                handleMenuItemClick
                                                            }
                                                            className="
                            flex
                            items-center
                            gap-3
                            px-4
                            py-2.5
                            pl-11
                            text-sm
                            text-gray-600
                            transition-colors
                            hover:bg-gray-100
                            hover:text-green-700
                            focus-visible:outline-none
                            focus-visible:ring-2
                            focus-visible:ring-inset
                            focus-visible:ring-green-600
                          "
                                                        >
                                                            <KeyRound
                                                                size={16}
                                                                aria-hidden="true"
                                                            />

                                                            <span>
                                                                Permissions
                                                            </span>
                                                        </Link>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Logout */}
                                    <button
                                        type="button"
                                        role="menuitem"
                                        disabled={loggingOut}
                                        onClick={() => {
                                            void handleLogout();
                                        }}
                                        className="
                  flex
                  w-full
                  items-center
                  px-4
                  py-3
                  text-left
                  text-sm
                  font-medium
                  text-red-600
                  transition-colors
                  hover:bg-red-50
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-inset
                  focus-visible:ring-red-500
                "
                                    >
                                        {loggingOut
                                            ? "Logging out..."
                                            : "Logout"}
                                    </button>
                                </div>
                            ) : null}
                        </div>
                    )}
                </div>

                {/* Logo */}
                <Logo />

                {/* Empty right side to keep logo centered */}
                <div
                    className="
        h-10
        w-10
      "
                    aria-hidden="true"
                />
            </div>

            {/* Navigation / Utility Row */}
            <div
                className="
      border-t
      border-gray-100
    "
            >
                {/* Mobile Date + E-Paper + Search */}
                <div
                    className="
        flex
        items-center
        justify-between
        border-b
        border-gray-100
        px-4
        py-1.5
        sm:hidden
      "
                >
                    {/* Mobile Date */}
                    <div
                        className="
          min-w-0
          truncate
          text-xs
          font-medium
          text-gray-500
        "
                    >
                        {currentDate}
                    </div>

                    {/* Mobile E-Paper + Search */}
                    <div
                        className="
          flex
          shrink-0
          items-center
          gap-2
          pl-3
        "
                    >
                        <button
                            type="button"
                            className="
            whitespace-nowrap
            text-xs
            font-medium
            text-gray-600
            transition-colors
            hover:text-green-700
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-green-600
            focus-visible:ring-offset-2
          "
                        >
                            தமிழ் E-Paper
                        </button>

                        <button
                            type="button"
                            className="
            rounded-full
            p-1.5
            text-gray-700
            transition-colors
            hover:bg-gray-100
            hover:text-green-700
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-green-600
            focus-visible:ring-offset-2
          "
                            aria-label="Search"
                        >
                            <Search
                                size={18}
                                aria-hidden="true"
                            />
                        </button>
                    </div>
                </div>

                <div
                    className="
        mx-auto
        flex
        h-12
        max-w-7xl
        items-center
        px-4
        lg:px-6
      "
                >
                    {/* Desktop Date */}
                    <div
                        className="
          hidden
          shrink-0
          items-center
          pr-4
          text-xs
          font-medium
          text-gray-500
          sm:flex
          lg:pr-6
        "
                    >
                        {currentDate}
                    </div>

                    {/* Navigation */}
                    <div className="min-w-0 flex-1">
                        <Navigation />
                    </div>

                    {/* Desktop E-Paper + Search */}
                    <div
                        className="
          hidden
          shrink-0
          items-center
          gap-2
          pl-3
          sm:flex
          sm:gap-3
          sm:pl-4
          lg:gap-4
          lg:pl-6
        "
                    >
                        <button
                            type="button"
                            className="
            whitespace-nowrap
            text-xs
            font-medium
            text-gray-600
            transition-colors
            hover:text-green-700
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-green-600
            focus-visible:ring-offset-2
            sm:text-sm
          "
                        >
                            தமிழ் E-Paper
                        </button>

                        <button
                            type="button"
                            className="
            rounded-full
            p-2
            text-gray-700
            transition-colors
            hover:bg-gray-100
            hover:text-green-700
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-green-600
            focus-visible:ring-offset-2
          "
                            aria-label="Search"
                        >
                            <Search
                                size={20}
                                aria-hidden="true"
                            />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}