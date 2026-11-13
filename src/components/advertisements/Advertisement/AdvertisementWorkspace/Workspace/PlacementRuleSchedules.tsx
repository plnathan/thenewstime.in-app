import { istInputToUtcIso, utcIsoToIstInput, formatIstDateTime } from "@/helpers/businessTimeZone.helpers";
import { useEffect, useState, type FormEvent } from "react";
import {
    createAdvertisementSchedule,
    getAdvertisementSchedules,
    updateAdvertisementSchedule,
    pauseAdvertisementSchedule,
    resumeAdvertisementSchedule,
    cancelAdvertisementSchedule,
    type AdvertisementSchedule,
} from "@/api/advertisements/schedules.api";
import type { AdvertisementPlacementRule } from "@/api/advertisements/placement-rules.api";
import type { AdvertisementPlacement } from "@/api/advertisements/placements.api";

interface Props {
    advertisementId: number;
    rules: AdvertisementPlacementRule[];
    placements: AdvertisementPlacement[];
}
const errorMessage = (error: unknown) => {
    const value = error as { response?: { data?: { message?: string } }; message?: string };
    return value.response?.data?.message ?? value.message ?? "Schedule operation failed.";
};
const toInput = utcIsoToIstInput;
const fmt = formatIstDateTime;
export default function PlacementRuleSchedules({ advertisementId, rules, placements }: Props) {
    const [schedules, setSchedules] = useState<AdvertisementSchedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [ruleId, setRuleId] = useState("");
    const [startAt, setStartAt] = useState("");
    const [endAt, setEndAt] = useState("");
    const [priority, setPriority] = useState("0");
    const [editing, setEditing] = useState<number | null>(null);
    const activeRules = rules.filter((rule) => rule.status === "ACTIVE");
    const reload = async () => setSchedules(await getAdvertisementSchedules({ advertisementId }));
    useEffect(() => {
        let active = true;
        getAdvertisementSchedules({ advertisementId })
            .then((items) => { if (active) setSchedules(items); })
            .catch((err: unknown) => { if (active) setError(errorMessage(err)); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [advertisementId]);
    const beginEdit = (schedule: AdvertisementSchedule) => {
        setEditing(schedule.id);
        setRuleId(String(schedule.placementRuleId ?? ""));
        setStartAt(toInput(schedule.startAt));
        setEndAt(toInput(schedule.endAt));
        setPriority(String(schedule.priority));
        setError(""); setMessage("");
    };
    const save = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault(); setError(""); setMessage("");
        const rule = activeRules.find((item) => item.id === Number(ruleId));
        if (!editing && !rule) { setError("Choose an active placement rule."); return; }
        let start: Date;
        let end: Date;
        try {
            start = new Date(istInputToUtcIso(startAt));
            end = new Date(istInputToUtcIso(endAt));
        } catch {
            setError("Enter valid start and end dates in IST.");
            return;
        }
        if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || start >= end) {
            setError("End time must be after start time."); return;
        }
        const rank = Number(priority);
        if (!Number.isInteger(rank) || rank < 0) { setError("Priority must be a nonnegative integer."); return; }
        setBusy(true);
        try {
            if (editing) {
                const current = schedules.find((item) => item.id === editing);
                if (!current || !["SCHEDULED", "PAUSED"].includes(current.status)) throw new Error("This schedule cannot be edited in its current status.");
                await updateAdvertisementSchedule(editing, { startAt: start.toISOString(), endAt: end.toISOString(), priority: rank });
            } else if (rule) {
                await createAdvertisementSchedule({ advertisementId, placementId: rule.placementId, placementRuleId: rule.id, startAt: start.toISOString(), endAt: end.toISOString(), priority: rank, status: "SCHEDULED" });
            }
            await reload(); setEditing(null); setRuleId(""); setStartAt(""); setEndAt(""); setPriority("0");
            setMessage("Schedule saved.");
        } catch (err) { setError(errorMessage(err)); }
        finally { setBusy(false); }
    };
    const changeStatus = async (id: number, action: "pause" | "resume" | "cancel") => {
        setBusy(true); setError(""); setMessage("");
        try {
            if (action === "pause") await pauseAdvertisementSchedule(id);
            else if (action === "resume") await resumeAdvertisementSchedule(id);
            else await cancelAdvertisementSchedule(id);
            await reload(); setMessage(`Schedule #${id} ${action} completed.`);
        } catch (err) { setError(errorMessage(err)); }
        finally { setBusy(false); }
    };
    return <div className="mt-6 space-y-4 border-t border-gray-200 pt-5">
        <div><h3 className="font-semibold text-gray-900">Independent placement schedules</h3><p className="text-sm text-gray-600">Each schedule belongs to one placement rule and uses its own placement ID. Creation requires an approved advertisement; backend validation remains authoritative.</p></div>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        {message && <p role="status" className="text-sm text-green-700">{message}</p>}
        {loading ? <p className="text-sm text-gray-500">Loading schedules…</p> : <div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead><tr className="border-b"><th className="p-2">Placement / Rule</th><th className="p-2">Window</th><th className="p-2">Status</th><th className="p-2">Actions</th></tr></thead><tbody>{schedules.map((item) => <tr key={item.id} className="border-b"><td className="p-2">#{item.placementId} {placements.find((p) => p.id === item.placementId)?.displayName ?? "Placement"}<div className="text-xs text-gray-500">Rule #{item.placementRuleId ?? "—"} · Schedule #{item.id}</div></td><td className="p-2">{fmt(item.startAt)} – {fmt(item.endAt)}</td><td className="p-2">{item.status}</td><td className="p-2"><div className="flex flex-wrap gap-2">{["SCHEDULED", "PAUSED"].includes(item.status) && <button type="button" disabled={busy} onClick={() => beginEdit(item)} className="underline">Edit</button>}{item.status === "ACTIVE" && <button type="button" disabled={busy} onClick={() => void changeStatus(item.id, "pause")} className="underline">Pause</button>}{item.status === "PAUSED" && <button type="button" disabled={busy} onClick={() => void changeStatus(item.id, "resume")} className="underline">Resume</button>}{["SCHEDULED", "ACTIVE", "PAUSED"].includes(item.status) && <button type="button" disabled={busy} onClick={() => void changeStatus(item.id, "cancel")} className="text-red-700 underline">Cancel</button>}</div></td></tr>)}</tbody></table>{schedules.length === 0 && <p className="p-3 text-sm text-gray-500">No placement schedules configured.</p>}</div>}
        <form onSubmit={(event) => void save(event)} className="grid grid-cols-1 items-end gap-3 rounded-lg bg-gray-50 p-3 sm:grid-cols-2 lg:grid-cols-5">
            <label className="text-sm">Placement rule<select required disabled={editing !== null || busy} value={ruleId} onChange={(event) => setRuleId(event.target.value)} className="mt-1 w-full rounded border p-2"><option value="">Select rule</option>{activeRules.map((rule) => <option key={rule.id} value={rule.id}>#{rule.placementId} / Rule #{rule.id}</option>)}</select></label>
            <label className="text-sm">Start (IST)<input required type="datetime-local" value={startAt} onChange={(event) => setStartAt(event.target.value)} className="mt-1 w-full rounded border p-2" /></label>
            <label className="text-sm">End (IST)<input required type="datetime-local" value={endAt} onChange={(event) => setEndAt(event.target.value)} className="mt-1 w-full rounded border p-2" /></label>
            <label className="text-sm">Priority<input required min={0} step={1} type="number" value={priority} onChange={(event) => setPriority(event.target.value)} className="mt-1 w-full rounded border p-2" /></label>
            <div className="flex gap-2"><button type="submit" disabled={busy || (!editing && activeRules.length === 0)} className="rounded bg-green-700 px-3 py-2 text-sm text-white disabled:opacity-50">{editing ? "Update" : "Add schedule"}</button>{editing !== null && <button type="button" onClick={() => { setEditing(null); setRuleId(""); setStartAt(""); setEndAt(""); }} className="rounded border px-2 text-sm">Cancel edit</button>}</div>
        </form>
    </div>;
}
