import { ChevronLeft, ChevronRight } from "lucide-react";

type PageToken = number | "ellipsis-start" | "ellipsis-end";

interface AdminListPaginationProps {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
}

const PAGE_SIZES = [5, 10, 20, 50, 100] as const;

function getPageTokens(current: number, totalPages: number): PageToken[] {
    if (totalPages <= 6) {
        return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    // Keep a five-page window around the current page, and always show the last page.
    const first = Math.max(1, Math.min(current - 3, totalPages - 4));
    const last = Math.min(totalPages, first + 4);
    const tokens: PageToken[] = [];

    if (first > 1) {
        tokens.push(1);
        if (first > 2) tokens.push("ellipsis-start");
    }

    for (let value = first; value <= last; value += 1) tokens.push(value);

    if (last < totalPages) {
        if (last < totalPages - 1) tokens.push("ellipsis-end");
        tokens.push(totalPages);
    }

    return tokens;
}

const pageButtonClass =
    "inline-flex h-9 min-w-9 items-center justify-center rounded-md border border-slate-300 bg-white px-2 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40";

export default function AdminListPagination({
    page,
    pageSize,
    total,
    onPageChange,
    onPageSizeChange,
}: AdminListPaginationProps) {
    const safePageSize = PAGE_SIZES.find((size) => size === pageSize) ?? 5;
    const totalPages = Math.max(1, Math.ceil(total / safePageSize));
    const current = Math.min(Math.max(1, page), totalPages);
    const firstRecord = total === 0 ? 0 : (current - 1) * safePageSize + 1;
    const lastRecord = Math.min(current * safePageSize, total);
    const tokens = getPageTokens(current, totalPages);

    return (
        <nav
            aria-label="Grid pagination"
            className="grid grid-cols-1 items-center gap-3 border-t border-slate-200 bg-white px-4 py-4 text-sm text-slate-600 lg:grid-cols-[1fr_auto_1fr] lg:px-6"
        >
            <div className="text-center text-xs sm:text-sm lg:text-left">
                Showing <span className="font-medium tabular-nums">{firstRecord} to {lastRecord}</span> of{" "}
                <span className="font-medium tabular-nums">{total}</span>
                <span className="mx-1 text-slate-400">·</span>
                Page <span className="tabular-nums">{current}</span> of{" "}
                <span className="tabular-nums">{totalPages}</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-1" aria-label="Page navigation">
                <button
                    type="button"
                    aria-label="Previous page"
                    title="Previous page"
                    disabled={current === 1}
                    onClick={() => onPageChange(current - 1)}
                    className={pageButtonClass}
                >
                    <ChevronLeft size={18} aria-hidden="true" />
                </button>
                {tokens.map((token) =>
                    typeof token === "number" ? (
                        <button
                            key={token}
                            type="button"
                            aria-label={`Go to page ${token}`}
                            aria-current={token === current ? "page" : undefined}
                            onClick={() => onPageChange(token)}
                            className={`${pageButtonClass} ${token === current
                                ? "!border-[#008236] !bg-[#008236] !text-white hover:!bg-[#006c2d]"
                                : ""
                                }`}
                        >
                            {token}
                        </button>
                    ) : (
                        <span key={token} aria-hidden="true" className="inline-flex h-9 min-w-7 items-center justify-center px-1">
                            ...
                        </span>
                    ),
                )}
                <button
                    type="button"
                    aria-label="Next page"
                    title="Next page"
                    disabled={current === totalPages}
                    onClick={() => onPageChange(current + 1)}
                    className={pageButtonClass}
                >
                    <ChevronRight size={18} aria-hidden="true" />
                </button>
            </div>

            <label className="flex items-center justify-center gap-3 whitespace-nowrap text-xs sm:text-sm lg:justify-end">
                <span>Rows per page</span>
                <select
                    aria-label="Rows per page"
                    value={safePageSize}
                    onChange={(event) => onPageSizeChange(Number(event.target.value))}
                    className="h-9 rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-900 focus:border-[#008236] focus:outline-none focus:ring-2 focus:ring-[#008236]/20"
                >
                    {PAGE_SIZES.map((size) => (
                        <option key={size} value={size}>{size}</option>
                    ))}
                </select>
            </label>
        </nav>
    );
}
