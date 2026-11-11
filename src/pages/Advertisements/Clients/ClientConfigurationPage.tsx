import AdvertisementAdminPageHeader from "@/components/ui/AdvertisementAdminPageHeader";
import AdminListPagination from "../../../components/ui/AdminListPagination";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Pencil, UserRoundX, UserRoundCheck, Plus, X, Save, LoaderCircle, RotateCcw } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import MainLayout from "@/layouts/MainLayout";
import {
    createAdvertisementClient,
    getAdvertisementClients,
    getAdvertisementClientSummary,
    getAdvertisementBusinessTypes,
    updateAdvertisementClient,
} from "@/api/advertisements/clients.api";
import type { AdvertisementClientMutation } from "@/api/advertisements/clients.api";
import type { AdvertisementClient, AdvertisementBusinessType } from "@/api/advertisements/advertisement.api";

const emptyForm = {
    clientCode: "", name: "", displayName: "", businessTypeId: "", businessName: "",
    contactPerson: "", contactNo: "", alternateMobile: "", email: "", alternateEmail: "", websiteUrl: "",
    primaryAddress: "", communicationAddress: "", notes: "",
    status: "ACTIVE" as "ACTIVE" | "INACTIVE" | "BLOCKED",
};
type ClientForm = typeof emptyForm;
const fields: Array<{ key: keyof ClientForm; label: string; required?: boolean }> = [
    { key: "clientCode", label: "Client code", required: true },
    { key: "name", label: "Client name", required: true },
    { key: "displayName", label: "Display name" },
    { key: "businessTypeId", label: "Business Type" },
    { key: "businessName", label: "Business name" },
    { key: "contactPerson", label: "Contact person" },
    { key: "contactNo", label: "Contact number" },
    { key: "alternateMobile", label: "Alternate Mobile" },
    { key: "email", label: "Email" },
    { key: "alternateEmail", label: "Alternate Email" },
    { key: "websiteUrl", label: "Website URL" },
    { key: "primaryAddress", label: "Primary address" },
    { key: "communicationAddress", label: "Communication address" },
    { key: "notes", label: "Notes" },
];

function toForm(client: AdvertisementClient): ClientForm {
    return {
        clientCode: client.clientCode, name: client.name,
        displayName: client.displayName ?? "", businessTypeId: client.businessTypeId == null ? "" : String(client.businessTypeId), businessName: client.businessName ?? "",
        contactPerson: client.contactPerson ?? "", contactNo: client.contactNo ?? "", alternateMobile: client.alternateMobile ?? "",
        email: client.email ?? "", alternateEmail: client.alternateEmail ?? "", websiteUrl: client.websiteUrl ?? "",
        primaryAddress: client.primaryAddress ?? "",
        communicationAddress: client.communicationAddress ?? "", notes: client.notes ?? "",
        status: client.status,
    };
}

