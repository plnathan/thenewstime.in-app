import AdvertisementAdminPageHeader from "@/components/ui/AdvertisementAdminPageHeader";
import AdminListPagination from "../../../components/ui/AdminListPagination";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Building2, Pencil, Plus, Search, RefreshCw, CheckCircle2, Ban, X } from "lucide-react";
import MainLayout from "@/layouts/MainLayout";
import { useAuth } from "@/auth/AuthContext";
import { createBusinessType, listBusinessTypes, setBusinessTypeStatus, updateBusinessType } from "@/api/advertisements/businessTypes.api";
import type { BusinessTypeRecord, BusinessTypePayload } from "@/api/advertisements/businessTypes.api";

const blank: BusinessTypePayload = { code: "", displayName: "", description: "", displayOrder: 0, status: "ACTIVE" };
const fieldClass = "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600";
export default function BusinessTypeConfigurationPage() {
    const { hasPermissionCode } = useAuth();
    const canCreate = hasPermissionCode("advertisements.clients.create");
    const canUpdate = hasPermissionCode("advertisements.clients.update");
    const [records, setRecords] = useState<BusinessTypeRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("ALL");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [editing, setEditing] = useState<BusinessTypeRecord | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState<BusinessTypePayload>({ ...blank });
    const load = useCallback(async () => {
        setLoading(true);
        try { setRecords(await listBusinessTypes()); setError(null); }
        catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to load business types"); }
        finally { setLoading(false); }
    }, []);
    useEffect(() => {
        const timerId = window.setTimeout(() => { void load(); }, 0);
        return () => window.clearTimeout(timerId);
    }, [load]);
    const filtered = useMemo(() => records.filter(item =>
        (filter === "ALL" || item.status === filter) &&
        `${item.code} ${item.displayName} ${item.description ?? ""} ${item.id}`.toLowerCase().includes(search.trim().toLowerCase())
    ).sort((a, b) => (a.status === b.status ? a.displayOrder - b.displayOrder || b.id - a.id : a.status === "ACTIVE" ? -1 : 1)), [records, filter, search]);
    const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const visible = filtered.slice((Math.min(page, pages) - 1) * pageSize, Math.min(page, pages) * pageSize);
    const openCreate = () => { setEditing(null); setForm({ ...blank }); setShowForm(true); setError(null); };
    const openEdit = (item: BusinessTypeRecord) => { setEditing(item); setForm({ code: item.code, displayName: item.displayName, description: item.description ?? "", displayOrder: item.displayOrder, status: item.status }); setShowForm(true); setError(null); };
    const save = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); if (busy) return; setBusy(true);
        try {
            if (editing) await updateBusinessType(editing.id, form); else await createBusinessType(form);
            setShowForm(false); await load();
        }
        catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to save business type"); }
        finally { setBusy(false); }
    };
    const changeStatus = async (item: BusinessTypeRecord) => {
        if (!window.confirm(`${item.status === "ACTIVE" ? "Deactivate" : "Activate"} ${item.displayName}?`)) return;
        setBusy(true); try { await setBusinessTypeStatus(item.id, item.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"); await load(); }
        catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to change status"); }
        finally { setBusy(false); }
    };
    return <MainLayout>
        <div className="mx-auto max-w-7xl space-y-5 px-4 py-6 sm:px-6">
            <AdvertisementAdminPageHeader title="Business Type Configuration" description="Manage the business types available in Client Configuration." actions={<>                    <button type="button" onClick={() => void load()} disabled={loading || busy} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/70 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20 disabled:opacity-50"><RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh</button>
                {canCreate && <button type="button" onClick={openCreate} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-green-800 hover:bg-green-50"><Plus size={16} /> Add Business Type</button>}
            </>} />            <div className="grid gap-3 sm:grid-cols-3">{[{ label: "Total Business Types", value: records.length }, { label: "Active Business Types", value: records.filter(x => x.status === "ACTIVE").length }, { label: "Inactive Business Types", value: records.filter(x => x.status === "INACTIVE").length }].map(item => <div key={item.label} className="rounded-xl border bg-white p-5 text-center shadow-sm"><Building2 className="mx-auto mb-2 text-green-700" size={22} /><div className="text-2xl font-bold">{item.value}</div><div className="text-sm text-gray-600">{item.label}</div></div>)}</div>
            <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="flex flex-wrap items-end gap-3 border-b border-gray-200 p-4 sm:p-5"><div className="mr-auto"><h2 className="font-semibold">Configured Business Types</h2><p className="text-xs text-gray-500">Active first, then display order</p></div>
                    <label className="text-xs">Search<div className="relative"><Search size={15} className="absolute left-3 top-3 text-gray-400" /><input className={`${fieldClass} pl-9`} value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Name, code, ID" /></div></label>
                    <label className="text-xs">Status<select className={fieldClass} value={filter} onChange={e => { setFilter(e.target.value); setPage(1); }}><option value="ALL">All statuses</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select></label>
                </div>
                {error && <p role="alert" className="m-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
                <div className="overflow-x-auto"><table className="w-full min-w-[900px] border-collapse text-left text-sm"><thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500"><tr><th className="p-4">Code</th><th className="p-4">Business Type</th><th className="p-4">Description</th><th className="p-4">Order</th><th className="p-4">Status</th><th className="p-4 text-right">Actions</th></tr></thead><tbody>
                    {loading ? <tr><td colSpan={6} className="p-8 text-center">Loading business types…</td></tr> : visible.length === 0 ? <tr><td colSpan={6} className="p-8 text-center">No business types found</td></tr> : visible.map(item => <tr key={item.id} className="border-t border-gray-100 hover:bg-green-50/40"><td className="p-4 font-medium">{item.code}</td><td className="p-4">{item.displayName}</td><td className="p-4">{item.description || "—"}</td><td className="p-4">{item.displayOrder}</td><td className="p-4"><span className={item.status === "ACTIVE" ? "text-green-700" : "text-gray-500"}>{item.status}</span></td><td className="p-4"><div className="flex justify-end gap-2">{canUpdate && <><button type="button" title="Edit" onClick={() => openEdit(item)} className="rounded-lg border p-2"><Pencil size={16} /></button><button type="button" disabled={busy} title={item.status === "ACTIVE" ? "Deactivate" : "Activate"} onClick={() => void changeStatus(item)} className="rounded-lg border p-2">{item.status === "ACTIVE" ? <Ban size={16} /> : <CheckCircle2 size={16} />}</button></>}</div></td></tr>)}
                </tbody></table></div>
                <AdminListPagination
                    page={Math.min(page, pages)}
                    pageSize={pageSize}
                    total={filtered.length}
                    onPageChange={(nextPage) => setPage(nextPage)}
                    onPageSizeChange={(nextSize) => { setPageSize(nextSize); setPage(1); }}
                />
            </section>
            {showForm && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-label={editing ? "Edit business type" : "Add business type"}><div className="w-full max-w-xl rounded-xl bg-white shadow-xl"><div className="flex items-center justify-between border-b p-5"><h2 className="font-bold">{editing ? "Edit" : "Add"} Business Type</h2><button type="button" onClick={() => setShowForm(false)}><X size={20} /></button></div><form onSubmit={e => void save(e)} className="space-y-4 p-5"><label className="block text-sm">Code *<input required maxLength={50} pattern="[A-Za-z0-9_.-]+" className={fieldClass} value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} /></label><label className="block text-sm">Business Type Name *<input required maxLength={150} className={fieldClass} value={form.displayName} onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))} /></label><label className="block text-sm">Description<textarea className={fieldClass} value={form.description ?? ""} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></label><label className="block text-sm">Display Order<input type="number" min={0} className={fieldClass} value={form.displayOrder} onChange={e => setForm(f => ({ ...f, displayOrder: Number(e.target.value) }))} /></label><label className="block text-sm">Status<select className={fieldClass} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as BusinessTypePayload["status"] }))}><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select></label><div className="flex justify-end gap-2"><button type="button" className="rounded border px-4 py-2" onClick={() => setShowForm(false)}>Cancel</button><button disabled={busy} className="rounded-lg bg-green-700 px-4 py-2 text-white disabled:opacity-50">{busy ? "Saving…" : "Save"}</button></div></form></div></div>}
        </div>
    </MainLayout>;
}
