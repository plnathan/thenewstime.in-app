import { rememberAdminReturnPath } from "@/auth/adminReturnPath";

/**
 * -----------------------------------------------------------------------------
 * Project     : thenewstime.in
 * Component   : AdminLayout
 * Description : Shared responsive layout for administration modules.
 * -----------------------------------------------------------------------------
 */

import {
    ArrowUpRight,
    FileText,
    LayoutDashboard,
    ShieldCheck,
    Users,
    Megaphone,
    Settings2,
    LogOut,
    UserRound,
    SlidersHorizontal,
    Layers3,
    CircleDollarSign,
    PanelsTopLeft,
    Building2,
    Inbox,
} from "lucide-react";

import {
    NavLink,
    useLocation,
    useNavigate,
} from "react-router-dom";

import {
    useState,
} from "react";

import { useAuth } from "@/auth/AuthContext";
import ScrollToTopBottom from "@/components/ui/ScrollToTopBottom/ScrollToTopBottom";

import type { ReactNode } from "react";

interface AdminLayoutProps {
    children: ReactNode;
}

interface AdminNavigationItem {
    label: string;
    description: string;
    to: string;
    icon: typeof LayoutDashboard;
    visible: boolean;
    end?: boolean;
}

export default function AdminLayout({
    children,
}: AdminLayoutProps) {
    const location = useLocation();
    const navigate = useNavigate();

    const {
        user,
        isAuthenticated,
        hasPermissionCode,
        logout,
    } = useAuth();

    const [loggingOut, setLoggingOut] = useState(false);
    const [advertisementsExpanded, setAdvertisementsExpanded] = useState(false);
    const [securityExpanded, setSecurityExpanded] = useState(false);

    const canReadUsers =
        hasPermissionCode("users.read");

    const canReadRoles =
        hasPermissionCode("roles.read");

    const canReadPermissions =
        hasPermissionCode("permissions.read");

    const canReadAdvertisements =
        hasPermissionCode("advertisements.read");

    const canReadFinancialApprovalThresholds =
        hasPermissionCode(
            "advertisements.financial_approval_thresholds.read",
        );

    const canReadSecurity =
        canReadUsers ||
        canReadRoles ||
        canReadPermissions;

    const isSecurityRoute =
        location.pathname.startsWith("/admin/security");

    const isAdvertisementRoute =
        location.pathname.startsWith("/admin/advertisements");

    const navigationItems: AdminNavigationItem[] = [
        {
            label: "Dashboard",
            description: "Administration home",
            to: "/admin",
            icon: LayoutDashboard,
            visible: isAuthenticated,
            end: true,
        },
        {
            label: "News",
            description: "Articles and publishing",
            to: "/admin/news",
            icon: FileText,
            visible: isAuthenticated,
        },
        {
            label: "Advertisements",
            description: "Advertisement Administration",
            to: "/admin/advertisements",
            icon: Megaphone,
            visible:
                canReadAdvertisements ||
                canReadFinancialApprovalThresholds,
        },
        {
            label: "Security",
            description: "Users, roles and permissions",
            to: "/admin/security",
            icon: ShieldCheck,
            visible: canReadSecurity,
        },
    ];

    const visibleNavigationItems =
        navigationItems.filter((item) => item.visible);

    const userDisplayName =
        user?.fullName?.trim() ||
        user?.displayName?.trim() ||
        user?.username?.trim() ||
        "Logged-in user";

    /**
     * Shared dimensions and alignment for all header actions.
     */
    const headerActionClass =
        "inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2";

    /**
     * Log out through the existing authentication context.
     * The context remains responsible for clearing the session.
     */
    const handleLogout = async () => {
        if (loggingOut) {
            return;
        }

        rememberAdminReturnPath(location.pathname + location.search + location.hash);
        setLoggingOut(true);

        try {
            await logout();
        } catch (error) {
            console.error(
                "Unable to complete logout cleanly.",
                error,
            );
        } finally {
            setLoggingOut(false);

            navigate("/login", {
                replace: true,
            });
        }
    };

    /** Configuration links share the same access guard as their routes. */
    const advertisementConfigurationLinks = [
        {
            label: "Advertisement Enquiries",
            description: "Review and respond to public advertising enquiries",
            to: "/admin/advertisements/enquiries",
            icon: Inbox,
            visible: canReadAdvertisements,
        },
        {
            label: "Business Type Configuration",
            description: "Manage client business types",
            to: "/admin/advertisements/business-types",
            icon: Building2,
            visible: hasPermissionCode("advertisements.clients.read"),
        },
        {
            label: "Client Configuration",
            description: "Add and manage advertisement clients",
            to: "/admin/advertisements/client-configuration",
            icon: Users,
            visible: hasPermissionCode("advertisements.clients.read"),
        },
        {
            label: "Format Configuration",
            description: "Manage advertisement creative formats",
            to: "/admin/advertisements/formats",
            icon: PanelsTopLeft,
            visible: hasPermissionCode("advertisements.formats.read"),
        },
        {
            label: "Placement Configuration",
            description: "Manage public advertisement slots",
            to: "/admin/advertisements/placements",
            icon: Layers3,
            visible: canReadAdvertisements,
        },
        {
            label: "Rate Card Configuration",
            description: "Manage advertisement pricing",
            to: "/admin/advertisements/rate-cards",
            icon: CircleDollarSign,
            visible: canReadAdvertisements,
        },
        {
            label: "Financial Approval Thresholds",
            description: "Configure financial approval limits",
            to: "/admin/advertisements/financial-approval-thresholds",
            icon: SlidersHorizontal,
            visible: canReadFinancialApprovalThresholds,
        },
    ];

    const renderSecurityLinks = (mobile = false) => {
        if (!isSecurityRoute && !securityExpanded) return null;

        return [
            { label: "Users", to: "/admin/security/users", icon: Users, visible: canReadUsers },
            { label: "Roles", to: "/admin/security/roles", icon: ShieldCheck, visible: canReadRoles },
            { label: "Permissions", to: "/admin/security/permissions", icon: Settings2, visible: canReadPermissions },
        ].filter(item => item.visible).map(item => {
            const Icon = item.icon;
            return (
                <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) => [
                        mobile
                            ? "inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium"
                            : "ml-7 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
                        isActive
                            ? "bg-green-50 text-green-800 ring-1 ring-inset ring-green-100"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                    ].join(" ")}
                >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{item.label}</span>
                </NavLink>
            );
        });
    };

    const renderNewsConfigurationLinks = (mobile = false) => {
        if (!location.pathname.startsWith("/admin/news")) return null;
        return [
            { label: "News Management", to: "/admin/news/list" },
            { label: "News Category Configuration", to: "/admin/news/categories" },
        ].map(item => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => [
                mobile ? "inline-flex min-h-10 shrink-0 items-center rounded-lg border px-3 py-2 text-sm" : "ml-7 block rounded-xl px-3 py-2.5 text-sm",
                isActive ? "bg-green-50 text-green-800" : "text-gray-600 hover:bg-gray-50",
            ].join(" ")}>{item.label}</NavLink>
        ));
    };

    const renderAdvertisementConfigurationLinks = (mobile = false) => {
        if (!isAdvertisementRoute && !advertisementsExpanded) return null;

        return advertisementConfigurationLinks
            .filter((item) => item.visible)
            .map((item) => {
                const Icon = item.icon;
                return (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) => [
                            mobile
                                ? "inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition"
                                : "group ml-7 flex items-start gap-3 rounded-xl px-3 py-2.5 transition",
                            mobile
                                ? isActive
                                    ? "border-green-700 bg-green-700 text-white"
                                    : "border-gray-200 bg-white text-gray-700 hover:border-green-200 hover:bg-green-50"
                                : isActive
                                    ? "bg-green-50 text-green-800 ring-1 ring-inset ring-green-100"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                        ].join(" ")}
                    >
                        <Icon className={mobile ? "h-4 w-4 shrink-0" : "mt-0.5 h-4 w-4 shrink-0"} aria-hidden="true" />
                        <span className="min-w-0">
                            <span className="block text-sm font-semibold">{item.label}</span>
                            {!mobile && <span className="mt-0.5 block text-xs text-gray-500">{item.description}</span>}
                        </span>
                    </NavLink>
                );
            });
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            {/* Shared administration header */}
            <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
                <div className="flex min-h-[68px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:flex-nowrap">
                    {/* Administration brand */}
                    <NavLink
                        to="/admin"
                        className="flex min-w-0 items-center gap-3"
                        aria-label="Administration dashboard"
                    >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-700 text-sm font-extrabold text-white">
                            TNT
                        </span>

                        <span className="min-w-0">
                            <span className="block truncate text-sm font-bold tracking-tight text-gray-900 sm:text-base">
                                www.thenewstime.in
                            </span>

                            <span className="block truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500">
                                Administration
                            </span>
                        </span>
                    </NavLink>

                    {/* User information and actions */}
                    <div className="flex min-w-0 flex-wrap items-center justify-end gap-2 sm:gap-3">
                        {isAuthenticated && (
                            <div
                                className={`${headerActionClass} border-gray-200 bg-gray-50 text-gray-700`}
                                title={userDisplayName}
                            >
                                <UserRound
                                    className="h-4 w-4 shrink-0"
                                    aria-hidden="true"
                                />

                                <span className="min-w-0">
                                    <span className="text-xs font-medium text-gray-500">
                                        Logged in as:
                                    </span>{" "}

                                    <span className="inline-block max-w-[150px] truncate align-bottom text-sm font-semibold text-gray-900 sm:max-w-[200px]">
                                        {userDisplayName}
                                    </span>
                                </span>
                            </div>
                        )}

                        {/* Open the public website in a separate tab */}
                        <a
                            href="https://www.thenewstime.in"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${headerActionClass} border-gray-200 bg-white text-gray-700 hover:border-green-200 hover:bg-green-50 hover:text-green-800`}
                            aria-label="Open public website in a new tab"
                        >
                            <span>Public website</span>

                            <ArrowUpRight
                                className="h-4 w-4 shrink-0"
                                aria-hidden="true"
                            />
                        </a>

                        {/* Logout */}
                        {isAuthenticated && (
                            <button
                                type="button"
                                onClick={() => {
                                    void handleLogout();
                                }}
                                disabled={loggingOut}
                                className={`${headerActionClass} border-red-200 bg-white text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:ring-red-500`}
                            >
                                <LogOut
                                    className="h-4 w-4 shrink-0"
                                    aria-hidden="true"
                                />

                                <span>
                                    {loggingOut
                                        ? "Logging out..."
                                        : "Logout"}
                                </span>
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* Mobile navigation: always visible, without a hamburger menu */}
            <nav
                aria-label="Administration navigation"
                className="border-b border-gray-200 bg-white lg:hidden"
            >
                <div className="flex gap-2 overflow-x-auto px-3 py-3">
                    {visibleNavigationItems.map((item) => {
                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.end}
                                onClick={() => {
                                    if (item.label === "Advertisements") setAdvertisementsExpanded(true);
                                    if (item.label === "Security") setSecurityExpanded(true);
                                }}
                                className={({ isActive }) => [
                                    "inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition",
                                    isActive
                                        ? "border-green-700 bg-green-700 text-white"
                                        : "border-gray-200 bg-white text-gray-700 hover:border-green-200 hover:bg-green-50 hover:text-green-800",
                                ].join(" ")}
                            >
                                <Icon
                                    className="h-4 w-4 shrink-0"
                                    aria-hidden="true"
                                />

                                <span>{item.label}</span>
                            </NavLink>
                        );
                    })}

                    {renderSecurityLinks(true)}
                    {renderNewsConfigurationLinks(true)}
                    {renderAdvertisementConfigurationLinks(true)}
                </div>
            </nav>

            <div className="mx-auto flex min-h-[calc(100vh-68px)] max-w-[1920px]">
                {/* Persistent desktop sidebar */}
                <aside className="hidden w-64 shrink-0 border-r border-gray-200 bg-white lg:block">
                    <div className="sticky top-[68px] flex max-h-[calc(100vh-68px)] flex-col overflow-y-auto px-4 py-6">
                        <div className="px-3 pb-3">
                            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400">
                                Workspace
                            </p>
                        </div>

                        <nav
                            aria-label="Administration sidebar"
                            className="space-y-1"
                        >
                            {visibleNavigationItems.map((item) => {
                                const Icon = item.icon;

                                return (
                                    <div key={item.to}>
                                        <NavLink
                                            to={item.to}
                                            end={item.end}
                                            onClick={() => {
                                                if (item.label === "Advertisements") setAdvertisementsExpanded(true);
                                                if (item.label === "Security") setSecurityExpanded(true);
                                            }}
                                            className={({ isActive }) => [
                                                "group flex items-start gap-3 rounded-xl px-3 py-3 transition",
                                                isActive
                                                    ? "bg-green-50 text-green-800 ring-1 ring-inset ring-green-100"
                                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                                            ].join(" ")}
                                        >
                                            {({ isActive }) => (
                                                <>
                                                    <Icon
                                                        className={[
                                                            "mt-0.5 h-5 w-5 shrink-0",
                                                            isActive
                                                                ? "text-green-700"
                                                                : "text-gray-400 group-hover:text-gray-600",
                                                        ].join(" ")}
                                                        aria-hidden="true"
                                                    />

                                                    <span className="min-w-0">
                                                        <span className="block text-sm font-semibold">
                                                            {item.label}
                                                        </span>

                                                        <span className="mt-0.5 block text-xs text-gray-500">
                                                            {item.description}
                                                        </span>
                                                    </span>
                                                </>
                                            )}
                                        </NavLink>

                                        {item.label === "Advertisements" &&
                                            renderAdvertisementConfigurationLinks()}
                                        {item.label === "News" && renderNewsConfigurationLinks()}
                                        {item.label === "Security" && renderSecurityLinks()}
                                    </div>
                                );
                            })}
                        </nav>

                        {(canReadSecurity ||
                            canReadAdvertisements ||
                            canReadFinancialApprovalThresholds) && (
                                <div className="mt-8 border-t border-gray-100 pt-5">
                                    <p className="px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400">
                                        Current module
                                    </p>

                                    <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
                                        <p className="text-sm font-semibold text-gray-800">
                                            {isSecurityRoute
                                                ? "Security"
                                                : isAdvertisementRoute
                                                    ? "Advertisements"
                                                    : "News and content"}
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-gray-500">
                                            Use the navigation above to switch between the modules available to your account.
                                        </p>
                                    </div>
                                </div>
                            )}

                        <div className="mt-auto pt-8">
                            <div className="rounded-xl bg-green-50 p-4">
                                <p className="text-xs font-semibold text-green-900">
                                    www.thenewstime.in
                                </p>

                                <p className="mt-1 text-xs leading-5 text-green-800">
                                    India’s Digital Voice
                                </p>
                            </div>
                        </div>
                    </div>
                </aside>

                <ScrollToTopBottom />

                {/* Page content */}
                <div className="min-w-0 flex-1">
                    {children}
                </div>
            </div>
        </div>
    );
}
