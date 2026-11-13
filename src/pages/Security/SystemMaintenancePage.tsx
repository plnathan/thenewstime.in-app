import { istInputToUtcIso } from "@/helpers/businessTimeZone.helpers";
/** Project: thenewstime.in — Planned maintenance administration. */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, CheckCircle2, XCircle, X } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import MainLayout from "@/layouts/MainLayout";
import {
    getMaintenanceSettings,
    saveMaintenanceSettings,
    type MaintenanceSettings,
} from "@/api/systemMaintenance.api";

type Dialog = "confirm" | "success" | "error" | null;

function toLocalInput(value: string | null): string {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
    return local.toISOString().slice(0, 16);
}

export default function SystemMaintenancePage() {
    const { hasPermissionCode } = useAuth();
    const canUpdate = hasPermissionCode("permissions.update");
    const [data, setData] = useState<MaintenanceSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [dialog, setDialog] = useState<Dialog>(null);
    const [enabled, setEnabled] = useState(false);
    const [message, setMessage] = useState("");
    const [restoration, setRestoration] = useState("");

    useEffect(() => {
        let active = true;
        void getMaintenanceSettings()
            .then((result) => {
                if (!active) return;
                setData(result);
                setEnabled(result.maintenance);
                setMessage(result.message);
                setRestoration(toLocalInput(result.expectedRestorationAt));
            })
            .catch(() => {
                if (active) setError("Unable to load maintenance settings.");
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => { active = false; };
    }, []);

    const openConfirmation = () => {
        if (!canUpdate || !data || saving || !message.trim()) return;
        setError("");
        setNotice("");
        setDialog("confirm");
    };

    const save = async () => {
        if (!canUpdate || saving || !data) return;
        setSaving(true);
        setError("");
        try {
            const result = await saveMaintenanceSettings({
                enabled,
                message: message.trim(),
                expectedRestorationAt: restoration ? istInputToUtcIso(restoration) : null,
            });
            setData(result);
            setEnabled(result.maintenance);
            setMessage(result.message);
            setRestoration(toLocalInput(result.expectedRestorationAt));
            setNotice(result.source === "ENVIRONMENT"
                ? "Settings saved. The PUBLIC_MAINTENANCE_MODE=true emergency override remains active until it is disabled and the API restarted."
                : "Maintenance settings saved successfully.");
            setDialog("success");
        } catch {
            setError("Unable to save maintenance settings. Check your permissions and backend logs.");
            setDialog("error");
        } finally {
            setSaving(false);
        }
    };

    const isEnabling = enabled && !data?.maintenance;
    const isDisabling = !enabled && data?.maintenance;
    const confirmationTitle = isEnabling ? "Enable Public Maintenance?"
        : isDisabling ? "Disable Public Maintenance?" : "Save Maintenance Settings?";
    const confirmationMessage = isEnabling
        ? "Public visitors will see the maintenance page. Authorized administrators can continue working."
        : isDisabling
            ? "The public website will become available again unless an environment override is active."
            : "Save the updated maintenance message and expected restoration time?";

    return (
        <MainLayout>
            <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-8">
                <div className="mx-auto max-w-5xl space-y-5">
                    <Link to="/admin/security" className="text-sm font-medium text-green-800">← Back to Security Administration</Link>
                    <header className="admin-unified-header rounded-2xl bg-[#008236] p-6 text-white">
                        <h1 className="text-2xl font-bold">System Maintenance</h1>
                        <p className="mt-2 text-sm text-white/90">Control planned public website downtime without redeploying.</p>
                    </header>
                    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        {loading ? <p>Loading maintenance settings...</p> : !data ? <p>Settings unavailable.</p> : (
                            <div className="space-y-5">
                                <p className="text-sm text-slate-600">Effective status: <strong>{data.maintenance ? "MAINTENANCE" : "AVAILABLE"}</strong> · Source: {data.source}</p>
                                {data.source === "ENVIRONMENT" && (
                                    <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
                                        Emergency override is active. Disable PUBLIC_MAINTENANCE_MODE and restart the API before database settings can restore the site.
                                    </p>
                                )}
                                <label className="flex items-center gap-3 text-sm font-medium">
                                    <input type="checkbox" checked={enabled} disabled={!canUpdate || saving} onChange={(e) => setEnabled(e.target.checked)} />
                                    Enable public maintenance
                                </label>
                                <label className="block text-sm font-medium">
                                    Tamil maintenance message
                                    <textarea className="mt-2 w-full rounded-lg border border-slate-300 p-3" rows={4} maxLength={1000}
                                        value={message} disabled={!canUpdate || saving} onChange={(e) => setMessage(e.target.value)} />
                                </label>
                                <label className="block text-sm font-medium">
                                    Expected restoration (optional)
                                    <input type="datetime-local" className="mt-2 block rounded-lg border border-slate-300 p-3"
                                        value={restoration} disabled={!canUpdate || saving} onChange={(e) => setRestoration(e.target.value)} />
                                    <span className="mt-1 block text-xs font-normal text-slate-500">
                                        Shown to public visitors in Indian Standard Time during maintenance. This is an estimate and will not automatically restore the website.
                                    </span>
                                </label>
                                {canUpdate && (
                                    <button type="button" onClick={openConfirmation} disabled={saving || !message.trim()}
                                        className="rounded-lg bg-[#008236] px-5 py-3 font-semibold text-white disabled:opacity-50">
                                        {saving ? "Saving..." : "Save Maintenance Settings"}
                                    </button>
                                )}
                            </div>
                        )}
                        {error && !dialog && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
                    </section>
                </div>
            </main>

            {dialog && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4"
                    onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) setDialog(null); }}>
                    <section role="dialog" aria-modal="true" aria-labelledby="maintenance-dialog-title"
                        aria-describedby="maintenance-dialog-description"
                        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                                {dialog === "confirm" ? <AlertTriangle className="h-7 w-7 text-amber-600" />
                                    : dialog === "success" ? <CheckCircle2 className="h-7 w-7 text-[#008236]" />
                                        : <XCircle className="h-7 w-7 text-red-600" />}
                                <h2 id="maintenance-dialog-title" className="text-lg font-bold text-slate-900">
                                    {dialog === "confirm" ? confirmationTitle : dialog === "success" ? "Settings Saved" : "Save Failed"}
                                </h2>
                            </div>
                            <button type="button" aria-label="Close dialog" disabled={saving} onClick={() => setDialog(null)}
                                className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-50"><X className="h-5 w-5" /></button>
                        </div>
                        <p id="maintenance-dialog-description" className="mt-4 text-sm leading-relaxed text-slate-600">
                            {dialog === "confirm" ? confirmationMessage : dialog === "success" ? notice : error}
                        </p>
                        <div className="mt-6 flex justify-end gap-3">
                            {dialog === "confirm" && (
                                <button type="button" disabled={saving} onClick={() => setDialog(null)}
                                    className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 disabled:opacity-50">Cancel</button>
                            )}
                            <button type="button" disabled={saving} onClick={() => { if (dialog === "confirm") void save(); else setDialog(null); }}
                                className="rounded-lg bg-[#008236] px-4 py-2 font-semibold text-white disabled:opacity-50">
                                {dialog === "confirm" ? saving ? "Saving..." : isEnabling ? "Enable Maintenance" : isDisabling ? "Disable Maintenance" : "Save Changes" : "OK"}
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </MainLayout>
    );
}
