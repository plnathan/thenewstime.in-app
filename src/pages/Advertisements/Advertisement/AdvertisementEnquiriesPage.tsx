import { formatIstDate, formatIstDateTime } from "@/helpers/businessTimeZone.helpers";
import AdvertisementAdminPageHeader from "@/components/ui/AdvertisementAdminPageHeader";
import AdminListPagination from "../../../components/ui/AdminListPagination";
import { useCallback, useEffect, useState } from "react";
import {
    Ban,
    CalendarCheck2,
    Clock3,
    Eye,
    Inbox,
    MessageSquareCheck,
    Pencil,
    RefreshCw,
    SearchX,
    Trash2,
    X,
} from "lucide-react";

import MainLayout from "@/layouts/MainLayout";
import {
    getAdvertisementEnquiryStatistics,
    type AdvertisementEnquiryStatistics,
    deleteAdvertisementEnquiry,
    listAdvertisementEnquiries,
    updateAdvertisementEnquiry,
    type AdvertisementEnquiryRecord,
    type EnquiryStatus,
} from "@/api/advertisements/advertisement-enquiries.api";

const statuses: EnquiryStatus[] = ["PENDING", "RESPONDED", "REJECTED", "BOOKED"];
const inputClass = "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100";
const actionClass = "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50";

const statusLabels: Record<EnquiryStatus, string> = {
    PENDING: "Pending",
    RESPONDED: "Responded",
    REJECTED: "Rejected",
    BOOKED: "Booked",
};

const statusColors: Record<EnquiryStatus, string> = {
    PENDING: "bg-amber-50 text-amber-800 ring-amber-200",
    RESPONDED: "bg-blue-50 text-blue-800 ring-blue-200",
    REJECTED: "bg-red-50 text-red-800 ring-red-200",
    BOOKED: "bg-green-50 text-green-800 ring-green-200",
};

function getErrorMessage(error: unknown, fallback: string): string {
    if (error && typeof error === "object") {
        const candidate = error as {
            response?: { data?: { message?: unknown } };
            message?: unknown;
        };
        const serverMessage = candidate.response?.data?.message;
        if (typeof serverMessage === "string" && serverMessage.trim()) return serverMessage;
        if (typeof candidate.message === "string" && candidate.message.trim()) return candidate.message;
    }
    return fallback;
}

