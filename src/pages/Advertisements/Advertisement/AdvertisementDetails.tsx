import {
    ExternalLink,
    Info,
    Link2,
    Megaphone,
    SlidersHorizontal,
} from "lucide-react";
import type {
    ChangeEvent,
    FocusEvent,
    ReactNode,
} from "react";

import Surface from "@/components/ui/Surface";
import Typography from "@/components/ui/Typography";

export type AdvertisementType =
    | "DISPLAY"
    | "BANNER"
    | "VIDEO"
    | "NATIVE"
    | "MODAL"
    | "POPUP"
    | "OVERLAY";

export interface AdvertisementDetailsValue {
    name: string;
    internalName: string;
    advertisementType: AdvertisementType;
    isClickable: boolean;
    destinationUrl: string;
    openInNewTab: boolean;
    priority: number;
    currencyCode: string;
    notes: string;
}

interface AdvertisementDetailsProps {
    value: AdvertisementDetailsValue;
    onChange: (
        value: AdvertisementDetailsValue,
    ) => void;
    disabled?: boolean;
}

const ADVERTISEMENT_TYPES: Array<{
    value: AdvertisementType;
    label: string;
    description: string;
}> = [
        {
            value: "DISPLAY",
            label: "Display",
            description: "General display advertisement.",
        },
        {
            value: "BANNER",
            label: "Banner",
            description: "Banner-oriented advertisement placement.",
        },
        {
            value: "VIDEO",
            label: "Video",
            description: "Video-based advertisement.",
        },
        {
            value: "NATIVE",
            label: "Native",
            description: "Advertisement designed to fit native content.",
        },
        {
            value: "MODAL",
            label: "Modal",
            description: "Modal advertisement experience.",
        },
        {
            value: "POPUP",
            label: "Popup",
            description: "Popup advertisement experience.",
        },
        {
            value: "OVERLAY",
            label: "Overlay",
            description: "Overlay or modal advertisement experience.",
        },
    ];

/**
 * Determines whether the supplied value already contains a URL scheme.
 *
 * Examples:
 * - https://example.com -> true
 * - http://example.com -> true
 * - www.example.com -> false
 * - example.com -> false
 */
const hasUrlScheme = (url: string): boolean => {
    return /^[a-z][a-z\d+\-.]*:\/\//i.test(url);
};

/**
 * Determines whether a value looks like a domain that can safely
 * receive the default HTTPS scheme.
 *
 * Examples:
 * - example.com -> true
 * - www.example.com -> true
 * - sub.example.co.in -> true
 * - localhost -> false
 * - abc -> false
 */
