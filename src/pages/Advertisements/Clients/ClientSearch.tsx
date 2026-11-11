import AdminListPagination from "@/components/ui/AdminListPagination";
import {
    Search,
    UserRound,
    X,
} from "lucide-react";
import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

import {
    getAdvertisementClients,
} from "@/api/advertisements";

import type {
    AdvertisementClient,
} from "@/api/advertisements";

import Surface from "@/components/ui/Surface";
import Typography from "@/components/ui/Typography";

interface ClientSearchProps {
    selectedClientId: number | null;
    onSelect: (client: AdvertisementClient) => void;
}

const ClientSearch = ({
    selectedClientId,
    onSelect,
}: ClientSearchProps) => {
    const [search, setSearch] = useState("");
    const [clients, setClients] = useState<AdvertisementClient[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState<number | null>(null);
    const requestId = useRef(0);
    const [errorMessage, setErrorMessage] = useState<string | null>(
        null,
    );

    const searchClients = useCallback(
        async (value: string, requestedPage: number, id: number) => {
            try {
                const response = await getAdvertisementClients({
                    page: requestedPage,
                    pageSize,
                    search: value.trim(),
                    status: "ACTIVE",
                });
                if (requestId.current !== id) return;
                setClients(response.data);
                setTotalPages(Math.max(1, response.meta?.totalPages ?? 1));
                setTotalRecords(response.meta?.totalRecords ?? null);
                setErrorMessage(null);
            } catch (error) {
                if (requestId.current !== id) return;
                console.error("Failed to retrieve advertisement clients:", error);
                setClients([]);
                setTotalPages(1);
                setTotalRecords(null);
                setErrorMessage("Unable to retrieve clients. Please try again.");
            } finally {
                if (requestId.current === id) setLoading(false);
            }
        },
        [pageSize],
    );

    useEffect(() => {
        const id = ++requestId.current;
        const value = search.trim();
        if (!value) return;
        const timer = window.setTimeout(() => {
            void searchClients(value, page, id);
        }, 300);
        return () => {
            window.clearTimeout(timer);
            ++requestId.current;
        };
    }, [search, page, searchClients]);

    const handleSearchChange = (value: string) => {
        ++requestId.current;
        setSearch(value);
        setPage(1);
        setClients([]);
        setTotalPages(1);
        setTotalRecords(null);
        setErrorMessage(null);
        setLoading(Boolean(value.trim()));
    };

    const handleClear = () => handleSearchChange("");

    const changePage = (nextPage: number) => {
        if (nextPage < 1 || nextPage > totalPages || nextPage === page) return;
        ++requestId.current;
        setLoading(true);
        setClients([]);
        setPage(nextPage);
    };

    return (
        <Surface
            className="
                border
                border-gray-200
                p-5
            "
        >
            <div
                className="
                    flex
                    flex-col
                    gap-4
                "
            >
                <div>
                    <Typography
                        as="h2"
                        variant="headline"
                        className="
                            text-base
                            font-semibold
                            sm:text-lg
                        "
                    >
                        Find Client
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
                        Search an existing advertisement client by
                        client name, code, mobile or email.
                    </Typography>
                </div>

                <div className="relative">
                    <label
                        htmlFor="advertisement-client-search"
                        className="
                            mb-1.5
                            block
                            text-sm
                            font-medium
                            text-gray-700
                        "
                    >
                        Client search
                    </label>

                    <div className="relative">
                        <Search
                            size={18}
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
                            id="advertisement-client-search"
                            type="search"
                            value={search}
                            onChange={(event) => {
                                handleSearchChange(event.target.value);
                            }}
                            placeholder="Name, client code, mobile or email"
                            autoComplete="off"
                            className="
                                min-h-11
                                w-full
                                rounded-md
                                border
                                border-gray-300
                                bg-white
                                pl-10
                                pr-10
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

                        {search.length > 0 && (
                            <button
                                type="button"
                                onClick={handleClear}
                                aria-label="Clear client search"
                                className="
                                    absolute
                                    right-2
                                    top-1/2
                                    flex
                                    h-8
                                    w-8
                                    -translate-y-1/2
                                    items-center
                                    justify-center
                                    rounded-md
                                    text-gray-500
                                    hover:bg-gray-100
                                    hover:text-gray-700
                                    focus:outline-none
                                    focus:ring-2
                                    focus:ring-green-600
                                "
                            >
                                <X
                                    size={17}
                                    aria-hidden="true"
                                />
                            </button>
                        )}
                    </div>
                </div>

                {loading && (
                    <div
                        className="
                            rounded-md
                            border
                            border-gray-200
                            bg-gray-50
                            px-4
                            py-3
                            text-sm
                            text-gray-600
                        "
                    >
                        Searching clients…
                    </div>
                )}

                {!loading && errorMessage && (
                    <div
                        role="alert"
                        className="
                            rounded-md
                            border
                            border-red-200
                            bg-red-50
                            px-4
                            py-3
                            text-sm
                            text-red-700
                        "
                    >
                        {errorMessage}
                    </div>
                )}

                {!loading &&
                    !errorMessage &&
                    search.trim().length > 0 &&
                    clients.length === 0 && (
                        <div
                            className="
                                rounded-md
                                border
                                border-gray-200
                                bg-gray-50
                                px-4
                                py-5
                                text-center
                            "
                        >
                            <UserRound
                                size={24}
                                className="
                                    mx-auto
                                    text-gray-400
                                "
                                aria-hidden="true"
                            />

                            <Typography
                                as="p"
                                variant="body"
                                className="
                                    mt-2
                                    text-sm
                                    font-medium
                                    text-gray-700
                                "
                            >
                                No active clients found.
                            </Typography>

                            <Typography
                                as="p"
                                variant="body"
                                className="
                                    mt-1
                                    text-xs
                                    text-gray-500
                                "
                            >
                                Try another client name, code, mobile
                                number or email.
                            </Typography>
                        </div>
                    )}

                {!loading && clients.length > 0 && (
                    <div
                        className="
                            overflow-hidden
                            rounded-md
                            border
                            border-gray-200
                        "
                    >
                        <div
                            className="
                                border-b
                                border-gray-200
                                bg-gray-50
                                px-4
                                py-2.5
                            "
                        >
                            <Typography
                                as="p"
                                variant="body"
                                className="
                                    text-xs
                                    font-semibold
                                    uppercase
                                    tracking-wide
                                    text-gray-500
                                "
                            >
                                Matching clients
                            </Typography>
                        </div>

                        <div className="divide-y divide-gray-200">
                            {clients.map((client) => {
                                const isSelected =
                                    client.id === selectedClientId;

                                return (
                                    <button
                                        key={client.id}
                                        type="button"
                                        onClick={() => {
                                            onSelect(client);
                                        }}
                                        className={`
                                            block
                                            w-full
                                            px-4
                                            py-4
                                            text-left
                                            transition
                                            focus:outline-none
                                            focus:ring-2
                                            focus:ring-inset
                                            focus:ring-green-600
                                            ${isSelected
                                                ? "bg-green-50"
                                                : "bg-white hover:bg-gray-50"
                                            }
                                        `}
                                    >
                                        <div
                                            className="
                                                flex
                                                flex-col
                                                gap-2
                                                sm:flex-row
                                                sm:items-start
                                                sm:justify-between
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
                                                        as="p"
                                                        variant="body"
                                                        className="
                                                            text-sm
                                                            font-semibold
                                                            text-gray-900
                                                        "
                                                    >
                                                        {client.displayName ||
                                                            client.name}
                                                    </Typography>

                                                    {client.clientCode && (
                                                        <span
                                                            className="
                                                                rounded
                                                                bg-gray-100
                                                                px-2
                                                                py-0.5
                                                                text-xs
                                                                font-medium
                                                                text-gray-600
                                                            "
                                                        >
                                                            {
                                                                client.clientCode
                                                            }
                                                        </span>
                                                    )}
                                                </div>

                                                <div
                                                    className="
                                                        mt-1
                                                        flex
                                                        flex-wrap
                                                        gap-x-4
                                                        gap-y-1
                                                        text-xs
                                                        text-gray-500
                                                    "
                                                >
                                                    {client.businessName && (
                                                        <span>
                                                            {
                                                                client.businessName
                                                            }
                                                        </span>
                                                    )}

                                                    {client.contactNo && (
                                                        <span>
                                                            {
                                                                client.contactNo
                                                            }
                                                        </span>
                                                    )}

                                                    {client.email && (
                                                        <span className="break-all">
                                                            {
                                                                client.email
                                                            }
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {isSelected && (
                                                <span
                                                    className="
                                                        shrink-0
                                                        rounded-full
                                                        bg-green-100
                                                        px-2.5
                                                        py-1
                                                        text-xs
                                                        font-semibold
                                                        text-green-800
                                                    "
                                                >
                                                    Selected
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {!errorMessage && search.trim().length > 0 && (
                    <AdminListPagination
                        page={page}
                        pageSize={pageSize}
                        total={totalRecords ?? (totalPages - 1) * pageSize + clients.length}
                        onPageChange={changePage}
                        onPageSizeChange={(size) => {
                            ++requestId.current;
                            setPageSize(size);
                            setPage(1);
                            setClients([]);
                            setLoading(true);
                        }}
                    />
                )}

                {!loading &&
                    search.trim().length === 0 && (
                        <div
                            className="
                                rounded-md
                                border
                                border-dashed
                                border-gray-300
                                bg-gray-50
                                px-4
                                py-5
                                text-center
                            "
                        >
                            <Typography
                                as="p"
                                variant="body"
                                className="text-sm text-gray-500"
                            >
                                Start typing to search existing
                                clients.
                            </Typography>
                        </div>
                    )}
            </div>
        </Surface>
    );
};

export default ClientSearch;