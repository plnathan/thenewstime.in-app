import {
    CheckCircle2,
    LayoutGrid,
    Monitor,
    PanelTop,
    Smartphone,
    XCircle,
} from "lucide-react";

import type {
    AdvertisementPlacement,
} from "@/api/advertisements/placements.api";

import Surface from "@/components/ui/Surface";
import Typography from "@/components/ui/Typography";

interface WorkspacePlacementProps {
    placement:
    | AdvertisementPlacement
    | null;
}

const PAGE_LABELS: Record<
    AdvertisementPlacement["pageType"],
    string
> = {
    HOME: "Homepage",
    NEWS_LIST: "News List",
    NEWS_DETAIL: "News Detail",
};

const INSERTION_LABELS: Record<
    AdvertisementPlacement["insertionType"],
    string
> = {
    FIXED: "Fixed position",
    AFTER_N_ITEMS: "After N items",
    BETWEEN_SECTIONS: "Between sections",
};

const FREQUENCY_LABELS: Record<
    NonNullable<AdvertisementPlacement["displayFrequency"]>,
    string
> = {
    EVERY_VISIT: "Every visit",
    ONCE_PER_SESSION: "Once per session",
    ONCE_PER_DAY: "Once per day",
    ONCE_PER_PERIOD: "Once per period",
};

const formatDimensions = (
    widthPx: number | null | undefined,
    heightPx: number | null | undefined,
    isResponsive = false,
): string => {
    if (
        widthPx == null ||
        heightPx == null ||
        widthPx <= 0 ||
        heightPx <= 0
    ) {
        return isResponsive
            ? "Responsive — no fixed dimensions"
            : "Not specified";
    }

    return `${widthPx} × ${heightPx} px`;
};

const formatPlacementType = (value: string): string => {
    return value
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (character) => character.toUpperCase());
};

const Info = ({
    label,
    value,
}: {
    label: string;
    value: string;
}) => {
    return (
        <div
            className="
                min-w-0
                rounded-lg
                border
                border-gray-200
                bg-gray-50
                px-3
                py-3
            "
        >
            <p
                className="
                    text-[11px]
                    font-semibold
                    uppercase
                    tracking-wide
                    text-gray-500
                "
            >
                {label}
            </p>

            <p
                className="
                    mt-1
                    wrap-break-words
                    text-sm
                    font-semibold
                    text-gray-800
                "
            >
                {value}
            </p>
        </div>
    );
};

const DimensionCard = ({
    label,
    value,
}: {
    label: string;
    value: string;
}) => {
    return (
        <div
            className="
                rounded-lg
                border
                border-green-200
                bg-white
                px-4
                py-3
            "
        >
            <p
                className="
                    text-[11px]
                    font-semibold
                    uppercase
                    tracking-wide
                    text-gray-500
                "
            >
                {label}
            </p>

            <p
                className="
                    mt-1
                    text-sm
                    font-bold
                    text-gray-900
                "
            >
                {value}
            </p>
        </div>
    );
};

