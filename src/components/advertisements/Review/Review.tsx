import {
    CheckCircle2,
    FileCode2,
    FileImage,
    FileText,
    FileVideo,
} from "lucide-react";

import type {
    AdvertisementClient,
} from "@/api/advertisements";
import Surface from "@/components/ui/Surface";
import Typography from "@/components/ui/Typography";

import AddedCreativePlacementPreview from "../Creative/AddedCreativePlacementPreview";
import {
    formatScheduleDateTime,
    getScheduleDurationLabel,
} from "@/helpers/schedule.helpers";
import type {
    AdvertisementScheduleValue,
} from "@/types/schedule.types";
import type {
    AdvertisementDetailsValue,
} from "@/pages/Advertisements/Advertisement/AdvertisementDetails";
import type {
    AdvertisementPlacementValue,
} from "@/pages/Advertisements/Advertisement/AdvertisementPlacement";
import type {
    AdvertisementCreativeValue,
    AdvertisementCreativePlacementFormat,
} from "@/types/creative.types";
import {
    getCreativeTypeLabel,
    getVariantLabel,
} from "../Creative/creative.helpers";

interface ReviewProps {
    client: AdvertisementClient | null;
    details: AdvertisementDetailsValue;
    placement: AdvertisementPlacementValue;
    creative: AdvertisementCreativeValue;
    placementFormat:
    | AdvertisementCreativePlacementFormat
    | null;
    schedule: AdvertisementScheduleValue;
    scheduleValid: boolean;
}

function getClientName(
    client: AdvertisementClient | null,
): string {
    return (
        client?.displayName ||
        client?.name ||
        client?.companyName ||
        "No client selected"
    );
}

function getPlacementLabel(
    placement: AdvertisementPlacementValue,
): string {
    return (
        placement.placementCode ||
        "No placement selected"
    );
}

function getFormatLabel(
    placement: AdvertisementPlacementValue,
): string {
    if (placement.format?.displayName) {
        return placement.format.displayName;
    }

    if (placement.format?.code) {
        return placement.format.code;
    }

    return "No format selected";
}

function getCreativeIcon(
    creativeType: AdvertisementCreativeValue["creatives"][number]["creativeType"],
) {
    switch (creativeType) {
        case "IMAGE":
            return (
                <FileImage
                    size={15}
                    aria-hidden="true"
                />
            );

        case "VIDEO":
            return (
                <FileVideo
                    size={15}
                    aria-hidden="true"
                />
            );

        case "HTML":
            return (
                <FileCode2
                    size={15}
                    aria-hidden="true"
                />
            );

        case "TEXT":
            return (
                <FileText
                    size={15}
                    aria-hidden="true"
                />
            );

        default:
            return null;
    }
}