const looksLikeDomain = (url: string): boolean => {
    return /^(?:www\.)?[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+(?::\d+)?(?:[/?#].*)?$/i.test(
        url,
    );
};

/**
 * Normalizes common user-entered destination URL values.
 *
 * The API expects a valid absolute URL. Staff may naturally enter
 * "www.example.com" or "example.com", so those values are converted
 * to HTTPS URLs before being stored in component state.
 */
const normalizeDestinationUrl = (
    input: string,
): string => {
    const trimmedValue = input.trim();

    if (trimmedValue === "") {
        return "";
    }

    if (hasUrlScheme(trimmedValue)) {
        return trimmedValue;
    }

    if (looksLikeDomain(trimmedValue)) {
        return `https://${trimmedValue}`;
    }

    return trimmedValue;
};

/**
 * Performs browser-level URL validation after normalization.
 *
 * This is intentionally kept separate from normalization so that
 * typing does not cause the component to constantly rewrite the
 * user's input.
 */
const isValidDestinationUrl = (
    url: string,
): boolean => {
    if (url === "") {
        return false;
    }

    try {
        const parsedUrl = new URL(url);

        return (
            parsedUrl.protocol === "http:" ||
            parsedUrl.protocol === "https:"
        );
    } catch {
        return false;
    }
};

const AdvertisementDetails = ({
    value,
    onChange,
    disabled = false,
}: AdvertisementDetailsProps) => {
    const handleTextChange = (
        event: ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement
        >,
    ): void => {
        const {
            name,
            value: fieldValue,
        } = event.target;

        onChange({
            ...value,
            [name]: fieldValue,
        });
    };

    const handleDestinationUrlChange = (
        event: ChangeEvent<HTMLInputElement>,
    ): void => {
        onChange({
            ...value,
            destinationUrl:
                event.target.value,
        });
    };

    const handleDestinationUrlBlur = (
        event: FocusEvent<HTMLInputElement>,
    ): void => {
        const normalizedUrl =
            normalizeDestinationUrl(
                event.target.value,
            );

        onChange({
            ...value,
            destinationUrl:
                normalizedUrl,
        });
    };

    const handleTypeChange = (
        event: ChangeEvent<HTMLSelectElement>,
    ): void => {
        onChange({
            ...value,
            advertisementType:
                event.target.value as AdvertisementType,
        });
    };

    const handleCurrencyChange = (
        event: ChangeEvent<HTMLSelectElement>,
    ): void => {
        onChange({
            ...value,
            currencyCode: event.target.value,
        });
    };

    const handleNumberChange = (
        event: ChangeEvent<HTMLInputElement>,
    ): void => {
        const nextValue = Number(
            event.target.value,
        );

        onChange({
            ...value,
            priority:
                Number.isFinite(nextValue) &&
                    nextValue >= 0
                    ? nextValue
                    : 0,
        });
    };

    const handleClickableChange = (
        event: ChangeEvent<HTMLInputElement>,
    ): void => {
        const isClickable =
            event.target.checked;

        onChange({
            ...value,
            isClickable,
            destinationUrl: isClickable
                ? value.destinationUrl
                : "",
            openInNewTab: isClickable
                ? value.openInNewTab
                : false,
        });
    };

    const handleOpenInNewTabChange = (
        event: ChangeEvent<HTMLInputElement>,
    ): void => {
        onChange({
            ...value,
            openInNewTab:
                event.target.checked,
        });
    };

    const normalizedDestinationUrl =
        normalizeDestinationUrl(
            value.destinationUrl,
        );

    const destinationUrlHasValue =
        value.destinationUrl.trim().length > 0;

    const destinationUrlIsValid =
        destinationUrlHasValue &&
        isValidDestinationUrl(
            normalizedDestinationUrl,
        );

    return (
        <div className="flex flex-col gap-5">
            {/* -------------------------------------------------------------
             * Section introduction
             * ------------------------------------------------------------- */}
            <Surface
                className="
                    border
                    border-green-100
                    bg-green-50/60
                    p-4
                "
            >
                <div className="flex gap-3">
                    <div
                        className="
                            flex
                            h-9
                            w-9
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            bg-white
                            text-green-700
                            shadow-sm
                        "
                    >
                        <Megaphone
                            size={18}
                            aria-hidden="true"
                        />
                    </div>

                    <div>
                        <Typography
                            as="h2"
                            variant="headline"
                            className="
                                text-sm
                                font-semibold
                                text-gray-900
                            "
                        >
                            Advertisement Details
                        </Typography>

                        <Typography
                            as="p"
                            variant="body"
                            className="
                                mt-1
                                text-sm
                                leading-6
                                text-gray-600
                            "
                        >
                            Define the advertisement identity,
                            type and basic delivery behaviour.
                            Creative content and placement will
                            be configured in later steps.
                        </Typography>
                    </div>
                </div>
            </Surface>

            {/* -------------------------------------------------------------
             * Advertisement identity
             * ------------------------------------------------------------- */}
            <Surface
                padding="lg"
                border="all"
                radius="lg"
            >
                <div
                    className="
                        mb-5
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
                        <Info
                            size={18}
                            aria-hidden="true"
                        />
                    </div>

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
                            Advertisement Identity
                        </Typography>

                        <Typography
                            as="p"
                            variant="body"
                            className="
                                mt-1
                                text-sm
                                text-gray-500
                            "
                        >
                            These values identify this
                            advertisement within the system.
                        </Typography>
                    </div>
                </div>

                <div
                    className="
                        grid
                        grid-cols-1
                        gap-5
                        lg:grid-cols-2
                    "
                >
                    <Field
                        label="Advertisement Name"
                        required
                        htmlFor="advertisement-name"
                        helpText="The name shown to staff when managing this advertisement."
                    >
                        <input
                            id="advertisement-name"
                            name="name"
                            type="text"
                            value={value.name}
                            onChange={handleTextChange}
                            disabled={disabled}
                            maxLength={200}
                            placeholder="Example: Diwali Gold Sale"
                            className={inputClassName}
                        />
                    </Field>

                    <Field
                        label="Internal Reference Name"
                        htmlFor="advertisement-internal-name"
                        helpText="Optional internal reference used by the advertisement team."
                    >
                        <input
                            id="advertisement-internal-name"
                            name="internalName"
                            type="text"
                            value={value.internalName}
                            onChange={handleTextChange}
                            disabled={disabled}
                            maxLength={200}
                            placeholder="Example: diwali-gold-sale-2026"
                            className={inputClassName}
                        />
                    </Field>

                    <Field
                        label="Advertisement Type"
                        required
                        htmlFor="advertisement-type"
                        helpText="Select the business-level advertisement type. Creative format is configured separately."
                    >
                        <select
                            id="advertisement-type"
                            name="advertisementType"
                            value={
                                value.advertisementType
                            }
                            onChange={handleTypeChange}
                            disabled={disabled}
                            className={inputClassName}
                        >
                            {ADVERTISEMENT_TYPES.map(
                                (item) => (
                                    <option
                                        key={item.value}
                                        value={item.value}
                                    >
                                        {item.label}
                                    </option>
                                ),
                            )}
                        </select>

                        <p className="mt-2 text-xs text-gray-500">
                            {
                                ADVERTISEMENT_TYPES.find(
                                    (item) =>
                                        item.value ===
                                        value.advertisementType,
                                )?.description
                            }
                        </p>
                    </Field>

                    <Field
                        label="Priority"
                        htmlFor="advertisement-priority"
                        helpText="Higher values can be used by the delivery configuration when prioritising eligible advertisements."
                    >
                        <input
                            id="advertisement-priority"
                            name="priority"
                            type="number"
                            min={0}
                            step={1}
                            value={value.priority}
                            onChange={handleNumberChange}
                            disabled={disabled}
                            className={inputClassName}
                        />
                    </Field>
                </div>
            </Surface>

            {/* -------------------------------------------------------------
             * Click behaviour
             * ------------------------------------------------------------- */}
            <Surface
                padding="lg"
                border="all"
                radius="lg"
            >
                <div
                    className="
                        mb-5
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
                        <Link2
                            size={18}
                            aria-hidden="true"
                        />
                    </div>

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
                            Click Behaviour
                        </Typography>

                        <Typography
                            as="p"
                            variant="body"
                            className="
                                mt-1
                                text-sm
                                text-gray-500
                            "
                        >
                            Configure whether users can interact
                            with the advertisement and where the
                            click should lead.
                        </Typography>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <CheckboxRow
                        id="advertisement-clickable"
                        checked={value.isClickable}
                        onChange={
                            handleClickableChange
                        }
                        disabled={disabled}
                        title="Clickable advertisement"
                        description="Allow visitors to click the advertisement."
                    />

                    {value.isClickable && (
                        <div
                            className="
                                rounded-lg
                                border
                                border-gray-200
                                bg-gray-50
                                p-4
                            "
                        >
                            <Field
                                label="Destination URL"
                                required
                                htmlFor="advertisement-destination-url"
                                helpText="Enter a complete URL or a domain such as example.com. Domains are automatically saved with HTTPS."
                            >
                                <div className="relative">
                                    <ExternalLink
                                        size={16}
                                        aria-hidden="true"
                                        className="
                                            pointer-events-none
                                            absolute
                                            left-3
                                            top-1/2
                                            -translate-y-1/2
                                            text-gray-400
                                        "
                                    />

                                    <input
                                        id="advertisement-destination-url"
                                        name="destinationUrl"
                                        type="url"
                                        value={
                                            value.destinationUrl
                                        }
                                        onChange={
                                            handleDestinationUrlChange
                                        }
                                        onBlur={
                                            handleDestinationUrlBlur
                                        }
                                        disabled={disabled}
                                        maxLength={2000}
                                        placeholder="https://example.com/campaign"
                                        aria-invalid={
                                            destinationUrlHasValue &&
                                            !destinationUrlIsValid
                                        }
                                        className={`
                                            ${inputClassName}
                                            pl-9
                                            ${destinationUrlHasValue &&
                                                !destinationUrlIsValid
                                                ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                                                : ""
                                            }
                                        `}
                                    />
                                </div>

                                {destinationUrlHasValue &&
                                    !destinationUrlIsValid && (
                                        <p
                                            className="
                                                mt-2
                                                text-xs
                                                font-medium
                                                text-red-600
                                            "
                                        >
                                            Enter a valid HTTP or
                                            HTTPS URL, for example
                                            https://example.com
                                        </p>
                                    )}

                                {destinationUrlHasValue &&
                                    destinationUrlIsValid &&
                                    normalizedDestinationUrl !==
                                    value.destinationUrl && (
                                        <p
                                            className="
                                                mt-2
                                                text-xs
                                                text-gray-500
                                            "
                                        >
                                            This domain will be
                                            saved as{" "}
                                            <span className="font-medium text-gray-700">
                                                {
                                                    normalizedDestinationUrl
                                                }
                                            </span>
                                        </p>
                                    )}
                            </Field>

                            <div className="mt-4">
                                <CheckboxRow
                                    id="advertisement-open-new-tab"
                                    checked={
                                        value.openInNewTab
                                    }
                                    onChange={
                                        handleOpenInNewTabChange
                                    }
                                    disabled={disabled}
                                    title="Open destination in a new tab"
                                    description="Recommended for external client websites and campaign landing pages."
                                />
                            </div>
                        </div>
                    )}

                    {!value.isClickable && (
                        <div
                            className="
                                rounded-lg
                                border
                                border-dashed
                                border-gray-300
                                bg-gray-50
                                px-4
                                py-3
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
                                This advertisement will not
                                have a destination URL. Visitors
                                will see the advertisement without
                                click-through behaviour.
                            </Typography>
                        </div>
                    )}
                </div>
            </Surface>

            {/* -------------------------------------------------------------
             * Operational information
             * ------------------------------------------------------------- */}
            <Surface
                padding="lg"
                border="all"
                radius="lg"
            >
                <div
                    className="
                        mb-5
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
                        <SlidersHorizontal
                            size={18}
                            aria-hidden="true"
                        />
                    </div>

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
                            Additional Information
                        </Typography>

                        <Typography
                            as="p"
                            variant="body"
                            className="
                                mt-1
                                text-sm
                                text-gray-500
                            "
                        >
                            Add internal information that may
                            help staff during campaign processing.
                        </Typography>
                    </div>
                </div>

                <div
                    className="
                        grid
                        grid-cols-1
                        gap-5
                        lg:grid-cols-2
                    "
                >
                    <Field
                        label="Currency"
                        htmlFor="advertisement-currency"
                        helpText="Currency used for the advertisement's later commercial information."
                    >
                        <select
                            id="advertisement-currency"
                            name="currencyCode"
                            value={value.currencyCode}
                            onChange={
                                handleCurrencyChange
                            }
                            disabled={disabled}
                            className={inputClassName}
                        >
                            <option value="INR">
                                INR — Indian Rupee
                            </option>
                        </select>
                    </Field>

                    <div className="hidden lg:block" />

                    <Field
                        label="Internal Notes / Special Instructions"
                        htmlFor="advertisement-notes"
                        helpText="These notes are for advertisement staff and are not the creative content."
                    >
                        <textarea
                            id="advertisement-notes"
                            name="notes"
                            value={value.notes}
                            onChange={handleTextChange}
                            disabled={disabled}
                            maxLength={5000}
                            rows={5}
                            placeholder="Add internal notes or special instructions..."
                            className={`${inputClassName} resize-y`}
                        />

                        <div className="mt-1 flex justify-end">
                            <span className="text-xs text-gray-400">
                                {value.notes.length}/5000
                            </span>
                        </div>
                    </Field>
                </div>
            </Surface>

            {/* -------------------------------------------------------------
             * API mapping information
             * ------------------------------------------------------------- */}
            <div
                className="
                    flex
                    items-start
                    gap-3
                    rounded-lg
                    border
                    border-gray-200
                    bg-gray-50
                    px-4
                    py-3
                "
            >
                <Info
                    size={17}
                    aria-hidden="true"
                    className="
                        mt-0.5
                        shrink-0
                        text-gray-500
                    "
                />

                <Typography
                    as="p"
                    variant="body"
                    className="
                        text-xs
                        leading-5
                        text-gray-500
                    "
                >
                    This step captures advertisement-level
                    information. Creative files, placement,
                    scheduling and system-calculated pricing are
                    intentionally handled in their respective
                    workflow steps.
                </Typography>
            </div>
        </div>
    );
};

interface FieldProps {
    label: string;
    htmlFor: string;
    required?: boolean;
    helpText?: string;
    children: ReactNode;
}

const Field = ({
    label,
    htmlFor,
    required = false,
    helpText,
    children,
}: FieldProps) => {
    return (
        <div>
            <label
                htmlFor={htmlFor}
                className="
                    block
                    text-sm
                    font-semibold
                    text-gray-800
                "
            >
                {label}

                {required && (
                    <span
                        className="ml-1 text-red-600"
                        aria-hidden="true"
                    >
                        *
                    </span>
                )}
            </label>

            {helpText && (
                <p className="mt-1 min-h-10 text-xs text-gray-500">
                    {helpText}
                </p>
            )}

            <div className="mt-2">
                {children}
            </div>
        </div>
    );
};

interface CheckboxRowProps {
    id: string;
    checked: boolean;
    onChange: (
        event: ChangeEvent<HTMLInputElement>,
    ) => void;
    disabled: boolean;
    title: string;
    description: string;
}

const CheckboxRow = ({
    id,
    checked,
    onChange,
    disabled,
    title,
    description,
}: CheckboxRowProps) => {
    return (
        <label
            htmlFor={id}
            className={`
                flex
                cursor-pointer
                items-start
                gap-3
                rounded-lg
                border
                border-gray-200
                bg-white
                p-4
                transition
                hover:border-green-300
                ${disabled ? "cursor-not-allowed opacity-60" : ""}
            `}
        >
            <input
                id={id}
                type="checkbox"
                checked={checked}
                onChange={onChange}
                disabled={disabled}
                className="
                    mt-0.5
                    h-4
                    w-4
                    shrink-0
                    rounded
                    border-gray-300
                    text-green-700
                    focus:ring-green-600
                "
            />

            <span className="min-w-0">
                <span
                    className="
                        block
                        text-sm
                        font-semibold
                        text-gray-900
                    "
                >
                    {title}
                </span>

                <span
                    className="
                        mt-1
                        block
                        text-xs
                        leading-5
                        text-gray-500
                    "
                >
                    {description}
                </span>
            </span>
        </label>
    );
};

const inputClassName = `
    block
    w-full
    rounded-md
    border
    border-gray-300
    bg-white
    px-3
    py-2.5
    text-sm
    text-gray-900
    shadow-sm
    outline-none
    transition
    placeholder:text-gray-400
    focus:border-green-600
    focus:ring-2
    focus:ring-green-600/20
    disabled:cursor-not-allowed
    disabled:bg-gray-100
    disabled:text-gray-500
`;

export default AdvertisementDetails;