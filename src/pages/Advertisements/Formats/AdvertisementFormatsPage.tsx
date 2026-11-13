import { formatIstDateTime } from "@/helpers/businessTimeZone.helpers";
import AdvertisementAdminPageHeader from "@/components/ui/AdvertisementAdminPageHeader";
import AdminListPagination from "../../../components/ui/AdminListPagination";

import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import { Link } from "react-router-dom";

import {
    Archive,
    ArrowLeft,
    CheckCircle2,
    CircleOff,

    Pencil,
    Plus,
    RefreshCw,
    Save,
    Search,
    X,
} from "lucide-react";

import MainLayout from "@/layouts/MainLayout";
import { useAuth } from "@/auth/AuthContext";

import {
    archiveFormat,
    createFormat,
    listFormats,
    setFormatStatus,
    updateFormat,
} from "@/api/advertisements/formats.api";

import type {
    AdvertisementFormat,
    FormatInput,
    FormatStatus,
} from "@/api/advertisements/formats.api";

type DialogAction = {
    item: AdvertisementFormat;
    action: "activate" | "deactivate" | "archive";
};

type DimensionKey =
    | "widthPx"
    | "heightPx"
    | "mobileWidthPx"
    | "mobileHeightPx";

const emptyForm: FormatInput = {
    code: "",
    displayName: "",
    description: null,
    widthPx: null,
    heightPx: null,
    mobileWidthPx: null,
    mobileHeightPx: null,
    isResponsive: false,
    displayOrder: 0,
};

const inputClass =
    "mt-1 min-h-10 w-full rounded-lg border border-gray-300 " +
    "bg-white px-3 py-2 text-sm focus:border-green-600 " +
    "focus:outline-none focus:ring-2 focus:ring-green-100";

function getError(error: unknown): string {
    if (
        typeof error === "object" &&
        error !== null &&
        "response" in error
    ) {
        const response = (
            error as {
                response?: {
                    data?: {
                        message?: string;
                    };
                };
            }
        ).response;

        if (response?.data?.message) {
            return response.data.message;
        }
    }

    return error instanceof Error
        ? error.message
        : "Unable to complete the request.";
}

function dimensions(
    width: number | null,
    height: number | null,
): string {
    return width !== null && height !== null
        ? `${width} × ${height} px`
        : "—";
}

function statusRank(status: FormatStatus): number {
    switch (status) {
        case "ACTIVE":
            return 0;

        case "INACTIVE":
            return 1;

        case "ARCHIVED":
            return 2;

        default:
            return 3;
    }
}

function formatTimestamp(value: string): string {
    const date = new Date(value);

    return Number.isNaN(date.getTime())
        ? "—"
        : formatIstDateTime(date);
}

