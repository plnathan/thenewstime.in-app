import {
    CalendarClock,
    CheckCircle2,
    Clock3,
} from "lucide-react";

import Surface from "@/components/ui/Surface";
import Typography from "@/components/ui/Typography";

import {
    formatScheduleDateTime,
    getScheduleDurationLabel,
    validateAdvertisementSchedule,
} from "@/helpers/schedule.helpers";
import type {
    AdvertisementScheduleProps,
} from "@/types/schedule.types";

export default function Schedule({
    value,
    onChange,
}: AdvertisementScheduleProps) {
    const validation =
        validateAdvertisementSchedule(value);

    const handleChange = (
        field:
            | "startDateTime"
            | "endDateTime",
        fieldValue: string,
    ): void => {
        onChange({
            ...value,
            [field]: fieldValue,
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
                        <CalendarClock
                            size={21}
                            aria-hidden="true"
                        />
                    </div>

                    <div className="min-w-0">
                        <Typography
                            as="h2"
                            id="advertisement-schedule-heading"
                            tabIndex={-1}
                            variant="headline"
                            className="
                                scroll-mt-24
                                text-base
                                font-semibold
                                text-gray-900
                                outline-none
                                sm:text-lg
                            "
                        >
                            5. Schedule
                        </Typography>

                        <Typography
                            as="p"
                            variant="body"
                            className="mt-1 text-sm text-gray-600"
                        >
                            Define when this advertisement should
                            run. The selected timezone is used when
                            displaying the schedule.
                        </Typography>
                    </div>
                </div>

                <div
                    className="
                        mt-6
                        grid
                        grid-cols-1
                        gap-5
                        md:grid-cols-2
                    "
                >
                    <label className="block">
                        <span className="mb-1.5 block text-sm font-semibold text-gray-800">
                            Start date & time
                        </span>

                        <input
                            type="datetime-local"
                            value={value.startDateTime}
                            onChange={(event) =>
                                handleChange(
                                    "startDateTime",
                                    event.target.value,
                                )
                            }
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
                                outline-none
                                transition
                                focus:border-green-600
                                focus:ring-2
                                focus:ring-green-600
                                focus:ring-offset-1
                            "
                        />

                        <span className="mt-1.5 block text-xs text-gray-500">
                            Choose the first moment at which the
                            advertisement may be delivered.
                        </span>
                    </label>

                    <label className="block">
                        <span className="mb-1.5 block text-sm font-semibold text-gray-800">
                            End date & time
                        </span>

                        <input
                            type="datetime-local"
                            min={
                                value.startDateTime ||
                                undefined
                            }
                            value={value.endDateTime}
                            onChange={(event) =>
                                handleChange(
                                    "endDateTime",
                                    event.target.value,
                                )
                            }
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
                                outline-none
                                transition
                                focus:border-green-600
                                focus:ring-2
                                focus:ring-green-600
                                focus:ring-offset-1
                            "
                        />

                        <span className="mt-1.5 block text-xs text-gray-500">
                            The advertisement will not be scheduled
                            beyond this time.
                        </span>
                    </label>
                </div>

                <div
                    className="
                        mt-5
                        rounded-lg
                        border
                        border-gray-200
                        bg-gray-50
                        p-4
                    "
                >
                    <div className="flex items-start gap-3">
                        <Clock3
                            size={18}
                            className="mt-0.5 shrink-0 text-gray-500"
                            aria-hidden="true"
                        />

                        <div className="min-w-0">
                            <Typography
                                as="p"
                                variant="body"
                                className="text-sm font-semibold text-gray-800"
                            >
                                Schedule timezone
                            </Typography>

                            <p className="mt-1 text-sm font-medium text-gray-700">
                                {value.timezone}
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                                Automatically detected from the
                                current browser environment.
                            </p>
                        </div>
                    </div>
                </div>

                {!validation.isValid && (
                    <div
                        className="
                            mt-5
                            rounded-lg
                            border
                            border-amber-200
                            bg-amber-50
                            p-4
                        "
                        role="alert"
                    >
                        <p className="text-sm font-semibold text-amber-900">
                            Schedule is not complete
                        </p>

                        <p className="mt-1 text-sm text-amber-800">
                            {validation.message}
                        </p>
                    </div>
                )}

                {validation.isValid && (
                    <div
                        className="
                            mt-5
                            rounded-lg
                            border
                            border-green-200
                            bg-green-50
                            p-4
                        "
                    >
                        <div className="flex items-start gap-3">
                            <CheckCircle2
                                size={19}
                                className="mt-0.5 shrink-0 text-green-700"
                                aria-hidden="true"
                            />

                            <div>
                                <p className="text-sm font-semibold text-green-900">
                                    Schedule is valid
                                </p>

                                <div className="mt-2 grid gap-1 text-sm text-green-800 sm:grid-cols-2">
                                    <span>
                                        Start:{" "}
                                        {formatScheduleDateTime(
                                            value.startDateTime,
                                            value.timezone,
                                        )}
                                    </span>

                                    <span>
                                        End:{" "}
                                        {formatScheduleDateTime(
                                            value.endDateTime,
                                            value.timezone,
                                        )}
                                    </span>
                                </div>

                                <p className="mt-2 text-xs font-medium text-green-800">
                                    Duration:{" "}
                                    {getScheduleDurationLabel(
                                        value,
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </Surface>
        </div>
    );
}