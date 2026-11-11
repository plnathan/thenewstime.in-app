import type { ReactNode } from "react";

export function SecurityStatCards({ items }: { items: Array<{ label: string; value: number }> }) {
    return <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{items.map(({ label, value }) => (
        <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-500">{label}</p><p className="mt-1 text-2xl font-bold tabular-nums text-gray-900">{value}</p>
        </div>
    ))}</div>;
}

export function SecurityListFilters({ search, onSearch, status, onStatus, statuses, extra, placeholder = "Search records..." }: {
    search: string; onSearch: (value: string) => void; status: string; onStatus: (value: string) => void;
    statuses: string[]; extra?: ReactNode; placeholder?: string;
}) {
    return <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <label className="min-w-[220px] flex-1 text-xs font-semibold text-gray-600">Search
            <input type="search" value={search} onChange={e => onSearch(e.target.value)} placeholder={placeholder}
                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-normal text-gray-900 focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600" />
        </label>
        <label className="min-w-[150px] text-xs font-semibold text-gray-600">Status
            <select value={status} onChange={e => onStatus(e.target.value)} className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-normal text-gray-900">
                <option value="ALL">All statuses</option>{statuses.map(item => <option key={item} value={item}>{item}</option>)}
            </select>
        </label>
        {extra}
        <button type="button" onClick={() => { onSearch(""); onStatus("ALL"); }} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Clear filters</button>
    </div>;
}
