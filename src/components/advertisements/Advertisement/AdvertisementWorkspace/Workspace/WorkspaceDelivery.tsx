import { confirmDialog } from "@/components/ui/Dialog/confirmDialog";
import { useEffect, useState } from "react";
import { AlertCircle, Archive, CheckCircle2, CirclePause, CirclePlay, LoaderCircle, ShieldAlert, Square, Workflow } from "lucide-react";
import {
    archiveAdvertisement,
    holdAdvertisement,
    pauseAdvertisement,
    resumeAdvertisement,
    resumeAdvertisementDelivery,
    stopAdvertisement,
} from "@/api/advertisements/advertisement.api";
import type { AdvertisementDetails, AdvertisementStatus, AdvertisementWorkflowStatus } from "@/api/advertisements/advertisement.api";
import { getAdvertisementPlacementRules } from "@/api/advertisements/placement-rules.api";
import type { AdvertisementPlacementRule } from "@/api/advertisements/placement-rules.api";
import { createAdvertisementSchedule } from "@/api/advertisements/schedules.api";
import type { AdvertisementSchedule } from "@/api/advertisements/schedules.api";

type Action = "pause" | "resume" | "hold" | "releaseHold" | "stop" | "archive";
interface Props { advertisement: AdvertisementDetails; schedules: AdvertisementSchedule[]; scheduleVerificationStatus: "LOADING" | "VERIFIED" | "ERROR"; onChanged: () => Promise<void>; }
type ApiError = { response?: { data?: { message?: string } }; message?: string };
const getError = (error: unknown) => { const value = error as ApiError; return value.response?.data?.message ?? value.message ?? "The delivery action failed. Refresh the workspace and try again."; };
const formatDate = (value: string | Date | null | undefined) => value ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(value instanceof Date ? value : new Date(value)) : "Not configured";
const toDateTimeLocal = (value: string | null) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const pad = (part: number) => String(part).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};
const statusClass = (status: string) => status === "ACTIVE" || status === "APPROVED" ? "bg-green-50 text-green-800" : status === "PAUSED" || status === "ON_HOLD" ? "bg-amber-50 text-amber-800" : status === "ARCHIVED" || status === "COMPLETED" ? "bg-gray-100 text-gray-700" : "bg-blue-50 text-blue-800";

