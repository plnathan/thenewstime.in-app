import { BUSINESS_TIME_ZONE } from "@/helpers/businessTimeZone.helpers";
import AdminListPagination from "@/components/ui/AdminListPagination";
import AdvertisementAdminPageHeader from "@/components/ui/AdvertisementAdminPageHeader";
import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    Building2,
    CalendarDays,
    Mail,
    Phone,
    Search,
    X,
} from "lucide-react";
import {
    useCallback,
    useEffect,
    useState,
} from "react";
import {
    Link,
    useSearchParams,
} from "react-router-dom";

import {
    getAdvertisements,
} from "@/api/advertisements/advertisement.api";
import type {
    AdvertisementListItem,
} from "@/api/advertisements/advertisement.api";

import Button from "@/components/ui/Button";
import MainLayout from "@/layouts/MainLayout";
import Surface from "@/components/ui/Surface";
import Typography from "@/components/ui/Typography";

import AdvertisementStatusBadge from "@/components/advertisements/Advertisement/AdvertisementStatusBadge/AdvertisementStatusBadge";

type SearchMode =
    | "CLIENT"
    | "MOBILE"
    | "EMAIL"
    | "ADVERTISEMENT";

interface SearchModeOption {
    value: SearchMode;
    label: string;
    description: string;
    icon: typeof Building2;
}

const SEARCH_MODES: SearchModeOption[] = [
    {
        value: "CLIENT",
        label: "Client name",
        description: "Business or trading name",
        icon: Building2,
    },
    {
        value: "MOBILE",
        label: "Mobile number",
        description: "Client contact number",
        icon: Phone,
    },
    {
        value: "EMAIL",
        label: "Email address",
        description: "Client email",
        icon: Mail,
    },
    {
        value: "ADVERTISEMENT",
        label: "Advertisement",
        description: "Campaign or advertisement name",
        icon: Search,
    },
];

interface AdvertisementSearchResultProps {
    advertisement: AdvertisementListItem;
    onReuse: (
        advertisement: AdvertisementListItem,
    ) => void;
}

