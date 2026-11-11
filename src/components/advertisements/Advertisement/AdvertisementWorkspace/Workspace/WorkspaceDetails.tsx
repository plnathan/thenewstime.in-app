import type {
    ComponentType,
} from "react";

import {
    ExternalLink,
    FileText,
    Link2,
    Megaphone,
    Settings2,
    Tag,
} from "lucide-react";

import {
    Link,
} from "react-router-dom";

import type {
    AdvertisementDetails,
} from "@/api/advertisements/advertisement.api";

import Surface from "@/components/ui/Surface";

interface WorkspaceDetailsProps {
    advertisement: AdvertisementDetails;
}

interface DetailItemProps {
    label: string;
    value: string;
    icon?: ComponentType<{
        className?: string;
    }>;
    fullWidth?: boolean;
}

const DetailItem = ({
    label,
    value,
    icon: Icon,
    fullWidth = false,
}: DetailItemProps) => {
    return (
        <div
            className={
                fullWidth
                    ? "md:col-span-2"
                    : ""
            }
        >
            <div className="mb-1.5 flex items-center gap-2">
                {Icon ? (
                    <Icon
                        className="
                            h-3.5
                            w-3.5
                            text-slate-400
                        "
                        aria-hidden="true"
                    />
                ) : null}

                <span
                    className="
                        text-xs
                        font-medium
                        uppercase
                        tracking-wide
                        text-slate-500
                    "
                >
                    {label}
                </span>
            </div>

            <div
                className="
                    min-h-[40px]
                    rounded-lg
                    border
                    border-slate-200
                    bg-slate-50
                    px-3
                    py-2.5
                    text-sm
                    text-slate-800
                "
            >
                {value}
            </div>
        </div>
    );
};

const formatAdvertisementType = (
    advertisementType: string,
): string => {
    return advertisementType
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(
            /\b\w/g,
            (character) =>
                character.toUpperCase(),
        );
};

const formatBoolean = (
    value: boolean,
): string => {
    return value
        ? "Yes"
        : "No";
};

const formatDateTime = (
    value: string | null,
): string => {
    if (!value) {
        return "Not recorded";
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime(),
        )
    ) {
        return value;
    }

    return new Intl.DateTimeFormat(
        "en-IN",
        {
            dateStyle: "medium",
            timeStyle: "short",
        },
    ).format(date);
};

const formatUser = (
    userId: number | null,
): string => {
    if (userId === null) {
        return "Not recorded";
    }

    /*
     * The current advertisement detail contract exposes the
     * workflow performer as an ID, not as a user display name.
     *
     * Keep this explicit until the user summary is included
     * by the backend security/user contract.
     */
    return `User #${userId}`;
};

const formatUrl = (
    value: string | null,
): string => {
    if (!value) {
        return "Not configured";
    }

    return value;
};

