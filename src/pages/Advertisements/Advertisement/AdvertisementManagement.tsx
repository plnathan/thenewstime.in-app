import AdvertisementAdminPageHeader from "@/components/ui/AdvertisementAdminPageHeader";
import {
    AlertCircle,
    Megaphone,
    Plus,
    RefreshCw,
    Search,
    ShieldCheck,
    RotateCcw,
} from "lucide-react";
import {
    useCallback,
    useEffect,
    useState,
    useRef,
} from "react";
import {
    Link,
    useSearchParams,
} from "react-router-dom";

import {
    getAdvertisements,
    type AdvertisementQuery,
} from "@/api/advertisements/advertisement.api";

import MainLayout from "@/layouts/MainLayout";
import Surface from "@/components/ui/Surface";
import Typography from "@/components/ui/Typography";

import {
    AdvertisementManagementRow,
    AdvertisementPagination,
    EmptyAdvertisements,
    ManagementOverviewCards,
    QuickActionCard,
    RecentAdvertisementsLoading,
} from "../../../components/advertisements/Advertisement/AdvertisementManagement";

import {
    DEFAULT_PAGE_SIZE,
    EMPTY_OVERVIEW,
    EMPTY_PAGINATION,
    getApiErrorMessage,
    getTotalPages,
} from "@/helpers/advertisementManagement.helpers";

import type {
    AdvertisementListItem,
} from "@/api/advertisements/advertisement.api";

const LIST_STATE_KEY = "thenewstime.advertisements.list.query";