const formatDate = (
    value: string | null,
): string => {
    if (!value) {
        return "Not scheduled";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Not scheduled";
    }

    return date.toLocaleDateString("en-IN", {
        timeZone: BUSINESS_TIME_ZONE,
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const getWorkflowStatus = (
    advertisement: AdvertisementListItem,
) => {
    const value =
        advertisement.workflowStatus
            ?.trim()
            .toUpperCase();

    return (
        value === "DRAFT" ||
            value === "SUBMITTED" ||
            value === "APPROVED" ||
            value === "REJECTED" ||
            value === "ON_HOLD" ||
            value === "ACTIVE" ||
            value === "INACTIVE" ||
            value === "ARCHIVED"
            ? value
            : "DRAFT"
    );
};

function AdvertisementSearchResult({
    advertisement,
    onReuse,
}: AdvertisementSearchResultProps) {
    return (
        <article
            className="
                rounded-2xl
                border
                border-gray-200
                bg-white
                p-4
                shadow-sm
                transition
                hover:border-green-200
                hover:shadow-md
                sm:p-5
            "
        >
            <div
                className="
                    flex
                    flex-col
                    gap-4
                    lg:flex-row
                    lg:items-center
                    lg:justify-between
                "
            >
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base font-bold text-gray-900">
                            {advertisement.name}
                        </h2>

                        <AdvertisementStatusBadge
                            status={getWorkflowStatus(
                                advertisement,
                            )}
                            size="sm"
                        />
                    </div>

                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-500">
                        <span className="inline-flex items-center gap-1.5">
                            <Building2
                                size={14}
                                aria-hidden="true"
                            />

                            {advertisement.clientName ??
                                "Client not available"}
                        </span>

                        {advertisement.clientCode && (
                            <span>
                                {advertisement.clientCode}
                            </span>
                        )}

                        <span>
                            {advertisement.advertisementType}
                        </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-500">
                        <span className="inline-flex items-center gap-1.5">
                            <CalendarDays
                                size={14}
                                aria-hidden="true"
                            />

                            {formatDate(
                                advertisement.startAt,
                            )}
                            {" – "}
                            {formatDate(
                                advertisement.endAt,
                            )}
                        </span>

                        <span>
                            Priority:{" "}
                            {advertisement.priority}
                        </span>
                    </div>
                </div>

                <div
                    className="
                        flex
                        w-full
                        flex-col
                        gap-2
                        sm:flex-row
                        lg:w-auto
                    "
                >
                    <Link
                        to={`/admin/advertisements/${advertisement.id}`}
                        className="w-full sm:w-auto"
                    >
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-full sm:w-auto"
                            rightIcon={
                                <ArrowRight size={15} />
                            }
                        >
                            View
                        </Button>
                    </Link>

                    <Button
                        type="button"
                        size="sm"
                        className="w-full sm:w-auto"
                        onClick={() =>
                            onReuse(advertisement)
                        }
                    >
                        Reuse Advertisement
                    </Button>
                </div>
            </div>
        </article>
    );
}

export default function AdvertisementSearchPage() {
    const [
        searchParams,
        setSearchParams,
    ] = useSearchParams();

    const initialMode =
        (
            searchParams.get(
                "mode",
            ) as SearchMode | null
        ) ?? "CLIENT";

    const initialQuery =
        searchParams.get("q") ?? "";
    const initialPage = Math.max(1, Number(searchParams.get("page")) || 1);

    const [
        mode,
        setMode,
    ] = useState<SearchMode>(
        SEARCH_MODES.some(
            (option) =>
                option.value === initialMode,
        )
            ? initialMode
            : "CLIENT",
    );

    const [
        query,
        setQuery,
    ] = useState(initialQuery);

    const [
        results,
        setResults,
    ] = useState<AdvertisementListItem[]>(
        [],
    );

    const [
        loading,
        setLoading,
    ] = useState(false);

    const [page, setPage] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [pageSize, setPageSize] = useState(() => {
        const requested = Number(searchParams.get("pageSize"));
        return [5, 10, 20, 50].includes(requested) ? requested : 5;
    });

    const [
        searched,
        setSearched,
    ] = useState(
        Boolean(initialQuery),
    );

    const [
        error,
        setError,
    ] = useState<string | null>(
        null,
    );

    const selectedMode =
        SEARCH_MODES.find(
            (option) =>
                option.value === mode,
        ) ?? SEARCH_MODES[0];

    const canSearch =
        query.trim().length >= 2;

    const performSearch =
        useCallback(
            async (
                searchMode: SearchMode,
                searchQuery: string,
                requestedPage = 1,
                requestedPageSize = pageSize,
            ) => {
                const trimmed =
                    searchQuery.trim();

                if (trimmed.length < 2) {
                    setError(
                        "Enter at least 2 characters to search.",
                    );
                    return;
                }

                try {
                    setLoading(true);
                    setError(null);
                    setSearched(true);

                    /*
                     * The verified Advertisement API exposes
                     * the generic `search` filter.
                     *
                     * The dedicated client/mobile/email lookup
                     * will be mapped to the client API once its
                     * exact backend contract is connected.
                     */
                    const response =
                        await getAdvertisements({
                            page: requestedPage,
                            pageSize: requestedPageSize,
                            search: trimmed,
                        });

                    setResults(response.data ?? []);
                    setPage(requestedPage);
                    setTotalRecords(response.meta?.totalRecords ?? response.data?.length ?? 0);

                    setSearchParams(
                        {
                            mode: searchMode,
                            q: trimmed,
                            page: String(requestedPage),
                            pageSize: String(requestedPageSize),
                        },
                        {
                            replace: true,
                        },
                    );
                } catch (searchError) {
                    console.error(
                        "Advertisement search failed:",
                        searchError,
                    );

                    setResults([]);
                    setTotalRecords(0);

                    setError(
                        "We couldn't complete the search. Please try again.",
                    );
                } finally {
                    setLoading(false);
                }
            },
            [setSearchParams, pageSize],
        );

    useEffect(() => {
        if (
            initialQuery.trim().length < 2
        ) {
            return;
        }

        /*
         * Do not invoke performSearch() synchronously from
         * the effect body.
         *
         * performSearch() updates React state immediately.
         * Scheduling the initial search as a browser task
         * prevents the effect itself from synchronously
         * triggering cascading React renders.
         */
        const timerId =
            window.setTimeout(() => {
                void performSearch(
                    initialMode,
                    initialQuery,
                    initialPage,
                );
            }, 0);

        return () => {
            window.clearTimeout(timerId);
        };
    }, [
        initialMode,
        initialQuery,
        initialPage,
        performSearch,
    ]);

    const handleSubmit = (
        event: React.FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        void performSearch(
            mode,
            query,
        );
    };

    const handleClear = () => {
        setQuery("");
        setResults([]);
        setPage(1);
        setTotalRecords(0);
        setSearched(false);
        setError(null);

        setSearchParams(
            {},
            {
                replace: true,
            },
        );
    };

    const handleReuse = (
        advertisement: AdvertisementListItem,
    ) => {
        /*
         * UI-4 will consume this route and pre-populate
         * the guided creation workflow.
         *
         * We intentionally pass only the source advertisement
         * reference. The new advertisement must not inherit
         * historical payment/financial state.
         */
        window.location.assign(
            `/admin/advertisements/create?reuseFrom=${advertisement.id}`,
        );
    };

    return (
        <MainLayout>
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <div className="space-y-6">
                    <Link to="/admin/advertisements" className="inline-flex items-center gap-2 text-sm font-semibold text-green-700 hover:underline"><ArrowLeft size={16} /> Back to Advertisement Administration</Link>
                    <AdvertisementAdminPageHeader title="Find a client or advertisement" description="Search before creating anything new. Selecting an existing advertisement will allow the next workflow to reuse its eligible information." />
                    <Surface
                        padding="lg"
                        border="all"
                        radius="lg"
                    >
                        <form
                            onSubmit={
                                handleSubmit
                            }
                        >
                            <div className="mb-5">
                                <p className="text-sm font-semibold text-gray-800">
                                    What would you like to find?
                                </p>

                                <div
                                    className="
                                        mt-3
                                        grid
                                        grid-cols-1
                                        gap-2
                                        sm:grid-cols-2
                                        lg:grid-cols-4
                                    "
                                >
                                    {SEARCH_MODES.map(
                                        (
                                            option,
                                        ) => {
                                            const Icon =
                                                option.icon;

                                            const selected =
                                                mode ===
                                                option.value;

                                            return (
                                                <button
                                                    key={
                                                        option.value
                                                    }
                                                    type="button"
                                                    onClick={() =>
                                                        setMode(
                                                            option.value,
                                                        )
                                                    }
                                                    className={`
                                                        flex
                                                        min-h-[76px]
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
                                                            ? "border-green-500 bg-green-50"
                                                            : "border-gray-200 bg-white hover:border-green-300 hover:bg-green-50/50"
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
                                                        <span className="block text-sm font-semibold text-gray-900">
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
                            </div>

                            <div>
                                <label
                                    htmlFor="advertisement-search"
                                    className="mb-1.5 block text-sm font-semibold text-gray-800"
                                >
                                    {
                                        selectedMode.label
                                    }
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
                                            id="advertisement-search"
                                            value={query}
                                            onChange={(
                                                event,
                                            ) =>
                                                setQuery(
                                                    event
                                                        .target
                                                        .value,
                                                )
                                            }
                                            placeholder={
                                                mode ===
                                                    "CLIENT"
                                                    ? "Type a business or client name"
                                                    : mode ===
                                                        "MOBILE"
                                                        ? "Type a mobile number"
                                                        : mode ===
                                                            "EMAIL"
                                                            ? "Type an email address"
                                                            : "Type an advertisement or campaign name"
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
                                                onClick={
                                                    handleClear
                                                }
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
                                        disabled={
                                            !canSearch
                                        }
                                        leftIcon={
                                            <Search
                                                size={17}
                                            />
                                        }
                                        className="h-12 w-full sm:w-auto sm:min-w-28"
                                    >
                                        Search
                                    </Button>
                                </div>

                                <div
                                    className="
                                        mt-3
                                        rounded-lg
                                        bg-gray-50
                                        px-3
                                        py-2
                                        text-xs
                                        text-gray-500
                                    "
                                >
                                    <span className="font-semibold text-gray-700">
                                        Tip:
                                    </span>{" "}
                                    Search first, then select
                                    an existing record instead
                                    of entering the same client
                                    information again.
                                </div>
                            </div>
                        </form>
                    </Surface>

                    {error && (
                        <div
                            className="
                                flex
                                items-start
                                gap-3
                                rounded-xl
                                border
                                border-red-200
                                bg-red-50
                                px-4
                                py-3
                                text-sm
                                text-red-700
                            "
                        >
                            <AlertCircle
                                size={18}
                                className="mt-0.5 shrink-0"
                                aria-hidden="true"
                            />

                            <div>
                                <p className="font-semibold">
                                    Search needs attention
                                </p>

                                <p className="mt-0.5">
                                    {error}
                                </p>
                            </div>
                        </div>
                    )}

                    {searched && !loading && !error && (
                        <Surface
                            padding="lg"
                            border="all"
                            radius="lg"
                        >
                            <div
                                className="
                                    flex
                                    flex-col
                                    gap-2
                                    sm:flex-row
                                    sm:items-center
                                    sm:justify-between
                                "
                            >
                                <div>
                                    <Typography
                                        as="h2"
                                        variant="sectionTitle"
                                        className="text-xl"
                                    >
                                        Search results
                                    </Typography>

                                    <p className="mt-1 text-sm text-gray-500">
                                        {totalRecords}{" "}
                                        matching advertisement
                                        {totalRecords ===
                                            1
                                            ? ""
                                            : "s"}{" "}
                                        found
                                    </p>
                                </div>
                            </div>

                            {results.length ===
                                0 ? (
                                <div
                                    className="
                                        mt-5
                                        rounded-xl
                                        border
                                        border-dashed
                                        border-gray-300
                                        bg-gray-50
                                        px-5
                                        py-10
                                        text-center
                                    "
                                >
                                    <Search
                                        size={30}
                                        className="mx-auto text-gray-400"
                                    />

                                    <p className="mt-3 text-sm font-semibold text-gray-800">
                                        No matching advertisements
                                    </p>

                                    <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-gray-500">
                                        Try a different spelling,
                                        a shorter search term,
                                        or another search option.
                                    </p>
                                </div>
                            ) : (
                                <div className="mt-5 space-y-3">
                                    {results.map(
                                        (
                                            advertisement,
                                        ) => (
                                            <AdvertisementSearchResult
                                                key={
                                                    advertisement.id
                                                }
                                                advertisement={
                                                    advertisement
                                                }
                                                onReuse={
                                                    handleReuse
                                                }
                                            />
                                        ),
                                    )}
                                </div>
                            )}

                            {searched && (
                                <div className="mt-5 overflow-hidden rounded-lg border border-gray-200">
                                    <AdminListPagination
                                        page={page}
                                        pageSize={pageSize}
                                        total={totalRecords}
                                        onPageChange={(nextPage) => {
                                            if (!loading) void performSearch(mode, query, nextPage);
                                        }}
                                        onPageSizeChange={(size) => {
                                            setPageSize(size);
                                            setPage(1);
                                            if (!loading && query.trim().length >= 2) {
                                                void performSearch(mode, query, 1, size);
                                            }
                                        }}
                                    />
                                </div>
                            )}
                        </Surface>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}