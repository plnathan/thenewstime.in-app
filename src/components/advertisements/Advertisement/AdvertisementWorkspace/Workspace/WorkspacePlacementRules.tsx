import { confirmDialog } from "@/components/ui/Dialog/confirmDialog";
import PlacementRuleSchedules from "@/components/advertisements/Advertisement/AdvertisementWorkspace/Workspace/PlacementRuleSchedules";
import { useCallback, useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, LoaderCircle, Plus, RefreshCw, Save, Trash2 } from "lucide-react";
import {
    createAdvertisementPlacementRule,
    deactivateAdvertisementPlacementRule,
    getAdvertisementPlacementRules,
    updateAdvertisementPlacementRule,
} from "@/api/advertisements/placement-rules.api";
import type { AdvertisementPlacementRule, CreatePlacementRuleInput, UpdatePlacementRuleInput } from "@/api/advertisements/placement-rules.api";
import { getAdvertisementPlacements } from "@/api/advertisements/placements.api";
import type { AdvertisementPlacement, PlacementInsertionType } from "@/api/advertisements/placements.api";

interface Props { advertisementId: number; placement: AdvertisementPlacement | null; }
type ApiError = { response?: { data?: { message?: string } }; message?: string };
const getError = (error: unknown) => { const value = error as ApiError; return value.response?.data?.message ?? value.message ?? "Unable to save placement rules."; };
const insertionOptions: { value: PlacementInsertionType; label: string }[] = [{ value: "FIXED", label: "Fixed position" }, { value: "AFTER_N_ITEMS", label: "After N items" }, { value: "BETWEEN_SECTIONS", label: "Between sections" }];

