import type {
    AdvertisementCreativeItem,
    AdvertisementCreativePlacementFormat,
} from "@/types/creative.types";

import type {
    PlacementContext,
} from "./creative.helpers";

import CreativeMediaPreview from "./CreativeMediaPreview";

interface PlacementPreviewProps {
    creative: AdvertisementCreativeItem;
    placementFormat:
    | AdvertisementCreativePlacementFormat
    | null;
    context: PlacementContext;
}

interface PlacementSlotProps {
    creative: AdvertisementCreativeItem;
    placementFormat:
    | AdvertisementCreativePlacementFormat
    | null;
    label: string;
    className?: string;
}

function PlacementSlot({
    creative,
    placementFormat,
    label,
    className = "",
}: PlacementSlotProps) {
    const expectedWidth =
        placementFormat?.widthPx ?? null;

    const expectedHeight =
        placementFormat?.heightPx ?? null;

    const aspectRatio =
        expectedWidth &&
            expectedHeight &&
            expectedWidth > 0 &&
            expectedHeight > 0
            ? expectedWidth / expectedHeight
            : undefined;

    return (
        <div
            className={[
                "relative overflow-hidden rounded-md border-2 border-dashed border-green-400 bg-green-50/70",
                className,
            ].join(" ")}
            style={
                aspectRatio
                    ? {
                        aspectRatio: `${aspectRatio}`,
                    }
                    : undefined
            }
        >
            <div className="absolute inset-x-1 top-1 z-10 rounded bg-green-700 px-1 py-1 text-center text-[8px] font-semibold uppercase leading-tight text-white shadow-sm [overflow-wrap:anywhere]">
                {label}
            </div>

            <div className="h-full min-h-[90px] w-full p-2 pt-12">
                <CreativeMediaPreview
                    creativeType={
                        creative.creativeType
                    }
                    mediaUrl={creative.mediaUrl}
                    altText={creative.altText}
                    title={creative.title}
                />
            </div>
        </div>
    );
}

function PageHeaderPlaceholder() {
    return (
        <div className="space-y-2">
            <div className="h-3 w-24 rounded bg-gray-300" />

            <div className="h-2 w-40 rounded bg-gray-200" />

            <div className="h-px w-full bg-gray-200" />
        </div>
    );
}

function ContentPlaceholder() {
    return (
        <div className="space-y-2">
            <div className="h-2.5 w-full rounded bg-gray-200" />
            <div className="h-2.5 w-[92%] rounded bg-gray-200" />
            <div className="h-2.5 w-[82%] rounded bg-gray-200" />
            <div className="h-2.5 w-[88%] rounded bg-gray-200" />
        </div>
    );
}

function PlacementPreviewFooter({
    pageLabel,
    placementLabel,
}: {
    pageLabel: string;
    placementLabel: string;
}) {
    return (
        <div className="mt-3 border-t border-gray-200 pt-2 text-[10px] text-gray-500">
            <span>{pageLabel}</span>
            <span className="mx-1">•</span>
            <span>{placementLabel}</span>
        </div>
    );
}

export default function PlacementPreview({
    creative,
    placementFormat,
    context,
}: PlacementPreviewProps) {
    if (context.position === "MODAL") {
        return (
            <div className="rounded-xl border border-gray-200 bg-gray-100 p-3">
                <div className="relative min-h-[280px] overflow-hidden rounded-lg bg-white p-4 shadow-sm">
                    <PageHeaderPlaceholder />

                    <div className="mt-6 space-y-3 opacity-40">
                        <ContentPlaceholder />
                        <ContentPlaceholder />
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 p-5">
                        <div className="w-full max-w-[330px] rounded-lg border border-gray-200 bg-white p-3 shadow-xl">
                            <div className="mb-2 flex items-center justify-between">
                                <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                                    Advertisement
                                </span>

                                <span className="text-[10px] text-gray-400">
                                    Modal
                                </span>
                            </div>

                            <PlacementSlot
                                creative={creative}
                                placementFormat={
                                    placementFormat
                                }
                                label={
                                    context.placementLabel
                                }
                            />
                        </div>
                    </div>
                </div>

                <PlacementPreviewFooter
                    pageLabel={context.pageLabel}
                    placementLabel={
                        context.placementLabel
                    }
                />
            </div>
        );
    }

    if (context.position === "SIDEBAR") {
        return (
            <div className="rounded-xl border border-gray-200 bg-gray-100 p-3">
                <div className="rounded-lg bg-white p-4 shadow-sm">
                    <PageHeaderPlaceholder />

                    <div className="mt-5 grid grid-cols-[minmax(0,1fr)_110px] gap-3">
                        <div className="space-y-3">
                            <ContentPlaceholder />
                            <ContentPlaceholder />
                            <ContentPlaceholder />
                        </div>

                        <PlacementSlot
                            creative={creative}
                            placementFormat={
                                placementFormat
                            }
                            label={
                                context.placementLabel
                            }
                            className="self-start"
                        />
                    </div>
                </div>

                <PlacementPreviewFooter
                    pageLabel={context.pageLabel}
                    placementLabel={
                        context.placementLabel
                    }
                />
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-gray-200 bg-gray-100 p-3">
            <div className="rounded-lg bg-white p-4 shadow-sm">
                <PageHeaderPlaceholder />

                {context.position === "TOP" && (
                    <div className="mt-4">
                        <PlacementSlot
                            creative={creative}
                            placementFormat={
                                placementFormat
                            }
                            label={
                                context.placementLabel
                            }
                        />
                    </div>
                )}

                <div className="mt-5">
                    <ContentPlaceholder />
                </div>

                {context.position === "BETWEEN" && (
                    <div className="my-4">
                        <PlacementSlot
                            creative={creative}
                            placementFormat={
                                placementFormat
                            }
                            label={
                                context.placementLabel
                            }
                        />
                    </div>
                )}

                {context.position === "CONTENT" && (
                    <div className="my-4">
                        <PlacementSlot
                            creative={creative}
                            placementFormat={
                                placementFormat
                            }
                            label={
                                context.placementLabel
                            }
                        />
                    </div>
                )}

                <div className="mt-5">
                    <ContentPlaceholder />
                </div>

                {context.position === "BOTTOM" && (
                    <div className="mt-4">
                        <PlacementSlot
                            creative={creative}
                            placementFormat={
                                placementFormat
                            }
                            label={
                                context.placementLabel
                            }
                        />
                    </div>
                )}

                <div className="mt-5 border-t border-gray-200 pt-3">
                    <div className="h-2 w-28 rounded bg-gray-200" />
                </div>
            </div>

            <PlacementPreviewFooter
                pageLabel={context.pageLabel}
                placementLabel={
                    context.placementLabel
                }
            />
        </div>
    );
}