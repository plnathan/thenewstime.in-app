import { getIstCalendarDate, shiftIsoCalendarDate, formatIstDateTime } from "@/helpers/businessTimeZone.helpers";
import { useCallback, useEffect, useState } from "react";
import { Activity, AlertCircle, BarChart3, MousePointerClick, RefreshCw, Users, Eye } from "lucide-react";
import { getAdvertisementMetrics } from "@/api/advertisements/tracking.api";
import type { AdvertisementMetrics } from "@/api/advertisements/tracking.api";

interface Props { advertisementId: number; }
type ApiError = { response?: { data?: { message?: string } }; message?: string };
const getError = (error: unknown) => { const value = error as ApiError; return value.response?.data?.message ?? value.message ?? "Unable to load tracking metrics."; };
const todayIso = () => getIstCalendarDate();
const daysAgoIso = (days: number) => shiftIsoCalendarDate(getIstCalendarDate(), -days);
const number = (value: number | null | undefined) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value ?? 0);
const percentage = (value: number | null | undefined) => `${(value ?? 0).toFixed(2)}%`;
const WorkspaceTracking = ({ advertisementId }: Props) => {
    const [metrics, setMetrics] = useState<AdvertisementMetrics | null>(null);
    const [from, setFrom] = useState(daysAgoIso(29));
    const [to, setTo] = useState(todayIso());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [loadedAt, setLoadedAt] = useState<Date | null>(null);

    const load = useCallback(async () => {
        if (from && to && from > to) { setError("The start date must be earlier than or equal to the end date."); return; }
        setLoading(true); setError("");
        try {
            const response = await getAdvertisementMetrics(advertisementId, { ...(from ? { from } : {}), ...(to ? { to } : {}) });
            if (!response.success || !response.data) throw new Error(response.message || "Tracking metrics were not returned.");
            setMetrics(response.data); setLoadedAt(new Date());
        } catch (loadError) { setError(getError(loadError)); setMetrics(null); }
        finally { setLoading(false); }
    }, [advertisementId, from, to]);
    // Schedule the initial/date-filter refresh asynchronously. The timer is
    // cleaned up when the filters change or the component unmounts.
    useEffect(() => {
        const timer = window.setTimeout(() => {
            void load();
        }, 0);
        return () => window.clearTimeout(timer);
    }, [load]);

    return <section className="space-y-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex items-center gap-2 text-green-700"><Activity size={18} /><span className="text-sm font-semibold">Performance analytics</span></div><h2 className="mt-1 text-lg font-semibold text-gray-900">Tracking metrics</h2><p className="mt-1 text-sm text-gray-600">Impressions, clicks, unique visitors, click-through rate, and daily performance returned by the protected tracking metrics API.</p></div><button type="button" onClick={() => void load()} disabled={loading} className="inline-flex min-h-9 items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"><RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh metrics</button></header>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"><label className="block text-sm font-medium text-gray-700">From<input type="date" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600" /></label><label className="block text-sm font-medium text-gray-700">To<input type="date" value={to} min={from || undefined} max={todayIso()} onChange={(e) => setTo(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600" /></label><button type="button" onClick={() => { setFrom(daysAgoIso(29)); setTo(todayIso()); }} className="min-h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">Last 30 days</button></div>
        {error && <div role="alert" className="flex gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"><AlertCircle size={17} className="shrink-0" />{error}</div>}
        {loading ? <div className="py-12 text-center text-sm text-gray-500">Loading tracking metrics…</div> : metrics && <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5"><Metric icon={<Eye size={18} />} label="Impressions" value={number(metrics.totals?.impressions)} /><Metric icon={<MousePointerClick size={18} />} label="Clicks" value={number(metrics.totals?.clicks)} /><Metric icon={<Users size={18} />} label="Unique impression visitors" value={number(metrics.totals?.uniqueImpressionVisitors)} /><Metric icon={<Users size={18} />} label="Unique click visitors" value={number(metrics.totals?.uniqueClickVisitors)} /><Metric icon={<BarChart3 size={18} />} label="Click-through rate" value={percentage(metrics.totals?.clickThroughRate)} /></div>
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-3"><div className="overflow-hidden rounded-lg border border-gray-200 xl:col-span-2"><div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3"><h3 className="text-sm font-semibold text-gray-900">Daily performance</h3><span className="text-xs text-gray-500">{metrics.daily?.length ?? 0} days with data</span></div>{!metrics.daily?.length ? <p className="p-6 text-sm text-gray-500">No daily tracking events were returned for this period.</p> : <div className="max-h-[420px] overflow-auto"><table className="min-w-full divide-y divide-gray-100 text-sm"><thead className="sticky top-0 bg-white text-xs uppercase text-gray-500"><tr><th className="px-4 py-2 text-left">Date</th><th className="px-4 py-2 text-right">Impressions</th><th className="px-4 py-2 text-right">Clicks</th><th className="px-4 py-2 text-right">CTR</th></tr></thead><tbody className="divide-y divide-gray-100">{metrics.daily.map((row) => <tr key={row.date}><td className="px-4 py-3 font-medium text-gray-800">{new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(`${row.date}T00:00:00Z`))}</td><td className="px-4 py-3 text-right tabular-nums">{number(row.impressions)}</td><td className="px-4 py-3 text-right tabular-nums">{number(row.clicks)}</td><td className="px-4 py-3 text-right tabular-nums">{percentage(row.clickThroughRate)}</td></tr>)}</tbody></table></div>}</div>
                <div className="space-y-5"><MetricBreakdown title="By placement" rows={(metrics.placements ?? []).map((r) => ({ key: String(r.placementId), label: `Placement #${r.placementId}`, impressions: r.impressions, clicks: r.clicks, ctr: r.clickThroughRate }))} /><MetricBreakdown title="By creative" rows={(metrics.creatives ?? []).map((r) => ({ key: String(r.creativeId), label: `Creative #${r.creativeId}`, impressions: r.impressions, clicks: r.clicks, ctr: r.clickThroughRate }))} /></div></div>
            {loadedAt && <p className="text-right text-xs text-gray-500">Updated {formatIstDateTime(loadedAt)}. Metrics reflect events stored by the tracking service.</p>}
        </>}
        {!loading && !error && !metrics && <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">Tracking metrics are not available for this advertisement.</div>}
    </section>;
};
const Metric = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
    <div className="flex min-w-0 flex-col rounded-lg border border-gray-200 p-4">
        <div className="flex min-h-14 items-center justify-center gap-2 text-center text-green-700">
            <span className="shrink-0" aria-hidden="true">{icon}</span>
            <span className="text-xs font-medium leading-4 text-gray-500">{label}</span>
        </div>
        <p className="mt-3 w-full text-center text-2xl font-bold tabular-nums text-gray-900">{value}</p>
    </div>
);
const MetricBreakdown = ({ title, rows }: { title: string; rows: { key: string; label: string; impressions: number; clicks: number; ctr: number }[] }) => <div className="overflow-hidden rounded-lg border border-gray-200"><h3 className="border-b border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900">{title}</h3>{!rows.length ? <p className="p-4 text-sm text-gray-500">No data available.</p> : <ul className="divide-y divide-gray-100">{rows.map((row) => <li key={row.key} className="px-4 py-3"><p className="text-sm font-medium text-gray-800">{row.label}</p><p className="mt-1 text-xs text-gray-500">{number(row.impressions)} impressions · {number(row.clicks)} clicks · {percentage(row.ctr)} CTR</p></li>)}</ul>}</div>;
export default WorkspaceTracking;
