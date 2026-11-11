import AdvertisementAdminPageHeader from "@/components/ui/AdvertisementAdminPageHeader";
import AdminListPagination from "../../../components/ui/AdminListPagination";
import { confirmDialog } from "@/components/ui/Dialog/confirmDialog";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, CircleAlert, Edit3, Layers3, LoaderCircle, Plus, RefreshCw, Search, ToggleLeft, ToggleRight, Trash2, X } from "lucide-react";
import {
    createAdvertisementPlacement,
    deactivateAdvertisementPlacement,
    disableAdvertisementPlacement,
    enableAdvertisementPlacement,
    getAdvertisementPlacements,
    updateAdvertisementPlacement,
} from "@/api/advertisements/placements.api";
import { getAdvertisements } from "@/api/advertisements/advertisement.api";
import { listFormats } from "@/api/advertisements/formats.api";
import type { AdvertisementFormat } from "@/api/advertisements/formats.api";
import type { AdvertisementListItem } from "@/api/advertisements/advertisement.api";
import type {
    AdvertisementPlacement,
    AdvertisementPlacementType,
    CreateAdvertisementPlacementInput,
    PlacementDisplayFrequency,
    PlacementFallbackBehavior,
    PlacementInsertionType,
    PlacementPageType,
    PlacementStatus,
} from "@/api/advertisements/placements.api";
import MainLayout from "@/layouts/MainLayout";

type FormState = {
    code: string; displayName: string; description: string; pageType: PlacementPageType;
    placementType: AdvertisementPlacementType; insertionType: PlacementInsertionType;
    displayOrder: string; isEnabled: boolean; formatId: string; collapseWhenEmpty: boolean;
    fallbackBehavior: PlacementFallbackBehavior; fallbackAdvertisementId: string; displayFrequency: PlacementDisplayFrequency | "";
    frequencyValue: string; autoCloseEnabled: boolean; autoCloseSeconds: string;
    closeButtonEnabled: boolean; closeOnOverlayClick: boolean; status: PlacementStatus;
};

const EMPTY_FORM: FormState = {
    code: "", displayName: "", description: "", pageType: "HOME", placementType: "HOME_TOP",
    insertionType: "FIXED", displayOrder: "0", isEnabled: true, formatId: "", collapseWhenEmpty: true,
    fallbackBehavior: "HIDE", fallbackAdvertisementId: "", displayFrequency: "EVERY_VISIT", frequencyValue: "", autoCloseEnabled: false,
    autoCloseSeconds: "", closeButtonEnabled: true, closeOnOverlayClick: false, status: "ACTIVE",
};

const PLACEMENT_TYPES: Record<PlacementPageType, AdvertisementPlacementType[]> = {
    HOME: ["HOME_BANNER", "HOME_TOP", "HOME_BETWEEN_SECTIONS", "HOME_SIDEBAR", "HOME_BOTTOM", "HOME_MODAL"],
    NEWS_LIST: ["NEWS_LIST_TOP", "NEWS_LIST_BANNER", "NEWS_LIST_BETWEEN", "NEWS_LIST_BOTTOM", "NEWS_LIST_SIDEBAR", "NEWS_LIST_MODAL"],
    NEWS_DETAIL: ["NEWS_DETAIL_TOP", "NEWS_DETAIL_BANNER", "NEWS_DETAIL_BETWEEN", "NEWS_DETAIL_SIDEBAR", "NEWS_DETAIL_BOTTOM", "NEWS_DETAIL_MODAL"],
};
const PAGE_LABELS: Record<PlacementPageType, string> = { HOME: "Home", NEWS_LIST: "News list", NEWS_DETAIL: "News detail" };
const INSERTION_LABELS: Record<PlacementInsertionType, string> = { FIXED: "Fixed position", AFTER_N_ITEMS: "After N items", BETWEEN_SECTIONS: "Between sections" };
const FREQUENCY_LABELS: Record<PlacementDisplayFrequency, string> = { EVERY_VISIT: "Every visit", ONCE_PER_SESSION: "Once per session", ONCE_PER_DAY: "Once per day", ONCE_PER_PERIOD: "Once per period" };

