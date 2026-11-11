import { useNewsDetailDeliveryId } from "@/contexts/NewsDetailDeliveryContext";
import {
    BriefcaseBusiness,
    ChevronDown,
    Clapperboard,
    Cpu,
    Globe2,
    Landmark,
    MapPinned,
    Newspaper,
    Trophy,
    Map,
    Home,
    KeyRound,
    Menu,
    ShieldCheck,
    Users,
    X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { navigationItems } from "../Navigation/navigation.data";

// The hamburger includes all public categories, including Business and Technology.
// The horizontal navigation intentionally retains its smaller primary selection.
const headerMenuItems = navigationItems;

const hamburgerIcons = {
    1: Home,
    10: Newspaper,
    2: Map,
    3: IndiaIcon,
    4: Globe2,
    11: MapPinned,
    5: Landmark,
    6: BriefcaseBusiness,
    7: Trophy,
    8: Cpu,
    9: Clapperboard,
} as const;

import IndiaIcon from "./IndiaIcon";
import Logo from "./Logo";
import Navigation from "../Navigation";
import LiveAdvertisementSlot from "@/components/advertisements/Advertisement/LiveAdvertisementSlot";
import { hasConfiguredHeaderAdvertisementSlot } from "@/api/advertisements/public-delivery.api";
import { useLocation } from "react-router-dom";

import { useAuth } from "@/auth/AuthContext";

function DigitalClock() {
    const [now, setNow] = useState(() => new Date());
    useEffect(() => {
        const timer = window.setInterval(() => setNow(new Date()), 1000);
        return () => window.clearInterval(timer);
    }, []);
    const pad = (value: number, length = 2) => String(value).padStart(length, "0");
    const hour12 = now.getHours() % 12 || 12;
    const period = now.getHours() >= 12 ? "PM" : "AM";
    const display = `${pad(hour12)}:${pad(now.getMinutes())}:${pad(now.getSeconds())} ${period}`;
    return <time dateTime={now.toISOString()} aria-label="Current time" className="inline-block whitespace-nowrap font-mono text-xs font-bold tabular-nums text-green-700">{display}</time>;
}

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
    const { pathname } = useLocation();
    const detailNewsId = useNewsDetailDeliveryId();
    const topCode = pathname === "/" ? "HOME_TOP" :
        pathname === "/news" || pathname === "/news/" ? "NEWS_LIST_TOP" :
            /^\/news\/[^/]+\/?$/.test(pathname) ? "NEWS_DETAIL_TOP" : null;

    const {
        user,
        isAuthenticated,
        isLoading,
        logout,
        hasPermissionCode,
    } = useAuth();

    const [menuOpen, setMenuOpen] = useState(false);
    const [publicMenuOpen, setPublicMenuOpen] = useState(false);
    const [securityOpen, setSecurityOpen] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    // Keep the live-ad sticky decision scoped to its own page/article.
    // Never reuse the previous page's decision while a new page is loading.
    const pageType = pathname === "/" ? "HOME" :
        pathname === "/news" || pathname === "/news/" ? "NEWS_LIST" :
            /^\/news\/[^/]+\/?$/.test(pathname) ? "NEWS_DETAIL" : null;
    const headerContextKey = pageType === "NEWS_DETAIL"
        ? `NEWS_DETAIL:${pathname}:${detailNewsId ?? "pending"}`
        : `${pageType ?? "OTHER"}:${pathname}`;
    const [stickyDecision, setStickyDecision] = useState<{
        contextKey: string;
        allowed: boolean;
    } | null>(null);
    const allowStickyHeader = stickyDecision?.contextKey === headerContextKey
        ? stickyDecision.allowed
        : false;

    useEffect(() => {
        if (!pageType) return;
        if (pageType === "NEWS_DETAIL" && detailNewsId == null) return;
        let cancelled = false;
        void hasConfiguredHeaderAdvertisementSlot(
            pageType,
            pageType === "NEWS_DETAIL" ? detailNewsId ?? undefined : undefined,
        ).then((configured) => {
            if (!cancelled) setStickyDecision({
                contextKey: headerContextKey,
                allowed: !configured,
            });
        }).catch(() => {
            if (!cancelled) setStickyDecision({
                contextKey: headerContextKey,
                allowed: false,
            });
        });
        return () => { cancelled = true; };
    }, [pageType, detailNewsId, headerContextKey]);


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
            className={`${(topCode === null || allowStickyHeader) ? "sticky top-0" : "relative"} z-50 border-b bg-white`}
        >
            {/* Top Header */}
            <div
                className="
      mx-auto
      flex
      h-20
      max-w-7xl
      items-center
      justify-center
      px-4
      lg:px-6
    "
            >
                {/* Menu */}
                <div className="relative z-[100] hidden">
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

                {/* Center the logo independently of utility controls. */}
                <div className="flex min-w-0 flex-1 items-center justify-center">
                    <Logo />
                </div>


            </div>

            {topCode && (topCode !== "NEWS_DETAIL_TOP" || detailNewsId != null) && (
                <div className="mx-auto w-full max-w-7xl px-3 has-[aside]:py-[18px] sm:px-4">
                    <LiveAdvertisementSlot placementCode={topCode} slotNumber={1} newsId={topCode === "NEWS_DETAIL_TOP" ? detailNewsId! : undefined} />
                </div>
            )}
            {/* Navigation row: fixed utilities and horizontally swipeable mobile links. */}
            <div className="border-t border-gray-100">
                <div className="relative mx-auto flex h-12 w-full max-w-7xl items-center gap-2 pl-0 pr-2 sm:pr-4 lg:pr-6">
                    <div className="relative z-20 shrink-0">
                        <button type="button" aria-label="Open navigation menu" aria-expanded={publicMenuOpen}
                            onClick={() => setPublicMenuOpen(open => !open)}
                            className="flex h-9 w-9 items-center justify-center rounded-md text-gray-700 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600">
                            {publicMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                        {publicMenuOpen && (
                            <div role="menu" className="absolute left-0 top-full z-[120] mt-2 max-h-[70vh] w-64 overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-xl">
                                {headerMenuItems.map(item => {
                                    const ItemIcon = hamburgerIcons[item.id as keyof typeof hamburgerIcons] ?? Newspaper;
                                    return (
                                        <NavLink key={item.id} role="menuitem" to={item.path}
                                            onClick={() => setPublicMenuOpen(false)}
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700">
                                            <ItemIcon size={item.label === "இந்தியா" ? 22 : 17} className="shrink-0 text-green-700" aria-hidden="true" />
                                            <span>{item.label}</span>
                                        </NavLink>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                    <div className="shrink-0 whitespace-nowrap font-mono text-[9px] font-semibold tabular-nums text-green-700 sm:text-xs">
                        {currentDate}
                    </div>
                    <div className="min-w-0 flex-1 overflow-hidden">
                        <Navigation />
                    </div>
                    <div className="shrink-0 whitespace-nowrap border-l border-gray-100 pl-2 sm:pl-3">
                        <DigitalClock />
                    </div>
                </div>
            </div>
        </header>
    );
}