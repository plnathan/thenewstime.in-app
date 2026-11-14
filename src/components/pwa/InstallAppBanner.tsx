import { useEffect, useState } from "react";
import { Download, Share2, X } from "lucide-react";

type InstallPromptEvent = Event & {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

type Platform = "android" | "ios" | null;
const DISMISS_KEY = "tnt-install-banner-dismissed-v1";
const SNOOZE_KEY = "tnt-install-banner-snooze-until-v1";
const SNOOZE_DAYS = 7;

function getPlatform(): Platform {
    const ua = navigator.userAgent;
    if (/iPad|iPhone|iPod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) return "ios";
    if (/Android/i.test(ua)) return "android";
    return null;
}

function isInstalled(): boolean {
    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    const iosStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true;
    return standalone || iosStandalone;
}

function isSuppressed(): boolean {
    try {
        if (localStorage.getItem(DISMISS_KEY) === "true") return true;
        const until = Number(localStorage.getItem(SNOOZE_KEY) || 0);
        return Number.isFinite(until) && Date.now() < until;
    } catch {
        return false;
    }
}

export default function InstallAppBanner() {
    const [platform, setPlatform] = useState<Platform>(null);
    const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(null);
    const [visible, setVisible] = useState(false);
    const [instructions, setInstructions] = useState(false);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        const detected = getPlatform();
        if (!detected || isInstalled() || isSuppressed()) return;
        const onBeforeInstallPrompt = (event: Event) => {
            event.preventDefault();
            setPromptEvent(event as InstallPromptEvent);
            if (!isSuppressed() && !isInstalled()) setVisible(true);
        };
        const onInstalled = () => {
            setVisible(false);
            setPromptEvent(null);
        };
        window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
        window.addEventListener("appinstalled", onInstalled);
        // Show a non-intrusive invitation on both Android and iOS.
        // Android browsers may never dispatch beforeinstallprompt; in that case,
        // the OK action shows manual installation instructions.
        const timer = window.setTimeout(() => {
            setPlatform(detected);
            if (!isSuppressed() && !isInstalled()) setVisible(true);
        }, 1800);
        return () => {
            window.clearTimeout(timer);
            window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
            window.removeEventListener("appinstalled", onInstalled);
        };
    }, []);

    if (!visible) return null;

    const dismiss = () => {
        try { localStorage.setItem(DISMISS_KEY, "true"); } catch { /* storage may be disabled */ }
        setVisible(false);
    };
    const later = () => {
        try { localStorage.setItem(SNOOZE_KEY, String(Date.now() + SNOOZE_DAYS * 86400000)); } catch { /* storage may be disabled */ }
        setVisible(false);
    };
    const accept = async () => {
        if (platform === "ios" || !promptEvent) {
            setInstructions(true);
            return;
        }
        setBusy(true);
        try {
            await promptEvent.prompt();
            const result = await promptEvent.userChoice;
            setPromptEvent(null);
            if (result.outcome === "accepted") {
                setVisible(false);
            } else {
                later();
            }
        } catch {
            setInstructions(true);
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="fixed inset-x-3 bottom-4 z-[90] mx-auto max-w-md rounded-xl border border-green-200 bg-white p-4 shadow-2xl sm:bottom-6" role="dialog" aria-label="The News Time installation" aria-modal="false">
            <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-700" aria-hidden="true"><Download size={23} /></div>
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900">The News Time</p>
                    <p className="mt-1 text-sm leading-6 text-gray-700">உங்கள் மொபைலில் The News Time செய்திகளை எளிதாகப் படிக்க வேண்டுமா?</p>
                </div>
                <button type="button" aria-label="மூடுக" onClick={later} className="rounded-md p-1 text-gray-500 hover:bg-gray-100"><X size={18} /></button>
            </div>
            {instructions && (
                <div className="mt-3 rounded-lg bg-green-50 p-3 text-sm leading-6 text-gray-800">
                    {platform === "ios" ? (
                        <p><Share2 size={16} className="mr-1 inline" aria-hidden="true" />Safari-யில் பகிர் (Share) பொத்தானைத் தேர்ந்தெடுத்து, <strong>Add to Home Screen</strong> என்பதை அழுத்தி, பின்னர் <strong>Add</strong> என்பதைத் தேர்ந்தெடுக்கவும்.</p>
                    ) : (
                        <p>Chrome மெனுவில் <strong>Install app</strong> அல்லது <strong>Add to Home screen</strong> என்பதைத் தேர்ந்தெடுக்கவும்.</p>
                    )}
                </div>
            )}
            <div className="mt-4 flex flex-wrap justify-end gap-2">
                <button type="button" onClick={dismiss} className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">வேண்டாம்</button>
                <button type="button" onClick={later} className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">பிறகு</button>
                <button type="button" onClick={() => { void accept(); }} disabled={busy} className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-60">சரி</button>
            </div>
        </div>
    );
}
