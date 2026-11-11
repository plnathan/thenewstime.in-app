import {
    CheckCircle2,
    ChevronDown,
    LayoutGrid,
    Monitor,
    PanelTop,
    Smartphone,
    XCircle,
} from "lucide-react";
import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    getAdvertisementPlacements,
} from "@/api/advertisements/placements.api";

import type {
    AdvertisementPlacement,
    AdvertisementPlacementFormat,
    AdvertisementPlacementType,
    PlacementDisplayFrequency,
    PlacementInsertionType,
    PlacementPageType,
} from "@/api/advertisements/placements.api";

import Surface from "@/components/ui/Surface";
import Typography from "@/components/ui/Typography";

export interface AdvertisementPlacementValue {
    placementId: number | null;
    placementCode:
    | AdvertisementPlacementType
    | null;
    pageType:
    | PlacementPageType
    | null;
    formatId: number | null;
    format:
    | AdvertisementPlacementFormat
    | null;
}

interface AdvertisementPlacementProps {
    value: AdvertisementPlacementValue;
    onChange: (
        value: AdvertisementPlacementValue,
    ) => void;
}

type PageFilter =
    | "ALL"
    | PlacementPageType;

const PAGE_OPTIONS: Array<{
    value: PageFilter;
    label: string;
    description: string;
}> = [
        {
            value: "ALL",
            label: "All Pages",
            description:
                "Show all active configured placements.",
        },
        {
            value: "HOME",
            label: "Homepage",
            description:
                "Placements used on the homepage.",
        },
        {
            value: "NEWS_LIST",
            label: "News List",
            description:
                "Placements used on news listing pages.",
        },
        {
            value: "NEWS_DETAIL",
            label: "News Detail",
            description:
                "Placements used on individual news pages.",
        },
    ];

const PAGE_LABELS: Record<
    PlacementPageType,
    string
> = {
    HOME: "Homepage",
    NEWS_LIST: "News List",
    NEWS_DETAIL: "News Detail",
};

const INSERTION_LABELS: Record<
    PlacementInsertionType,
    string
> = {
    FIXED: "Fixed position",
    AFTER_N_ITEMS: "After N items",
    BETWEEN_SECTIONS:
        "Between sections",
};

const FREQUENCY_LABELS: Record<
    PlacementDisplayFrequency,
    string
> = {
    EVERY_VISIT: "Every visit",
    ONCE_PER_SESSION:
        "Once per session",
    ONCE_PER_DAY: "Once per day",
    ONCE_PER_PERIOD:
        "Once per period",
};

const formatDimensions = (
    widthPx: number | null,
    heightPx: number | null,
): string => {
    if (
        widthPx === null ||
        heightPx === null
    ) {
        return "Not fixed";
    }

    return `${widthPx} × ${heightPx} px`;
};

