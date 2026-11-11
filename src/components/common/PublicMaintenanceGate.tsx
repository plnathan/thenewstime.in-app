import { useEffect, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import ServiceUnavailablePage from "@/pages/ServiceUnavailable/ServiceUnavailablePage";

type Availability = "available" | "maintenance" | "unreachable";
type CheckResult = { path: string; availability: Availability; message?: string; expectedRestorationAt?: string | null };

/**
 * Blocks public page rendering until the server has confirmed availability.
 * Admin routes stay accessible so operators can restore the service.
 */
export default function PublicMaintenanceGate({ children }: { children: ReactNode }) {
    const { pathname } = useLocation();
    const isPublic = !pathname.startsWith("/admin") && pathname !== "/service-unavailable";
    const [result, setResult] = useState<CheckResult | null>(null);

    useEffect(() => {
        if (!isPublic) return;

        const controller = new AbortController();
        const base = String(import.meta.env.VITE_API_BASE_URL ?? "/api/v1").replace(/\/$/, "");
        const url = `${base}/system/public-availability`;

        const check = async () => {
            try {
                const response = await fetch(url, {
                    method: "GET",
                    cache: "no-store",
                    credentials: "omit",
                    signal: controller.signal,
                    headers: { Accept: "application/json" },
                });
                if (!response.ok) {
                    if (!controller.signal.aborted) setResult({ path: pathname, availability: "unreachable" });
                    return;
                }
                const data: { maintenance?: boolean; message?: string; expectedRestorationAt?: string | null } = await response.json();
                if (!controller.signal.aborted) {
                    setResult({ path: pathname, availability: data.maintenance === false ? "available" : "maintenance", message: data.message, expectedRestorationAt: data.expectedRestorationAt });
                }
            } catch {
                if (!controller.signal.aborted) setResult({ path: pathname, availability: "unreachable" });
            }
        };

        void check();
        return () => controller.abort();
    }, [isPublic, pathname]);

    if (!isPublic) return <>{children}</>;
    // Never mount the public route while its availability is unknown.
    if (!result || result.path !== pathname) {
        return <main className="min-h-screen bg-slate-50" aria-label="Checking website availability" />;
    }
    if (result.availability !== "available") return <ServiceUnavailablePage message={result.message} expectedRestorationAt={result.expectedRestorationAt} />;
    return <>{children}</>;
}
