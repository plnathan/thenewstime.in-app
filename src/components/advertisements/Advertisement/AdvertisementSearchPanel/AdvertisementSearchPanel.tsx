import {
    Mail,
    Phone,
    Search,
    UserRoundSearch,
    X,
} from "lucide-react";
import {
    useState,
} from "react";

import Button from "@/components/ui/Button";

export type AdvertisementSearchField =
    | "clientName"
    | "mobile"
    | "email";

export interface AdvertisementSearchValues {
    field: AdvertisementSearchField;
    query: string;
}

interface AdvertisementSearchPanelProps {
    onSearch: (
        values: AdvertisementSearchValues,
    ) => void;
    loading?: boolean;
    initialField?: AdvertisementSearchField;
    initialQuery?: string;
    onClear?: () => void;
}

const SEARCH_OPTIONS: Array<{
    value: AdvertisementSearchField;
    label: string;
    description: string;
    icon: typeof UserRoundSearch;
}> = [
        {
            value: "clientName",
            label: "Client name",
            description: "Business or trading name",
            icon: UserRoundSearch,
        },
        {
            value: "mobile",
            label: "Mobile number",
            description: "Client contact number",
            icon: Phone,
        },
        {
            value: "email",
            label: "Email address",
            description: "Client email",
            icon: Mail,
        },
    ];

export default function AdvertisementSearchPanel({
    onSearch,
    loading = false,
    initialField = "clientName",
    initialQuery = "",
    onClear,
}: AdvertisementSearchPanelProps) {
    const [field, setField] =
        useState<AdvertisementSearchField>(
            initialField,
        );

    const [query, setQuery] =
        useState(initialQuery);

    const selectedOption =
        SEARCH_OPTIONS.find(
            (option) => option.value === field,
        ) ?? SEARCH_OPTIONS[0];

    const canSearch = query.trim().length >= 2;

    const handleSubmit = (
        event: React.FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        if (!canSearch || loading) {
            return;
        }

        onSearch({
            field,
            query: query.trim(),
        });
    };

    const handleClear = () => {
        setQuery("");
        onClear?.();
    };

    return (
        <div
            className="
                overflow-hidden
                rounded-2xl
                border
                border-green-100
                bg-gradient-to-br
                from-green-50
                via-white
                to-white
                shadow-sm
            "
        >
            <div className="border-b border-green-100 px-4 py-4 sm:px-6">
                <div className="flex items-start gap-3">
                    <div
                        className="
                            flex
                            h-11
                            w-11
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            bg-green-600
                            text-white
                            shadow-sm
                        "
                    >
                        <Search
                            size={20}
                            aria-hidden="true"
                        />
                    </div>

                    <div>
                        <h2 className="text-base font-bold text-gray-900">
                            Find an existing client
                        </h2>

                        <p className="mt-1 text-sm text-gray-600">
                            Reuse an existing client or
                            find previous advertisements
                            before creating a new record.
                        </p>
                    </div>
                </div>
            </div>

            <form
                onSubmit={handleSubmit}
                className="space-y-5 p-4 sm:p-6"
            >
                <fieldset>
                    <legend className="mb-3 text-sm font-semibold text-gray-800">
                        Search by
                    </legend>

                    <div
                        className="
                            grid
                            grid-cols-1
                            gap-2
                            sm:grid-cols-3
                        "
                    >
                        {SEARCH_OPTIONS.map(
                            (option) => {
                                const Icon = option.icon;
                                const selected =
                                    field ===
                                    option.value;

                                return (
                                    <button
                                        key={
                                            option.value
                                        }
                                        type="button"
                                        onClick={() =>
                                            setField(
                                                option.value,
                                            )
                                        }
                                        className={`
                                            flex
                                            min-h-[72px]
                                            items-center
                                            gap-3
                                            rounded-xl
                                            border
                                            px-3
                                            py-3
                                            text-left
                                            transition
                                            focus:outline-none
                                            focus:ring-2
                                            focus:ring-green-500
                                            focus:ring-offset-2
                                            ${selected
                                                ? "border-green-500 bg-green-50 text-green-800 shadow-sm"
                                                : "border-gray-200 bg-white text-gray-700 hover:border-green-300 hover:bg-green-50/50"
                                            }
                                        `}
                                        aria-pressed={
                                            selected
                                        }
                                    >
                                        <Icon
                                            size={19}
                                            className={
                                                selected
                                                    ? "text-green-700"
                                                    : "text-gray-500"
                                            }
                                            aria-hidden="true"
                                        />

                                        <span className="min-w-0">
                                            <span className="block text-sm font-semibold">
                                                {
                                                    option.label
                                                }
                                            </span>

                                            <span className="mt-0.5 block text-xs text-gray-500">
                                                {
                                                    option.description
                                                }
                                            </span>
                                        </span>
                                    </button>
                                );
                            },
                        )}
                    </div>
                </fieldset>

                <div>
                    <label
                        htmlFor="advertisement-client-search"
                        className="mb-1.5 block text-sm font-semibold text-gray-800"
                    >
                        {selectedOption.label}
                    </label>

                    <div className="flex flex-col gap-2 sm:flex-row">
                        <div className="relative min-w-0 flex-1">
                            <Search
                                size={18}
                                className="
                                    pointer-events-none
                                    absolute
                                    left-3
                                    top-1/2
                                    -translate-y-1/2
                                    text-gray-400
                                "
                                aria-hidden="true"
                            />

                            <input
                                id="advertisement-client-search"
                                value={query}
                                onChange={(event) =>
                                    setQuery(
                                        event.target
                                            .value,
                                    )
                                }
                                placeholder={
                                    field ===
                                        "clientName"
                                        ? "Enter business or client name"
                                        : field ===
                                            "mobile"
                                            ? "Enter mobile number"
                                            : "Enter email address"
                                }
                                autoComplete="off"
                                className="
                                    h-12
                                    w-full
                                    rounded-xl
                                    border
                                    border-gray-300
                                    bg-white
                                    pl-10
                                    pr-10
                                    text-sm
                                    outline-none
                                    transition
                                    placeholder:text-gray-400
                                    focus:border-green-500
                                    focus:ring-2
                                    focus:ring-green-100
                                "
                            />

                            {query && (
                                <button
                                    type="button"
                                    onClick={handleClear}
                                    className="
                                        absolute
                                        right-3
                                        top-1/2
                                        -translate-y-1/2
                                        rounded-md
                                        p-1
                                        text-gray-400
                                        hover:bg-gray-100
                                        hover:text-gray-700
                                    "
                                    aria-label="Clear search"
                                >
                                    <X
                                        size={16}
                                        aria-hidden="true"
                                    />
                                </button>
                            )}
                        </div>

                        <Button
                            type="submit"
                            size="md"
                            loading={loading}
                            disabled={!canSearch}
                            leftIcon={
                                <Search size={17} />
                            }
                            className="h-12 w-full sm:w-auto sm:min-w-28"
                        >
                            Search
                        </Button>
                    </div>

                    <p className="mt-2 text-xs text-gray-500">
                        Enter at least 2 characters.
                        Search results will show matching
                        clients and their previous
                        advertisements.
                    </p>
                </div>
            </form>
        </div>
    );
}