const AdvertisementPlacementSelector = ({
    value,
    onChange,
}: AdvertisementPlacementProps) => {
    const [pageFilter, setPageFilter] =
        useState<PageFilter>(
            value.pageType ?? "ALL",
        );

    const [placements, setPlacements] =
        useState<
            AdvertisementPlacement[]
        >([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState<string | null>(null);

    const [showDetails, setShowDetails] =
        useState(false);

    const loadPlacements =
        useCallback(async () => {
            setLoading(true);
            setError(null);

            try {
                const response =
                    await getAdvertisementPlacements();

                setPlacements(
                    response.data,
                );
            } catch (loadError) {
                console.error(
                    "Unable to load advertisement placements.",
                    loadError,
                );

                setPlacements([]);

                setError(
                    "Unable to load configured advertisement placements.",
                );
            } finally {
                setLoading(false);
            }
        }, []);

    useEffect(() => {
        let cancelled = false;

        void getAdvertisementPlacements()
            .then((response) => {
                if (cancelled) {
                    return;
                }

                setPlacements(response.data);
                setError(null);
            })
            .catch((loadError) => {
                if (cancelled) {
                    return;
                }

                console.error(
                    "Unable to load advertisement placements.",
                    loadError,
                );

                setPlacements([]);
                setError(
                    "Unable to load configured advertisement placements.",
                );
            })
            .finally(() => {
                if (!cancelled) {
                    setLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, []);

    const availablePlacements =
        useMemo(() => {
            return placements
                .filter(
                    (placement) =>
                        placement.status ===
                        "ACTIVE" &&
                        placement.isEnabled,
                )
                .filter((placement) => {
                    if (
                        pageFilter ===
                        "ALL"
                    ) {
                        return true;
                    }

                    return (
                        placement.pageType ===
                        pageFilter
                    );
                })
                .sort(
                    (a, b) =>
                        a.pageType.localeCompare(
                            b.pageType,
                        ) ||
                        a.displayOrder -
                        b.displayOrder ||
                        a.id - b.id,
                );
        }, [
            pageFilter,
            placements,
        ]);

    const selectedPlacement =
        useMemo(() => {
            if (
                value.placementId ===
                null
            ) {
                return null;
            }

            return (
                placements.find(
                    (placement) =>
                        placement.id ===
                        value.placementId,
                ) ?? null
            );
        }, [
            placements,
            value.placementId,
        ]);

    const selectPlacement = (
        placement: AdvertisementPlacement,
    ): void => {
        if (
            placement.status !==
            "ACTIVE" ||
            !placement.isEnabled
        ) {
            return;
        }

        onChange({
            placementId: placement.id,
            placementCode:
                placement.placementType,
            pageType: placement.pageType,
            formatId:
                placement.formatId,
            format:
                placement.format,
        });
    };

    const clearSelection = (): void => {
        onChange({
            placementId: null,
            placementCode: null,
            pageType:
                pageFilter === "ALL"
                    ? null
                    : pageFilter,
            formatId: null,
            format: null,
        });
    };

    return (
        <div className="space-y-5">
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
                    as="h2"
                    variant="headline"
                    className="
                        text-base
                        font-semibold
                        text-gray-900
                        sm:text-lg
                    "
                >
                    3. Advertisement Placement
                </Typography>

                <Typography
                    as="p"
                    variant="body"
                    className="
                        mt-1
                        text-sm
                        text-gray-600
                    "
                >
                    Select the configured placement first.
                    The placement determines the expected
                    creative format and Desktop/Mobile
                    dimensions.
                </Typography>
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
                    variant="headline"
                    className="
                        text-sm
                        font-semibold
                        text-gray-900
                    "
                >
                    Select Page
                </Typography>

                <div
                    className="
                        mt-4
                        grid
                        grid-cols-1
                        gap-3
                        sm:grid-cols-2
                        lg:grid-cols-4
                    "
                >
                    {PAGE_OPTIONS.map(
                        (option) => {
                            const active =
                                pageFilter ===
                                option.value;

                            return (
                                <button
                                    key={
                                        option.value
                                    }
                                    type="button"
                                    onClick={() => {
                                        setPageFilter(
                                            option.value,
                                        );

                                        if (
                                            option.value !==
                                            "ALL" &&
                                            value.pageType !==
                                            option.value
                                        ) {
                                            clearSelection();
                                        }
                                    }}
                                    className={`
                                        rounded-lg
                                        border
                                        p-4
                                        text-left
                                        ${active
                                            ? "border-green-300 bg-green-50"
                                            : "border-gray-200 bg-white hover:border-green-300"
                                        }
                                    `}
                                >
                                    <div
                                        className="
                                            flex
                                            items-center
                                            gap-2
                                        "
                                    >
                                        {option.value ===
                                            "HOME" ? (
                                            <Monitor
                                                size={
                                                    18
                                                }
                                                className="text-green-700"
                                            />
                                        ) : option.value ===
                                            "NEWS_LIST" ? (
                                            <LayoutGrid
                                                size={
                                                    18
                                                }
                                                className="text-green-700"
                                            />
                                        ) : option.value ===
                                            "NEWS_DETAIL" ? (
                                            <PanelTop
                                                size={
                                                    18
                                                }
                                                className="text-green-700"
                                            />
                                        ) : (
                                            <Smartphone
                                                size={
                                                    18
                                                }
                                                className="text-green-700"
                                            />
                                        )}

                                        <span
                                            className="
                                                text-sm
                                                font-semibold
                                                text-gray-900
                                            "
                                        >
                                            {
                                                option.label
                                            }
                                        </span>
                                    </div>

                                    <p
                                        className="
                                            mt-2
                                            text-xs
                                            leading-5
                                            text-gray-600
                                        "
                                    >
                                        {
                                            option.description
                                        }
                                    </p>
                                </button>
                            );
                        },
                    )}
                </div>
            </Surface>

            {loading && (
                <Surface
                    className="
                        border
                        border-gray-200
                        bg-white
                        p-5
                    "
                >
                    <p className="text-sm text-gray-600">
                        Loading configured placements...
                    </p>
                </Surface>
            )}

            {error && (
                <Surface
                    className="
                        border
                        border-red-200
                        bg-red-50
                        p-5
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
                                text-red-700
                            "
                        />

                        <div>
                            <p
                                className="
                                    text-sm
                                    font-semibold
                                    text-red-900
                                "
                            >
                                Placement configuration
                                unavailable
                            </p>

                            <p
                                className="
                                    mt-1
                                    text-sm
                                    text-red-800
                                "
                            >
                                {error}
                            </p>

                            <button
                                type="button"
                                onClick={() =>
                                    void loadPlacements()
                                }
                                className="
                                    mt-3
                                    rounded-md
                                    border
                                    border-red-300
                                    bg-white
                                    px-3
                                    py-2
                                    text-sm
                                    font-semibold
                                    text-red-800
                                "
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                </Surface>
            )}

            {!loading &&
                !error &&
                availablePlacements.length ===
                0 && (
                    <Surface
                        className="
                            border
                            border-amber-200
                            bg-amber-50
                            p-5
                        "
                    >
                        <p
                            className="
                                text-sm
                                font-semibold
                                text-amber-900
                            "
                        >
                            No active placements are
                            available.
                        </p>

                        <p
                            className="
                                mt-1
                                text-sm
                                text-amber-800
                            "
                        >
                            An administrator must configure
                            an active placement before an
                            advertisement can continue.
                        </p>
                    </Surface>
                )}

            {availablePlacements.length > 0 && (
                <div className="grid gap-4 lg:grid-cols-2">
                    {availablePlacements.map(
                        (placement) => {
                            const selected =
                                placement.id ===
                                value.placementId;

                            return (
                                <button
                                    key={
                                        placement.id
                                    }
                                    type="button"
                                    onClick={() =>
                                        selectPlacement(
                                            placement,
                                        )
                                    }
                                    aria-pressed={
                                        selected
                                    }
                                    className={`
                                        rounded-xl
                                        border
                                        p-5
                                        text-left
                                        transition
                                        ${selected
                                            ? "border-green-400 bg-green-50 shadow-sm"
                                            : "border-gray-200 bg-white hover:border-green-300"
                                        }
                                    `}
                                >
                                    <div
                                        className="
                                            flex
                                            items-start
                                            justify-between
                                            gap-4
                                        "
                                    >
                                        <div>
                                            <div
                                                className="
                                                    flex
                                                    flex-wrap
                                                    gap-2
                                                "
                                            >
                                                <span
                                                    className="
                                                        rounded-full
                                                        bg-gray-100
                                                        px-2.5
                                                        py-1
                                                        text-[11px]
                                                        font-semibold
                                                        text-gray-600
                                                    "
                                                >
                                                    {
                                                        PAGE_LABELS[
                                                        placement.pageType
                                                        ]
                                                    }
                                                </span>

                                                <span
                                                    className="
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
                                            </div>

                                            <h4
                                                className="
                                                    mt-3
                                                    text-base
                                                    font-semibold
                                                    text-gray-900
                                                "
                                            >
                                                {
                                                    placement.displayName
                                                }
                                            </h4>

                                            <p
                                                className="
                                                    mt-1
                                                    text-sm
                                                    text-gray-600
                                                "
                                            >
                                                {
                                                    placement.description
                                                }
                                            </p>
                                        </div>

                                        {selected && (
                                            <CheckCircle2
                                                size={22}
                                                className="
                                                    shrink-0
                                                    text-green-700
                                                "
                                            />
                                        )}
                                    </div>

                                    <div
                                        className="
                                            mt-5
                                            grid
                                            grid-cols-1
                                            gap-3
                                            sm:grid-cols-2
                                        "
                                    >
                                        <Info
                                            label="Format"
                                            value={
                                                placement.format
                                                    ?.displayName ??
                                                "Not configured"
                                            }
                                        />

                                        <Info
                                            label="Desktop"
                                            value={formatDimensions(
                                                placement.format
                                                    ?.widthPx ??
                                                null,
                                                placement.format
                                                    ?.heightPx ??
                                                null,
                                            )}
                                        />

                                        <Info
                                            label="Mobile"
                                            value={formatDimensions(
                                                placement.format
                                                    ?.mobileWidthPx ??
                                                null,
                                                placement.format
                                                    ?.mobileHeightPx ??
                                                null,
                                            )}
                                        />

                                        <Info
                                            label="Insertion"
                                            value={
                                                INSERTION_LABELS[
                                                placement
                                                    .insertionType
                                                ]
                                            }
                                        />
                                    </div>

                                    {!placement.format && (
                                        <div
                                            className="
                                                mt-4
                                                rounded-md
                                                border
                                                border-amber-200
                                                bg-amber-50
                                                px-3
                                                py-2
                                                text-xs
                                                font-medium
                                                text-amber-800
                                            "
                                        >
                                            No creative format
                                            has been assigned to
                                            this placement.
                                            Creative upload cannot
                                            continue until it is
                                            configured.
                                        </div>
                                    )}
                                </button>
                            );
                        },
                    )}
                </div>
            )}

            {selectedPlacement && (
                <Surface
                    className="
                        border
                        border-green-300
                        bg-green-50
                        p-5
                    "
                >
                    <div
                        className="
                            flex
                            flex-col
                            gap-4
                        "
                    >
                        <div
                            className="
                                flex
                                items-start
                                justify-between
                                gap-4
                            "
                        >
                            <div>
                                <p
                                    className="
                                        text-sm
                                        font-semibold
                                        text-green-950
                                    "
                                >
                                    Selected placement
                                </p>

                                <p
                                    className="
                                        mt-1
                                        text-sm
                                        text-green-900
                                    "
                                >
                                    {
                                        selectedPlacement.displayName
                                    }
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={
                                    clearSelection
                                }
                                className="
                                    inline-flex
                                    min-h-9
                                    items-center
                                    gap-1.5
                                    rounded-md
                                    border
                                    border-green-300
                                    bg-white
                                    px-3
                                    py-2
                                    text-sm
                                    font-semibold
                                    text-green-800
                                "
                            >
                                Change
                            </button>
                        </div>

                        {selectedPlacement.format && (
                            <div
                                className="
                                    grid
                                    gap-3
                                    sm:grid-cols-2
                                "
                            >
                                <DimensionCard
                                    label="Desktop expected"
                                    value={formatDimensions(
                                        selectedPlacement
                                            .format
                                            .widthPx,
                                        selectedPlacement
                                            .format
                                            .heightPx,
                                    )}
                                />

                                <DimensionCard
                                    label="Mobile expected"
                                    value={formatDimensions(
                                        selectedPlacement
                                            .format
                                            .mobileWidthPx ?? null,
                                        selectedPlacement
                                            .format
                                            .mobileHeightPx ?? null,
                                    )}
                                />
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={() =>
                                setShowDetails(
                                    (current) =>
                                        !current,
                                )
                            }
                            className="
                                inline-flex
                                w-fit
                                items-center
                                gap-2
                                text-sm
                                font-semibold
                                text-green-900
                            "
                        >
                            Placement behavior
                            <ChevronDown
                                size={16}
                                className={
                                    showDetails
                                        ? "rotate-180"
                                        : ""
                                }
                            />
                        </button>

                        {showDetails && (
                            <div
                                className="
                                    grid
                                    gap-3
                                    border-t
                                    border-green-200
                                    pt-4
                                    sm:grid-cols-2
                                    lg:grid-cols-3
                                "
                            >
                                <Info
                                    label="Frequency"
                                    value={
                                        selectedPlacement.displayFrequency
                                            ? FREQUENCY_LABELS[
                                            selectedPlacement
                                                .displayFrequency
                                            ]
                                            : "Not specified"
                                    }
                                />

                                <Info
                                    label="Fallback"
                                    value={
                                        selectedPlacement.fallbackBehavior
                                    }
                                />

                                <Info
                                    label="Modal auto-close"
                                    value={
                                        selectedPlacement
                                            .autoCloseEnabled
                                            ? `${selectedPlacement.autoCloseSeconds ?? 0} seconds`
                                            : "Disabled"
                                    }
                                />
                            </div>
                        )}
                    </div>
                </Surface>
            )}
        </div>
    );
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
                rounded-md
                border
                border-gray-100
                bg-gray-50
                px-3
                py-2.5
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
                    text-xs
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

export default AdvertisementPlacementSelector;