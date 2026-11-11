import {
    CircleCheck,
    CircleDot,
    CirclePause,
    CircleX,
    Clock3,
    FileText,
    ShieldAlert,
} from "lucide-react";

export type AdvertisementStatus =
    | "DRAFT"
    | "SUBMITTED"
    | "APPROVED"
    | "REJECTED"
    | "ON_HOLD"
    | "ACTIVE"
    | "INACTIVE"
    | "ARCHIVED";

interface AdvertisementStatusBadgeProps {
    status: AdvertisementStatus;
    size?: "sm" | "md";
}

const STATUS_CONFIG: Record<
    AdvertisementStatus,
    {
        label: string;
        className: string;
        icon: typeof FileText;
    }
> = {
    DRAFT: {
        label: "Draft",
        className:
            "border-gray-200 bg-gray-50 text-gray-700",
        icon: FileText,
    },
    SUBMITTED: {
        label: "Submitted",
        className:
            "border-blue-200 bg-blue-50 text-blue-700",
        icon: Clock3,
    },
    APPROVED: {
        label: "Approved",
        className:
            "border-green-200 bg-green-50 text-green-700",
        icon: CircleCheck,
    },
    REJECTED: {
        label: "Rejected",
        className:
            "border-red-200 bg-red-50 text-red-700",
        icon: CircleX,
    },
    ON_HOLD: {
        label: "On Hold",
        className:
            "border-amber-200 bg-amber-50 text-amber-700",
        icon: ShieldAlert,
    },
    ACTIVE: {
        label: "Active",
        className:
            "border-emerald-200 bg-emerald-50 text-emerald-700",
        icon: CircleDot,
    },
    INACTIVE: {
        label: "Inactive",
        className:
            "border-slate-200 bg-slate-50 text-slate-700",
        icon: CirclePause,
    },
    ARCHIVED: {
        label: "Archived",
        className:
            "border-gray-200 bg-gray-100 text-gray-600",
        icon: FileText,
    },
};

export default function AdvertisementStatusBadge({
    status,
    size = "md",
}: AdvertisementStatusBadgeProps) {
    const config = STATUS_CONFIG[status];
    const Icon = config.icon;

    return (
        <span
            className={`
                inline-flex
                items-center
                gap-1.5
                rounded-full
                border
                font-semibold
                ${config.className}
                ${size === "sm"
                    ? "px-2 py-0.5 text-xs"
                    : "px-2.5 py-1 text-xs"
                }
            `}
        >
            <Icon
                size={size === "sm" ? 13 : 14}
                aria-hidden="true"
            />

            {config.label}
        </span>
    );
}