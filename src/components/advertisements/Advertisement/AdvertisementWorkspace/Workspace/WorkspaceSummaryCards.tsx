import {
    Building2,
    CalendarDays,
    GitBranch,
    IndianRupee,
} from "lucide-react";

import type {
    AdvertisementListItem,
    AdvertisementWorkflowStatus,
} from "@/api/advertisements/advertisement.api";

import Surface from "@/components/ui/Surface";
import Typography from "@/components/ui/Typography";

import {
    formatDate, formatDateTime,
} from "@/helpers/advertisementManagement.helpers";

import {
    formatMoney,
    formatWorkflowStatus,
} from "@/helpers/advertisementWorkspace.helpers";

import type {
    WorkspaceSummaryCardProps,
} from "@/types/advertisement.types";

interface WorkspaceSummaryCardsProps {
    advertisement: AdvertisementListItem;
    workflowStatus: AdvertisementWorkflowStatus;
}

const WorkspaceSummaryCards = ({
    advertisement,
    workflowStatus,
}: WorkspaceSummaryCardsProps) => {
    return (
        <section
            aria-label="Advertisement summary"
            className="
                grid
                grid-cols-1
                gap-4
                sm:grid-cols-2
                xl:grid-cols-4
            "
        >
            <SummaryCard
                label="Client"
                value={
                    advertisement.clientName ??
                    "Not available"
                }
                secondary={
                    advertisement.clientCode ??
                    "Client code unavailable"
                }
                icon={Building2}
            />

            <SummaryCard
                label="Campaign Schedule"
                value={formatDate(
                    advertisement.startAt,
                )}
                secondary={
                    advertisement.endAt
                        ? `Ends ${formatDate(
                            advertisement.endAt,
                        )}`
                        : "End date not configured"
                }
                icon={CalendarDays}
            />

            <SummaryCard
                label="Advertisement Amount"
                value={formatMoney(
                    advertisement.advertisementAmount,
                    advertisement.currencyCode,
                )}
                secondary="Commercial amount currently stored"
                icon={IndianRupee}
            />

            <SummaryCard
                label="Workflow"
                value={formatWorkflowStatus(
                    workflowStatus,
                )}
                secondary={
                    advertisement.updatedAt
                        ? `Updated ${formatDateTime(
                            String(
                                advertisement.updatedAt,
                            ),
                        )}`
                        : "Not available"
                }
                icon={GitBranch}
            />
        </section>
    );
};

const SummaryCard = ({
    label,
    value,
    secondary,
    icon: Icon,
}: WorkspaceSummaryCardProps) => {
    return (
        <Surface
            className="
                relative
                min-w-0
                border
                border-gray-200
                p-4
                sm:p-5
            "
        >
            <div
                className="
                    absolute
                    right-4
                    top-4
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-lg
                    bg-green-50
                    text-green-700
                    sm:right-5
                    sm:top-5
                "
                aria-hidden="true"
            >
                <Icon
                    size={18}
                    strokeWidth={2}
                />
            </div>

            <Typography
                as="p"
                variant="body"
                className="
                    pr-11
                    text-xs
                    font-semibold
                    uppercase
                    tracking-wide
                    text-gray-500
                "
            >
                {label}
            </Typography>

            <Typography
                as="p"
                variant="body"
                className="
                    mt-2
                    min-w-0
                    wrap-break-words
                    pr-2
                    text-base
                    font-semibold
                    leading-6
                    text-gray-900
                    sm:text-lg
                    sm:leading-7
                "
                title={value}
            >
                {value}
            </Typography>

            <Typography
                as="p"
                variant="body"
                className="
                    mt-1
                    pr-2
                    text-xs
                    text-gray-500
                "
            >
                {secondary}
            </Typography>
        </Surface>
    );
};

export default WorkspaceSummaryCards;