import { istInputToUtcIso, utcIsoToIstInput, formatIstDateTime } from "@/helpers/businessTimeZone.helpers";
import {
    AlertCircle,
    CalendarClock,
    CheckCircle2,
    Clock3,
    Save,
} from "lucide-react";

import {
    useState,
} from "react";

import {
    updateAdvertisement,
} from "@/api/advertisements/advertisement.api";

import type {
    AdvertisementDetails,
} from "@/api/advertisements/advertisement.api";

import {
    getApiErrorMessage,
} from "@/helpers/advertisementManagement.helpers";

import Typography from "@/components/ui/Typography";

interface WorkspaceScheduleProps {
    advertisement: AdvertisementDetails;
    canEditSchedule: boolean;
    onSaved: () => Promise<void>;
}

interface ScheduleFormValues {
    startAt: string;
    endAt: string;
}

// const EMPTY_SCHEDULE: ScheduleFormValues = {
//     startAt: "",
//     endAt: "",
// };

/**
 * Convert an API date into the value expected by a
 * datetime-local input, explicitly using Indian Standard Time.
 */
const toDateTimeLocal = utcIsoToIstInput;
const formatDateTime = (value: string | null | undefined): string => value ? formatIstDateTime(value) : "Not configured";

const WorkspaceSchedule = ({
    advertisement,
    canEditSchedule,
    onSaved,
}: WorkspaceScheduleProps) => {
    const [formValues, setFormValues] = useState<ScheduleFormValues>(
        () => ({
            startAt: toDateTimeLocal(advertisement.startAt),
            endAt: toDateTimeLocal(advertisement.endAt),
        }),
    );

    const [
        saving,
        setSaving,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState<string | null>(
        null,
    );

    const [
        successMessage,
        setSuccessMessage,
    ] = useState<string | null>(
        null,
    );

    const hasPersistedSchedule =
        Boolean(
            advertisement.startAt &&
            advertisement.endAt,
        );

    const handleDateChange = (
        field: keyof ScheduleFormValues,
        value: string,
    ): void => {
        setFormValues((current) => ({
            ...current,
            [field]: value,
        }));

        setError(null);
        setSuccessMessage(null);
    };

    const handleSave = async (
        event: React.FormEvent<HTMLFormElement>,
    ): Promise<void> => {
        event.preventDefault();

        if (!canEditSchedule) {
            setError(
                "The schedule can only be edited while the advertisement is a draft.",
            );

            return;
        }

        if (
            !formValues.startAt ||
            !formValues.endAt
        ) {
            setError(
                "Please enter both the campaign start and end date/time.",
            );

            return;
        }

        let startDate: Date;
        let endDate: Date;
        try {
            startDate = new Date(istInputToUtcIso(formValues.startAt));
            endDate = new Date(istInputToUtcIso(formValues.endAt));
        } catch {
            setError("Please enter valid campaign dates and times in IST.");
            return;
        }

        if (
            Number.isNaN(startDate.getTime()) ||
            Number.isNaN(endDate.getTime())
        ) {
            setError(
                "Please enter valid campaign dates and times.",
            );

            return;
        }

        if (
            endDate.getTime() <=
            startDate.getTime()
        ) {
            setError(
                "The campaign end date/time must be later than the start date/time.",
            );

            return;
        }

        try {
            setSaving(true);
            setError(null);
            setSuccessMessage(null);

            await updateAdvertisement(
                advertisement.id,
                {
                    startAt: startDate.toISOString(),
                    endAt: endDate.toISOString(),
                },
            );

            await onSaved();

            setSuccessMessage(
                advertisement.pricingUnit === "DAY"
                    ? "Campaign schedule saved. Standard Amount and derived commercial values were recalculated; existing payment transactions were left unchanged."
                    : "Campaign schedule saved successfully. Any schedule-dependent rate was recalculated by the server; existing payment transactions were left unchanged.",
            );
        } catch (saveError) {
            console.error(
                "Failed to save advertisement schedule:",
                saveError,
            );

            setError(
                getApiErrorMessage(
                    saveError,
                ),
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <section
            className="
                overflow-hidden
                rounded-xl
                border
                border-gray-200
                bg-white
                shadow-sm
            "
            aria-labelledby="workspace-schedule-heading"
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
                        <CalendarClock
                            size={21}
                            aria-hidden="true"
                        />
                    </div>

                    <div className="min-w-0">
                        <Typography
                            as="h2"
                            variant="headline"
                            className="
                                text-base
                                font-semibold
                                text-gray-900
                            "
                        >
                            Campaign Schedule
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
                            Manage the start and end date/time
                            for this advertisement campaign. When DAY pricing is configured, saving a schedule change also recalculates the Standard Amount and its discount, Advertisement Amount, advance, and balance values.
                        </Typography>
                    </div>
                </div>
            </div>

            <div
                className="
                    space-y-5
                    p-5
                    sm:p-6
                "
            >
                {error && (
                    <div
                        role="alert"
                        className="
                            flex
                            items-start
                            gap-3
                            rounded-lg
                            border
                            border-red-200
                            bg-red-50
                            p-3
                            text-sm
                            text-red-800
                        "
                    >
                        <AlertCircle
                            size={18}
                            className="mt-0.5 shrink-0"
                            aria-hidden="true"
                        />

                        <p>{error}</p>
                    </div>
                )}

                {successMessage && (
                    <div
                        role="status"
                        className="
                            flex
                            items-start
                            gap-3
                            rounded-lg
                            border
                            border-green-200
                            bg-green-50
                            p-3
                            text-sm
                            text-green-800
                        "
                    >
                        <CheckCircle2
                            size={18}
                            className="mt-0.5 shrink-0"
                            aria-hidden="true"
                        />

                        <p>{successMessage}</p>
                    </div>
                )}

                <div
                    className="
                        grid
                        grid-cols-1
                        gap-4
                        sm:grid-cols-2
                    "
                >
                    <div
                        className="
                            rounded-lg
                            border
                            border-gray-200
                            bg-gray-50
                            p-4
                        "
                    >
                        <div
                            className="
                                flex
                                items-center
                                gap-2
                                text-sm
                                font-medium
                                text-gray-600
                            "
                        >
                            <Clock3
                                size={16}
                                aria-hidden="true"
                            />

                            Start date/time
                        </div>

                        <Typography
                            as="p"
                            variant="body"
                            className="
                                mt-2
                                wrap-break-word
                                text-sm
                                font-semibold
                                text-gray-900
                            "
                        >
                            {formatDateTime(
                                advertisement.startAt,
                            )}
                        </Typography>
                    </div>

                    <div
                        className="
                            rounded-lg
                            border
                            border-gray-200
                            bg-gray-50
                            p-4
                        "
                    >
                        <div
                            className="
                                flex
                                items-center
                                gap-2
                                text-sm
                                font-medium
                                text-gray-600
                            "
                        >
                            <Clock3
                                size={16}
                                aria-hidden="true"
                            />

                            End date/time
                        </div>

                        <Typography
                            as="p"
                            variant="body"
                            className="
                                mt-2
                                wrap-break-word
                                text-sm
                                font-semibold
                                text-gray-900
                            "
                        >
                            {formatDateTime(
                                advertisement.endAt,
                            )}
                        </Typography>
                    </div>
                </div>

                <div
                    className="
                        flex
                        flex-wrap
                        items-center
                        gap-2
                    "
                >
                    <span
                        className={`
                            inline-flex
                            items-center
                            rounded-full
                            px-2.5
                            py-1
                            text-xs
                            font-semibold
                            ${hasPersistedSchedule
                                ? "bg-green-50 text-green-700"
                                : "bg-amber-50 text-amber-800"
                            }
                        `}
                    >
                        {hasPersistedSchedule
                            ? "Dates configured"
                            : "Dates not configured"}
                    </span>

                    {!canEditSchedule && (
                        <span
                            className="
                                inline-flex
                                items-center
                                rounded-full
                                bg-gray-100
                                px-2.5
                                py-1
                                text-xs
                                font-medium
                                text-gray-600
                            "
                        >
                            Read-only
                        </span>
                    )}
                </div>

                {canEditSchedule ? (
                    <form
                        onSubmit={(event) => {
                            void handleSave(event);
                        }}
                        className="
                            space-y-5
                            border-t
                            border-gray-200
                            pt-5
                        "
                    >
                        <div>
                            <Typography
                                as="h3"
                                variant="headline"
                                className="
                                    text-sm
                                    font-semibold
                                    text-gray-900
                                "
                            >
                                Edit campaign dates
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
                                Dates are saved to the advertisement
                                record. The backend synchronizes the
                                corresponding schedule record.
                            </Typography>
                        </div>

                        <div
                            className="
                                grid
                                grid-cols-1
                                gap-4
                                sm:grid-cols-2
                            "
                        >
                            <div>
                                <label
                                    htmlFor="schedule-start-at"
                                    className="
                                        mb-1.5
                                        block
                                        text-sm
                                        font-medium
                                        text-gray-700
                                    "
                                >
                                    Start date/time
                                    <span className="text-red-600">
                                        {" "}*
                                    </span>
                                </label>

                                <input
                                    id="schedule-start-at"
                                    name="startAt"
                                    type="datetime-local"
                                    value={
                                        formValues.startAt
                                    }
                                    onChange={(event) =>
                                        handleDateChange(
                                            "startAt",
                                            event.target.value,
                                        )
                                    }
                                    required
                                    disabled={saving}
                                    className="
                                        block
                                        min-h-10
                                        w-full
                                        rounded-md
                                        border
                                        border-gray-300
                                        bg-white
                                        px-3
                                        py-2
                                        text-sm
                                        text-gray-900
                                        shadow-sm
                                        focus:border-green-600
                                        focus:outline-none
                                        focus:ring-2
                                        focus:ring-green-600/20
                                        disabled:cursor-not-allowed
                                        disabled:bg-gray-100
                                    "
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="schedule-end-at"
                                    className="
                                        mb-1.5
                                        block
                                        text-sm
                                        font-medium
                                        text-gray-700
                                    "
                                >
                                    End date/time
                                    <span className="text-red-600">
                                        {" "}*
                                    </span>
                                </label>

                                <input
                                    id="schedule-end-at"
                                    name="endAt"
                                    type="datetime-local"
                                    value={
                                        formValues.endAt
                                    }
                                    min={
                                        formValues.startAt ||
                                        undefined
                                    }
                                    onChange={(event) =>
                                        handleDateChange(
                                            "endAt",
                                            event.target.value,
                                        )
                                    }
                                    required
                                    disabled={saving}
                                    className="
                                        block
                                        min-h-10
                                        w-full
                                        rounded-md
                                        border
                                        border-gray-300
                                        bg-white
                                        px-3
                                        py-2
                                        text-sm
                                        text-gray-900
                                        shadow-sm
                                        focus:border-green-600
                                        focus:outline-none
                                        focus:ring-2
                                        focus:ring-green-600/20
                                        disabled:cursor-not-allowed
                                        disabled:bg-gray-100
                                    "
                                />
                            </div>
                        </div>

                        <div
                            className="
                                flex
                                justify-end
                                border-t
                                border-gray-200
                                pt-4
                            "
                        >
                            <button
                                type="submit"
                                disabled={saving}
                                className="
                                    inline-flex
                                    min-h-10
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-md
                                    bg-green-700
                                    px-4
                                    py-2
                                    text-sm
                                    font-semibold
                                    text-white
                                    transition
                                    hover:bg-green-800
                                    focus:outline-none
                                    focus:ring-2
                                    focus:ring-green-600
                                    focus:ring-offset-2
                                    disabled:cursor-not-allowed
                                    disabled:opacity-60
                                "
                            >
                                <Save
                                    size={16}
                                    aria-hidden="true"
                                />

                                {saving
                                    ? "Saving..."
                                    : "Save Schedule"}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div
                        className="
                            rounded-lg
                            border
                            border-gray-200
                            bg-gray-50
                            p-4
                        "
                    >
                        <Typography
                            as="p"
                            variant="body"
                            className="
                                text-sm
                                text-gray-600
                            "
                        >
                            The schedule is read-only because
                            this advertisement is no longer in
                            the draft workflow state.
                        </Typography>
                    </div>
                )}
            </div>
        </section>
    );
};

export default WorkspaceSchedule;