type ApiError = { response?: { data?: { message?: string; errors?: unknown } }; message?: string };
const errorMessage = (error: unknown, fallback: string): string => {
    const value = error as ApiError;
    const errors = value.response?.data?.errors;
    if (Array.isArray(errors) && errors.length) {
        const first = errors[0] as { message?: string };
        if (first?.message) return first.message;
    }
    return value.response?.data?.message ?? value.message ?? fallback;
};

const toForm = (placement: AdvertisementPlacement): FormState => ({
    code: placement.code, displayName: placement.displayName, description: placement.description ?? "",
    pageType: placement.pageType, placementType: placement.placementType, insertionType: placement.insertionType,
    displayOrder: String(placement.displayOrder), isEnabled: placement.isEnabled,
    formatId: placement.formatId === null ? "" : String(placement.formatId),
    collapseWhenEmpty: placement.collapseWhenEmpty, fallbackBehavior: placement.fallbackBehavior,
    fallbackAdvertisementId: placement.fallbackAdvertisementId == null ? "" : String(placement.fallbackAdvertisementId),
    displayFrequency: placement.displayFrequency ?? "", frequencyValue: placement.frequencyValue === null ? "" : String(placement.frequencyValue),
    autoCloseEnabled: placement.autoCloseEnabled, autoCloseSeconds: placement.autoCloseSeconds === null ? "" : String(placement.autoCloseSeconds),
    closeButtonEnabled: placement.closeButtonEnabled, closeOnOverlayClick: placement.closeOnOverlayClick, status: placement.status,
});

const controlClass = "mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600 disabled:bg-gray-100";
const labelClass = "block text-sm font-medium text-gray-700";