const WorkspaceDetails = ({
    advertisement,
}: WorkspaceDetailsProps) => {
    const editAdvertisementPath =
        `/admin/advertisements/${advertisement.id}/edit`;

    return (
        <div
            className="
                flex
                flex-col
                gap-4
            "
        >
            <Surface
                className="
                    overflow-hidden
                    border
                    border-gray-200
                    bg-white
                "
            >
                <div
                    className="
                        flex
                        flex-col
                        gap-4
                        border-b
                        border-gray-200
                        px-4
                        py-4
                        sm:flex-row
                        sm:items-start
                        sm:justify-between
                        sm:px-5
                    "
                >
                    <div
                        className="
                            flex
                            min-w-0
                            items-start
                            gap-3
                        "
                    >
                        <div
                            className="
                                flex
                                h-9
                                w-9
                                shrink-0
                                items-center
                                justify-center
                                rounded-lg
                                bg-slate-100
                            "
                        >
                            <Settings2
                                className="
                                    h-4.5
                                    w-4.5
                                    text-slate-600
                                "
                                aria-hidden="true"
                            />
                        </div>

                        <div className="min-w-0">
                            <h3
                                className="
                                    text-base
                                    font-semibold
                                    text-slate-900
                                "
                            >
                                Advertisement Details
                            </h3>

                            <p
                                className="
                                    mt-1
                                    text-sm
                                    text-slate-500
                                "
                            >
                                Core advertisement configuration
                                submitted for review.
                            </p>
                        </div>
                    </div>

                    <Link
                        to={editAdvertisementPath}
                        className="
                            inline-flex
                            min-h-9
                            shrink-0
                            items-center
                            justify-center
                            gap-2
                            rounded-md
                            border
                            border-gray-300
                            bg-white
                            px-3
                            py-2
                            text-sm
                            font-semibold
                            text-gray-700
                            transition
                            hover:border-green-300
                            hover:bg-green-50
                            hover:text-green-800
                            focus:outline-none
                            focus:ring-2
                            focus:ring-green-600
                            focus:ring-offset-2
                        "
                    >
                        View / Edit Advertisement
                    </Link>
                </div>

                <div
                    className="
                        grid
                        gap-4
                        p-4
                        md:grid-cols-2
                        sm:p-5
                    "
                >
                    <DetailItem
                        label="Advertisement Name"
                        value={
                            advertisement.name.trim() ||
                            "Not configured"
                        }
                        icon={Megaphone}
                    />

                    <DetailItem
                        label="Internal Name"
                        value={
                            advertisement.internalName?.trim() ||
                            "Not configured"
                        }
                        icon={Tag}
                    />

                    <DetailItem
                        label="Advertisement Type"
                        value={formatAdvertisementType(
                            advertisement.advertisementType,
                        )}
                        icon={FileText}
                    />

                    <DetailItem
                        label="Priority"
                        value={String(
                            advertisement.priority,
                        )}
                        icon={Tag}
                    />

                    <DetailItem
                        label="Campaign"
                        value={
                            advertisement.campaignId !== null
                                ? `Campaign #${advertisement.campaignId}`
                                : "Not associated"
                        }
                        icon={Tag}
                    />

                    <DetailItem
                        label="House Advertisement"
                        value={formatBoolean(
                            advertisement.isHouseAd,
                        )}
                        icon={Megaphone}
                    />
                </div>
            </Surface>

            <Surface
                className="
                    overflow-hidden
                    border
                    border-gray-200
                    bg-white
                "
            >
                <div
                    className="
                        border-b
                        border-gray-200
                        px-4
                        py-4
                        sm:px-5
                    "
                >
                    <div
                        className="
                            flex
                            items-start
                            gap-3
                        "
                    >
                        <div
                            className="
                                flex
                                h-9
                                w-9
                                shrink-0
                                items-center
                                justify-center
                                rounded-lg
                                bg-slate-100
                            "
                        >
                            <Link2
                                className="
                                    h-4.5
                                    w-4.5
                                    text-slate-600
                                "
                                aria-hidden="true"
                            />
                        </div>

                        <div className="min-w-0">
                            <h3
                                className="
                                    text-base
                                    font-semibold
                                    text-slate-900
                                "
                            >
                                Click &amp; Destination
                            </h3>

                            <p
                                className="
                                    mt-1
                                    text-sm
                                    text-slate-500
                                "
                            >
                                Click behaviour and destination
                                configured for this advertisement.
                            </p>
                        </div>
                    </div>
                </div>

                <div
                    className="
                        grid
                        gap-4
                        p-4
                        md:grid-cols-2
                        sm:p-5
                    "
                >
                    <DetailItem
                        label="Clickable"
                        value={formatBoolean(
                            advertisement.isClickable,
                        )}
                        icon={Link2}
                    />

                    <DetailItem
                        label="Open in New Tab"
                        value={
                            advertisement.isClickable
                                ? formatBoolean(
                                    advertisement.openInNewTab,
                                )
                                : "Not applicable"
                        }
                        icon={ExternalLink}
                    />

                    <DetailItem
                        label="Destination URL"
                        value={formatUrl(
                            advertisement.destinationUrl,
                        )}
                        icon={ExternalLink}
                        fullWidth
                    />
                </div>
            </Surface>

            <Surface
                className="
                    overflow-hidden
                    border
                    border-gray-200
                    bg-white
                "
            >
                <div
                    className="
                        border-b
                        border-gray-200
                        px-4
                        py-4
                        sm:px-5
                    "
                >
                    <div
                        className="
                            flex
                            items-start
                            gap-3
                        "
                    >
                        <div
                            className="
                                flex
                                h-9
                                w-9
                                shrink-0
                                items-center
                                justify-center
                                rounded-lg
                                bg-slate-100
                            "
                        >
                            <FileText
                                className="
                                    h-4.5
                                    w-4.5
                                    text-slate-600
                                "
                                aria-hidden="true"
                            />
                        </div>

                        <div className="min-w-0">
                            <h3
                                className="
                                    text-base
                                    font-semibold
                                    text-slate-900
                                "
                            >
                                Notes
                            </h3>

                            <p
                                className="
                                    mt-1
                                    text-sm
                                    text-slate-500
                                "
                            >
                                Internal notes associated with
                                this advertisement.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-4 sm:p-5">
                    <div
                        className="
                            rounded-lg
                            border
                            border-slate-200
                            bg-slate-50
                            px-3
                            py-3
                            text-sm
                            leading-6
                            text-slate-700
                        "
                    >
                        {advertisement.notes?.trim() ||
                            "No notes have been added."}
                    </div>
                </div>
            </Surface>

            <Surface
                className="
                    overflow-hidden
                    border
                    border-gray-200
                    bg-white
                "
            >
                <div
                    className="
                        border-b
                        border-gray-200
                        px-4
                        py-4
                        sm:px-5
                    "
                >
                    <div
                        className="
                            flex
                            items-start
                            gap-3
                        "
                    >
                        <div
                            className="
                                flex
                                h-9
                                w-9
                                shrink-0
                                items-center
                                justify-center
                                rounded-lg
                                bg-slate-100
                            "
                        >
                            <Settings2
                                className="
                                    h-4.5
                                    w-4.5
                                    text-slate-600
                                "
                                aria-hidden="true"
                            />
                        </div>

                        <div className="min-w-0">
                            <h3
                                className="
                                    text-base
                                    font-semibold
                                    text-slate-900
                                "
                            >
                                Workflow Information
                            </h3>

                            <p
                                className="
                                    mt-1
                                    text-sm
                                    text-slate-500
                                "
                            >
                                Submission and review history
                                available on the advertisement.
                            </p>
                        </div>
                    </div>
                </div>

                <div
                    className="
                        grid
                        gap-4
                        p-4
                        md:grid-cols-2
                        sm:p-5
                    "
                >
                    <DetailItem
                        label="Submitted By"
                        value={formatUser(
                            advertisement.submittedBy,
                        )}
                    />

                    <DetailItem
                        label="Submitted At"
                        value={formatDateTime(
                            advertisement.submittedAt,
                        )}
                    />

                    <DetailItem
                        label="Approved By"
                        value={formatUser(
                            advertisement.approvedBy,
                        )}
                    />

                    <DetailItem
                        label="Approved At"
                        value={formatDateTime(
                            advertisement.approvedAt,
                        )}
                    />

                    <DetailItem
                        label="Rejected By"
                        value={formatUser(
                            advertisement.rejectedBy,
                        )}
                    />

                    <DetailItem
                        label="Rejected At"
                        value={formatDateTime(
                            advertisement.rejectedAt,
                        )}
                    />

                    <DetailItem
                        label="Rejection Reason"
                        value={
                            advertisement.rejectionReason?.trim() ||
                            "Not recorded"
                        }
                        fullWidth
                    />

                    <DetailItem
                        label="On Hold By"
                        value={formatUser(
                            advertisement.onHoldBy,
                        )}
                    />

                    <DetailItem
                        label="On Hold At"
                        value={formatDateTime(
                            advertisement.onHoldAt,
                        )}
                    />

                    <DetailItem
                        label="On Hold Reason"
                        value={
                            advertisement.onHoldReason?.trim() ||
                            "Not recorded"
                        }
                        fullWidth
                    />
                </div>
            </Surface>
        </div>
    );
};

export default WorkspaceDetails;