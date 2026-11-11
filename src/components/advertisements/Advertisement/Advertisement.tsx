import type { CSSProperties } from "react";
import { PUBLIC_PLACEMENT_SIZES, type PublicPlacementCode } from "../../../constants/publicPlacementSizes";

interface AdvertisementProps {
    className?: string;
    placementCode?: PublicPlacementCode;
    labelPosition?: "top-left" | "bottom-right";
    message?: string;
    sizeLabel?: string;
}

/**
 * Public-site advertisement placeholder.
 * This component intentionally renders a placeholder only; it does not
 * request or serve live advertisement creatives.
 */
export default function Advertisement({
    className = "",
    placementCode,
    labelPosition = "top-left",
    message = "Your advertisement here",
    sizeLabel = "Responsive placement",
}: AdvertisementProps) {
    const labelPositionClass = labelPosition === "bottom-right"
        ? "bottom-3 right-3"
        : "left-3 top-3";

    const dimensions = placementCode ? PUBLIC_PLACEMENT_SIZES[placementCode] : null;
    const mobileStyle = dimensions ? { maxWidth: `${dimensions.mobile.width}px`, aspectRatio: `${dimensions.mobile.width} / ${dimensions.mobile.height}` } : undefined;
    const tabletStyle = dimensions ? { maxWidth: `${dimensions.tablet.width}px`, aspectRatio: `${dimensions.tablet.width} / ${dimensions.tablet.height}` } : undefined;
    const desktopStyle = dimensions ? { maxWidth: `${dimensions.desktop.width}px`, aspectRatio: `${dimensions.desktop.width} / ${dimensions.desktop.height}` } : undefined;
    const renderPlaceholder = (style: CSSProperties, breakpointClass: string) => (
        <div className={`mx-auto w-full ${breakpointClass}`} style={style}>
            <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-green-300 bg-green-50 p-3 text-center">
                <span className="text-xs font-semibold text-slate-600">Advertisement</span>
                <span className="mt-2 text-sm font-semibold text-slate-700">{message}</span>
                <span className="mt-1 text-xs text-slate-500">{placementCode ?? sizeLabel}</span>
            </div>
        </div>
    );
    if (dimensions && mobileStyle && tabletStyle && desktopStyle) {
        return <aside aria-label={`Advertisement ${placementCode}`} className={className}>
            {renderPlaceholder(mobileStyle, "md:hidden")}
            {renderPlaceholder(tabletStyle, "hidden md:block lg:hidden")}
            {renderPlaceholder(desktopStyle, "hidden lg:block")}
        </aside>;
    }
    return (
        <aside
            aria-label="Advertisement"
            className={`h-full w-full ${className}`}
        >
            <div
                className="
                    relative flex h-full min-h-[100px] w-full flex-col
                    items-center justify-center overflow-hidden rounded-xl
                    border border-dashed border-green-300 bg-gradient-to-br
                    from-green-50 via-white to-emerald-50 px-4 py-8 text-center
                    transition-colors duration-200 hover:border-green-400
                "
            >
                <span
                    className={`absolute ${labelPositionClass} rounded-md border border-green-200 bg-white/95 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-600 shadow-sm`}
                >
                    Advertisement
                </span>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-green-200 bg-white text-green-700 shadow-sm">
                    <svg
                        viewBox="0 0 24 24"
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        aria-hidden="true"
                    >
                        <rect x="3.5" y="3.5" width="17" height="17" rx="2.5" />
                        <circle cx="9" cy="9" r="1.5" />
                        <path d="m4.5 17 5-5 3.2 3.2 2.2-2.2 4.6 4.6" />
                    </svg>
                </div>

                <p className="mt-3 text-sm font-semibold text-slate-700">
                    {message}
                </p>
                <p className="mt-1 text-[11px] font-medium tracking-wide text-slate-500">
                    {sizeLabel}
                </p>
            </div>
        </aside>
    );
}