const WorkspaceDelivery = ({ advertisement, schedules, scheduleVerificationStatus, onChanged }: Props) => {
    const [action, setAction] = useState<Action | null>(null);
    const [reason, setReason] = useState("");
    const [remarks, setRemarks] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [placementRules, setPlacementRules] = useState<AdvertisementPlacementRule[]>([]);
    const [showScheduleForm, setShowScheduleForm] = useState(false);
    const [scheduleStart, setScheduleStart] = useState(toDateTimeLocal(advertisement.startAt));
    const [scheduleEnd, setScheduleEnd] = useState(toDateTimeLocal(advertisement.endAt));
    const [scheduleRuleId, setScheduleRuleId] = useState("");
    const [scheduleNotes, setScheduleNotes] = useState("");
    const [scheduleSaving, setScheduleSaving] = useState(false);
    const [scheduleError, setScheduleError] = useState("");
    const [scheduleSuccess, setScheduleSuccess] = useState("");
    const workflowStatus: AdvertisementWorkflowStatus = advertisement.workflowStatus;
    const status: AdvertisementStatus = advertisement.status;
    const terminal = workflowStatus === "ARCHIVED" || status === "ARCHIVED";
    // COMPLETED is a stopped delivery state, not an archived workflow state.
    const active = status === "ACTIVE";
    const paused = status === "PAUSED";
    const onHold = workflowStatus === "ON_HOLD";
    const start = advertisement.startAt ? new Date(advertisement.startAt) : null;
    const end = advertisement.endAt ? new Date(advertisement.endAt) : null;
    const now = new Date();
    const windowState = !start || !end ? "Schedule dates missing" : now < start ? "Scheduled for the future" : now > end ? "Campaign window expired" : "Within campaign window";
    const windowTone = windowState === "Within campaign window" ? "text-green-700" : "text-amber-700";
    useEffect(() => {
        let cancelled = false;
        const fetchPlacementRules = async () => {
            try {
                const rows = await getAdvertisementPlacementRules({ advertisementId: advertisement.id });
                if (cancelled) return;
                setPlacementRules(rows.filter((rule) =>
                    rule.status === "ACTIVE" && rule.placementId === advertisement.placement?.id,
                ));
            } catch (ruleError: unknown) {
                if (!cancelled) setScheduleError(getError(ruleError));
            }
        };
        void fetchPlacementRules();
        return () => { cancelled = true; };
    }, [advertisement.id, advertisement.placement?.id]);

    const openAction = (next: Action) => { setAction(next); setReason(""); setRemarks(""); setError(""); setSuccess(""); };
    const cancelAction = () => { if (!saving) { setAction(null); setError(""); } };
    const submitAction = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); if (!action || saving) return;
        setError(""); setSuccess("");
        if (action === "hold" && !reason.trim()) { setError("A hold reason is required."); return; }
        if (action === "stop" && !remarks.trim()) { setError("Remarks are required to stop delivery."); return; }
        if ((action === "stop" || action === "archive") && !await confirmDialog(`Are you sure you want to ${action} this advertisement? This operation may affect its schedules and delivery.`)) return;
        setSaving(true);
        try {
            const payload = remarks.trim() ? { remarks: remarks.trim() } : {};
            let response: Awaited<ReturnType<typeof pauseAdvertisement>> | null = null;
            switch (action) {
                case "pause": response = await pauseAdvertisement(advertisement.id, payload); break;
                case "resume": response = await resumeAdvertisementDelivery(advertisement.id, payload); break;
                case "releaseHold": {
                    // Workflow release must succeed before the explicit delivery resume.
                    // If activation fails, remain approved/paused and display the error.
                    const released = await resumeAdvertisement(advertisement.id, payload);
                    if (!released.success) throw new Error(released.message || "Unable to release hold.");
                    response = await resumeAdvertisementDelivery(advertisement.id, payload);
                    break;
                }
                case "hold": response = await holdAdvertisement(advertisement.id, { reason: reason.trim(), ...(remarks.trim() ? { remarks: remarks.trim() } : {}) }); break;
                case "stop": response = await stopAdvertisement(advertisement.id, payload); break;
                case "archive": response = await archiveAdvertisement(advertisement.id, payload); break;
            }
            if (!response) throw new Error("Choose a valid delivery action.");
            if (!response.success) throw new Error(response.message || `Unable to ${action} advertisement.`);
            setSuccess(response.message || `Advertisement ${action} action completed.`);
            setAction(null); setReason(""); setRemarks("");
            await onChanged();
        } catch (actionError) { setError(getError(actionError)); }
        finally { setSaving(false); }
    };

    const createSchedule = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); setScheduleError(""); setScheduleSuccess("");
        if (!advertisement.placement?.id) { setScheduleError("Assign a configured placement before creating a schedule."); return; }
        if (!scheduleRuleId || !placementRules.some((rule) => rule.id === Number(scheduleRuleId))) { setScheduleError("Choose an active placement rule for this advertisement."); return; }
        if (!scheduleStart || !scheduleEnd || new Date(scheduleEnd) <= new Date(scheduleStart)) { setScheduleError("Schedule end must be later than schedule start."); return; }
        if (advertisement.startAt && new Date(scheduleStart) < new Date(advertisement.startAt)) { setScheduleError("Schedule start cannot be earlier than the campaign start."); return; }
        if (advertisement.endAt && new Date(scheduleEnd) > new Date(advertisement.endAt)) { setScheduleError("Schedule end cannot be later than the campaign end."); return; }
        setScheduleSaving(true);
        try {
            const response = await createAdvertisementSchedule({
                advertisementId: advertisement.id,
                placementId: advertisement.placement.id,
                placementRuleId: Number(scheduleRuleId),
                startAt: new Date(scheduleStart).toISOString(),
                endAt: new Date(scheduleEnd).toISOString(),
                status: "SCHEDULED",
                priority: advertisement.priority,
                notes: scheduleNotes.trim() || null,
            });
            if (!response.success) throw new Error(response.message || "Unable to create the schedule.");
            setScheduleSuccess(response.message || "Schedule created successfully.");
            setShowScheduleForm(false); setScheduleNotes("");
            await onChanged();
        } catch (scheduleSaveError) { setScheduleError(getError(scheduleSaveError)); }
        finally { setScheduleSaving(false); }
    };

    return <section className="space-y-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex items-center gap-2 text-green-700"><Workflow size={18} /><span className="text-sm font-semibold">Operational controls</span></div><h2 className="mt-1 text-lg font-semibold text-gray-900">Delivery status</h2><p className="mt-1 max-w-3xl text-sm text-gray-600">Approval and delivery are separate. These actions request a lifecycle transition; the backend validates permissions, schedule eligibility, placement, creative, rotation and financial requirements.</p></div><span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${statusClass(status)}`}>{status}</span></header>
        {error && <div role="alert" className="flex gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"><AlertCircle size={17} className="shrink-0" />{error}</div>}
        {success && <div role="status" className="flex gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800"><CheckCircle2 size={17} className="shrink-0" />{success}</div>}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Info label="Workflow approval" value={workflowStatus} tone={statusClass(workflowStatus)} />
            <Info label="Operational status" value={status} tone={statusClass(status)} />
            <Info label="Campaign start" value={formatDate(advertisement.startAt)} />
            <Info label="Campaign end" value={formatDate(advertisement.endAt)} />
        </div>
        <div className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-semibold text-gray-900">Campaign window</p><p className={`mt-1 text-sm font-medium ${windowTone}`}>{windowState}</p><p className="mt-1 text-xs text-gray-500">Activating an advertisement does not change its campaign dates or make a future schedule deliver early.</p></div><span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-600 ring-1 ring-gray-200">Server-validated</span></div>
        <section className="space-y-3 rounded-lg border border-gray-200 p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div><h3 className="text-sm font-semibold text-gray-900">Persisted delivery schedules</h3><p className="mt-1 text-xs text-gray-500">Go-Live activation requires at least one persisted SCHEDULED or PAUSED schedule that is valid for this placement.</p></div>{workflowStatus === "APPROVED" && !terminal && <button type="button" onClick={() => { if (!showScheduleForm) { setScheduleStart(toDateTimeLocal(advertisement.startAt)); setScheduleEnd(toDateTimeLocal(advertisement.endAt)); } setShowScheduleForm((value) => !value); setScheduleError(""); setScheduleSuccess(""); }} disabled={scheduleVerificationStatus !== "VERIFIED" || schedules.some((schedule) => schedule.status === "SCHEDULED" || schedule.status === "PAUSED" || schedule.status === "ACTIVE")} className="inline-flex min-h-9 items-center justify-center gap-2 rounded-md bg-green-700 px-3 py-2 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-50"><CirclePlay size={15} /> Create schedule</button>}</div>
            {scheduleVerificationStatus === "LOADING" && <p className="text-sm text-gray-500">Verifying schedule records…</p>}
            {scheduleVerificationStatus === "ERROR" && <p role="alert" className="text-sm text-red-700">Schedule records could not be verified. Refresh the workspace and check schedule-read permissions.</p>}
            {scheduleSuccess && <p role="status" className="text-sm text-green-700">{scheduleSuccess}</p>}
            {scheduleError && <p role="alert" className="text-sm text-red-700">{scheduleError}</p>}
            {scheduleVerificationStatus === "VERIFIED" && !schedules.some((schedule) => schedule.status === "SCHEDULED" || schedule.status === "PAUSED" || schedule.status === "ACTIVE") && <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">No persisted schedule exists. Create an active placement rule first, then add a schedule before activation.</p>}
            {schedules.length > 0 && <div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-100 text-sm"><thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr><th className="px-3 py-2 text-left">Schedule</th><th className="px-3 py-2 text-left">Window</th><th className="px-3 py-2 text-left">Placement rule</th><th className="px-3 py-2 text-left">Status</th></tr></thead><tbody className="divide-y divide-gray-100">{schedules.map((schedule) => <tr key={schedule.id}><td className="px-3 py-3 font-semibold text-gray-900">#{schedule.id}<p className="text-xs font-normal text-gray-500">Priority {schedule.priority}</p></td><td className="px-3 py-3"><p>{formatDate(schedule.startAt)}</p><p className="mt-1 text-xs text-gray-500">to {formatDate(schedule.endAt)}</p></td><td className="px-3 py-3">{schedule.placementRuleId ? `Rule #${schedule.placementRuleId}` : "Not assigned"}</td><td className="px-3 py-3"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusClass(schedule.status)}`}>{schedule.status}</span></td></tr>)}</tbody></table></div>}
            {showScheduleForm && <form onSubmit={(e) => void createSchedule(e)} className="space-y-4 rounded-lg border border-green-200 bg-green-50/40 p-4"><h4 className="text-sm font-semibold text-gray-900">Create persisted schedule</h4>{placementRules.length === 0 && <p className="text-sm text-amber-800">No active placement rule was found for this advertisement. Open Placement and create or activate a placement rule first.</p>}<div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><label className="block text-sm font-medium text-gray-700">Active placement rule <span className="text-red-600">*</span><select required value={scheduleRuleId} onChange={(e) => setScheduleRuleId(e.target.value)} disabled={scheduleSaving || placementRules.length === 0} className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"><option value="">Choose rule</option>{placementRules.map((rule) => <option key={rule.id} value={String(rule.id)}>Rule #{rule.id} · order {rule.displayOrder} · {rule.insertionType ?? "FIXED"}</option>)}</select></label><label className="block text-sm font-medium text-gray-700">Notes<input value={scheduleNotes} onChange={(e) => setScheduleNotes(e.target.value)} disabled={scheduleSaving} maxLength={1000} className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm" placeholder="Optional scheduling note" /></label><label className="block text-sm font-medium text-gray-700">Schedule starts <span className="text-red-600">*</span><input type="datetime-local" required value={scheduleStart} min={toDateTimeLocal(advertisement.startAt)} max={toDateTimeLocal(advertisement.endAt)} onChange={(e) => setScheduleStart(e.target.value)} disabled={scheduleSaving} className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm" /></label><label className="block text-sm font-medium text-gray-700">Schedule ends <span className="text-red-600">*</span><input type="datetime-local" required value={scheduleEnd} min={scheduleStart || undefined} max={toDateTimeLocal(advertisement.endAt)} onChange={(e) => setScheduleEnd(e.target.value)} disabled={scheduleSaving} className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm" /></label></div><div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={() => setShowScheduleForm(false)} disabled={scheduleSaving} className="min-h-9 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700">Cancel</button><button type="submit" disabled={scheduleSaving || placementRules.length === 0} className="inline-flex min-h-9 items-center justify-center gap-2 rounded-md bg-green-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">{scheduleSaving && <LoaderCircle size={15} className="animate-spin" />}{scheduleSaving ? "Creating…" : "Create schedule"}</button></div></form>}
        </section>
        {!terminal && <div className="space-y-3"><h3 className="text-sm font-semibold text-gray-900">Available actions</h3><div className="flex flex-wrap gap-2">
            {active && <ActionButton icon={<CirclePause size={16} />} label="Pause delivery" onClick={() => openAction("pause")} />}
            {paused && !onHold && <ActionButton icon={<CirclePlay size={16} />} label="Resume delivery" onClick={() => openAction("resume")} />}
            {onHold && <ActionButton icon={<CirclePlay size={16} />} label="Release hold & resume" onClick={() => openAction("releaseHold")} />}
            {active && !onHold && workflowStatus === "APPROVED" && <ActionButton icon={<ShieldAlert size={16} />} label="Place on hold" onClick={() => openAction("hold")} />}
            {(active || paused) && <ActionButton icon={<Square size={15} />} label="Stop delivery" danger onClick={() => openAction("stop")} />}
            {(workflowStatus === "APPROVED" || workflowStatus === "ON_HOLD") && <button type="button" disabled={active || paused} title={active || paused ? "Stop delivery before archiving this advertisement" : "Archive advertisement"} onClick={() => openAction("archive")} className="inline-flex min-h-9 items-center gap-2 rounded-md border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white"><Archive size={16} />Archive advertisement</button>}
        </div>{(active || paused) && (workflowStatus === "APPROVED" || workflowStatus === "ON_HOLD") && <p className="text-xs text-amber-700">Archive is unavailable while delivery is active or paused. Stop delivery first, then archive the advertisement. Stopping cancels active and future schedules.</p>}<p className="text-xs text-gray-500">Buttons may be rejected by the API when a transition is not valid or your account lacks the required permission.</p></div>}
        {terminal && <p className="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-600">This advertisement is archived. Delivery actions are unavailable.</p>}
        {action && <form onSubmit={(e) => void submitAction(e)} className="space-y-4 rounded-lg border border-green-200 bg-green-50/50 p-4"><div><h3 className="font-semibold capitalize text-gray-900">Confirm {action === "hold" ? "hold" : action} action</h3><p className="mt-1 text-sm text-gray-600">Provide an audit explanation. The server remains authoritative for this transition.</p></div>{action === "hold" && <label className="block text-sm font-medium text-gray-700">Hold reason <span className="text-red-600">*</span><textarea className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600" rows={2} maxLength={2000} required value={reason} onChange={(e) => setReason(e.target.value)} disabled={saving} placeholder="Explain why this advertisement is being placed on hold" /></label>}<label className="block text-sm font-medium text-gray-700">Remarks {action === "stop" ? "(required)" : action === "hold" ? "(optional)" : "(optional but recommended)"}<textarea className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600" rows={2} maxLength={2000} value={remarks} onChange={(e) => setRemarks(e.target.value)} disabled={saving} placeholder="Add an audit note" /></label>{error && <p role="alert" className="text-sm text-red-700">{error}</p>}<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={cancelAction} disabled={saving} className="min-h-9 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 disabled:opacity-60">Cancel</button><button type="submit" disabled={saving || (action === "hold" && !reason.trim()) || (action === "stop" && !remarks.trim())} className="inline-flex min-h-9 items-center justify-center gap-2 rounded-md bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-60">{saving && <LoaderCircle size={16} className="animate-spin" />}{saving ? "Processing…" : `Confirm ${action}`}</button></div></form>}
    </section>;
};

const Info = ({ label, value, tone }: { label: string; value: string; tone?: string }) => <div className="rounded-lg border border-gray-200 p-3"><p className="text-xs font-medium text-gray-500">{label}</p><p className={`mt-1 text-sm font-semibold ${tone ? `inline-flex rounded-full px-2 py-0.5 ${tone}` : "text-gray-900"}`}>{value}</p></div>;
const ActionButton = ({ icon, label, onClick, danger = false }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) => <button type="button" onClick={onClick} className={`inline-flex min-h-9 items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold ${danger ? "border-red-200 bg-white text-red-700 hover:bg-red-50" : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"}`}>{icon}{label}</button>;
export default WorkspaceDelivery;
