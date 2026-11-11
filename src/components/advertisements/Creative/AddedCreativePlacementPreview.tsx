import {
    Monitor,
    Smartphone,
} from "lucide-react";

import PlacementPreview from "./PlacementPreview";
import {
    getPlacementContext,
} from "./creative.helpers";
import type {
    AdvertisementCreativeItem,
    AdvertisementCreativePlacementFormat,
} from "../../../types/creative.types";

interface AddedCreativePlacementPreviewProps {
    creative: AdvertisementCreativeItem;
    placementName?: string;
    placementFormat:
    | AdvertisementCreativePlacementFormat
    | null;
}

export default function AddedCreativePlacementPreview({
    creative,
    placementName,
    placementFormat,
}: AddedCreativePlacementPreviewProps) {
    if (!creative.mediaUrl) {
        return null;
    }

    const context = getPlacementContext(
        placementName,
    );

    return (
        <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                        Placement Preview
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                        Showing this creative in its configured
                        placement context.
                    </p>
                </div>

                <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-gray-600 ring-1 ring-gray-200">
                    {creative.variant === "DESKTOP" ? (
                        <Monitor
                            size={13}
                            aria-hidden="true"
                        />
                    ) : (
                        <Smartphone
                            size={13}
                            aria-hidden="true"
                        />
                    )}

                    {creative.variant === "DESKTOP"
                        ? "Desktop"
                        : "Mobile"}
                </span>
            </div>

            <PlacementPreview
                creative={creative}
                placementFormat={placementFormat}
                context={context}
            />
        </div>
    );
}