export default function ClientConfigurationPage() {
    const navigate = useNavigate();
    const { hasPermissionCode } = useAuth();
    const canCreate = hasPermissionCode("advertisements.clients.create");
    const canUpdate = hasPermissionCode("advertisements.clients.update");
    const [items, setItems] = useState<AdvertisementClient[]>([]);
    const [businessTypes, setBusinessTypes] = useState<AdvertisementBusinessType[]>([]);
    const [businessTypesError, setBusinessTypesError] = useState<string | null>(null);
    const [summary, setSummary] = useState<{ total: number; active: number; inactive: number; blocked: number } | null>(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [loading, setLoading] = useState(false);
    const [actionId, setActionId] = useState<number | null>(null);
    const [pendingStatusClient, setPendingStatusClient] = useState<AdvertisementClient | null>(null);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState<ClientForm>(emptyForm);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const refresh = useCallback(() => setRefreshKey((value) => value + 1), []);
    useEffect(() => {
        let cancelled = false;
        void Promise.resolve().then(async () => {
            try {
                if (!cancelled) setLoading(true);
                const response = await getAdvertisementClients({ page, pageSize, search: search.trim() || undefined, status: statusFilter || undefined });
                if (cancelled) return;
                setItems(response.data ?? []);
                setTotalRecords(response.meta?.totalRecords ?? 0);
                setError(null);
            } catch (err) {
                if (!cancelled) setError(err instanceof Error ? err.message : "Unable to load clients.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        });
        return () => { cancelled = true; };
    }, [page, pageSize, search, statusFilter, refreshKey]);

    useEffect(() => {
        let cancelled = false;
        void getAdvertisementClientSummary().then(data => {
            if (!cancelled) setSummary(data);
        }).catch(() => { if (!cancelled) setSummary(null); });
        return () => { cancelled = true; };
    }, [refreshKey]);

    useEffect(() => {
        let cancelled = false;
        void getAdvertisementBusinessTypes().then((types) => {
            if (!cancelled) { setBusinessTypes(types); setBusinessTypesError(null); }
        }).catch(() => {
            if (!cancelled) setBusinessTypesError("Unable to load business types. Please retry before saving a business type.");
        });
        return () => { cancelled = true; };
    }, [refreshKey]);

    const beginCreate = () => { setEditingId(null); setForm({ ...emptyForm }); setShowForm(true); setError(null); };
    const beginEdit = (client: AdvertisementClient) => {
        setEditingId(client.id); setForm(toForm(client)); setShowForm(true); setError(null);
    };
    const save = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (busy) return;
        setBusy(true); setError(null);
        try {
            const payload: AdvertisementClientMutation = {
                name: form.name.trim(), displayName: form.displayName.trim(),
                businessName: form.businessName.trim(),
                ...(form.businessTypeId ? { businessTypeId: Number(form.businessTypeId) } : {}),
                contactPerson: form.contactPerson.trim(),
                contactNo: form.contactNo.trim(), alternateMobile: form.alternateMobile.trim(), email: form.email.trim() || undefined,
                alternateEmail: form.alternateEmail.trim() || undefined,
                websiteUrl: form.websiteUrl.trim(), primaryAddress: form.primaryAddress.trim(),
                communicationAddress: form.communicationAddress.trim(), notes: form.notes.trim(),
                status: form.status,
            };
            if (editingId === null) {
                await createAdvertisementClient({ ...payload, clientCode: form.clientCode.trim(), name: form.name.trim() });
            } else {
                await updateAdvertisementClient(editingId, payload);
            }
            setShowForm(false);
            refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unable to save client.");
        } finally { setBusy(false); }
    };

    const changeStatus = async (client: AdvertisementClient) => {
        if (!canUpdate || actionId !== null) return;
        const deactivate = client.status === "ACTIVE";
        const nextStatus = deactivate ? "INACTIVE" : "ACTIVE";
        const action = deactivate ? "Deactivate" : "Activate";
        setActionId(client.id);
        setError(null);
        try {
            await updateAdvertisementClient(client.id, { status: nextStatus });
            if (editingId === client.id) {
                setForm((current) => ({ ...current, status: nextStatus }));
            }
            setPendingStatusClient(null);
            refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : `Unable to ${action.toLowerCase()} client.`);
        } finally {
            setActionId(null);
        }
    };

    const inputClass = "min-h-10 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-100";

    return (
        <MainLayout>
            <main className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6">
                <button type="button" onClick={() => navigate("/admin/advertisements")} className="text-sm font-semibold text-green-700 hover:underline">← Back to Advertisement Administration</button>
                <AdvertisementAdminPageHeader title="Client Configuration" description="Manage advertisement clients independently of advertisement creation." actions={<><button type="button" onClick={refresh} className="inline-flex items-center gap-2 rounded-lg border px-4 py-2"><RotateCcw size={16} /> Refresh</button></>} />
                <section aria-label="Client status summary" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    {[
                        { label: "Total Clients", count: summary?.total },
                        { label: "Active Clients", count: summary?.active },
                        { label: "Blocked Clients", count: summary?.blocked },
                        { label: "Inactive Clients", count: summary?.inactive },
                    ].map(card => <div key={card.label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"><p className="text-sm font-medium text-gray-600">{card.label}</p><p className="mt-2 text-2xl font-bold text-gray-900">{card.count ?? "—"}</p></div>)}
                </section>
                {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">{error}</div>}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-lg font-semibold text-gray-900">Client Management</h2>
                    {canCreate && <button type="button" onClick={beginCreate} className="inline-flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2 font-semibold text-white hover:bg-green-800"><Plus size={17} aria-hidden="true" /> Add Client</button>}
                </div>
                {showForm && (
                    <section aria-labelledby="client-form-heading" className="overflow-hidden rounded-xl border border-green-200 bg-white shadow-sm">
                        <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-5 py-4">
                            <div>
                                <h2 id="client-form-heading" className="flex items-center gap-2 text-base font-semibold text-gray-900">
                                    {editingId === null ? <Plus size={18} aria-hidden="true" /> : <Pencil size={18} aria-hidden="true" />}
                                    {editingId === null ? "Add Client" : "Edit Client"}
                                </h2>
                                <p className="mt-1 text-sm text-gray-600">
                                    {editingId === null ? "Register a new advertising client." : `Update client #${editingId} and its contact details.`}
                                </p>
                            </div>
                            <button type="button" onClick={() => setShowForm(false)} disabled={busy} aria-label="Close client form" className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800 disabled:opacity-50">
                                <X size={18} aria-hidden="true" />
                            </button>
                        </div>
                        <form onSubmit={(event) => { void save(event); }} className="space-y-5 p-5">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                                {fields.map(({ key, label, required }) => (
                                    <div key={key} className={key === "notes" ? "md:col-span-2 xl:col-span-3" : ""}>
                                        <label htmlFor={`client-form-${key}`} className="mb-1.5 block text-sm font-medium text-gray-700">
                                            {label}{required && <span className="text-red-600"> *</span>}
                                        </label>
                                        {key === "businessTypeId" ? (
                                            <>
                                                <select id={`client-form-${key}`} value={form.businessTypeId} disabled={busy || !!businessTypesError}
                                                    onChange={(event) => setForm((value) => ({ ...value, businessTypeId: event.target.value }))}
                                                    className={`${inputClass} bg-white disabled:bg-gray-100`}>
                                                    <option value="">Select business type (optional)</option>
                                                    {businessTypes.filter((type) => type.status === "ACTIVE" || String(type.id) === form.businessTypeId).map((type) => (
                                                        <option key={type.id} value={type.id}>{type.displayName}</option>
                                                    ))}
                                                </select>
                                                {businessTypesError && <p className="mt-1 text-xs text-red-600">{businessTypesError}</p>}
                                            </>
                                        ) : key === "notes" ? (
                                            <textarea id={`client-form-${key}`} value={form[key]} disabled={busy} rows={3}
                                                onChange={(event) => setForm((value) => ({ ...value, [key]: event.target.value }))}
                                                className={`${inputClass} resize-y`} />
                                        ) : (
                                            <input id={`client-form-${key}`} value={form[key]} required={required} disabled={busy || (key === "clientCode" && editingId !== null)}
                                                type={(key === "email" || key === "alternateEmail") ? "email" : key === "websiteUrl" ? "url" : (key === "contactNo" || key === "alternateMobile") ? "tel" : "text"}
                                                onChange={(event) => setForm((value) => ({ ...value, [key]: event.target.value }))}
                                                className={`${inputClass} disabled:bg-gray-100`} />
                                        )}
                                    </div>
                                ))}
                                <div>
                                    <label htmlFor="client-form-status" className="mb-1.5 block text-sm font-medium text-gray-700">Status</label>
                                    <select id="client-form-status" value={form.status} disabled={busy}
                                        onChange={(event) => setForm((value) => ({ ...value, status: event.target.value as ClientForm["status"] }))}
                                        className={`${inputClass} bg-white disabled:bg-gray-100`}>
                                        <option value="ACTIVE">Active</option>
                                        <option value="INACTIVE">Inactive</option>
                                        <option value="BLOCKED">Blocked</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center justify-end gap-3 border-t border-gray-100 pt-4">
                                <button type="button" onClick={() => setShowForm(false)} disabled={busy}
                                    className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                                    <X size={16} aria-hidden="true" /> Cancel
                                </button>
                                <button type="submit" disabled={busy}
                                    className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-50">
                                    {busy ? <LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> : <Save size={16} aria-hidden="true" />}
                                    {busy ? "Saving…" : editingId === null ? "Create Client" : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </section>
                )}
                <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                    <div className="border-b border-gray-200 p-4 sm:p-5">
                        <h2 className="text-base font-semibold text-gray-900">Configured Clients</h2>
                        <p className="mt-1 text-sm text-gray-500">Search and filter clients. Manage client availability using the actions in each row.</p>
                        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                            <div className="relative md:col-span-1 xl:col-span-2">
                                <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                                <input id="client-configuration-search" type="search" aria-label="Search clients" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search client name, code, mobile or email" className={`${inputClass} pl-9`} />
                            </div>
                            <select aria-label="Filter clients by status" value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }} className={inputClass}>
                                <option value="">All statuses</option>
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                                <option value="BLOCKED">Blocked</option>
                            </select>
                            <button type="button" onClick={() => { setSearch(""); setStatusFilter(""); setPage(1); refresh(); }} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"><RotateCcw size={16} aria-hidden="true" /> Reset filters</button>
                        </div>
                    </div>
                    {loading ? (
                        <div className="flex min-h-40 items-center justify-center gap-2 text-sm text-gray-500"><LoaderCircle size={19} className="animate-spin" aria-hidden="true" />Loading clients...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[700px] text-left text-sm">
                                <thead className="bg-gray-50 text-gray-700"><tr>{["Code", "Client", "Contact", "Status", "Actions"].map((heading) => <th key={heading} scope="col" className={`px-4 py-3 font-semibold ${heading === "Actions" ? "text-right" : ""}`}>{heading}</th>)}</tr></thead>
                                <tbody className="divide-y divide-gray-100">{items.map((client) => <tr key={client.id} className="align-top hover:bg-gray-50/70">
                                    <td className="px-4 py-4 font-medium">{client.clientCode}</td>
                                    <td className="px-4 py-4"><div className="font-semibold text-gray-900">{client.displayName || client.name}</div><div className="text-gray-500">{client.businessName}</div></td>
                                    <td className="px-4 py-4">{client.contactNo || client.email || "—"}</td>
                                    <td className="px-4 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${client.status === "ACTIVE" ? "bg-green-50 text-green-700" : client.status === "BLOCKED" ? "bg-red-50 text-red-700" : "bg-gray-100 text-gray-700"}`}>{client.status}</span></td>
                                    <td className="px-4 py-4"><div className="flex items-center justify-end gap-2">
                                        {canUpdate && <>
                                            <button type="button" title="Edit client" aria-label={`Edit ${client.name}`} disabled={actionId !== null} onClick={() => beginEdit(client)} className="rounded-lg border border-gray-300 p-2 text-green-700 hover:bg-green-50 disabled:opacity-50"><Pencil size={16} aria-hidden="true" /></button>
                                            {<button type="button" title={client.status === "ACTIVE" ? "Deactivate client" : "Activate client"} aria-label={`${client.status === "ACTIVE" ? "Deactivate" : "Activate"} ${client.name}`} disabled={actionId !== null || client.status === "BLOCKED"} onClick={() => setPendingStatusClient(client)} className={`rounded-lg border p-2 disabled:opacity-50 ${client.status === "ACTIVE" ? "border-red-200 text-red-700 hover:bg-red-50" : "border-green-200 text-green-700 hover:bg-green-50"}`}>{actionId === client.id ? <LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> : client.status === "ACTIVE" ? <UserRoundX size={16} aria-hidden="true" /> : <UserRoundCheck size={16} aria-hidden="true" />}</button>}
                                        </>}
                                        {!canUpdate && <span className="text-gray-400">—</span>}
                                    </div></td>
                                </tr>)}{items.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-gray-500">No clients found. Try changing your search or filters.</td></tr>}</tbody>
                            </table>
                        </div>
                    )}
                </section>
                <AdminListPagination
                    page={page}
                    pageSize={pageSize}
                    total={totalRecords}
                    onPageChange={(nextPage) => setPage(nextPage)}
                    onPageSizeChange={(nextSize) => { setPageSize(nextSize); setPage(1); }}
                />

                {pendingStatusClient && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget && actionId === null) setPendingStatusClient(null); }}>
                        <section role="alertdialog" aria-modal="true" aria-labelledby="client-status-confirm-title" aria-describedby="client-status-confirm-description" className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-2xl">
                            <div className="flex items-start justify-between gap-4">
                                <h2 id="client-status-confirm-title" className="text-lg font-semibold text-gray-900">
                                    {pendingStatusClient.status === "ACTIVE" ? "Deactivate Client" : "Activate Client"}
                                </h2>
                                <button type="button" aria-label="Close confirmation" disabled={actionId !== null} onClick={() => setPendingStatusClient(null)} className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-50"><X size={20} /></button>
                            </div>
                            <p id="client-status-confirm-description" className="mt-3 text-sm text-gray-600">
                                Are you sure you want to {pendingStatusClient.status === "ACTIVE" ? "deactivate" : "activate"} <strong>{pendingStatusClient.displayName || pendingStatusClient.name}</strong>?
                                {pendingStatusClient.status === "ACTIVE" ? " This client will become inactive." : " This client will become active."}
                            </p>
                            <div className="mt-6 flex justify-end gap-3">
                                <button type="button" disabled={actionId !== null} onClick={() => setPendingStatusClient(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50">Cancel</button>
                                <button type="button" disabled={actionId !== null} onClick={() => { void changeStatus(pendingStatusClient); }} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 ${pendingStatusClient.status === "ACTIVE" ? "bg-red-700 hover:bg-red-800" : "bg-green-700 hover:bg-green-800"}`}>
                                    {actionId !== null ? <LoaderCircle size={16} className="animate-spin" /> : pendingStatusClient.status === "ACTIVE" ? <UserRoundX size={16} /> : <UserRoundCheck size={16} />}
                                    {pendingStatusClient.status === "ACTIVE" ? "Deactivate" : "Activate"}
                                </button>
                            </div>
                        </section>
                    </div>
                )}
            </main>
        </MainLayout>
    );
}