export default function AdvertisementEnquiriesPage() {
    const [name, setName] = useState("");
    const [company, setCompany] = useState("");
    const [mobile, setMobile] = useState("");
    const [status, setStatus] = useState<EnquiryStatus | "">("");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [rows, setRows] = useState<AdvertisementEnquiryRecord[]>([]);
    const [total, setTotal] = useState(0);
    const [statistics, setStatistics] = useState<AdvertisementEnquiryStatistics | null>(null);
    const [statisticsError, setStatisticsError] = useState("");
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);
    const [editing, setEditing] = useState<AdvertisementEnquiryRecord | null>(null);
    const [viewing, setViewing] = useState<AdvertisementEnquiryRecord | null>(null);
    const [deleting, setDeleting] = useState<AdvertisementEnquiryRecord | null>(null);
    const [editStatus, setEditStatus] = useState<EnquiryStatus>("PENDING");
    const [remarks, setRemarks] = useState("");

    const reload = useCallback(() => setRefreshKey((key) => key + 1), []);

    useEffect(() => {
        let active = true;
        const load = async () => {
            try {
                const result = await listAdvertisementEnquiries({
                    name: name.trim(),
                    company: company.trim(),
                    mobile: mobile.trim(),
                    status,
                    page,
                    pageSize,
                });
                if (!active) return;
                setRows(result.data);
                setTotal(result.meta.total);
                setError("");
            } catch (cause: unknown) {
                if (!active) return;
                setRows([]);
                setTotal(0);
                setError(getErrorMessage(cause, "Unable to load enquiries."));
            } finally {
                if (active) setLoading(false);
            }
        };
        void load();
        return () => { active = false; };
    }, [name, company, mobile, status, page, pageSize, refreshKey]);

    useEffect(() => {
        let active = true;
        void getAdvertisementEnquiryStatistics()
            .then((result) => {
                if (!active) return;
                setStatistics(result);
                setStatisticsError("");
            })
            .catch((cause: unknown) => {
                if (!active) return;
                setStatisticsError(getErrorMessage(cause, "Unable to load enquiry statistics."));
            });
        return () => { active = false; };
    }, [refreshKey]);

    useEffect(() => {
        const previousTitle = document.title;
        document.title = "Advertisement Enquiries | The News Time Administration";
        return () => { document.title = previousTitle; };
    }, []);

    const refresh = () => {
        setLoading(true);
        reload();
    };

    const clearFilters = () => {
        setName("");
        setCompany("");
        setMobile("");
        setStatus("");
        setPage(1);
    };

    const openEdit = (item: AdvertisementEnquiryRecord) => {
        setEditing(item);
        setEditStatus(item.status);
        setRemarks(item.remarks ?? "");
    };

    const save = async () => {
        if (!editing || busy) return;
        setBusy(true);
        try {
            await updateAdvertisementEnquiry(editing.id, {
                status: editStatus,
                remarks: remarks.trim() || null,
            });
            setEditing(null);
            setError("");
            refresh();
        } catch (cause: unknown) {
            setError(getErrorMessage(cause, "Unable to save enquiry changes."));
        } finally {
            setBusy(false);
        }
    };

    const remove = async () => {
        if (!deleting || busy) return;
        setBusy(true);
        try {
            await deleteAdvertisementEnquiry(deleting.id);
            setDeleting(null);
            setError("");
            if (rows.length === 1 && page > 1) {
                setLoading(true);
                setPage((current) => Math.max(1, current - 1));
            } else {
                refresh();
            }
        } catch (cause: unknown) {
            setError(getErrorMessage(cause, "Unable to delete enquiry."));
        } finally {
            setBusy(false);
        }
    };

    const filtersActive = Boolean(name || company || mobile || status);

    return (
        <MainLayout>
            <div className="mx-auto max-w-7xl space-y-5 p-4 sm:p-6">
                <AdvertisementAdminPageHeader title="Advertisement Enquiries" description="Review, respond, book, reject or delete incoming enquiries." actions={<>                    <button
                    type="button"
                    onClick={refresh}
                    disabled={loading || busy}
                    className="inline-flex items-center gap-2 rounded-lg border border-white/70 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                    {loading ? "Refreshing..." : "Refresh"}
                </button>
                </>} />

                {statisticsError && <p role="alert" className="text-sm text-red-700">{statisticsError}</p>}
                <section aria-label="Enquiry statistics" className="grid grid-cols-2 gap-3 lg:grid-cols-5">
                    {[
                        { label: "Total Enquiries", value: statistics?.total, icon: Inbox },
                        { label: "Pending", value: statistics?.PENDING, icon: Clock3 },
                        { label: "Responded", value: statistics?.RESPONDED, icon: MessageSquareCheck },
                        { label: "Booked", value: statistics?.BOOKED, icon: CalendarCheck2 },
                        { label: "Rejected", value: statistics?.REJECTED, icon: Ban },
                    ].map(({ label, value, icon: Icon }) => (
                        <div key={label} className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white p-3 text-center shadow-sm">
                            <Icon size={20} className="text-green-700" aria-hidden="true" />
                            <span className="text-2xl font-bold text-gray-900">{value ?? "—"}</span>
                            <span className="text-xs text-gray-600">{label}</span>
                        </div>
                    ))}
                </section>

                <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <h2 className="text-base font-semibold text-gray-900">Enquiry Records</h2>
                        <button type="button" onClick={clearFilters} disabled={!filtersActive || loading} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                            <SearchX size={16} /> Clear Filters
                        </button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <input aria-label="Filter by name" placeholder="Name" className={inputClass} value={name} onChange={(event) => { setName(event.target.value); setPage(1); }} />
                        <input aria-label="Filter by company" placeholder="Company" className={inputClass} value={company} onChange={(event) => { setCompany(event.target.value); setPage(1); }} />
                        <input aria-label="Filter by mobile" placeholder="Mobile number" className={inputClass} value={mobile} onChange={(event) => { setMobile(event.target.value); setPage(1); }} />
                        <select aria-label="Filter by status" className={inputClass} value={status} onChange={(event) => { setStatus(event.target.value as EnquiryStatus | ""); setPage(1); }}>
                            <option value="">All statuses</option>
                            {statuses.map((item) => <option key={item} value={item}>{statusLabels[item]}</option>)}
                        </select>
                    </div>
                    {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

                    <div className="overflow-x-auto rounded-xl border border-gray-300">
                        <table className="w-full min-w-[980px] text-left text-sm">
                            <thead className="bg-gray-50 text-gray-800">
                                <tr>
                                    {["Date", "Name", "Company", "Mobile", "Source", "Status", "Remarks", "Actions"].map((heading) => (
                                        <th key={heading} scope="col" className="whitespace-nowrap px-3 py-3 font-semibold">{heading}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((item) => (
                                    <tr key={item.id} className="border-t border-gray-200 hover:bg-gray-50/70">
                                        <td className="whitespace-nowrap px-3 py-3 text-gray-600">{formatIstDate(item.createdAt)}</td>
                                        <td className="px-3 py-3 font-medium text-gray-900">{item.fullName}</td>
                                        <td className="px-3 py-3">{item.companyName || "—"}</td>
                                        <td className="whitespace-nowrap px-3 py-3">{item.mobileNumber}</td>
                                        <td className="px-3 py-3 text-xs">{item.source === "HOUSE_AD" ? "In-house Ad" : "Footer"}</td>
                                        <td className="px-3 py-3"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusColors[item.status]}`}>{statusLabels[item.status]}</span></td>
                                        <td className="max-w-48 truncate px-3 py-3 text-gray-600" title={item.remarks ?? ""}>{item.remarks || "—"}</td>
                                        <td className="px-3 py-3">
                                            <div className="flex items-center gap-2">
                                                <button type="button" className={`${actionClass} text-slate-700`} title="View enquiry" aria-label={`View enquiry from ${item.fullName}`} onClick={() => setViewing(item)}><Eye size={16} /></button>
                                                <button type="button" className={`${actionClass} text-green-700`} title="Edit status and remarks" aria-label={`Manage enquiry from ${item.fullName}`} onClick={() => openEdit(item)}><Pencil size={16} /></button>
                                                <button type="button" className={`${actionClass} text-red-700`} title="Delete enquiry" aria-label={`Delete enquiry from ${item.fullName}`} disabled={busy} onClick={() => setDeleting(item)}><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {!loading && !error && rows.length === 0 && (
                                    <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-500">No enquiries found for the selected filters.</td></tr>
                                )}
                                {loading && <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-500">Loading enquiries...</td></tr>}
                                {!loading && error && <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-red-700">Enquiries could not be loaded.</td></tr>}
                            </tbody>
                        </table>
                        <AdminListPagination
                            page={page}
                            pageSize={pageSize}
                            total={total}
                            onPageChange={(nextPage) => setPage(nextPage)}
                            onPageSizeChange={(nextSize) => { setPageSize(nextSize); setPage(1); }}
                        />
                    </div>
                </section>

                {viewing && (
                    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setViewing(null); }}>
                        <div role="dialog" aria-modal="true" aria-label="Enquiry details" className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
                            <div className="mb-4 flex items-start justify-between gap-3"><h2 className="text-lg font-bold">Enquiry Details</h2><button type="button" aria-label="Close" onClick={() => setViewing(null)}><X size={20} /></button></div>
                            <dl className="space-y-3 text-sm">
                                {[
                                    ["Name", viewing.fullName], ["Company", viewing.companyName || "—"],
                                    ["Mobile", viewing.mobileNumber], ["Email", viewing.email || "—"],
                                    ["Source", viewing.source], ["Status", statusLabels[viewing.status]],
                                    ["Submitted", formatIstDateTime(viewing.createdAt)],
                                    ["Additional requirements", viewing.additionalRequirements || "—"],
                                    ["Remarks", viewing.remarks || "—"],
                                ].map(([label, value]) => <div key={label} className="grid grid-cols-3 gap-3 border-b border-gray-100 pb-2"><dt className="font-medium text-gray-600">{label}</dt><dd className="col-span-2 break-words text-gray-900">{value}</dd></div>)}
                            </dl>
                            <div className="mt-5 flex justify-end gap-2"><button type="button" className="rounded-lg border px-4 py-2 text-sm" onClick={() => setViewing(null)}>Close</button><button type="button" className="rounded-lg bg-green-700 px-4 py-2 text-sm text-white" onClick={() => { setViewing(null); openEdit(viewing); }}>Manage</button></div>
                        </div>
                    </div>
                )}

                {editing && (
                    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 p-4">
                        <div role="dialog" aria-modal="true" aria-label="Manage enquiry" className="w-full max-w-lg space-y-4 rounded-xl bg-white p-6 shadow-xl">
                            <div className="flex items-start justify-between gap-2"><h2 className="text-lg font-bold">Manage Enquiry — {editing.fullName}</h2><button type="button" aria-label="Close" disabled={busy} onClick={() => setEditing(null)}><X size={20} /></button></div>
                            <p className="text-sm text-gray-600">{editing.mobileNumber} · {editing.companyName || "Individual"}</p>
                            <div className="text-sm text-gray-600">{editing.additionalRequirements || "No additional requirements"}</div>
                            <fieldset><legend className="mb-2 text-sm font-medium">Status</legend><div className="flex flex-wrap gap-2">{statuses.map((item) => <button key={item} type="button" disabled={busy} onClick={() => setEditStatus(item)} aria-pressed={editStatus === item} className={`rounded-lg border px-3 py-2 text-sm ${editStatus === item ? "border-green-700 bg-green-50 font-semibold text-green-800" : "border-gray-300"}`}>{statusLabels[item]}</button>)}</div></fieldset>
                            <label className="block text-sm">Remarks (optional)<textarea className={`mt-1 block ${inputClass}`} rows={4} maxLength={2000} value={remarks} onChange={(event) => setRemarks(event.target.value)} /></label>
                            <div className="flex justify-end gap-3"><button type="button" className="rounded-lg border border-gray-300 px-4 py-2 text-sm" onClick={() => setEditing(null)} disabled={busy}>Cancel</button><button type="button" className="rounded-lg bg-green-700 px-4 py-2 text-sm text-white disabled:opacity-50" disabled={busy} onClick={() => void save()}>{busy ? "Saving..." : "Save Changes"}</button></div>
                        </div>
                    </div>
                )}

                {deleting && (
                    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 p-4">
                        <div role="alertdialog" aria-modal="true" aria-label="Confirm delete enquiry" className="w-full max-w-md space-y-4 rounded-xl bg-white p-6 shadow-xl">
                            <div className="flex items-center gap-2 text-lg font-bold text-red-700"><Trash2 size={20} /> Delete Enquiry</div>
                            <p className="text-sm text-gray-700">Delete the enquiry from <strong>{deleting.fullName}</strong>? This action will remove it from the active enquiry list.</p>
                            <div className="flex justify-end gap-3"><button type="button" className="rounded-lg border border-gray-300 px-4 py-2 text-sm" disabled={busy} onClick={() => setDeleting(null)}>Cancel</button><button type="button" className="rounded-lg bg-red-700 px-4 py-2 text-sm text-white disabled:opacity-50" disabled={busy} onClick={() => void remove()}>{busy ? "Deleting..." : "Delete"}</button></div>
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