const AdvertisementPlacementPage = () => {
    const [placements, setPlacements] = useState<AdvertisementPlacement[]>([]);
    const [availableFormats, setAvailableFormats] = useState<AdvertisementFormat[]>([]);
    const [houseAds, setHouseAds] = useState<AdvertisementListItem[]>([]);
    const [houseSearch, setHouseSearch] = useState("");
    const [houseError, setHouseError] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [actionId, setActionId] = useState<number | null>(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [statusFilter, setStatusFilter] = useState<"ALL" | PlacementStatus>("ALL");
    const [enabledFilter, setEnabledFilter] = useState<"ALL" | "ENABLED" | "DISABLED">("ALL");
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<AdvertisementPlacement | null>(null);
    const [form, setForm] = useState<FormState>(EMPTY_FORM);
    const [formError, setFormError] = useState("");

    const load = useCallback(async (showSpinner = true) => {
        if (showSpinner) setLoading(true);
        setError("");
        try {
            const [response, formatRecords] = await Promise.all([getAdvertisementPlacements(), listFormats()]);
            setPlacements(response.data ?? []);
            setAvailableFormats(formatRecords);
        } catch (loadError) {
            setError(errorMessage(loadError, "Unable to load advertisement placements."));
        } finally {
            if (showSpinner) setLoading(false);
        }
    }, []);

    useEffect(() => {
        let cancelled = false;

        void Promise.resolve().then(() => {
            if (!cancelled) {
                return load();
            }
        });

        return () => {
            cancelled = true;
        };
    }, [load]);

    useEffect(() => {
        let cancelled = false;
        const loadHouseAds = async () => {
            try {
                const collected: AdvertisementListItem[] = [];
                for (let page = 1; page <= 20; page += 1) {
                    const result = await getAdvertisements({ page, pageSize: 100 });
                    collected.push(...result.data.filter((ad) => ad.isHouseAd === true));
                    if (result.data.length < 100) break;
                }
                if (!cancelled) setHouseAds(collected);
            } catch (error) {
                if (!cancelled) setHouseError(errorMessage(error, "Unable to load house advertisements."));
            }
        };
        void loadHouseAds();
        return () => { cancelled = true; };
    }, []);

    const formats = useMemo(() => {
        return availableFormats
            .filter((format) => format.status === "ACTIVE" || (editing !== null && format.id === editing.formatId))
            .sort((a, b) => a.displayName.localeCompare(b.displayName));
    }, [availableFormats, editing]);

    const visiblePlacements = useMemo(() => {
        const q = search.trim().toLowerCase();
        return placements.filter((item) => {
            const matchesSearch = !q || [item.code, item.displayName, item.description ?? "", item.pageType, item.placementType, item.format?.displayName ?? ""].some((v) => v.toLowerCase().includes(q));
            const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;
            const matchesEnabled = enabledFilter === "ALL" || (enabledFilter === "ENABLED" ? item.isEnabled : !item.isEnabled);
            return matchesSearch && matchesStatus && matchesEnabled;
        }).sort((a, b) => {
            if (a.status !== b.status) return a.status === "ACTIVE" ? -1 : 1;
            const aTime = new Date(a.createdAt).getTime();
            const bTime = new Date(b.createdAt).getTime();
            if (Number.isFinite(aTime) && Number.isFinite(bTime) && aTime !== bTime) return bTime - aTime;
            return b.id - a.id;
        });
    }, [placements, search, statusFilter, enabledFilter]);

    const totalPages = Math.max(1, Math.ceil(visiblePlacements.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const pagedPlacements = visiblePlacements.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((current) => ({ ...current, [key]: value }));
    const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setFormError(""); setError(""); setSuccess(""); setFormOpen(true); };
    const openEdit = (item: AdvertisementPlacement) => { setEditing(item); setForm(toForm(item)); setFormError(""); setError(""); setSuccess(""); setFormOpen(true); };

    const validate = (): string | null => {
        if (!/^[A-Za-z0-9_.:-]{2,100}$/.test(form.code.trim())) return "Placement code must be 2–100 characters and use letters, numbers, underscore, dot, colon, or hyphen without space.";
        if (form.displayName.trim().length < 2 || form.displayName.trim().length > 150) return "Display name must be between 2 and 150 characters.";
        const order = Number(form.displayOrder);
        if (!Number.isInteger(order) || order < 0) return "Display order must be a non-negative whole number.";
        if (form.displayFrequency === "ONCE_PER_PERIOD" && (!Number.isInteger(Number(form.frequencyValue)) || Number(form.frequencyValue) <= 0)) return "Frequency value is required for once-per-period frequency.";
        if (form.autoCloseEnabled && (!Number.isInteger(Number(form.autoCloseSeconds)) || Number(form.autoCloseSeconds) <= 0)) return "Auto-close seconds must be a positive whole number when auto-close is enabled.";
        if (form.fallbackBehavior === "HOUSE_AD" && !form.fallbackAdvertisementId) return "Select an in-house advertisement for this placement.";
        return null;
    };

    const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); setFormError(""); setError(""); setSuccess("");
        const validation = validate(); if (validation) { setFormError(validation); return; }
        const configPayload = {
            displayName: form.displayName.trim(), description: form.description.trim(), pageType: form.pageType,
            placementType: form.placementType, insertionType: form.insertionType, displayOrder: Number(form.displayOrder),
            isEnabled: form.isEnabled, formatId: form.formatId ? Number(form.formatId) : null,
            collapseWhenEmpty: form.collapseWhenEmpty, fallbackBehavior: form.fallbackBehavior,
            fallbackAdvertisementId: form.fallbackBehavior === "HOUSE_AD" ? Number(form.fallbackAdvertisementId) : null,
            displayFrequency: form.displayFrequency || null,
            frequencyValue: form.displayFrequency === "ONCE_PER_PERIOD" && form.frequencyValue ? Number(form.frequencyValue) : null,
            autoCloseEnabled: form.autoCloseEnabled,
            autoCloseSeconds: form.autoCloseEnabled && form.autoCloseSeconds ? Number(form.autoCloseSeconds) : null,
            closeButtonEnabled: form.closeButtonEnabled, closeOnOverlayClick: form.closeOnOverlayClick, status: form.status,
        };
        setSaving(true);
        try {
            if (editing) {
                await updateAdvertisementPlacement(editing.id, configPayload);
                setSuccess("Placement configuration updated successfully.");
            } else {
                const createPayload: CreateAdvertisementPlacementInput = { ...configPayload, code: form.code.trim() };
                await createAdvertisementPlacement(createPayload);
                setSuccess("Placement created successfully.");
            }
            setFormOpen(false); setEditing(null); await load(false);
        } catch (saveError) {
            setFormError(errorMessage(saveError, "Unable to save the placement configuration."));
        } finally { setSaving(false); }
    };

    const handleToggle = async (item: AdvertisementPlacement) => {
        setActionId(item.id); setError(""); setSuccess("");
        try {
            if (item.isEnabled) await disableAdvertisementPlacement(item.id);
            else await enableAdvertisementPlacement(item.id);
            setSuccess(`Placement ${item.code} ${item.isEnabled ? "disabled" : "enabled"} successfully.`);
            await load(false);
        } catch (actionError) { setError(errorMessage(actionError, "Unable to change placement enabled state.")); }
        finally { setActionId(null); }
    };

    const handleDeactivate = async (item: AdvertisementPlacement) => {
        if (!await confirmDialog(`Deactivate placement “${item.displayName}” (${item.code})? This will make it unavailable for new use.`)) return;
        setActionId(item.id); setError(""); setSuccess("");
        try {
            await deactivateAdvertisementPlacement(item.id);
            setSuccess(`Placement ${item.code} deactivated successfully.`); await load(false);
        } catch (actionError) { setError(errorMessage(actionError, "Unable to deactivate this placement.")); }
        finally { setActionId(null); }
    };

    const activeCount = placements.filter((item) => item.status === "ACTIVE").length;
    const enabledCount = placements.filter((item) => item.isEnabled && item.status === "ACTIVE").length;

    return (
        <MainLayout>
            <main className="mx-auto w-full max-w-[1600px] space-y-6 px-4 py-6 sm:px-6 lg:px-8">
                <Link to="/admin/advertisements" className="inline-flex text-sm font-semibold text-green-700 hover:underline">← Back to Advertisement Administration</Link>
                <AdvertisementAdminPageHeader title="Placement Configuration" description="Manage placement locations, page compatibility, insertion behavior, display frequency, creative format assignment, and delivery-related display settings." actions={<>                        <button type="button" onClick={() => void load()} disabled={loading} className="inline-flex min-h-10 items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"><RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh</button>
                    <button type="button" onClick={openCreate} className="inline-flex min-h-10 items-center gap-2 rounded-md bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800"><Plus size={16} /> Add placement</button>
                </>} />

                {error && <div role="alert" className="flex gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"><CircleAlert size={18} className="shrink-0" />{error}</div>}
                {success && <div role="status" className="flex gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"><CheckCircle2 size={18} className="shrink-0" />{success}</div>}

                <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <StatCard label="Total placements" value={placements.length} detail="Configured placement records" />
                    <StatCard label="Active" value={activeCount} detail="Available for configuration" />
                    <StatCard label="Enabled for delivery" value={enabledCount} detail="Active and enabled placements" />
                </section>

                <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="grid grid-cols-1 gap-3 border-b border-gray-200 p-4 md:grid-cols-[minmax(220px,1fr)_190px_190px]">
                        <label className={labelClass}>Search placements<span className="relative block"><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search by code, name, page, format…" className={`${controlClass} pl-9`} /></span></label>
                        <label className={labelClass}>Status<select className={controlClass} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value as typeof statusFilter); setPage(1); }}><option value="ALL">All statuses</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select></label>
                        <label className={labelClass}>Delivery switch<select className={controlClass} value={enabledFilter} onChange={(e) => { setEnabledFilter(e.target.value as typeof enabledFilter); setPage(1); }}><option value="ALL">All placements</option><option value="ENABLED">Enabled</option><option value="DISABLED">Disabled</option></select></label>
                    </div>
                    {loading ? <div className="flex items-center justify-center gap-2 p-12 text-sm text-gray-600"><LoaderCircle size={18} className="animate-spin" /> Loading placements…</div> : visiblePlacements.length === 0 ? <div className="p-12 text-center"><Layers3 size={28} className="mx-auto text-gray-400" /><p className="mt-3 text-sm font-semibold text-gray-900">No placements found</p><p className="mt-1 text-sm text-gray-500">Change the filters or add a placement to begin.</p></div> : (
                        <div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200 text-left text-sm"><thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500"><tr><th className="px-4 py-3">Placement</th><th className="px-4 py-3">Page / location</th><th className="px-4 py-3">Format</th><th className="px-4 py-3">Delivery settings</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-gray-100">{pagedPlacements.map((item) => <tr key={item.id} className="align-top hover:bg-gray-50/70">
                            <td className="px-4 py-4"><p className="font-semibold text-gray-900">{item.displayName}</p><p className="mt-1 font-mono text-xs text-gray-500">{item.code} · ID {item.id}</p>{item.description && <p className="mt-2 max-w-xs text-xs text-gray-500">{item.description}</p>}</td>
                            <td className="px-4 py-4"><p className="font-medium text-gray-800">{PAGE_LABELS[item.pageType]}</p><p className="mt-1 text-xs text-gray-500">{item.placementType.replaceAll("_", " ")}</p><p className="mt-1 text-xs text-gray-500">{INSERTION_LABELS[item.insertionType]} · order {item.displayOrder}</p></td>
                            <td className="px-4 py-4">{item.format ? <><p className="font-medium text-gray-800">{item.format.displayName}</p><p className="mt-1 text-xs text-gray-500">{item.format.widthPx && item.format.heightPx ? `${item.format.widthPx} × ${item.format.heightPx}px` : item.format.isResponsive ? "Responsive" : "Dimensions not configured"}</p>{item.format.mobileWidthPx && item.format.mobileHeightPx && <p className="mt-1 text-xs text-gray-500">Mobile: {item.format.mobileWidthPx} × {item.format.mobileHeightPx}px</p>}</> : <span className="text-xs text-amber-700">No format assigned</span>}</td>
                            <td className="px-4 py-4"><p className="text-xs text-gray-700">Frequency: {item.displayFrequency ? FREQUENCY_LABELS[item.displayFrequency] : "Default"}</p><p className="mt-1 text-xs text-gray-500">Fallback: {item.fallbackBehavior.replaceAll("_", " ")}</p><p className="mt-1 text-xs text-gray-500">{item.collapseWhenEmpty ? "Collapse when empty" : "Reserve empty space"}</p><p className="mt-1 text-xs text-gray-500">{item.autoCloseEnabled ? `Auto-close ${item.autoCloseSeconds ?? "—"}s` : "Auto-close off"} · Close button {item.closeButtonEnabled ? "on" : "off"}</p></td>
                            <td className="px-4 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${item.status === "ACTIVE" ? "bg-green-50 text-green-800" : "bg-gray-100 text-gray-700"}`}>{item.status}</span><span className={`mt-2 block text-xs font-medium ${item.isEnabled ? "text-green-700" : "text-gray-500"}`}>{item.isEnabled ? "Enabled" : "Disabled"}</span></td>
                            <td className="px-4 py-4"><div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                                <button type="button" title="Edit configuration" aria-label={`Edit ${item.displayName}`} onClick={() => openEdit(item)} className="rounded-md border border-gray-200 p-2 text-gray-700 hover:bg-gray-100"><Edit3 size={17} /></button>
                                <button type="button" title={item.isEnabled ? "Disable delivery" : "Enable delivery"} aria-label={`${item.isEnabled ? "Disable" : "Enable"} delivery for ${item.displayName}`} disabled={actionId === item.id || item.status !== "ACTIVE"} onClick={() => void handleToggle(item)} className="rounded-md border border-gray-200 p-2 text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40">{item.isEnabled ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}</button>
                                <button type="button" title="Deactivate placement" aria-label={`Deactivate ${item.displayName}`} disabled={actionId === item.id || item.status === "INACTIVE"} onClick={() => void handleDeactivate(item)} className="rounded-md border border-gray-200 p-2 text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"><Trash2 size={17} /></button>
                            </div></td>
                        </tr>)}</tbody></table></div>
                    )}
                    <AdminListPagination
                        page={currentPage}
                        pageSize={pageSize}
                        total={visiblePlacements.length}
                        onPageChange={(nextPage) => setPage(nextPage)}
                        onPageSizeChange={(nextSize) => { setPageSize(nextSize); setPage(1); }}
                    />
                </section>

                {formOpen && <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-950/40 p-3 sm:p-6" role="presentation"><div className="mx-auto my-4 max-w-5xl rounded-xl bg-white shadow-xl" role="dialog" aria-modal="true" aria-labelledby="placement-form-title"><div className="flex items-start justify-between border-b border-gray-200 p-5"><div><h2 id="placement-form-title" className="text-lg font-semibold text-gray-900">{editing ? `Edit placement · ${editing.code}` : "Create placement"}</h2><p className="mt-1 text-sm text-gray-500">Only fields supported by the placement configuration API are submitted.</p></div><button type="button" onClick={() => !saving && setFormOpen(false)} disabled={saving} aria-label="Close form" className="rounded-md p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50"><X size={18} /></button></div>
                    <form onSubmit={(e) => void handleSave(e)} className="space-y-6 p-5">
                        {formError && <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{formError}</div>}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <Field label="Placement code" required><input className={controlClass} value={form.code} onChange={(e) => updateField("code", e.target.value)} disabled={saving || Boolean(editing)} required maxLength={100} placeholder="HOME_TOP_BANNER" /></Field>
                            <Field label="Display name" required><input className={controlClass} value={form.displayName} onChange={(e) => updateField("displayName", e.target.value)} disabled={saving} required maxLength={150} /></Field>
                            <Field label="Page type" required><select className={controlClass} value={form.pageType} onChange={(e) => { const pageType = e.target.value as PlacementPageType; updateField("pageType", pageType); updateField("placementType", PLACEMENT_TYPES[pageType][0]); }} disabled={saving}>{Object.entries(PAGE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field>
                            <Field label="Placement location" required><select className={controlClass} value={form.placementType} onChange={(e) => updateField("placementType", e.target.value as AdvertisementPlacementType)} disabled={saving}>{PLACEMENT_TYPES[form.pageType].map((value) => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}</select></Field>
                            <Field label="Insertion behavior" required><select className={controlClass} value={form.insertionType} onChange={(e) => updateField("insertionType", e.target.value as PlacementInsertionType)} disabled={saving}>{Object.entries(INSERTION_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field>
                            <Field label="Display order"><input type="number" min="0" step="1" className={controlClass} value={form.displayOrder} onChange={(e) => updateField("displayOrder", e.target.value)} disabled={saving} /></Field>
                            <Field label="Creative format"><select className={controlClass} value={form.formatId} onChange={(e) => updateField("formatId", e.target.value)} disabled={saving}><option value="">No format assigned</option>{formats.map((format) => <option key={format.id} value={String(format.id)}>{format.displayName} ({format.code}){format.status !== "ACTIVE" ? " · Inactive (existing assignment)" : ""}{format.widthPx && format.heightPx ? ` · ${format.widthPx}×${format.heightPx}px` : ""}</option>)}</select><span className="mt-1 block text-xs text-gray-500">Format definitions are managed elsewhere; this field assigns an existing format.</span></Field>
                            <Field label="Fallback behavior"><select className={controlClass} value={form.fallbackBehavior} onChange={(e) => updateField("fallbackBehavior", e.target.value as PlacementFallbackBehavior)} disabled={saving}><option value="HIDE">Hide when no eligible ad</option><option value="HOUSE_AD">Use house ad fallback</option></select></Field>
                            {form.fallbackBehavior === "HOUSE_AD" && <Field label="Selected house advertisement" required>
                                <input className={controlClass} placeholder="Search house advertisements by name or ID" value={houseSearch} onChange={(e) => setHouseSearch(e.target.value)} disabled={saving} />
                                <select className={controlClass} value={form.fallbackAdvertisementId} onChange={(e) => updateField("fallbackAdvertisementId", e.target.value)} disabled={saving} required>
                                    <option value="">Select an in-house advertisement</option>
                                    {houseAds.filter((ad) => ad.name.toLowerCase().includes(houseSearch.toLowerCase()) || String(ad.id).includes(houseSearch) || String(ad.id) === form.fallbackAdvertisementId).map((ad) => <option key={ad.id} value={ad.id}>{ad.name} (#{ad.id}, {ad.workflowStatus})</option>)}
                                </select>
                                {houseError && <p role="alert" className="mt-1 text-xs text-red-700">{houseError}</p>}
                            </Field>}
                            <Field label="Display frequency"><select className={controlClass} value={form.displayFrequency} onChange={(e) => updateField("displayFrequency", e.target.value as FormState["displayFrequency"])} disabled={saving}><option value="">Default</option>{Object.entries(FREQUENCY_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field>
                            {form.displayFrequency === "ONCE_PER_PERIOD" && <Field label="Frequency period (positive integer)" required><input type="number" min="1" step="1" className={controlClass} value={form.frequencyValue} onChange={(e) => updateField("frequencyValue", e.target.value)} disabled={saving} required /></Field>}
                            <Field label="Status"><select className={controlClass} value={form.status} onChange={(e) => updateField("status", e.target.value as PlacementStatus)} disabled={saving}><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select></Field>
                            <Field label="Description" className="md:col-span-2 lg:col-span-3"><textarea className={controlClass} rows={2} maxLength={1000} value={form.description} onChange={(e) => updateField("description", e.target.value)} disabled={saving} /></Field>
                        </div>
                        <div className="rounded-lg border border-gray-200 p-4"><h3 className="text-sm font-semibold text-gray-900">Display behavior</h3><div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            <Toggle label="Enabled for delivery" checked={form.isEnabled} onChange={(v) => updateField("isEnabled", v)} disabled={saving} />
                            <Toggle label="Collapse when empty" checked={form.collapseWhenEmpty} onChange={(v) => updateField("collapseWhenEmpty", v)} disabled={saving} />
                            <Toggle label="Auto-close" checked={form.autoCloseEnabled} onChange={(v) => { updateField("autoCloseEnabled", v); if (!v) updateField("autoCloseSeconds", ""); }} disabled={saving} />
                            <Toggle label="Show close button" checked={form.closeButtonEnabled} onChange={(v) => updateField("closeButtonEnabled", v)} disabled={saving} />
                            <Toggle label="Close on overlay click" checked={form.closeOnOverlayClick} onChange={(v) => updateField("closeOnOverlayClick", v)} disabled={saving} />
                            {form.autoCloseEnabled && <Field label="Auto-close after (seconds)" required><input type="number" min="1" step="1" className={controlClass} value={form.autoCloseSeconds} onChange={(e) => updateField("autoCloseSeconds", e.target.value)} disabled={saving} required /></Field>}
                        </div></div>
                        {editing && <div className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">The placement code is immutable after creation. Disable delivery before changing configuration if you need to prevent serving during the update.</div>}
                        <div className="flex flex-col-reverse gap-2 border-t border-gray-200 pt-4 sm:flex-row sm:justify-end"><button type="button" onClick={() => setFormOpen(false)} disabled={saving} className="min-h-10 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50">Cancel</button><button type="submit" disabled={saving} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-60">{saving && <LoaderCircle size={16} className="animate-spin" />}{saving ? "Saving…" : editing ? "Save configuration" : "Create placement"}</button></div>
                    </form></div></div>}
            </main>
        </MainLayout>
    );
};

const StatCard = ({ label, value, detail }: { label: string; value: number; detail: string }) => <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"><p className="text-sm font-medium text-gray-500">{label}</p><p className="mt-2 text-2xl font-bold tabular-nums text-gray-900">{value}</p><p className="mt-1 text-xs text-gray-500">{detail}</p></div>;
const Field = ({ label, required, className = "", children }: { label: string; required?: boolean; className?: string; children: React.ReactNode }) => <label className={`${labelClass} ${className}`}>{label}{required && <span className="ml-1 text-red-600">*</span>}{children}</label>;
const Toggle = ({ label, checked, onChange, disabled }: { label: string; checked: boolean; onChange: (value: boolean) => void; disabled?: boolean }) => <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} disabled={disabled} className="h-4 w-4 rounded border-gray-300 text-green-700 focus:ring-green-600" />{label}</label>;

export default AdvertisementPlacementPage;
