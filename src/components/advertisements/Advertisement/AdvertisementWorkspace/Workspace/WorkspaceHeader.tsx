import {
    ArrowLeft,
    Pencil,
    RefreshCw,
} from "lucide-react";

import type {
    WorkspaceHeaderProps,
} from "@/types/advertisement.types";

import AdvertisementStatusBadge from "@/components/advertisements/Advertisement/AdvertisementStatusBadge/AdvertisementStatusBadge";

import Typography from "@/components/ui/Typography";

const WorkspaceHeader = ({
    advertisement,
    workflowStatus,
    refreshing,
    onBack,
    onContinueDraft,
    onRefresh,
}: WorkspaceHeaderProps) => {
    const isDraft =
        workflowStatus === "DRAFT";

    return (
        <header>
            <button
                type="button"
                onClick={onBack}
                className="
                    inline-flex
                    min-h-9
                    items-center
                    gap-2
                    rounded-md
                    px-2
                    py-1.5
                    text-sm
                    font-semibold
                    text-gray-600
                    transition
                    hover:bg-gray-100
                    hover:text-gray-900
                    focus:outline-none
                    focus:ring-2
                    focus:ring-green-600
                    focus:ring-offset-2
                "
            >
                <ArrowLeft
                    size={16}
                    aria-hidden="true"
                />

                Advertisements
            </button>

            <div
                className="
                    mt-4
                    flex
                    flex-col
                    gap-4
                    lg:flex-row
                    lg:items-start
                    lg:justify-between
                "
            >
                <div className="min-w-0">
                    <div
                        className="
                            flex
                            flex-wrap
                            items-center
                            gap-2
                        "
                    >
                        <Typography
                            as="h1"
                            variant="headline"
                            className="
                                min-w-0
                                wrap-break-words
                                text-xl
                                font-semibold
                                sm:text-2xl
                            "
                        >
                            {advertisement.name}
                        </Typography>

                        <AdvertisementStatusBadge
                            status={workflowStatus}
                            size="sm"
                        />
                    </div>

                    <Typography
                        as="p"
                        variant="body"
                        className="
                            mt-2
                            text-sm
                            text-gray-600
                        "
                    >
                        Advertisement #
                        {advertisement.id}

                        {" • "}

                        {advertisement.advertisementType}

                        {" • "}

                        Client:{" "}
                        {advertisement.clientName ??
                            "Not available"}
                    </Typography>
                </div>

                <div
                    className="
                        flex
                        flex-col
                        gap-2
                        sm:flex-row
                    "
                >
                    {isDraft && (
                        <button
                            type="button"
                            onClick={
                                onContinueDraft
                            }
                            className="
                                inline-flex
                                min-h-10
                                items-center
                                justify-center
                                gap-2
                                rounded-md
                                border
                                border-gray-300
                                bg-white
                                px-4
                                py-2
                                text-sm
                                font-semibold
                                text-gray-700
                                hover:bg-gray-50
                                focus:outline-none
                                focus:ring-2
                                focus:ring-green-600
                                focus:ring-offset-2
                            "
                        >
                            <Pencil
                                size={16}
                                aria-hidden="true"
                            />

                            Continue Draft
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={onRefresh}
                        disabled={refreshing}
                        className="
                            inline-flex
                            min-h-10
                            items-center
                            justify-center
                            gap-2
                            rounded-md
                            border
                            border-gray-300
                            bg-white
                            px-4
                            py-2
                            text-sm
                            font-semibold
                            text-gray-700
                            hover:bg-gray-50
                            disabled:cursor-not-allowed
                            disabled:opacity-60
                            focus:outline-none
                            focus:ring-2
                            focus:ring-green-600
                            focus:ring-offset-2
                        "
                    >
                        <RefreshCw
                            size={16}
                            className={
                                refreshing
                                    ? "animate-spin"
                                    : ""
                            }
                            aria-hidden="true"
                        />

                        Refresh
                    </button>
                </div>
            </div>
        </header>
    );
};

export default WorkspaceHeader;