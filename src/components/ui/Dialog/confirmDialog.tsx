import { useState } from "react";
import { createRoot } from "react-dom/client";

/** Promise-based, accessible replacement for browser confirm/prompt. */
function showDialog(message: string, requireReason: boolean): Promise<string | boolean | null> {
    return new Promise((resolve) => {
        const host = document.createElement("div");
        document.body.appendChild(host);
        const root = createRoot(host);
        let settled = false;
        const close = (value: string | boolean | null) => {
            if (settled) return;
            settled = true;
            queueMicrotask(() => { root.unmount(); host.remove(); });
            resolve(value);
        };
        function Dialog() {
            const [reason, setReason] = useState("");
            return (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4" role="presentation">
                    <div role="dialog" aria-modal="true" aria-labelledby="confirmation-title" className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-900" onKeyDown={(e) => { if (e.key === "Escape") close(requireReason ? null : false); }}>
                        <h2 id="confirmation-title" className="text-lg font-semibold">{requireReason ? "Reason required" : "Please confirm"}</h2>
                        <p className="my-4 whitespace-pre-wrap text-sm">{message}</p>
                        {requireReason && <textarea autoFocus aria-label="Reason" value={reason} onChange={(e) => setReason(e.target.value)} className="mb-4 w-full rounded-md border p-2 text-gray-900" rows={3} />}
                        <div className="flex justify-end gap-3">
                            <button type="button" autoFocus={!requireReason} className="rounded-md border px-4 py-2" onClick={() => close(requireReason ? null : false)}>Cancel</button>
                            <button type="button" disabled={requireReason && !reason.trim()} className="rounded-md bg-green-700 px-4 py-2 text-white disabled:opacity-50" onClick={() => close(requireReason ? reason.trim() : true)}>Confirm</button>
                        </div>
                    </div>
                </div>
            );
        }
        root.render(<Dialog />);
    });
}
export async function confirmDialog(message: string): Promise<boolean> {
    return (await showDialog(message, false)) === true;
}
export async function reasonDialog(message: string): Promise<string | null> {
    const result = await showDialog(message, true);
    return typeof result === "string" ? result : null;
}
