import {
    CheckCircle2,
    FileCode2,
    FileImage,
    FileText,
    FileVideo,
    Pencil,
    Star,
    Trash2,
} from "lucide-react";

import DimensionStatusMessage from "./DimensionStatusMessage";
import AddedCreativePlacementPreview from "./AddedCreativePlacementPreview";
import {
    getCreativeTypeLabel,
    getDimensionComparison,
    getDimensionStatusLabel,
    getFileSizeLabel,
    getVariantLabel,
} from "./creative.helpers";
import type {
    AdvertisementCreativeItem,
    AdvertisementCreativePlacementFormat,
    AdvertisementCreativeType,
} from "../../../types/creative.types";

interface AddedCreativeCardProps {
    creative: AdvertisementCreativeItem;
    placementName?: string;
    placementFormat:
        | AdvertisementCreativePlacementFormat
        | null;
    onEdit: (
        creative: AdvertisementCreativeItem,
    ) => void;
    onDelete: (
        creativeId: string,
    ) => void;
    onSetPrimary: (
        creativeId: string,
    ) => void;
}

interface CreativeTypeIconProps {
    creativeType: AdvertisementCreativeType;
    size?: number;
    className?: string;
}

function CreativeTypeIcon({
    creativeType,
    size = 19,
    className,
}: CreativeTypeIconProps) {
    switch (creativeType) {
        case "IMAGE":
            return (
                <FileImage
                    size={size}
                    className={className}
                    aria-hidden="true"
                />
            );

        case "VIDEO":
            return (
                <FileVideo
                    size={size}
                    className={className}
                    aria-hidden="true"
                />
            );

        case "HTML":
            return (
                <FileCode2
                    size={size}
                    className={className}
                    aria-hidden="true"
                />
            );

        case "TEXT":
            return (
                <FileText
                    size={size}
                    className={className}
                    aria-hidden="true"
                />
            );

        default:
            return null;
    }
}

export default function AddedCreativeCard({
    creative,
    placementName,
    placementFormat,
    onEdit,
    onDelete,
    onSetPrimary,
}: AddedCreativeCardProps) {
    const comparison = getDimensionComparison(
        creative.widthPx,
        creative.heightPx,
        placementFormat,
    );

    return (
        <article className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex min-w-0 gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                            <CreativeTypeIcon
                                creativeType={
                                    creative.creativeType
                                }
                                size={19}
                                className="text-gray-600"
                            />
                        </div>

                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <h4 className="truncate text-sm font-semibold text-gray-900">
                                    {creative.title ||
                                        "Untitled Creative"}
                                </h4>

                                {creative.isPrimary && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 ring-1 ring-amber-200">
                                        <Star
                                            size={11}
                                            fill="currentColor"
                                            aria-hidden="true"
                                        />
                                        Primary
                                    </span>
                                )}
                            </div>

                            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
                                <span>
                                    {getCreativeTypeLabel(
                                        creative.creativeType,
                                    )}
                                </span>

                                <span>•</span>

                                <span>
                                    {getVariantLabel(
                                        creative.variant,
                                    )}
                                </span>

                                {creative.fileName && (
                                    <>
                                        <span>•</span>

                                        <span className="max-w-[240px] truncate">
                                            {creative.fileName}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                        {!creative.isPrimary && (
                            <button
                                type="button"
                                onClick={() =>
                                    onSetPrimary(
                                        creative.id,
                                    )
                                }
                                className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
                            >
                                <CheckCircle2
                                    size={14}
                                    aria-hidden="true"
                                />
                                Set Primary
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={() =>
                                onEdit(creative)
                            }
                            className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
                        >
                            <Pencil
                                size={14}
                                aria-hidden="true"
                            />
                            Edit
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                onDelete(
                                    creative.id,
                                )
                            }
                            className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50"
                        >
                            <Trash2
                                size={14}
                                aria-hidden="true"
                            />
                            Remove
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-md bg-gray-50 px-3 py-2">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-gray-500">
                            Width
                        </p>

                        <p className="mt-1 text-sm font-semibold text-gray-800">
                            {creative.widthPx !== null
                                ? `${ creative.widthPx } px`
                                : "—"}
                        </p>
                    </div>

                    <div className="rounded-md bg-gray-50 px-3 py-2">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-gray-500">
                            Height
                        </p>

                        <p className="mt-1 text-sm font-semibold text-gray-800">
                            {creative.heightPx !== null
                                ? `${ creative.heightPx } px`
                                : "—"}
                        </p>
                    </div>

                    <div className="rounded-md bg-gray-50 px-3 py-2">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-gray-500">
                            File Size
                        </p>

                        <p className="mt-1 text-sm font-semibold text-gray-800">
                            {getFileSizeLabel(
                                creative.fileSizeBytes,
                            )}
                        </p>
                    </div>

                    <div className="rounded-md bg-gray-50 px-3 py-2">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-gray-500">
                            Status
                        </p>

                        <p className="mt-1 text-sm font-semibold text-gray-800">
                            {creative.isActive
                                ? "Active"
                                : "Inactive"}
                        </p>
                    </div>
                </div>

                {creative.altText && (
                    <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-gray-500">
                            Alt Text
                        </p>

                        <p className="mt-1 text-xs text-gray-700">
                            {creative.altText}
                        </p>
                    </div>
                )}

                {comparison.status !==
                    "NOT_AVAILABLE" && (
                    <div>
                        <DimensionStatusMessage
                            comparison={
                                comparison
                            }
                        />

                        <p className="mt-1 text-[11px] text-gray-500">
                            {
                                getDimensionStatusLabel(
                                    comparison.status,
                                )
                            }
                        </p>
                    </div>
                )}

                <AddedCreativePlacementPreview
                    creative={creative}
                    placementName={placementName}
                    placementFormat={
                        placementFormat
                    }
                />
            </div>
        </article>
    );
}