const WorkspacePlacementRules = ({ advertisementId, placement }: Props) => {
    const [rules, setRules] = useState<AdvertisementPlacementRule[]>([]);
    const [availablePlacements, setAvailablePlacements] = useState<AdvertisementPlacement[]>([]);
    const [selectedPlacementId, setSelectedPlacementId] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState<AdvertisementPlacementRule | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [displayOrder, setDisplayOrder] = useState("0");
    const [insertionType, setInsertionType] = useState<PlacementInsertionType>("FIXED");
    const [insertionPosition, setInsertionPosition] = useState("");
    const [maxImpressions, setMaxImpressions] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const load = useCallback(async () => {
        try { setRules(await getAdvertisementPlacementRules({ advertisementId })); }
        catch (loadError) { setError(getError(loadError)); }
        finally { setLoading(false); }
    }, [advertisementId]);
    useEffect(() => {
        let active = true;

        // Start the request directly from the effect. State changes happen only
        // in asynchronous completion handlers, not during effect execution.
        getAdvertisementPlacementRules({ advertisementId })
            .then((result) => {
                if (active) setRules(result);
            })
            .catch((loadError: unknown) => {
                if (active) setError(getError(loadError));
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [advertisementId]);

    const refresh = () => {
        setLoading(true);
        setError("");
        void load();
    };
    useEffect(() => {
        let active = true;
        getAdvertisementPlacements().then((response) => {
            if (active) setAvailablePlacements(response.data ?? []);
        }).catch(() => { if (active) setError("Unable to load placement configuration choices."); });
        return () => { active = false; };
    }, []);
    const eligiblePlacements = availablePlacements.filter((item) => item.status === "ACTIVE" && item.isEnabled);
    const chosenPlacement = eligiblePlacements.find((item) => item.id === Number(selectedPlacementId)) ?? null;
    const existingActiveIds = new Set(rules.filter((rule) => rule.status === "ACTIVE").map((rule) => rule.placementId));

    const openCreate = () => { setSelectedPlacementId(""); setEditing(null); setDisplayOrder("0"); setInsertionType(placement?.insertionType ?? "FIXED"); setInsertionPosition(""); setMaxImpressions(""); setFormOpen(true); setError(""); setSuccess(""); };
    const openEdit = (rule: AdvertisementPlacementRule) => { setSelectedPlacementId(String(rule.placementId)); setEditing(rule); setDisplayOrder(String(rule.displayOrder)); setInsertionType(rule.insertionType ?? "FIXED"); setInsertionPosition(rule.insertionPosition === null ? "" : String(rule.insertionPosition)); setMaxImpressions(rule.maxImpressions === null ? "" : String(rule.maxImpressions)); setFormOpen(true); setError(""); setSuccess(""); };

    const save = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); setError(""); setSuccess("");
        if (!editing && !chosenPlacement) { setError("Select an active, enabled placement configuration."); return; }
        if (!editing && existingActiveIds.has(Number(selectedPlacementId))) { setError("This advertisement already has an active rule for the selected placement."); return; }
        if (!Number.isInteger(Number(displayOrder)) || Number(displayOrder) < 0) { setError("Display order must be a non-negative whole number."); return; }
        if ((insertionType === "AFTER_N_ITEMS" || insertionType === "BETWEEN_SECTIONS") && (!Number.isInteger(Number(insertionPosition)) || Number(insertionPosition) <= 0)) { setError("Insertion position must be a positive whole number for this insertion behavior."); return; }
        if (insertionType === "FIXED" && insertionPosition.trim()) { setError("Insertion position must be empty for fixed positioning."); return; }
        if (maxImpressions.trim() && (!Number.isInteger(Number(maxImpressions)) || Number(maxImpressions) <= 0)) { setError("Maximum impressions must be a positive whole number or left blank."); return; }
        const position = insertionType === "FIXED" ? null : Number(insertionPosition);
        const max = maxImpressions.trim() ? Number(maxImpressions) : null;
        setSaving(true);
        try {
            if (editing) {
                const payload: UpdatePlacementRuleInput = { displayOrder: Number(displayOrder), insertionType, insertionPosition: position, maxImpressions: max, status: "ACTIVE" };
                const response = await updateAdvertisementPlacementRule(editing.id, payload);
                if (!response.success) throw new Error(response.message || "Unable to update the placement rule.");
                setSuccess("Placement rule updated successfully.");
            } else {
                const payload: CreatePlacementRuleInput = { advertisementId, placementId: Number(selectedPlacementId), displayOrder: Number(displayOrder), insertionType, insertionPosition: position, maxImpressions: max, status: "ACTIVE" };
                const response = await createAdvertisementPlacementRule(payload);
                if (!response.success) throw new Error(response.message || "Unable to create the placement rule.");
                setSuccess("Placement rule created successfully.");
            }
            setFormOpen(false); setEditing(null); await load();
        } catch (saveError) { setError(getError(saveError)); }
        finally { setSaving(false); }
    };

    const deactivate = async (rule: AdvertisementPlacementRule) => {
        if (!await confirmDialog(`Deactivate placement rule #${rule.id}?`)) return;
        setError(""); setSuccess(""); setSaving(true);
        try { const response = await deactivateAdvertisementPlacementRule(rule.id); if (!response.success) throw new Error(response.message || "Unable to deactivate the rule."); setSuccess(`Placement rule #${rule.id} deactivated.`); await load(); }
        catch (actionError) { setError(getError(actionError)); }
        finally { setSaving(false); }
    };

    return <section className="mt-5 space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><h2 className="text-base font-semibold text-gray-900">Advertisement placement rules</h2><p className="mt-1 text-sm text-gray-600">Rules link this advertisement to its configured placement and determine insertion order and optional impression limits.</p></div><div className="flex gap-2"><button type="button" onClick={refresh} disabled={loading || saving} className="inline-flex min-h-9 items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 disabled:opacity-50"><RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh</button><button type="button" onClick={openCreate} disabled={saving || eligiblePlacements.length === 0} className="inline-flex min-h-9 items-center gap-2 rounded-md bg-green-700 px-3 py-2 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-50"><Plus size={15} /> Add rule</button></div></div>
        {!placement && <div className="flex gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800"><AlertCircle size={17} />Select one or more enabled placements by creating a rule for each placement.</div>}
        {error && <p role="alert" className="flex gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"><AlertCircle size={17} />{error}</p>}{success && <p role="status" className="flex gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800"><CheckCircle2 size={17} />{success}</p>}
        {loading ? <p className="py-5 text-sm text-gray-500">Loading placement rules…</p> : rules.length === 0 ? <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center"><p className="text-sm font-semibold text-gray-900">No placement rules found</p><p className="mt-1 text-sm text-gray-500">Create a rule for the selected placement to make this advertisement eligible for placement-based delivery.</p></div> : <div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200 text-sm"><thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr><th className="px-3 py-2 text-left">Rule</th><th className="px-3 py-2 text-left">Insertion</th><th className="px-3 py-2 text-right">Max impressions</th><th className="px-3 py-2 text-left">Status</th><th className="px-3 py-2 text-right">Actions</th></tr></thead><tbody className="divide-y divide-gray-100">{rules.map((rule) => <tr key={rule.id}><td className="px-3 py-3"><p className="font-semibold text-gray-900">Rule #{rule.id}</p><p className="text-xs text-gray-500">Placement #{rule.placementId} · {availablePlacements.find((item) => item.id === rule.placementId)?.displayName ?? "Configured placement"}</p><p className="text-xs text-gray-500">Display order {rule.displayOrder}</p></td><td className="px-3 py-3"><p>{(rule.insertionType ?? "FIXED").replaceAll("_", " ")}</p><p className="text-xs text-gray-500">Position: {rule.insertionPosition ?? "Default"}</p></td><td className="px-3 py-3 text-right tabular-nums">{rule.maxImpressions ?? "Unlimited"}</td><td className="px-3 py-3"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${rule.status === "ACTIVE" ? "bg-green-50 text-green-800" : "bg-gray-100 text-gray-700"}`}>{rule.status}</span></td><td className="px-3 py-3"><div className="flex justify-end gap-2"><button type="button" onClick={() => openEdit(rule)} className="rounded-md border border-gray-300 px-2.5 py-1.5 text-xs font-semibold text-gray-700">Edit</button>{rule.status === "ACTIVE" && <button type="button" onClick={() => void deactivate(rule)} disabled={saving} className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"><Trash2 size={13} /> Deactivate</button>}</div></td></tr>)}</tbody></table></div>}
        {formOpen && <form onSubmit={(e) => void save(e)} className="space-y-4 rounded-lg border border-green-200 bg-green-50/40 p-4">{!editing && <label className="block text-sm font-medium text-gray-700">Placement configuration<select required value={selectedPlacementId} onChange={(e) => { setSelectedPlacementId(e.target.value); const selected = eligiblePlacements.find((item) => item.id === Number(e.target.value)); if (selected) setInsertionType(selected.insertionType); }} className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"><option value="">Select a placement</option>{eligiblePlacements.map((item) => <option key={item.id} value={item.id} disabled={existingActiveIds.has(item.id)}>{item.displayName} (#{item.id}, {item.pageType}, {item.placementType}){existingActiveIds.has(item.id) ? " — already assigned" : ""}</option>)}</select></label>}{editing && <p className="text-sm text-gray-600">Editing placement #{editing.placementId}; placement identity cannot be changed. Deactivate and create a new rule to move it.</p>}<h3 className="text-sm font-semibold text-gray-900">{editing ? `Edit placement rule #${editing.id}` : "Create placement rule"}</h3><div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"><label className="block text-sm font-medium text-gray-700">Display order<input type="number" min="0" step="1" required value={displayOrder} onChange={(e) => setDisplayOrder(e.target.value)} disabled={saving} className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm" /></label><label className="block text-sm font-medium text-gray-700">Insertion behavior<select value={insertionType} onChange={(e) => { const value = e.target.value as PlacementInsertionType; setInsertionType(value); if (value === "FIXED") setInsertionPosition(""); }} disabled={saving} className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm">{insertionOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label><label className="block text-sm font-medium text-gray-700">Insertion position{insertionType !== "FIXED" && <span className="text-red-600"> *</span>}<input type="number" min="1" step="1" required={insertionType !== "FIXED"} value={insertionPosition} onChange={(e) => setInsertionPosition(e.target.value)} disabled={saving || insertionType === "FIXED"} placeholder={insertionType === "FIXED" ? "Not applicable" : "Positive integer"} className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm disabled:bg-gray-100" /></label><label className="block text-sm font-medium text-gray-700">Max impressions<input type="number" min="1" step="1" value={maxImpressions} onChange={(e) => setMaxImpressions(e.target.value)} disabled={saving} placeholder="Unlimited" className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm" /></label></div><div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={() => setFormOpen(false)} disabled={saving} className="min-h-9 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700">Cancel</button><button type="submit" disabled={saving} className="inline-flex min-h-9 items-center justify-center gap-2 rounded-md bg-green-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">{saving ? <LoaderCircle size={15} className="animate-spin" /> : <Save size={15} />}{saving ? "Saving…" : "Save rule"}</button></div></form>}
        <PlacementRuleSchedules advertisementId={advertisementId} rules={rules} placements={availablePlacements} />
    </section>;
};
export default WorkspacePlacementRules;