export default function AdvertisementFormatsPage() {
    const { hasPermissionCode } = useAuth();

    const canCreate = hasPermissionCode(
        "advertisements.formats.create",
    );

    const canUpdate = hasPermissionCode(
        "advertisements.formats.update",
    );

    const [items, setItems] = useState<AdvertisementFormat[]>([]);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const [status, setStatus] = useState<
        FormatStatus | "ALL"
    >("ALL");

    const [responsive, setResponsive] = useState("ALL");
    const [origin, setOrigin] = useState("ALL");

    const [editing, setEditing] =
        useState<AdvertisementFormat | null>(null);

    const [form, setForm] = useState<FormatInput | null>(null);

    const [confirm, setConfirm] =
        useState<DialogAction | null>(null);

    /**
     * Fetch format configuration.
     */
    const refresh = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const records = await listFormats();
            setItems(records);
        } catch (cause) {
            setError(getError(cause));
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Defer initial loading to avoid synchronous
     * setState calls inside the effect body.
     */
    useEffect(() => {
        let cancelled = false;

        void Promise.resolve().then(() => {
            if (!cancelled) {
                void refresh();
            }
        });

        return () => {
            cancelled = true;
        };
    }, [refresh]);

    /**
     * Active newest first.
     * Inactive newest next.
     * Archived records last.
     */
    const visible = useMemo(() => {
        const query = search.trim().toLowerCase();

        return items
            .filter((item) => {
                if (
                    status !== "ALL" &&
                    item.status !== status
                ) {
                    return false;
                }

                if (
                    responsive !== "ALL" &&
                    item.isResponsive !==
                    (responsive === "YES")
                ) {
                    return false;
                }

                if (
                    origin !== "ALL" &&
                    item.isSystemFormat !==
                    (origin === "SYSTEM")
                ) {
                    return false;
                }

                if (!query) {
                    return true;
                }

                return [
                    item.code,
                    item.displayName,
                    item.description ?? "",
                ]
                    .join(" ")
                    .toLowerCase()
                    .includes(query);
            })
            .sort((a, b) => {
                const statusDifference =
                    statusRank(a.status) -
                    statusRank(b.status);

                if (statusDifference !== 0) {
                    return statusDifference;
                }

                const createdA = Date.parse(a.createdAt);
                const createdB = Date.parse(b.createdAt);

                const timeA = Number.isFinite(createdA)
                    ? createdA
                    : 0;

                const timeB = Number.isFinite(createdB)
                    ? createdB
                    : 0;

                return timeB - timeA || b.id - a.id;
            });
    }, [
        items,
        search,
        status,
        responsive,
        origin,
    ]);

    const totalPages = Math.max(1, Math.ceil(visible.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const pagedFormats = visible.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    /**
     * Open Add / Edit form.
     */
    const openForm = (item?: AdvertisementFormat) => {
        setEditing(item ?? null);

        setForm(
            item
                ? {
                    code: item.code,
                    displayName: item.displayName,
                    description: item.description,
                    widthPx: item.widthPx,
                    heightPx: item.heightPx,
                    mobileWidthPx: item.mobileWidthPx,
                    mobileHeightPx: item.mobileHeightPx,
                    isResponsive: item.isResponsive,
                    displayOrder: item.displayOrder,
                }
                : { ...emptyForm },
        );

        setError("");
        setSuccess("");
    };

    const change = <K extends keyof FormatInput>(
        key: K,
        value: FormatInput[K],
    ) => {
        setForm((previous) =>
            previous
                ? {
                    ...previous,
                    [key]: value,
                }
                : null,
        );
    };

    /**
     * Save format.
     */
    const save = async () => {
        if (!form || busy) {
            return;
        }

        if (
            (form.widthPx === null) !==
            (form.heightPx === null) ||
            (form.mobileWidthPx === null) !==
            (form.mobileHeightPx === null)
        ) {
            setError(
                "Width and height must both be supplied for each device size.",
            );
            return;
        }

        if (
            !form.isResponsive &&
            form.widthPx === null
        ) {
            setError(
                "Desktop dimensions are required for fixed formats.",
            );
            return;
        }

        setBusy(true);
        setError("");

        try {
            if (editing) {
                await updateFormat(editing.id, form);
            } else {
                await createFormat(form);
            }

            const wasEditing = Boolean(editing);

            setForm(null);
            setEditing(null);

            await refresh();

            setSuccess(
                wasEditing
                    ? "Format updated successfully."
                    : "Format created successfully.",
            );
        } catch (cause) {
            setError(getError(cause));
        } finally {
            setBusy(false);
        }
    };

    /**
     * Activate / Deactivate / Archive.
     */
    const performAction = async () => {
        if (!confirm || busy) {
            return;
        }

        const { item, action } = confirm;

        setBusy(true);
        setError("");

        try {
            if (action === "archive") {
                await archiveFormat(item.id);
            } else {
                await setFormatStatus(
                    item.id,
                    action === "activate"
                        ? "ACTIVE"
                        : "INACTIVE",
                );
            }

            setConfirm(null);

            await refresh();

            setSuccess(
                `Format ${action === "archive"
                    ? "archived"
                    : action === "activate"
                        ? "activated"
                        : "deactivated"
                } successfully.`,
            );
        } catch (cause) {
            setError(getError(cause));
            setConfirm(null);
        } finally {
            setBusy(false);
        }
    };

    const numberField = (
        label: string,
        key: DimensionKey,
    ) => (
        <label className="block text-sm font-medium text-gray-700">
            {label}

            <input
                type="number"
                min={1}
                max={10000}
                value={form?.[key] ?? ""}
                onChange={(event) =>
                    change(
                        key,
                        event.target.value === ""
                            ? null
                            : Number(event.target.value),
                    )
                }
                className={inputClass}
            />
        </label>
    );

    const totalActive = items.filter(
        (item) => item.status === "ACTIVE",
    ).length;

    const totalResponsive = items.filter(
        (item) => item.isResponsive,
    ).length;

    return (
        <MainLayout>
            <main className="mx-auto w-full max-w-[1600px] space-y-6 px-4 py-6 sm:px-6 lg:px-8">
                {/* Page header */}
                <Link to="/admin/advertisements" className="inline-flex items-center gap-2 text-sm font-semibold text-green-700 hover:underline"><ArrowLeft size={15} /> Back to Advertisement Administration</Link>
                <AdvertisementAdminPageHeader title="Format Configuration" description="Configure desktop and mobile creative dimensions, responsive formats, and format lifecycle status." actions={<>                        <button
                    type="button"
                    onClick={() => void refresh()}
                    disabled={loading || busy}
                    className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                    <RefreshCw
                        size={16}
                        className={
                            loading
                                ? "animate-spin"
                                : ""
                        }
                    />
                    Refresh
                </button>

                    {canCreate && (
                        <button
                            type="button"
                            onClick={() => openForm()}
                            className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800"
                        >
                            <Plus size={17} />
                            Add Format
                        </button>
                    )}
                </>} />

                {/* Messages */}
                {error && (
                    <div
                        role="alert"
                        className="flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                    >
                        <span>{error}</span>

                        <button
                            type="button"
                            onClick={() => setError("")}
                            aria-label="Dismiss error"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}

                {success && (
                    <div
                        role="status"
                        className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
                    >
                        <CheckCircle2 size={17} />
                        {success}
                    </div>
                )}

                {/* Summary */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {[
                        {
                            label: "Total Formats",
                            value: items.length,
                        },
                        {
                            label: "Active Formats",
                            value: totalActive,
                        },
                        {
                            label: "Responsive Formats",
                            value: totalResponsive,
                        },
                    ].map((summary) => (
                        <div
                            key={summary.label}
                            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                        >
                            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                {summary.label}
                            </div>

                            <div className="mt-2 text-2xl font-bold text-green-700">
                                {summary.value}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Format grid */}
                <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-200 p-4 sm:p-5">
                        <h2 className="text-base font-semibold text-gray-900">
                            Configured Formats
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Active formats appear first, newest to
                            oldest. Inactive and archived formats
                            follow.
                        </p>

                        {/* Search and filters */}
                        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                            <div className="relative">
                                <Search
                                    size={16}
                                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                />

                                <input
                                    type="search"
                                    aria-label="Search formats"
                                    placeholder="Search formats..."
                                    value={search}
                                    onChange={(event) =>
                                        (setSearch(event.target.value), setPage(1))
                                    }
                                    className={`${inputClass} mt-0 pl-9`}
                                />
                            </div>

                            <select
                                aria-label="Filter by status"
                                value={status}
                                onChange={(event) =>
                                (setPage(1), setStatus(
                                    event.target.value as
                                    | FormatStatus
                                    | "ALL",
                                ))
                                }
                                className={`${inputClass} mt-0`}
                            >
                                <option value="ALL">
                                    All statuses
                                </option>

                                <option value="ACTIVE">
                                    Active
                                </option>

                                <option value="INACTIVE">
                                    Inactive
                                </option>

                                <option value="ARCHIVED">
                                    Archived
                                </option>
                            </select>

                            <select
                                aria-label="Filter by responsive"
                                value={responsive}
                                onChange={(event) =>
                                    (setPage(1), setResponsive(event.target.value))
                                }
                                className={`${inputClass} mt-0`}
                            >
                                <option value="ALL">
                                    All responsive types
                                </option>

                                <option value="YES">
                                    Responsive
                                </option>

                                <option value="NO">
                                    Fixed size
                                </option>
                            </select>

                            <select
                                aria-label="Filter by origin"
                                value={origin}
                                onChange={(event) =>
                                    (setPage(1), setOrigin(event.target.value))
                                }
                                className={`${inputClass} mt-0`}
                            >
                                <option value="ALL">
                                    All formats
                                </option>

                                <option value="SYSTEM">
                                    System formats
                                </option>

                                <option value="CUSTOM">
                                    Custom formats
                                </option>
                            </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1000px] border-collapse text-left text-sm">
                            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                                <tr>
                                    {[
                                        "Format",
                                        "Desktop Size",
                                        "Mobile Size",
                                        "Type",
                                        "Status",
                                        "Audit",
                                        "Actions",
                                    ].map((heading) => (
                                        <th
                                            key={heading}
                                            scope="col"
                                            className={`px-4 py-3 font-semibold ${heading === "Actions"
                                                ? "text-right"
                                                : ""
                                                }`}
                                        >
                                            {heading}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-4 py-12 text-center text-gray-500"
                                        >
                                            Loading formats...
                                        </td>
                                    </tr>
                                ) : visible.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-4 py-12 text-center text-gray-500"
                                        >
                                            No formats match your filters.
                                        </td>
                                    </tr>
                                ) : (
                                    pagedFormats.map((item) => {
                                        /**
                                         * Updated action permissions.
                                         *
                                         * System formats:
                                         * - Edit allowed
                                         * - Activate/Deactivate allowed
                                         * - Archive prohibited
                                         *
                                         * Custom formats:
                                         * - All actions allowed
                                         *
                                         * Archived formats:
                                         * - All actions prohibited
                                         */
                                        const canEditFormat =
                                            canUpdate &&
                                            item.status !==
                                            "ARCHIVED";

                                        const canChangeStatus =
                                            canUpdate &&
                                            item.status !==
                                            "ARCHIVED";

                                        const canArchiveFormat =
                                            canUpdate &&
                                            !item.isSystemFormat &&
                                            item.status !==
                                            "ARCHIVED";

                                        const editTitle =
                                            !canUpdate
                                                ? "Requires advertisements.formats.update permission"
                                                : item.status ===
                                                    "ARCHIVED"
                                                    ? "Archived formats cannot be edited"
                                                    : "Edit format";

                                        const statusTitle =
                                            !canUpdate
                                                ? "Requires advertisements.formats.update permission"
                                                : item.status ===
                                                    "ARCHIVED"
                                                    ? "Archived formats cannot change status"
                                                    : item.status ===
                                                        "ACTIVE"
                                                        ? "Deactivate format"
                                                        : "Activate format";

                                        const archiveTitle =
                                            !canUpdate
                                                ? "Requires advertisements.formats.update permission"
                                                : item.isSystemFormat
                                                    ? "System formats cannot be archived"
                                                    : item.status ===
                                                        "ARCHIVED"
                                                        ? "Already archived"
                                                        : "Archive format";

                                        return (
                                            <tr
                                                key={item.id}
                                                className="align-top hover:bg-gray-50/70"
                                            >
                                                <td className="px-4 py-4">
                                                    <div className="font-semibold text-gray-900">
                                                        {item.displayName}
                                                    </div>

                                                    <div className="mt-1 font-mono text-xs text-gray-500">
                                                        {item.code}
                                                    </div>

                                                    {item.description && (
                                                        <div className="mt-1 max-w-56 text-xs text-gray-500">
                                                            {item.description}
                                                        </div>
                                                    )}
                                                </td>

                                                <td className="px-4 py-4 text-gray-700">
                                                    {dimensions(
                                                        item.widthPx,
                                                        item.heightPx,
                                                    )}
                                                </td>

                                                <td className="px-4 py-4 text-gray-700">
                                                    {dimensions(
                                                        item.mobileWidthPx,
                                                        item.mobileHeightPx,
                                                    )}
                                                </td>

                                                <td className="px-4 py-4">
                                                    <div>
                                                        {item.isResponsive
                                                            ? "Responsive"
                                                            : "Fixed"}
                                                    </div>

                                                    <div className="mt-1 text-xs text-gray-500">
                                                        {item.isSystemFormat
                                                            ? "System"
                                                            : "Custom"}
                                                    </div>
                                                </td>

                                                <td className="px-4 py-4">
                                                    <span
                                                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.status ===
                                                            "ACTIVE"
                                                            ? "bg-green-50 text-green-700"
                                                            : item.status ===
                                                                "ARCHIVED"
                                                                ? "bg-gray-100 text-gray-600"
                                                                : "bg-amber-50 text-amber-700"
                                                            }`}
                                                    >
                                                        {item.status}
                                                    </span>
                                                </td>

                                                <td className="px-4 py-4 text-xs text-gray-600">
                                                    <div>
                                                        {formatTimestamp(
                                                            item.updatedAt,
                                                        )}
                                                    </div>

                                                    <div className="mt-1">
                                                        Updated by:{" "}
                                                        {item.updatedBy ??
                                                            "—"}
                                                    </div>
                                                </td>

                                                {/* Actions */}
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center justify-end gap-1 whitespace-nowrap">
                                                        {/* Edit */}
                                                        <button
                                                            type="button"
                                                            disabled={
                                                                !canEditFormat ||
                                                                busy
                                                            }
                                                            title={editTitle}
                                                            aria-label={`Edit ${item.displayName}`}
                                                            onClick={() =>
                                                                openForm(item)
                                                            }
                                                            className="rounded-lg p-2 text-green-700 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-35"
                                                        >
                                                            <Pencil
                                                                size={17}
                                                            />
                                                        </button>

                                                        {/* Activate / Deactivate */}
                                                        <button
                                                            type="button"
                                                            disabled={
                                                                !canChangeStatus ||
                                                                busy
                                                            }
                                                            title={statusTitle}
                                                            aria-label={`${item.status ===
                                                                "ACTIVE"
                                                                ? "Deactivate"
                                                                : "Activate"
                                                                } ${item.displayName}`}
                                                            onClick={() =>
                                                                setConfirm({
                                                                    item,
                                                                    action:
                                                                        item.status ===
                                                                            "ACTIVE"
                                                                            ? "deactivate"
                                                                            : "activate",
                                                                })
                                                            }
                                                            className="rounded-lg p-2 text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-35"
                                                        >
                                                            {item.status ===
                                                                "ACTIVE" ? (
                                                                <CircleOff
                                                                    size={17}
                                                                />
                                                            ) : (
                                                                <CheckCircle2
                                                                    size={17}
                                                                />
                                                            )}
                                                        </button>

                                                        {/* Archive */}
                                                        <button
                                                            type="button"
                                                            disabled={
                                                                !canArchiveFormat ||
                                                                busy
                                                            }
                                                            title={archiveTitle}
                                                            aria-label={`Archive ${item.displayName}`}
                                                            onClick={() =>
                                                                setConfirm({
                                                                    item,
                                                                    action:
                                                                        "archive",
                                                                })
                                                            }
                                                            className="rounded-lg p-2 text-amber-700 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-35"
                                                        >
                                                            <Archive
                                                                size={17}
                                                            />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    <AdminListPagination
                        page={currentPage}
                        pageSize={pageSize}
                        total={visible.length}
                        onPageChange={(nextPage) => setPage(nextPage)}
                        onPageSizeChange={(nextSize) => { setPageSize(nextSize); setPage(1); }}
                    />
                </section>

                {/* Add / Edit dialog */}
                {form && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4">
                        <div
                            role="dialog"
                            aria-modal="true"
                            aria-label={
                                editing
                                    ? "Edit format"
                                    : "Add format"
                            }
                            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-5 shadow-xl"
                        >
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    {editing
                                        ? "Edit Format"
                                        : "Add Format"}
                                </h2>

                                <button
                                    type="button"
                                    aria-label="Close"
                                    disabled={busy}
                                    onClick={() => setForm(null)}
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    void save();
                                }}
                                className="space-y-4"
                            >
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <label className="text-sm font-medium text-gray-700">
                                        Format code

                                        <input
                                            required
                                            minLength={2}
                                            maxLength={80}
                                            pattern="[A-Z0-9_]+"
                                            disabled={!!editing}
                                            value={form.code}
                                            onChange={(event) =>
                                                change(
                                                    "code",
                                                    event.target.value.toUpperCase(),
                                                )
                                            }
                                            className={inputClass}
                                        />
                                    </label>

                                    <label className="text-sm font-medium text-gray-700">
                                        Display name

                                        <input
                                            required
                                            minLength={2}
                                            maxLength={150}
                                            value={form.displayName}
                                            onChange={(event) =>
                                                change(
                                                    "displayName",
                                                    event.target.value,
                                                )
                                            }
                                            className={inputClass}
                                        />
                                    </label>
                                </div>

                                <label className="block text-sm font-medium text-gray-700">
                                    Description

                                    <textarea
                                        maxLength={1000}
                                        rows={2}
                                        value={
                                            form.description ?? ""
                                        }
                                        onChange={(event) =>
                                            change(
                                                "description",
                                                event.target.value ||
                                                null,
                                            )
                                        }
                                        className={inputClass}
                                    />
                                </label>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="space-y-3 rounded-lg border border-gray-200 p-3">
                                        <h3 className="font-semibold text-gray-900">
                                            Desktop dimensions
                                        </h3>

                                        {numberField(
                                            "Width (px)",
                                            "widthPx",
                                        )}

                                        {numberField(
                                            "Height (px)",
                                            "heightPx",
                                        )}
                                    </div>

                                    <div className="space-y-3 rounded-lg border border-gray-200 p-3">
                                        <h3 className="font-semibold text-gray-900">
                                            Mobile dimensions
                                        </h3>

                                        {numberField(
                                            "Width (px)",
                                            "mobileWidthPx",
                                        )}

                                        {numberField(
                                            "Height (px)",
                                            "mobileHeightPx",
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <label className="flex items-center gap-2 text-sm font-medium">
                                        <input
                                            type="checkbox"
                                            checked={
                                                form.isResponsive
                                            }
                                            onChange={(event) =>
                                                change(
                                                    "isResponsive",
                                                    event.target.checked,
                                                )
                                            }
                                        />
                                        Responsive format
                                    </label>

                                    <label className="text-sm font-medium">
                                        Display order

                                        <input
                                            type="number"
                                            min={0}
                                            max={100000}
                                            value={
                                                form.displayOrder
                                            }
                                            onChange={(event) =>
                                                change(
                                                    "displayOrder",
                                                    Number(
                                                        event.target.value,
                                                    ),
                                                )
                                            }
                                            className={`${inputClass} w-32`}
                                        />
                                    </label>
                                </div>

                                <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
                                    <button
                                        type="button"
                                        disabled={busy}
                                        onClick={() =>
                                            setForm(null)
                                        }
                                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={busy}
                                        className="inline-flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                                    >
                                        <Save size={16} />
                                        {busy
                                            ? "Saving..."
                                            : "Save Format"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Action confirmation */}
                {confirm && (
                    <div className="fixed inset-0 z-[210] flex items-center justify-center bg-black/40 p-4">
                        <div
                            role="alertdialog"
                            aria-modal="true"
                            aria-labelledby="format-action-title"
                            className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl"
                        >
                            <h2
                                id="format-action-title"
                                className="text-lg font-semibold capitalize"
                            >
                                {confirm.action} Format
                            </h2>

                            <p className="mt-2 text-sm text-gray-600">
                                Are you sure you want to{" "}
                                {confirm.action}{" "}
                                <strong>
                                    {confirm.item.displayName}
                                </strong>
                                ?
                                {confirm.action === "archive"
                                    ? " Archived formats cannot be edited or reactivated."
                                    : ""}
                            </p>

                            <div className="mt-5 flex justify-end gap-2">
                                <button
                                    type="button"
                                    disabled={busy}
                                    onClick={() =>
                                        setConfirm(null)
                                    }
                                    className="rounded-lg border px-4 py-2 text-sm font-semibold"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    disabled={busy}
                                    onClick={() =>
                                        void performAction()
                                    }
                                    className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                                >
                                    {busy
                                        ? "Processing..."
                                        : "Confirm"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </MainLayout>
    );
}