const AdvertisementManagementPage = () => {
    const didRestore = useRef(false);
    const requestSequence = useRef(0);
    const hasLoaded = useRef(false);
    const [
        searchParams,
        setSearchParams,
    ] = useSearchParams();

    const [
        advertisements,
        setAdvertisements,
    ] = useState<AdvertisementListItem[]>(
        [],
    );

    const [
        overview,
        setOverview,
    ] = useState(
        EMPTY_OVERVIEW,
    );

    const [
        pagination,
        setPagination,
    ] = useState(
        EMPTY_PAGINATION,
    );

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        refreshing,
        setRefreshing,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState<string | null>(
        null,
    );

    const loadAdvertisements =
        useCallback(
            async (
                page: number,
                showRefreshState = false,
                filters: AdvertisementQuery = {},
            ): Promise<void> => {
                const requestId = ++requestSequence.current;
                try {
                    if (showRefreshState) {
                        setRefreshing(true);
                    } else if (!hasLoaded.current) {
                        setLoading(true);
                    } else {
                        setRefreshing(true);
                    }

                    setError(null);

                    const pageResponse =
                        await getAdvertisements({
                            page,
                            pageSize: filters.pageSize ?? DEFAULT_PAGE_SIZE,
                            ...filters,
                        });

                    const totalRecords =
                        pageResponse.meta
                            ?.totalRecords ??
                        pageResponse.data
                            ?.length ??
                        0;

                    const serverPage =
                        page;

                    const serverPageSize =
                        pageResponse.meta
                            ?.pageSize ??
                        DEFAULT_PAGE_SIZE;

                    if (requestId !== requestSequence.current) return;
                    setAdvertisements(
                        pageResponse.data ?? [],
                    );

                    setPagination({
                        page:
                            serverPage > 0
                                ? serverPage
                                : page,
                        pageSize:
                            serverPageSize > 0
                                ? serverPageSize
                                : DEFAULT_PAGE_SIZE,
                        totalRecords,
                    });

                    const [
                        draftResponse,
                        pendingResponse,
                        activeResponse,
                        completedResponse,
                    ] = await Promise.all([
                        getAdvertisements({
                            page: 1,
                            pageSize: 1,
                            workflowStatus:
                                "DRAFT",
                        }),
                        getAdvertisements({
                            page: 1,
                            pageSize: 1,
                            workflowStatus:
                                "SUBMITTED",
                        }),
                        getAdvertisements({
                            page: 1,
                            pageSize: 1,
                            status: "ACTIVE",
                        }),
                        getAdvertisements({
                            page: 1,
                            pageSize: 1,
                            status: "ARCHIVED",
                        }),
                    ]);

                    if (requestId !== requestSequence.current) return;
                    setOverview({
                        draft:
                            draftResponse.meta
                                ?.totalRecords ??
                            draftResponse.data
                                ?.length ??
                            0,

                        pendingApproval:
                            pendingResponse.meta
                                ?.totalRecords ??
                            pendingResponse.data
                                ?.length ??
                            0,

                        active:
                            activeResponse.meta
                                ?.totalRecords ??
                            activeResponse.data
                                ?.length ??
                            0,

                        completed:
                            completedResponse.meta
                                ?.totalRecords ??
                            completedResponse.data
                                ?.length ??
                            0,
                    });
                } catch (loadError) {
                    console.error(
                        "Failed to load advertisements:",
                        loadError,
                    );

                    if (requestId !== requestSequence.current) return;
                    // Keep the last successful grid and pagination visible on refresh errors.
                    if (!hasLoaded.current) {
                        setAdvertisements([]);
                        setPagination({ ...EMPTY_PAGINATION, page });
                        setOverview(EMPTY_OVERVIEW);
                    }

                    setError(
                        getApiErrorMessage(
                            loadError,
                        ),
                    );
                } finally {
                    if (requestId === requestSequence.current) {
                        hasLoaded.current = true;
                        setLoading(false);
                        setRefreshing(false);
                    }
                }
            },
            [],
        );

    useEffect(() => {
        if (didRestore.current) return;
        didRestore.current = true;
        if (searchParams.toString()) return;
        const previous = window.sessionStorage.getItem(LIST_STATE_KEY);
        if (previous) setSearchParams(new URLSearchParams(previous), { replace: true, preventScrollReset: true });
    }, [searchParams, setSearchParams]);

    useEffect(() => {
        if (searchParams.toString()) window.sessionStorage.setItem(LIST_STATE_KEY, searchParams.toString());
    }, [searchParams]);

    useEffect(() => {
        const urlPage =
            Number(
                searchParams.get("page"),
            );

        const normalizedPage =
            Number.isInteger(
                urlPage,
            ) &&
                urlPage > 0
                ? urlPage
                : 1;

        const pageSize = Number(searchParams.get("pageSize"));
        const filters: AdvertisementQuery = {
            pageSize: [10, 20, 50].includes(pageSize) ? pageSize : DEFAULT_PAGE_SIZE,
            ...(searchParams.get("search") ? { search: searchParams.get("search")! } : {}),
            ...(searchParams.get("workflowStatus") ? { workflowStatus: searchParams.get("workflowStatus") as AdvertisementQuery["workflowStatus"] } : {}),
            ...(searchParams.get("operationalCondition") || searchParams.get("status") ? { operationalCondition: (searchParams.get("operationalCondition") ?? searchParams.get("status")) as AdvertisementQuery["operationalCondition"] } : {}),
            ...(searchParams.get("placementType") ? { placementType: searchParams.get("placementType")! } : {}),
            ...(searchParams.get("startDate") ? { startDate: searchParams.get("startDate")! } : {}),
            ...(searchParams.get("endDate") ? { endDate: searchParams.get("endDate")! } : {}),
        };
        const timerId =
            window.setTimeout(() => {
                void loadAdvertisements(
                    normalizedPage,
                    false,
                    filters,
                );
            }, 0);

        return () => {
            window.clearTimeout(
                timerId,
            );
        };
    }, [
        loadAdvertisements,
        searchParams,
    ]);

    const currentPage =
        pagination.page;

    const totalPages =
        getTotalPages(
            pagination,
        );

    const handleRefresh = () => {
        void loadAdvertisements(
            currentPage,
            true,
            {
                pageSize: [10, 20, 50].includes(Number(searchParams.get("pageSize"))) ? Number(searchParams.get("pageSize")) : DEFAULT_PAGE_SIZE,
                ...(searchParams.get("search") ? { search: searchParams.get("search")! } : {}),
                ...(searchParams.get("workflowStatus") ? { workflowStatus: searchParams.get("workflowStatus") as AdvertisementQuery["workflowStatus"] } : {}),
                ...(searchParams.get("operationalCondition") || searchParams.get("status") ? { operationalCondition: (searchParams.get("operationalCondition") ?? searchParams.get("status")) as AdvertisementQuery["operationalCondition"] } : {}),
                ...(searchParams.get("placementType") ? { placementType: searchParams.get("placementType")! } : {}),
                ...(searchParams.get("startDate") ? { startDate: searchParams.get("startDate")! } : {}),
                ...(searchParams.get("endDate") ? { endDate: searchParams.get("endDate")! } : {}),
            },
        );
    };

    const handlePageChange = (
        page: number,
    ) => {
        if (
            page < 1 ||
            page > totalPages ||
            page === currentPage
        ) {
            return;
        }

        setSearchParams((previous) => {
            const next = new URLSearchParams(previous);
            next.set("page", String(page));
            return next;
        }, { preventScrollReset: true });
    };

    const updateFilter = (key: string, value: string) => {
        setSearchParams(previous => {
            const next = new URLSearchParams(previous);
            if (value) next.set(key, value);
            else next.delete(key);
            next.set("page", "1");
            return next;
        }, { preventScrollReset: true });
    };

    const filterClass = "min-h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600";
    const firstRecord =
        pagination.totalRecords === 0
            ? 0
            : (
                (
                    currentPage -
                    1
                ) *
                pagination.pageSize
            ) + 1;

    const lastRecord =
        Math.min(
            currentPage *
            pagination.pageSize,
            pagination.totalRecords,
        );

    return (
        <MainLayout>
            <main
                className="
                    mx-auto
                    w-full
                    max-w-7xl
                    px-4
                    py-6
                    sm:px-6
                    lg:px-8
                "
            >
                <div
                    className="
                        flex
                        flex-col
                        gap-6
                    "
                >
                    <AdvertisementAdminPageHeader title="Advertisement Management" description="Manage clients, advertisements, campaigns, placements, schedules, payments and approval workflows from one place." actions={<>                            <button
                        type="button"
                        onClick={
                            handleRefresh
                        }
                        disabled={
                            loading ||
                            refreshing
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
                                    transition
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
                            size={17}
                            className={
                                refreshing
                                    ? "animate-spin"
                                    : ""
                            }
                            aria-hidden="true"
                        />

                        Refresh
                    </button>

                        <Link
                            to="/admin/advertisements/search"
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
                                    transition
                                    hover:bg-gray-50
                                    focus:outline-none
                                    focus:ring-2
                                    focus:ring-green-600
                                    focus:ring-offset-2
                                "
                        >
                            <Search
                                size={17}
                                aria-hidden="true"
                            />

                            Search Advertisements
                        </Link>

                        <Link
                            to="/admin/advertisements/create"
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
                                "
                        >
                            <Plus
                                size={17}
                                aria-hidden="true"
                            />

                            Create Advertisement
                        </Link>
                    </>} />

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
                            role="alert"
                        >
                            <AlertCircle
                                size={19}
                                className="mt-0.5 shrink-0"
                                aria-hidden="true"
                            />

                            <div className="min-w-0">
                                <p className="font-semibold">
                                    Advertisement data could not
                                    be loaded
                                </p>

                                <p className="mt-1">
                                    {error}
                                </p>

                                <button
                                    type="button"
                                    onClick={
                                        handleRefresh
                                    }
                                    className="
                                        mt-3
                                        inline-flex
                                        min-h-9
                                        items-center
                                        gap-2
                                        rounded-md
                                        border
                                        border-red-300
                                        bg-white
                                        px-3
                                        py-1.5
                                        text-xs
                                        font-semibold
                                        text-red-700
                                        hover:bg-red-50
                                        focus:outline-none
                                        focus:ring-2
                                        focus:ring-red-500
                                        focus:ring-offset-2
                                    "
                                >
                                    <RefreshCw
                                        size={14}
                                        aria-hidden="true"
                                    />

                                    Try again
                                </button>
                            </div>
                        </div>
                    )}

                    <section
                        aria-labelledby="advertisement-overview-heading"
                    >
                        <div className="mb-3">
                            <Typography
                                id="advertisement-overview-heading"
                                as="h2"
                                variant="headline"
                                className="
                                    text-sm
                                    font-medium
                                    sm:text-xl
                                "
                            >
                                Campaign Overview
                            </Typography>
                        </div>

                        <div
                            className="
                                grid
                                grid-cols-1
                                gap-4
                                sm:grid-cols-2
                                xl:grid-cols-4
                            "
                        >
                            <ManagementOverviewCards
                                draft={
                                    overview.draft
                                }
                                pendingApproval={
                                    overview.pendingApproval
                                }
                                active={
                                    overview.active
                                }
                                completed={
                                    overview.completed
                                }
                                loading={
                                    loading
                                }
                            />
                        </div>
                    </section>

                    <section
                        aria-labelledby="advertisement-actions-heading"
                    >
                        <div className="mb-3">
                            <Typography
                                id="advertisement-actions-heading"
                                as="h2"
                                variant="headline"
                                className="
                                    text-sm
                                    font-medium
                                    sm:text-xl
                                "
                            >
                                Quick Actions
                            </Typography>
                        </div>

                        <div
                            className="
                                grid
                                grid-cols-1
                                gap-4
                                md:grid-cols-2
                                xl:grid-cols-4
                            "
                        >
                            <QuickActionCard
                                to="/admin/advertisements/create"
                                icon={
                                    <Plus
                                        size={21}
                                    />
                                }
                                title="Create Advertisement"
                                description="Start a new advertisement using an existing or new client."
                            />

                            <QuickActionCard
                                to="/admin/advertisements/search"
                                icon={
                                    <Search
                                        size={21}
                                    />
                                }
                                title="Search Advertisements"
                                description="Find advertisements by client, mobile, email or advertisement details."
                            />

                            <QuickActionCard
                                to="/admin/advertisements/list"
                                icon={
                                    <Megaphone
                                        size={21}
                                    />
                                }
                                title="Advertisement List"
                                description="Review all advertisements, campaign activity and workflow status."
                            />

                            <QuickActionCard
                                to="/admin/advertisements/list?workflowStatus=SUBMITTED"
                                icon={
                                    <ShieldCheck
                                        size={21}
                                    />
                                }
                                title="Approval Workflow"
                                description="Review advertisements currently moving through the approval workflow."
                            />
                        </div>
                    </section>

                    <section
                        aria-labelledby="advertisements-heading"
                    >
                        <Surface
                            className="
                                overflow-hidden
                                border
                                border-gray-200
                            "
                        >
                            <div
                                className="
                                    flex
                                    flex-col
                                    gap-3
                                    border-b
                                    border-gray-200
                                    px-5
                                    py-4
                                    sm:flex-row
                                    sm:items-center
                                    sm:justify-between
                                "
                            >
                                <div>
                                    <Typography
                                        id="advertisements-heading"
                                        as="h2"
                                        variant="headline"
                                        className="
                                            text-sm
                                            font-medium
                                            sm:text-xl
                                        "
                                    >
                                        {searchParams.get("workflowStatus") === "SUBMITTED" ? "Approval Workflow — Submitted Advertisements" : "Advertisements"}
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
                                        {searchParams.get("workflowStatus") === "SUBMITTED"
                                            ? "Advertisements awaiting approval."
                                            : "Browse and manage all advertisements."}
                                    </Typography>
                                </div>


                            </div>

                            <form
                                className="grid gap-3 border-b border-gray-200 bg-gray-50/60 px-5 py-4 sm:grid-cols-2 lg:grid-cols-3"
                                onSubmit={event => { event.preventDefault(); const formData = new FormData(event.currentTarget); updateFilter("search", String(formData.get("search") ?? "").trim()); }}
                            >
                                <label className="text-xs font-semibold text-gray-700">Advertisement / Client / Client Code
                                    <div className="mt-1 flex gap-2">
                                        <input name="search" key={searchParams.get("search") ?? ""} className={filterClass} defaultValue={searchParams.get("search") ?? ""} placeholder="Search advertisements or clients" />
                                        <button type="submit" className="rounded-lg bg-green-700 px-3 text-white" aria-label="Search"><Search size={17} /></button>
                                    </div>
                                </label>
                                <label className="text-xs font-semibold text-gray-700">Placement Type
                                    <select className={`mt-1 ${filterClass}`} value={searchParams.get("placementType") ?? ""} onChange={event => updateFilter("placementType", event.target.value)}>
                                        <option value="">All placements</option>
                                        {[
                                            "HOME_TOP", "HOME_BANNER", "HOME_BETWEEN_SECTIONS", "HOME_SIDEBAR", "HOME_BOTTOM", "HOME_MODAL",
                                            "NEWS_LIST_TOP",
                                            "NEWS_LIST_BANNER",
                                            "NEWS_LIST_BANNER", "NEWS_LIST_BETWEEN", "NEWS_LIST_BOTTOM", "NEWS_LIST_SIDEBAR", "NEWS_LIST_MODAL",
                                            "NEWS_DETAIL_TOP",
                                            "NEWS_DETAIL_BANNER",
                                            "NEWS_DETAIL_BANNER", "NEWS_DETAIL_BETWEEN", "NEWS_DETAIL_BOTTOM", "NEWS_DETAIL_SIDEBAR", "NEWS_DETAIL_MODAL",
                                        ].map(value => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}
                                    </select>
                                </label>
                                <label className="text-xs font-semibold text-gray-700">Workflow Status
                                    <select className={`mt-1 ${filterClass}`} value={searchParams.get("workflowStatus") ?? ""} onChange={event => updateFilter("workflowStatus", event.target.value)}>
                                        <option value="">All workflows</option>
                                        {["DRAFT", "SUBMITTED", "APPROVED", "REJECTED"].map(value => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}
                                    </select>
                                </label>
                                <label className="text-xs font-semibold text-gray-700">Operational / Delivery Status
                                    <select className={`mt-1 ${filterClass}`} value={searchParams.get("operationalCondition") ?? searchParams.get("status") ?? ""} onChange={event => {
                                        const value = event.target.value;
                                        setSearchParams(previous => {
                                            const next = new URLSearchParams(previous);
                                            next.delete("status");
                                            next.delete("operationalCondition");
                                            if (value) {
                                                next.set("operationalCondition", value);
                                            }
                                            next.set("page", "1");
                                            return next;
                                        }, { preventScrollReset: true });
                                    }}>
                                        <option value="">All statuses</option>
                                        {["ACTIVE", "PAUSED", "COMPLETED", "ON_HOLD", "STOPPED", "ARCHIVED"].map(value => <option key={value} value={value}>{value === "ACTIVE" ? "ACTIVATED" : value.replaceAll("_", " ")}</option>)}
                                    </select>
                                </label>
                                <label className="text-xs font-semibold text-gray-700">Campaign / Schedule Start Date
                                    <input type="date" className={`mt-1 ${filterClass}`} value={searchParams.get("startDate") ?? ""} onChange={event => updateFilter("startDate", event.target.value)} />
                                </label>
                                <label className="text-xs font-semibold text-gray-700">Campaign / Schedule End Date
                                    <input type="date" className={`mt-1 ${filterClass}`} value={searchParams.get("endDate") ?? ""} min={searchParams.get("startDate") ?? undefined} onChange={event => updateFilter("endDate", event.target.value)} />
                                </label>
                                <div className="flex items-center sm:col-span-2 lg:col-span-3">
                                    <button type="button" onClick={() => { setSearchParams(new URLSearchParams({ page: "1", pageSize: String(pagination.pageSize || DEFAULT_PAGE_SIZE) }), { preventScrollReset: true }); }} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"><RotateCcw size={16} /> Reset Filters</button>
                                </div>
                            </form>

                            {refreshing && <div className="border-b border-green-100 bg-green-50 px-5 py-2 text-xs font-semibold text-green-800" role="status">Updating advertisement records…</div>}
                            {loading ? (
                                <RecentAdvertisementsLoading />
                            ) : advertisements.length ===
                                0 ? (
                                <EmptyAdvertisements />
                            ) : (
                                <>
                                    <div className="divide-y divide-gray-100">
                                        {advertisements.map(
                                            (
                                                advertisement,
                                            ) => (
                                                <AdvertisementManagementRow
                                                    key={
                                                        advertisement.id
                                                    }
                                                    advertisement={
                                                        advertisement
                                                    }
                                                />
                                            ),
                                        )}
                                    </div>

                                    <AdvertisementPagination
                                        currentPage={
                                            currentPage
                                        }
                                        totalPages={
                                            totalPages
                                        }
                                        totalRecords={pagination.totalRecords}
                                        pageSize={pagination.pageSize}
                                        firstRecord={firstRecord}
                                        lastRecord={lastRecord}
                                        onPageSizeChange={size => updateFilter("pageSize", String(size))}
                                        onPrevious={() =>
                                            handlePageChange(
                                                currentPage -
                                                1,
                                            )
                                        }
                                        onNext={() =>
                                            handlePageChange(
                                                currentPage +
                                                1,
                                            )
                                        }
                                        onPageChange={
                                            handlePageChange
                                        }
                                    />
                                </>
                            )}
                        </Surface>
                    </section>
                </div>
            </main>
        </MainLayout>
    );
};

export default AdvertisementManagementPage;