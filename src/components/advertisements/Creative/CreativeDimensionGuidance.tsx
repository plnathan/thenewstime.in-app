import {
    AlertTriangle,
    CheckCircle2,
} from "lucide-react";

import type {
    AdvertisementCreativePlacementFormat,
} from "../../../types/creative.types";

interface DimensionGuidanceProps {
    placementFormat:
    | AdvertisementCreativePlacementFormat
    | null;
}

export default function DimensionGuidance({
    placementFormat,
}: DimensionGuidanceProps) {
    if (
        !placementFormat ||
        placementFormat.widthPx === null ||
        placementFormat.heightPx === null
    ) {
        return (
            <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                <AlertTriangle
                    size={18}
                    className="mt-0.5 shrink-0 text-amber-600"
                    aria-hidden="true"
                />

                <div>
                    <p className="text-sm font-semibold text-amber-900">
                        Placement format dimensions are unavailable.
                    </p>

                    <p className="mt-1 text-xs leading-5 text-amber-800">
                        Select a configured placement format before
                        uploading production creative content.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
            <CheckCircle2
                size={18}
                className="mt-0.5 shrink-0 text-green-600"
                aria-hidden="true"
            />

            <div className="min-w-0">
                <p className="text-sm font-semibold text-green-900">
                    Creative dimensions are driven by the selected
                    placement format.
                </p>

                <p className="mt-1 text-xs leading-5 text-green-800">
                    Expected dimensions:{" "}
                    <span className="font-semibold">
                        {placementFormat.widthPx} ×{" "}
                        {placementFormat.heightPx} px
                    </span>
                    {placementFormat.displayName
                        ? ` (${placementFormat.displayName})`
                        : placementFormat.code
                            ? ` (${placementFormat.code})`
                            : ""}
                    .
                </p>

                {placementFormat.isResponsive && (
                    <p className="mt-1 text-xs text-green-700">
                        This placement format is configured as
                        responsive.
                    </p>
                )}
            </div>
        </div>
    );
}