export default function Review({
    client,
    details,
    placement,
    creative,
    placementFormat,
    schedule,
    scheduleValid,
}: ReviewProps) {
    const clientName = getClientName(client);
    const placementLabel =
        getPlacementLabel(placement);
    const formatLabel =
        getFormatLabel(placement);
    const creatives = creative.creatives;

    return (
        <div className="mt-5 space-y-5">
            <Surface
                className="
                    border
                    border-gray-200
                    bg-white
                    p-5
                    sm:p-6
                "
            >
                <div className="flex items-start gap-3">
                    <div
                        className="
                            flex
                            h-10
                            w-10
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            bg-green-50
                            text-green-700
                        "
                    >
                        <CheckCircle2
                            size={21}
                            aria-hidden="true"
                        />
                    </div>

                    <div>
                        <Typography
                            as="h3"
                            variant="sectionTitle"
                            className="text-base font-semibold text-gray-900"
                        >
                            Review
                        </Typography>

                        <Typography
                            as="p"
                            variant="body"
                            className="mt-1 text-sm text-gray-600"
                        >
                            Review the complete advertisement
                            configuration before it is persisted or
                            submitted for approval.
                        </Typography>
                    </div>
                </div>
            </Surface>

            <Surface
                className="
                    border
                    border-gray-200
                    bg-white
                    p-5
                    sm:p-6
                "
            >
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <Typography
                            as="h3"
                            variant="sectionTitle"
                            className="text-sm font-semibold text-gray-900"
                        >
                            Client
                        </Typography>

                        <p className="mt-1 text-sm text-gray-700">
                            {clientName}
                        </p>
                    </div>

                    {client?.clientCode && (
                        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                            {client.clientCode}
                        </span>
                    )}
                </div>
            </Surface>

            <Surface
                className="
                    border
                    border-gray-200
                    bg-white
                    p-5
                    sm:p-6
                "
            >
                <Typography
                    as="h3"
                    variant="sectionTitle"
                    className="text-sm font-semibold text-gray-900"
                >
                    Advertisement Details
                </Typography>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <ReviewValue
                        label="Name"
                        value={
                            details.name.trim() ||
                            "Not provided"
                        }
                    />

                    <ReviewValue
                        label="Internal Name"
                        value={
                            details.internalName.trim() ||
                            "Not provided"
                        }
                    />

                    <ReviewValue
                        label="Type"
                        value={
                            details.advertisementType
                        }
                    />

                    <ReviewValue
                        label="Currency"
                        value={
                            details.currencyCode
                        }
                    />

                    <ReviewValue
                        label="Priority"
                        value={String(details.priority)}
                    />

                    <ReviewValue
                        label="Clickable"
                        value={
                            details.isClickable
                                ? "Yes"
                                : "No"
                        }
                    />

                    {details.isClickable && (
                        <ReviewValue
                            label="Destination URL"
                            value={
                                details.destinationUrl.trim() ||
                                "Not provided"
                            }
                        />
                    )}

                    <ReviewValue
                        label="Open in new tab"
                        value={
                            details.openInNewTab
                                ? "Yes"
                                : "No"
                        }
                    />
                </div>

                {details.notes.trim() && (
                    <div className="mt-4 rounded-lg bg-gray-50 p-3">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                            Notes
                        </p>

                        <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">
                            {details.notes}
                        </p>
                    </div>
                )}
            </Surface>

            <Surface
                className="
                    border
                    border-gray-200
                    bg-white
                    p-5
                    sm:p-6
                "
            >
                <Typography
                    as="h3"
                    variant="sectionTitle"
                    className="text-sm font-semibold text-gray-900"
                >
                    Placement
                </Typography>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <ReviewValue
                        label="Placement"
                        value={placementLabel}
                    />

                    <ReviewValue
                        label="Page Type"
                        value={
                            placement.pageType ||
                            "Not provided"
                        }
                    />

                    <ReviewValue
                        label="Format"
                        value={formatLabel}
                    />

                    <ReviewValue
                        label="Format ID"
                        value={
                            placement.formatId !== null
                                ? String(
                                    placement.formatId,
                                )
                                : "Not selected"
                        }
                    />

                    {placementFormat && (
                        <ReviewValue
                            label="Desktop Dimensions"
                            value={`${placementFormat.widthPx} × ${placementFormat.heightPx} px`}
                        />
                    )}

                    {placementFormat?.isResponsive &&
                        placementFormat.mobileWidthPx !=
                        null &&
                        placementFormat.mobileHeightPx !=
                        null && (
                            <ReviewValue
                                label="Mobile Dimensions"
                                value={`${placementFormat.mobileWidthPx} × ${placementFormat.mobileHeightPx} px`}
                            />
                        )}
                </div>
            </Surface>

            <Surface
                className="
                    border
                    border-gray-200
                    bg-white
                    p-5
                    sm:p-6
                "
            >
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <Typography
                            as="h3"
                            variant="sectionTitle"
                            className="text-sm font-semibold text-gray-900"
                        >
                            Creative Content
                        </Typography>

                        <p className="mt-1 text-xs text-gray-500">
                            {creatives.length}{" "}
                            {creatives.length === 1
                                ? "creative"
                                : "creatives"}{" "}
                            configured.
                        </p>
                    </div>

                    {creatives.length > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                            <CheckCircle2
                                size={13}
                                aria-hidden="true"
                            />
                            Validated
                        </span>
                    )}
                </div>

                {creatives.length === 0 ? (
                    <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                        No creative content has been added.
                    </div>
                ) : (
                    <div className="mt-4 space-y-4">
                        {creatives.map((item) => (
                            <div
                                key={item.id}
                                className="
                                    rounded-xl
                                    border
                                    border-gray-200
                                    bg-gray-50
                                    p-4
                                "
                            >
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 ring-1 ring-gray-200">
                                                {getCreativeIcon(
                                                    item.creativeType,
                                                )}
                                                {getCreativeTypeLabel(
                                                    item.creativeType,
                                                )}
                                            </span>

                                            <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-200">
                                                {getVariantLabel(
                                                    item.variant,
                                                )}
                                            </span>

                                            {item.isPrimary && (
                                                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
                                                    Primary
                                                </span>
                                            )}
                                        </div>

                                        <p className="mt-2 truncate text-sm font-semibold text-gray-900">
                                            {item.title ||
                                                item.fileName ||
                                                "Untitled Creative"}
                                        </p>

                                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                                            <span>
                                                Dimensions:{" "}
                                                {item.widthPx ??
                                                    "—"}{" "}
                                                ×{" "}
                                                {item.heightPx ??
                                                    "—"}{" "}
                                                px
                                            </span>

                                            {item.fileName && (
                                                <span>
                                                    File:{" "}
                                                    {
                                                        item.fileName
                                                    }
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <span
                                        className={
                                            item.isActive
                                                ? "text-xs font-semibold text-green-700"
                                                : "text-xs font-semibold text-gray-500"
                                        }
                                    >
                                        {item.isActive
                                            ? "Active"
                                            : "Inactive"}
                                    </span>
                                </div>

                                <AddedCreativePlacementPreview
                                    creative={item}
                                    placementName={
                                        placement.placementCode ??
                                        "Selected placement"
                                    }
                                    placementFormat={
                                        placementFormat
                                    }
                                />
                            </div>
                        ))}
                    </div>
                )}
            </Surface>

            <Surface
                className="
                    border
                    border-gray-200
                    bg-white
                    p-5
                    sm:p-6
                "
            >
                <Typography
                    as="h3"
                    variant="sectionTitle"
                    className="text-sm font-semibold text-gray-900"
                >
                    Schedule
                </Typography>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <ReviewValue
                        label="Start"
                        value={formatScheduleDateTime(
                            schedule.startDateTime,
                        )}
                    />

                    <ReviewValue
                        label="End"
                        value={formatScheduleDateTime(
                            schedule.endDateTime,
                        )}
                    />

                    <ReviewValue
                        label="Duration"
                        value={getScheduleDurationLabel(
                            schedule,
                        )}
                    />

                    <ReviewValue
                        label="Timezone"
                        value={
                            schedule.timezone ||
                            "Not provided"
                        }
                    />
                </div>

                <div
                    className={
                        scheduleValid
                            ? "mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm font-medium text-green-800"
                            : "mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm font-medium text-amber-800"
                    }
                >
                    {scheduleValid
                        ? "Schedule is ready for the next persistence/approval workflow."
                        : "Complete the schedule before this advertisement can be considered ready."}
                </div>
            </Surface>
        </div>
    );
}

interface ReviewValueProps {
    label: string;
    value: string;
}

function ReviewValue({
    label,
    value,
}: ReviewValueProps) {
    return (
        <div className="rounded-lg bg-gray-50 px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                {label}
            </p>

            <p className="mt-1 break-words text-sm font-semibold text-gray-800">
                {value}
            </p>
        </div>
    );
}