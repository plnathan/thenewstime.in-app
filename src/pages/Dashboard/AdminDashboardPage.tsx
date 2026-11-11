import { useEffect, useRef, useState } from "react";
import {
    Activity, Archive, BadgeCheck, BarChart3, CalendarDays, CheckCircle2,
    CirclePause, Clock3, FileCheck2, FileClock, FilePenLine, FileText,
    KeyRound, Layers3, Megaphone, RefreshCw, Send, Shield, ShieldCheck,
    TrendingUp, UserCheck, UserRound, Users, WalletCards, X,
    type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import { getDashboardMetrics, type DashboardMetric, type DashboardModule } from "@/api/dashboard.api";
import MainLayout from "@/layouts/MainLayout";

const modules: ReadonlyArray<{
    id: DashboardModule;
    title: string;
    permission: string;
    icon: LucideIcon;
    description: string;
}> = [
        { id: "news", title: "News", permission: "news.read", icon: FileText, description: "Articles and publishing activity" },
        { id: "advertisements", title: "Advertisements", permission: "advertisements.read", icon: Megaphone, description: "Campaigns and delivery performance" },
        { id: "users", title: "Users", permission: "users.read", icon: Users, description: "Accounts and user activity" },
        { id: "roles", title: "Roles", permission: "roles.read", icon: Shield, description: "Roles and assignments" },
        { id: "permissions", title: "Permissions", permission: "permissions.read", icon: KeyRound, description: "Access and authorization" },
    ];

const firstDashboardYear = 2026;
const currentDashboardYear = new Date().getFullYear();
const years = Array.from(
    { length: Math.max(1, currentDashboardYear - firstDashboardYear + 1) },
    (_, index) => firstDashboardYear + index,
);
const months = Array.from({ length: 12 }, (_, index) => ({
    value: index + 1,
    label: new Intl.DateTimeFormat("en", { month: "long", timeZone: "UTC" }).format(new Date(Date.UTC(2024, index, 1))),
}));

const palettes = [
    { border: "border-emerald-200", background: "bg-emerald-50/70", iconBackground: "bg-emerald-100", iconColor: "text-emerald-700", count: "text-emerald-900" },
    { border: "border-sky-200", background: "bg-sky-50/70", iconBackground: "bg-sky-100", iconColor: "text-sky-700", count: "text-sky-900" },
    { border: "border-violet-200", background: "bg-violet-50/70", iconBackground: "bg-violet-100", iconColor: "text-violet-700", count: "text-violet-900" },
    { border: "border-amber-200", background: "bg-amber-50/70", iconBackground: "bg-amber-100", iconColor: "text-amber-700", count: "text-amber-900" },
    { border: "border-teal-200", background: "bg-teal-50/70", iconBackground: "bg-teal-100", iconColor: "text-teal-700", count: "text-teal-900" },
    { border: "border-rose-200", background: "bg-rose-50/70", iconBackground: "bg-rose-100", iconColor: "text-rose-700", count: "text-rose-900" },
] as const;

function metricIcon(metric: DashboardMetric, module: DashboardModule): LucideIcon {
    const name = `${metric.key} ${metric.label}`.toLowerCase();
    if (/de.activat|archiv|deleted|delet/.test(name)) return Archive;
    if (/promot/.test(name)) return TrendingUp;
    if (/hold|reject/.test(name)) return CirclePause;
    if (/paus|stop/.test(name)) return CirclePause;
    if (/activat|live|running/.test(name)) return Activity;
    if (/complet|finish|expir/.test(name)) return CheckCircle2;
    if (/approv/.test(name) && /pend|await/.test(name)) return FileClock;
    if (/approv/.test(name)) return BadgeCheck;
    if (/draft/.test(name)) return FilePenLine;
    if (/submit/.test(name)) return Send;
    if (/pend|waiting|review/.test(name)) return Clock3;
    if (/payment|revenue|amount|financial|balance|credit|refund/.test(name)) return WalletCards;
    if (/publish/.test(name)) return FileCheck2;
    if (/permission|access/.test(name)) return KeyRound;
    if (/role/.test(name)) return ShieldCheck;
    if (/user|account/.test(name)) return UserRound;
    if (/assign|member/.test(name)) return UserCheck;
    if (/schedule|month|year/.test(name)) return CalendarDays;
    if (/total|overall|all/.test(name)) return Layers3;
    if (/trend|growth/.test(name)) return TrendingUp;
    if (module === "advertisements") return Megaphone;
    if (module === "news") return FileText;
    if (module === "users") return Users;
    if (module === "roles") return Shield;
    if (module === "permissions") return KeyRound;
    return BarChart3;
}

function AnimatedCount({ value }: { value: number | null }) {
    const [display, setDisplay] = useState(0);
    useEffect(() => {
        if (value === null) return;
        const target = Math.max(0, value);
        const duration = 750;
        let frame = 0;
        let start: number | null = null;
        const tick = (timestamp: number) => {
            if (start === null) start = timestamp;
            const progress = Math.min(1, (timestamp - start) / duration);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(Math.round(target * eased));
            if (progress < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [value]);
    if (value === null) return <>N/A</>;
    return <>{display.toLocaleString("en-IN")}</>;
}

function MetricCards({ items, module }: { items: DashboardMetric[]; module: DashboardModule }) {
    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((metric, index) => {
                const Icon = metricIcon(metric, module);
                const palette = palettes[index % palettes.length];
                return (
                    <article
                        key={metric.key}
                        className={`group flex min-h-36 flex-col rounded-xl border p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${palette.border} ${palette.background}`}
                    >
                        <div className="flex items-start justify-between gap-3">
                            <p className="min-w-0 text-sm font-semibold leading-5 text-gray-700">{metric.label}</p>
                            <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110 ${palette.iconBackground} ${palette.iconColor}`}>
                                <Icon size={20} aria-hidden="true" />
                            </span>
                        </div>
                        <div className="flex flex-1 items-center justify-center py-3">
                            <p
                                className={`text-center text-3xl font-bold tabular-nums tracking-tight ${metric.value === null ? "text-gray-500" : palette.count}`}
                                title={metric.value === null ? "This metric cannot yet be calculated reliably" : undefined}
                            >
                                <AnimatedCount key={`${metric.key}-${metric.value}`} value={metric.value} />
                            </p>
                        </div>
                    </article>
                );
            })}
        </div>
    );
}

export default function AdminDashboardPage() {
    const { hasPermissionCode, hasRole } = useAuth();
    const [selected, setSelected] = useState<DashboardModule | null>(null);
    const [month, setMonth] = useState<number | null>(null);
    const [year, setYear] = useState<number | null>(null);
    const [metrics, setMetrics] = useState<DashboardMetric[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const requestId = useRef(0);

    const visible = modules.filter(item => hasRole("SUPER_ADMIN") || hasPermissionCode(item.permission));
    const selectedModule = modules.find(item => item.id === selected);

    const load = async (module: DashboardModule, nextMonth: number | null, nextYear: number | null): Promise<void> => {
        const request = ++requestId.current;
        setLoading(true);
        setError(null);
        try {
            const result = await getDashboardMetrics(module, nextMonth, nextYear);
            if (request === requestId.current) setMetrics(result);
        } catch (caught) {
            if (request === requestId.current) {
                setError(caught instanceof Error ? caught.message : "Unable to load dashboard metrics");
            }
        } finally {
            if (request === requestId.current) setLoading(false);
        }
    };

    const open = (module: DashboardModule) => {
        setSelected(module);
        setMetrics([]);
        void load(module, month, year);
    };
    const close = () => {
        requestId.current += 1;
        setSelected(null);
        setMetrics([]);
        setLoading(false);
        setError(null);
    };
    const changePeriod = (nextMonth: number | null, nextYear: number | null) => {
        setMonth(nextMonth);
        setYear(nextYear);
        if (selected) void load(selected, nextMonth, nextYear);
    };

    const isTotal = (metric: DashboardMetric) => /^(total|overall)\b/i.test(metric.label.trim());
    const classified = selected === "advertisements" || selected === "news";
    const advertisementOverallOrder = [
        "total advertisements",
        "overall drafted",
        "overall submitted",
        "overall approved",
        "overall activated",
    ] as const;
    const totals = classified ? metrics.filter(isTotal) : [];
    const orderedTotals = selected === "advertisements"
        ? [...totals].sort((a, b) => {
            const normalize = (value: string) => value.trim().toLowerCase().replace(/\s+/g, " ");
            const position = (metric: DashboardMetric) => {
                const label = normalize(metric.label);
                const index = advertisementOverallOrder.findIndex(item => item === label);
                return index === -1 ? advertisementOverallOrder.length : index;
            };
            return position(a) - position(b);
        })
        : totals;
    const remaining = classified ? metrics.filter(metric => !isTotal(metric)) : metrics;
    const orderedRemaining = selected === "advertisements"
        ? [...remaining].sort((a, b) => {
            const rank = (metric: DashboardMetric) => {
                if (metric.key.toLowerCase() === "stopped") return 0;
                if (metric.key.toLowerCase() === "archived") return 1;
                return -1;
            };
            const aRank = rank(a);
            const bRank = rank(b);
            if (aRank === -1 && bRank === -1) return 0;
            if (aRank === -1) return -1;
            if (bRank === -1) return 1;
            return aRank - bRank;
        })
        : remaining;
    const SelectedIcon = selectedModule?.icon;

    return (
        <MainLayout>
            <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
                <header className="admin-unified-header">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Administration Dashboard</h1>
                        <p className="mt-2 text-sm text-green-50">Select a module to view authorized statistics.</p>
                    </div>
                </header>
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {visible.map(item => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => open(item.id)}
                            className="group flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-green-400 hover:bg-green-50/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600"
                        >
                            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-700 transition-colors group-hover:bg-green-200">
                                <item.icon size={23} aria-hidden="true" />
                            </span>
                            <span className="min-w-0">
                                <span className="block font-semibold text-gray-900">{item.title}</span>
                                <span className="mt-1 block text-xs leading-5 text-gray-500">{item.description}</span>
                            </span>
                        </button>
                    ))}
                </div>

                {selected && selectedModule && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-[2px] sm:p-5"
                        role="presentation"
                        onMouseDown={event => { if (event.target === event.currentTarget) close(); }}
                    >
                        <section
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="dashboard-modal-title"
                            aria-describedby="dashboard-modal-description"
                            className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-green-100 bg-white shadow-2xl"
                        >
                            <header className="shrink-0 border-b border-green-200 bg-gradient-to-r from-green-50 via-emerald-50 to-white px-5 py-5 sm:px-7">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-700 text-white shadow-sm">
                                            {SelectedIcon && <SelectedIcon size={24} aria-hidden="true" />}
                                        </span>
                                        <div className="min-w-0">
                                            <h2 id="dashboard-modal-title" className="text-xl font-bold text-green-900 sm:text-2xl">{selectedModule.title} Dashboard</h2>
                                            <p id="dashboard-modal-description" className="mt-1 text-sm font-medium text-green-700">{selectedModule.description} · Overview and Insights</p>
                                        </div>
                                    </div>
                                    <button type="button" onClick={close} aria-label="Close dashboard" className="rounded-lg border border-green-200 bg-white p-2 text-green-800 transition hover:bg-green-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600">
                                        <X size={19} />
                                    </button>
                                </div>
                            </header>

                            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7">
                                <div className="flex flex-wrap items-end gap-3 rounded-xl border border-green-100 bg-green-50/50 p-3 sm:p-4">
                                    <label className="flex flex-col gap-1 text-xs font-semibold text-green-900">
                                        Month
                                        <select className="min-w-32 rounded-lg border border-green-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 outline-none focus:ring-2 focus:ring-green-600" value={month ?? ""} onChange={event => changePeriod(event.target.value ? Number(event.target.value) : null, year)}>
                                            <option value="">All months</option>
                                            {months.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
                                        </select>
                                    </label>
                                    <label className="flex flex-col gap-1 text-xs font-semibold text-green-900">
                                        Year
                                        <select className="min-w-28 rounded-lg border border-green-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 outline-none focus:ring-2 focus:ring-green-600" value={year ?? ""} onChange={event => changePeriod(month, event.target.value ? Number(event.target.value) : null)}>
                                            <option value="">All years</option>
                                            {years.map(value => <option key={value} value={value}>{value}</option>)}
                                        </select>
                                    </label>
                                    <button type="button" onClick={() => void load(selected, month, year)} disabled={loading} className="ml-auto inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-green-600 bg-white px-4 py-2 text-sm font-semibold text-green-800 transition hover:bg-green-100 disabled:cursor-wait disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600">
                                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} aria-hidden="true" /> Refresh
                                    </button>
                                </div>

                                {loading && <div className="mt-6 rounded-xl border border-green-100 bg-green-50 p-5 text-sm font-medium text-green-800" role="status">Loading dashboard metrics…</div>}
                                {error && <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800" role="alert">{error}</div>}
                                {!loading && !error && (
                                    <div className="mt-6 space-y-6">
                                        {totals.length > 0 && (
                                            <section aria-label="Totals and overall metrics">
                                                <div className="mb-3 flex items-center gap-2 text-green-900"><Layers3 size={18} aria-hidden="true" /><h3 className="text-base font-bold">Totals &amp; Overall</h3></div>
                                                <MetricCards items={orderedTotals} module={selected} />
                                            </section>
                                        )}
                                        {totals.length > 0 && remaining.length > 0 && <hr className="border-t-2 border-green-100" />}
                                        {remaining.length > 0 && (
                                            <section aria-label={totals.length ? "Current and other metrics" : "Dashboard metrics"}>
                                                <div className="mb-3 flex items-center gap-2 text-green-900"><BarChart3 size={18} aria-hidden="true" /><h3 className="text-base font-bold">{totals.length ? "Other Metrics" : "Metrics Overview"}</h3></div>
                                                <MetricCards items={orderedRemaining} module={selected} />
                                            </section>
                                        )}
                                        {metrics.length === 0 && <p className="rounded-xl border border-gray-200 bg-gray-50 p-5 text-center text-sm text-gray-600">No dashboard metrics available for the selected period.</p>}
                                    </div>
                                )}
                                <p className="mt-6 text-xs leading-5 text-gray-500">For News and Advertisements, Month/Year selects the creation-period cohort. Overall cards count lifecycle milestones for that cohort, while other cards show current statuses. Unavailable historical evidence may still limit deleted or promotion counts.</p>
                            </div>

                            <footer className="flex shrink-0 justify-end border-t border-green-100 bg-green-50/60 px-5 py-3 sm:px-7">
                                <button type="button" onClick={close} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-green-700 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-green-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2">
                                    <X size={17} aria-hidden="true" /> Close
                                </button>
                            </footer>
                        </section>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
