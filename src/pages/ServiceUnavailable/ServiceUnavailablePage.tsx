/**
 * Project: thenewstime.in
 * Description: Public maintenance and service unavailable page.
 */

import { useState } from "react";
import { Clock3, RefreshCw, Wrench } from "lucide-react";

interface ServiceUnavailablePageProps {
    message?: string | null;
    expectedRestorationAt?: string | null;
}

const DEFAULT_MAINTENANCE_MESSAGE =
    "எங்கள் இணையதளத்தில் பராமரிப்புப் பணிகள் நடைபெற்று வருகின்றன. சிறிது நேரம் கழித்து மீண்டும் முயற்சிக்கவும்.";

const AVAILABILITY_URL = `${String(
    import.meta.env.VITE_API_BASE_URL ?? "/api/v1"
).replace(/\/$/, "")}/system/public-availability`;

export default function ServiceUnavailablePage({
    message,
    expectedRestorationAt,
}: ServiceUnavailablePageProps) {
    const [isChecking, setIsChecking] = useState(false);
    const [retryError, setRetryError] = useState<string | null>(null);

    const displayMessage = message?.trim() || DEFAULT_MAINTENANCE_MESSAGE;
    const restorationDate = expectedRestorationAt ? new Date(expectedRestorationAt) : null;
    const formattedRestoration = restorationDate && !Number.isNaN(restorationDate.getTime())
        ? new Intl.DateTimeFormat("ta-IN", {
            timeZone: "Asia/Kolkata",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        }).format(restorationDate)
        : null;

    const handleRetry = async () => {
        if (isChecking) return;

        setIsChecking(true);
        setRetryError(null);

        try {
            const response = await fetch(AVAILABILITY_URL, {
                method: "GET",
                cache: "no-store",
                credentials: "omit",
                headers: {
                    Accept: "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Service is unavailable");
            }

            const result: unknown = await response.json();

            if (
                typeof result !== "object" ||
                result === null ||
                !("maintenance" in result) ||
                result.maintenance !== false
            ) {
                setRetryError(
                    "பராமரிப்புப் பணிகள் இன்னும் நடைபெற்று வருகின்றன. சிறிது நேரம் கழித்து மீண்டும் முயற்சிக்கவும்."
                );
                return;
            }

            // Full navigation resets the public maintenance gate's cached state.
            window.location.replace("/");
        } catch {
            setRetryError(
                "சேவையை தற்போது அணுக முடியவில்லை. சிறிது நேரம் கழித்து மீண்டும் முயற்சிக்கவும்."
            );
        } finally {
            setIsChecking(false);
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
            <section
                role="alert"
                aria-live="polite"
                className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white px-6 py-8 text-center shadow-sm sm:px-10"
            >
                <Wrench
                    className="mx-auto mb-5 h-7 w-7 text-[#008236]"
                    aria-hidden="true"
                />

                <h1 className="mb-3 text-xl font-bold text-slate-950 sm:text-2xl">
                    தற்காலிக பராமரிப்பு நடைபெறுகிறது
                </h1>

                <p className="mx-auto mb-5 max-w-2xl whitespace-pre-line text-base leading-relaxed text-slate-600">
                    {displayMessage}
                </p>

                {formattedRestoration && (
                    <div className="mx-auto mb-6 flex max-w-xl flex-col items-center gap-2 text-slate-700">
                        <div className="flex items-center gap-2 text-sm font-semibold">
                            <Clock3 className="h-4 w-4 text-[#008236]" aria-hidden="true" />
                            <span>எதிர்பார்க்கப்படும் சேவை தொடக்க நேரம்</span>
                        </div>
                        <p className="text-sm font-medium">{formattedRestoration} (இந்திய நேரம்)</p>
                    </div>
                )}

                <button
                    type="button"
                    onClick={() => void handleRetry()}
                    disabled={isChecking}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#008236] px-5 py-3 font-semibold text-white transition-colors hover:bg-[#006d2d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#008236] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <RefreshCw
                        className={`h-4 w-4 ${isChecking ? "animate-spin" : ""}`}
                        aria-hidden="true"
                    />

                    {isChecking
                        ? "சரிபார்க்கப்படுகிறது..."
                        : "மீண்டும் முயற்சிக்கவும்"}
                </button>

                {retryError && (
                    <p
                        role="status"
                        className="mx-auto mt-4 max-w-xl text-sm text-slate-600"
                    >
                        {retryError}
                    </p>
                )}
            </section>
        </main>
    );
}