const WorkspacePlacement = ({
    placement,
}: WorkspacePlacementProps) => {
    if (!placement) {
        return (
            <Surface
                className="
                    border
                    border-amber-200
                    bg-amber-50
                    p-5
                    sm:p-6
                "
            >
                <div
                    className="
                        flex
                        items-start
                        gap-3
                    "
                >
                    <XCircle
                        size={20}
                        className="
                            mt-0.5
                            shrink-0
                            text-amber-700
                        "
                        aria-hidden="true"
                    />

                    <div
                        className="
                            min-w-0
                        "
                    >
                        <Typography
                            as="h2"
                            variant="headline"
                            className="
                                text-base
                                font-semibold
                                text-amber-900
                                sm:text-lg
                            "
                        >
                            Placement not configured
                        </Typography>

                        <Typography
                            as="p"
                            variant="body"
                            className="
                                mt-1
                                text-sm
                                leading-6
                                text-amber-800
                            "
                        >
                            No runtime advertisement
                            placement has been persisted
                            for this advertisement.
                        </Typography>
                    </div>
                </div>
            </Surface>
        );
    }

    const format =
        placement.format;

    return (
        <div
            className="
                flex
                flex-col
                gap-5
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
                        border-b
                        border-gray-200
                        px-5
                        py-4
                        sm:px-6
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
                                bg-green-50
                                text-green-700
                            "
                        >
                            <LayoutGrid
                                size={18}
                                aria-hidden="true"
                            />
                        </div>

                        <div
                            className="
                                min-w-0
                            "
                        >
                            <Typography
                                as="h2"
                                variant="headline"
                                className="
                                    text-base
                                    font-semibold
                                    text-gray-900
                                    sm:text-lg
                                "
                            >
                                Advertisement Placement
                            </Typography>

                            <Typography
                                as="p"
                                variant="body"
                                className="
                                    mt-1
                                    text-sm
                                    leading-6
                                    text-gray-500
                                "
                            >
                                Persisted runtime placement
                                selected for this
                                advertisement.
                            </Typography>
                        </div>
                    </div>
                </div>

                <div
                    className="
                        p-5
                        sm:p-6
                    "
                >
                    <div
                        className="
                            flex
                            flex-col
                            gap-4
                            sm:flex-row
                            sm:items-start
                            sm:justify-between
                        "
                    >
                        <div
                            className="
                                min-w-0
                            "
                        >
                            <div
                                className="
                                    flex
                                    flex-wrap
                                    items-center
                                    gap-2
                                "
                            >
                                <span
                                    className="
                                        inline-flex
                                        items-center
                                        gap-1.5
                                        rounded-full
                                        bg-gray-100
                                        px-2.5
                                        py-1
                                        text-[11px]
                                        font-semibold
                                        text-gray-700
                                    "
                                >
                                    {placement.pageType ===
                                        "HOME" ? (
                                        <Monitor
                                            size={13}
                                            aria-hidden="true"
                                        />
                                    ) : placement.pageType ===
                                        "NEWS_LIST" ? (
                                        <LayoutGrid
                                            size={13}
                                            aria-hidden="true"
                                        />
                                    ) : (
                                        <PanelTop
                                            size={13}
                                            aria-hidden="true"
                                        />
                                    )}

                                    {
                                        PAGE_LABELS[
                                        placement.pageType
                                        ]
                                    }
                                </span>

                                <span
                                    className="
                                        inline-flex
                                        items-center
                                        rounded-full
                                        bg-green-100
                                        px-2.5
                                        py-1
                                        text-[11px]
                                        font-semibold
                                        text-green-800
                                    "
                                >
                                    {
                                        placement.code
                                    }
                                </span>

                                <span
                                    className="
                                        inline-flex
                                        items-center
                                        rounded-full
                                        bg-blue-50
                                        px-2.5
                                        py-1
                                        text-[11px]
                                        font-semibold
                                        text-blue-800
                                    "
                                >
                                    {placement.status}
                                </span>
                            </div>

                            <h3
                                className="
                                    mt-3
                                    wrap-break-words
                                    text-lg
                                    font-semibold
                                    text-gray-900
                                "
                            >
                                {
                                    placement.displayName
                                }
                            </h3>

                            <p
                                className="
                                    mt-1
                                    max-w-3xl
                                    text-sm
                                    leading-6
                                    text-gray-600
                                "
                            >
                                {placement.description?.trim() ||
                                    "No placement description is available."}
                            </p>
                        </div>

                        <div
                            className="
                                inline-flex
                                shrink-0
                                items-center
                                gap-1.5
                                rounded-md
                                border
                                border-green-200
                                bg-green-50
                                px-3
                                py-2
                                text-xs
                                font-semibold
                                text-green-800
                            "
                        >
                            <CheckCircle2
                                size={15}
                                aria-hidden="true"
                            />

                            Persisted
                        </div>
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
                        px-5
                        py-4
                        sm:px-6
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
                                bg-gray-100
                                text-gray-700
                            "
                        >
                            <Smartphone
                                size={18}
                                aria-hidden="true"
                            />
                        </div>

                        <div
                            className="
                                min-w-0
                            "
                        >
                            <Typography
                                as="h3"
                                variant="headline"
                                className="
                                    text-base
                                    font-semibold
                                    text-gray-900
                                "
                            >
                                Placement Configuration
                            </Typography>

                            <Typography
                                as="p"
                                variant="body"
                                className="
                                    mt-1
                                    text-sm
                                    leading-6
                                    text-gray-500
                                "
                            >
                                The advertisement uses the
                                configuration defined by the
                                selected Placement.
                            </Typography>
                        </div>
                    </div>
                </div>

                <div
                    className="
                        grid
                        gap-3
                        p-5
                        sm:grid-cols-2
                        sm:p-6
                        lg:grid-cols-3
                    "
                >
                    <Info
                        label="Placement ID"
                        value={String(
                            placement.id,
                        )}
                    />

                    <Info
                        label="Placement Type"
                        value={formatPlacementType(
                            placement.placementType,
                        )}
                    />

                    <Info
                        label="Insertion"
                        value={
                            INSERTION_LABELS[
                            placement.insertionType
                            ]
                        }
                    />

                    <Info
                        label="Display Order"
                        value={String(
                            placement.displayOrder,
                        )}
                    />

                    <Info
                        label="Enabled"
                        value={
                            placement.isEnabled
                                ? "Yes"
                                : "No"
                        }
                    />

                    <Info
                        label="Collapse When Empty"
                        value={
                            placement.collapseWhenEmpty
                                ? "Yes"
                                : "No"
                        }
                    />

                    <Info
                        label="Fallback"
                        value={
                            placement.fallbackBehavior
                        }
                    />

                    <Info
                        label="Frequency"
                        value={
                            placement.displayFrequency
                                ? FREQUENCY_LABELS[
                                placement
                                    .displayFrequency
                                ]
                                : "Not specified"
                        }
                    />

                    <Info
                        label="Frequency Value"
                        value={
                            placement.frequencyValue !==
                                null
                                ? String(
                                    placement.frequencyValue,
                                )
                                : "Not specified"
                        }
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
                        px-5
                        py-4
                        sm:px-6
                    "
                >
                    <Typography
                        as="h3"
                        variant="headline"
                        className="
                            text-base
                            font-semibold
                            text-gray-900
                        "
                    >
                        Creative Format
                    </Typography>

                    <Typography
                        as="p"
                        variant="body"
                        className="
                            mt-1
                            text-sm
                            leading-6
                            text-gray-500
                        "
                    >
                        Expected creative dimensions are
                        inherited from the persisted Placement
                        configuration.
                    </Typography>
                </div>

                <div
                    className="
                        p-5
                        sm:p-6
                    "
                >
                    {!format ? (
                        <div
                            className="
                                rounded-lg
                                border
                                border-amber-200
                                bg-amber-50
                                p-4
                            "
                        >
                            <div
                                className="
                                    flex
                                    items-start
                                    gap-3
                                "
                            >
                                <XCircle
                                    size={18}
                                    className="
                                        mt-0.5
                                        shrink-0
                                        text-amber-700
                                    "
                                    aria-hidden="true"
                                />

                                <div>
                                    <p
                                        className="
                                            text-sm
                                            font-semibold
                                            text-amber-900
                                        "
                                    >
                                        No creative format
                                        configured
                                    </p>

                                    <p
                                        className="
                                            mt-1
                                            text-xs
                                            leading-5
                                            text-amber-800
                                        "
                                    >
                                        The selected Placement
                                        does not currently have
                                        an active creative format.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div
                            className="
                                space-y-4
                            "
                        >
                            <div
                                className="
                                    rounded-lg
                                    border
                                    border-green-200
                                    bg-green-50
                                    px-4
                                    py-3
                                "
                            >
                                <p
                                    className="
                                        text-[11px]
                                        font-semibold
                                        uppercase
                                        tracking-wide
                                        text-green-700
                                    "
                                >
                                    Format
                                </p>

                                <p
                                    className="
                                        mt-1
                                        text-sm
                                        font-semibold
                                        text-green-950
                                    "
                                >
                                    {
                                        format.displayName
                                    }
                                </p>

                                {format.description ? (
                                    <p
                                        className="
                                            mt-1
                                            text-xs
                                            leading-5
                                            text-green-900
                                        "
                                    >
                                        {
                                            format.description
                                        }
                                    </p>
                                ) : null}
                            </div>

                            <div
                                className="
                                    grid
                                    gap-3
                                    sm:grid-cols-2
                                "
                            >
                                    <DimensionCard
                                        label="Desktop Expected"
                                        value={formatDimensions(
                                            format.widthPx,
                                            format.heightPx,
                                            format.isResponsive,
                                        )}
                                    />

                                    <DimensionCard
                                        label="Mobile Expected"
                                        value={formatDimensions(
                                            format.mobileWidthPx,
                                            format.mobileHeightPx,
                                            format.isResponsive,
                                        )}
                                    />
                            </div>

                            <div
                                className="
                                    grid
                                    gap-3
                                    sm:grid-cols-2
                                "
                            >
                                <Info
                                    label="Format Code"
                                    value={
                                        format.code ||
                                        "Not configured"
                                    }
                                />

                                <Info
                                    label="Responsive"
                                    value={
                                        format.isResponsive
                                            ? "Yes"
                                            : "No"
                                    }
                                />
                            </div>
                        </div>
                    )}
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
                        px-5
                        py-4
                        sm:px-6
                    "
                >
                    <Typography
                        as="h3"
                        variant="headline"
                        className="
                            text-base
                            font-semibold
                            text-gray-900
                        "
                    >
                        Placement Behaviour
                    </Typography>
                </div>

                <div
                    className="
                        grid
                        gap-3
                        p-5
                        sm:grid-cols-2
                        sm:p-6
                        lg:grid-cols-3
                    "
                >
                    <Info
                        label="Modal Auto-close"
                        value={
                            placement.autoCloseEnabled
                                ? `${ placement.autoCloseSeconds ?? 0 } seconds`
                                : "Disabled"
                        }
                    />

                    <Info
                        label="Close Button"
                        value={
                            placement.closeButtonEnabled
                                ? "Enabled"
                                : "Disabled"
                        }
                    />

                    <Info
                        label="Close on Overlay Click"
                        value={
                            placement.closeOnOverlayClick
                                ? "Enabled"
                                : "Disabled"
                        }
                    />
                </div>
            </Surface>
        </div>
    );
};

export default WorkspacePlacement;