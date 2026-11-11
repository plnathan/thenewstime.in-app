import {
    CheckCircle2, CircleOff, FolderOpen,
    LoaderCircle, Pencil, Plus, RefreshCw, Search, Tags, X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
    createCategory, getCategories, updateCategory, type Category,
} from "@/api/category.api";
import { confirmDialog } from "@/components/ui/Dialog/confirmDialog";
import { getApiErrorMessage } from "@/helpers/advertisementManagement.helpers";
import MainLayout from "@/layouts/MainLayout";
import AdminListPagination from "@/components/ui/AdminListPagination";

type CategoryForm = { code: string; displayName: string; urlName: string };
const emptyForm: CategoryForm = { code: "", displayName: "", urlName: "" };

export default function NewsCategoryConfigurationPage() {
    const [items, setItems] = useState<Category[]>([]);
    const [query, setQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const [editing, setEditing] = useState<Category | null | undefined>(undefined);
    const [form, setForm] = useState<CategoryForm>(emptyForm);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getCategories();
            setItems(response.data ?? []);
            setError(null);
        } catch (caught) {
            setError(getApiErrorMessage(caught));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { void Promise.resolve().then(() => load()); }, [load]);

    const activeCount = items.filter(item => (item.status ?? "ACTIVE") === "ACTIVE").length;
    const inactiveCount = items.filter(item => item.status === "INACTIVE").length;
    const filtered = useMemo(() => {
        const term = query.trim().toLowerCase();
        return items.filter(item =>
            (statusFilter === "ALL" || (item.status ?? "ACTIVE") === statusFilter) &&
            [item.code, item.displayName, item.urlName, String(item.id)]
                .some(value => value.toLowerCase().includes(term)),
        ).sort((a, b) =>
            Number((a.status ?? "ACTIVE") === "INACTIVE") - Number((b.status ?? "ACTIVE") === "INACTIVE") ||
            b.id - a.id,
        );
    }, [items, query, statusFilter]);
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const openForm = (item: Category | null) => {
        setEditing(item);
        setForm(item ? { code: item.code, displayName: item.displayName, urlName: item.urlName } : emptyForm);
        setError(null);
        setNotice(null);
    };

    const save = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (saving) return;
        try {
            setSaving(true);
            setError(null);
            if (editing) {
                await updateCategory(editing.id, form);
            } else {
                await createCategory(form);
            }
            setNotice(editing ? "Category updated successfully." : "Category created successfully.");
            setEditing(undefined);
            await load();
        } catch (caught) {
            setError(getApiErrorMessage(caught));
        } finally {
            setSaving(false);
        }
    };

    const toggle = async (item: Category) => {
        const next = item.status === "INACTIVE" ? "ACTIVE" : "INACTIVE";
        if (!await confirmDialog(`${next === "INACTIVE" ? "Deactivate" : "Activate"} category “${item.displayName}”?`)) return;
        try {
            setSaving(true);
            setError(null);
            await updateCategory(item.id, { status: next });
            setNotice(`Category ${next.toLowerCase()} successfully.`);
            await load();
        } catch (caught) {
            setError(getApiErrorMessage(caught));
        } finally {
            setSaving(false);
        }
    };

    return (
        <MainLayout>
            <main className="mx-auto w-full max-w-[1600px] space-y-6 px-4 py-6 sm:px-6 lg:px-8">
                <Link to="/admin/news" className="inline-flex items-center gap-2 text-sm font-semibold text-green-700 hover:underline">
                    <Tags size={18} aria-hidden="true" /> ← Back to News Management
                </Link>
                <header className="admin-unified-header flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900">News Category Configuration</h1>
                        <p className="mt-1 max-w-3xl text-sm leading-6 text-gray-600">
                            Configure news categories, their codes, URL names, and active status.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <button type="button" onClick={() => void load()} disabled={loading || saving}
                            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60">
                            <RefreshCw size={16} className={loading ? "animate-spin" : ""} aria-hidden="true" /> Refresh
                        </button>
                        <button type="button" onClick={() => openForm(null)} disabled={saving}
                            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-800 disabled:opacity-60">
                            <Plus size={17} aria-hidden="true" /> Add Category
                        </button>
                    </div>
                </header>

                {error && <div role="alert" className="flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"><span>{error}</span><button type="button" onClick={() => setError(null)} aria-label="Dismiss error"><X size={16} /></button></div>}
                {notice && <div role="status" className="flex items-start justify-between gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"><span className="inline-flex items-center gap-2"><CheckCircle2 size={18} />{notice}</span><button type="button" onClick={() => setNotice(null)} aria-label="Dismiss notice"><X size={16} /></button></div>}

                <section aria-label="Category summary" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {[
                        { label: "Categories listed", value: items.length, color: "text-gray-900", Icon: Tags },
                        { label: "Active categories", value: activeCount, color: "text-green-700", Icon: CheckCircle2 },
                        { label: "Inactive categories", value: inactiveCount, color: "text-gray-900", Icon: CircleOff },
                    ].map(({ label, value, color, Icon }) => (
                        <article key={label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                            <div className="flex items-center justify-between gap-2"><span className="text-sm font-medium text-gray-500">{label}</span><Icon size={19} className="text-gray-400" aria-hidden="true" /></div>
                            <div className={`mt-2 text-2xl font-bold tabular-nums ${color}`}>{loading ? "—" : value}</div>
                        </article>
                    ))}
                </section>

                <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm" aria-label="Configured news categories">
                    <div className="border-b border-gray-200 p-4 sm:p-5">
                        <h2 className="text-base font-semibold text-gray-900">Configured News Categories</h2>
                        <p className="mt-1 text-sm text-gray-500">Search, review, and manage the categories available to news articles.</p>
                        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                            <div className="relative md:col-span-2">
                                <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                                <input type="search" value={query} onChange={event => { setQuery(event.target.value); setPage(1); }}
                                    placeholder="Search category, code, URL name or ID..." aria-label="Search categories"
                                    className="min-h-10 w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-100" />
                            </div>
                            <select value={statusFilter} onChange={event => { setStatusFilter(event.target.value); setPage(1); }} aria-label="Filter category status"
                                className="min-h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-100">
                                <option value="ALL">All statuses</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option>
                            </select>
                            <div className="flex min-h-10 items-center rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-600">
                                {filtered.length.toLocaleString("en-IN")} matching {filtered.length === 1 ? "category" : "categories"}
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex min-h-48 items-center justify-center gap-3 text-sm text-gray-500"><LoaderCircle size={20} className="animate-spin text-green-700" /> Loading categories...</div>
                    ) : visible.length === 0 ? (
                        <div className="flex min-h-52 flex-col items-center justify-center px-6 py-10 text-center">
                            <span className="mb-3 rounded-full bg-gray-100 p-3 text-gray-500"><FolderOpen size={23} /></span>
                            <h3 className="text-sm font-semibold text-gray-900">No categories found</h3>
                            <p className="mt-1 text-sm text-gray-500">{items.length ? "Try changing your search or status filter." : "Add a category to get started."}</p>
                            {items.length === 0 && <button type="button" onClick={() => openForm(null)} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-green-700 px-3 py-2 text-sm font-semibold text-white hover:bg-green-800"><Plus size={16} /> Add Category</button>}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-[850px] w-full border-collapse text-left text-sm">
                                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500"><tr>
                                    {['Category', 'Code', 'URL Name', 'Status'].map(label => <th key={label} scope="col" className="px-4 py-3 font-semibold">{label}</th>)}
                                    <th scope="col" className="px-4 py-3 text-right font-semibold">Actions</th>
                                </tr></thead>
                                <tbody className="divide-y divide-gray-100">
                                    {visible.map(item => {
                                        const active = (item.status ?? "ACTIVE") === "ACTIVE";
                                        return <tr key={item.id} className="align-middle hover:bg-gray-50/70">
                                            <td className="px-4 py-4"><div className="font-semibold text-gray-900">{item.displayName}</div><div className="mt-1 text-xs text-gray-500">Category #{item.id}</div></td>
                                            <td className="px-4 py-4 font-medium text-gray-800">{item.code}</td>
                                            <td className="px-4 py-4 text-gray-700">{item.urlName}</td>
                                            <td className="px-4 py-4"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${active ? "bg-green-50 text-green-700 ring-1 ring-green-200" : "bg-gray-100 text-gray-600 ring-1 ring-gray-200"}`}><span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-green-600" : "bg-gray-400"}`} />{active ? "ACTIVE" : "INACTIVE"}</span></td>
                                            <td className="px-4 py-4"><div className="flex items-center justify-end gap-2">
                                                <button type="button" title="Edit category" aria-label={`Edit ${item.displayName}`} onClick={() => openForm(item)} disabled={saving} className="rounded-lg border border-gray-200 p-2 text-green-700 hover:bg-green-50 disabled:opacity-50"><Pencil size={16} /></button>
                                                <button type="button" title={active ? "Deactivate category" : "Activate category"} aria-label={`${active ? "Deactivate" : "Activate"} ${item.displayName}`} onClick={() => void toggle(item)} disabled={saving} className={`rounded-lg border p-2 disabled:opacity-50 ${active ? "border-red-200 text-red-700 hover:bg-red-50" : "border-green-200 text-green-700 hover:bg-green-50"}`}>{active ? <CircleOff size={16} /> : <CheckCircle2 size={16} />}</button>
                                            </div></td>
                                        </tr>;
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                    <div className="border-t border-gray-200 p-3 sm:p-4">
                        <AdminListPagination
                            page={currentPage}
                            pageSize={pageSize}
                            total={filtered.length}
                            onPageChange={setPage}
                            onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
                        />
                    </div>
                </section>

                {editing !== undefined && <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4">
                    <form onSubmit={event => void save(event)} role="dialog" aria-modal="true" aria-labelledby="category-form-title" className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4"><div><h2 id="category-form-title" className="text-lg font-semibold text-gray-900">{editing ? "Edit Category" : "Add Category"}</h2><p className="mt-1 text-sm text-gray-500">{editing ? `Updating category #${editing.id}` : "Configure a new news category."}</p></div><button type="button" onClick={() => setEditing(undefined)} disabled={saving} aria-label="Close category form" className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"><X size={18} /></button></div>
                        <div className="space-y-4 px-6 py-5">{(["code", "displayName", "urlName"] as const).map(key => <label key={key} className="block text-sm font-medium text-gray-700">{key === "displayName" ? "Display Name" : key === "urlName" ? "URL Name" : "Code"}<input required maxLength={key === "displayName" ? 150 : key === "urlName" ? 120 : 80} value={form[key]} onChange={event => setForm(previous => ({ ...previous, [key]: event.target.value }))} className="mt-1 block min-h-10 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-100" /></label>)}</div>
                        <div className="flex justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4"><button type="button" onClick={() => setEditing(undefined)} disabled={saving} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100">Cancel</button><button type="submit" disabled={saving} className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-50">{saving ? "Saving..." : editing ? "Save Changes" : "Create Category"}</button></div>
                    </form>
                </div>}
            </main>
        </MainLayout>
    );
}
