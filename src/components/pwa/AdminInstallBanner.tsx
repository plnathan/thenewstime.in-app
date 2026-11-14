import { ADMIN_INSTALL_EVENT } from "./installBannerEvents";
import { useEffect, useState } from "react";
import { Download, ShieldCheck, Share2, X } from "lucide-react";

type InstallPromptEvent = Event & {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};
type Platform = "android" | "ios" | null;

const DISMISS_KEY = "tnt-admin-install-dismissed-v1";
const SNOOZE_KEY = "tnt-admin-install-snooze-until-v1";
const SNOOZE_MS = 7 * 24 * 60 * 60 * 1000;

function platform(): Platform {
    const ua = navigator.userAgent;
    if (/iPhone|iPad|iPod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) return "ios";
    if (/Android/i.test(ua)) return "android";
    return null;
}

function installed(): boolean {
    return window.matchMedia("(display-mode: standalone)").matches ||
        (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

function suppressed(): boolean {
    try {
        if (localStorage.getItem(DISMISS_KEY) === "true") return true;
        const until = Number(localStorage.getItem(SNOOZE_KEY) || "0");
        return Number.isFinite(until) && Date.now() < until;
    } catch {
        return false;
    }
}

export default function AdminInstallBanner() {
    const [device, setDevice] = useState<Platform>(null);
    const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(null);
    const [visible, setVisible] = useState(false);
    const [instructions, setInstructions] = useState(false);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        const openManually = () => {
            setInstructions(false);
            setVisible(true);
        };
        window.addEventListener(ADMIN_INSTALL_EVENT, openManually);
        return () => window.removeEventListener(ADMIN_INSTALL_EVENT, openManually);
    }, []);

    useEffect(() => {
        const detected = platform();
        if (installed()) return;
        const onPrompt = (event: Event) => {
            event.preventDefault();
            setPromptEvent(event as InstallPromptEvent);
        };
        const onInstalled = () => {
            setVisible(false);
            setPromptEvent(null);
        };
        window.addEventListener("beforeinstallprompt", onPrompt);
        window.addEventListener("appinstalled", onInstalled);
        const timeout = window.setTimeout(() => {
            setDevice(detected);
            if (detected && !suppressed() && !installed()) setVisible(true);
        }, 1800);
        return () => {
            window.clearTimeout(timeout);
            window.removeEventListener("beforeinstallprompt", onPrompt);
            window.removeEventListener("appinstalled", onInstalled);
        };
    }, []);

    const dismiss = () => {
        try { localStorage.setItem(DISMISS_KEY, "true"); } catch { /* blocked storage */ }
        setVisible(false);
    };
    const later = () => {
        try { localStorage.setItem(SNOOZE_KEY, String(Date.now() + SNOOZE_MS)); } catch { /* blocked storage */ }
        setVisible(false);
    };
    const accept = async () => {
        if (device === "ios" || !promptEvent) {
            setInstructions(true);
            return;
        }
        setBusy(true);
        try {
            await promptEvent.prompt();
            const result = await promptEvent.userChoice;
            setPromptEvent(null);
            if (result.outcome === "accepted") setVisible(false);
            else later();
        } catch {
            setInstructions(true);
        } finally {
            setBusy(false);
        }
    };

    if (!visible) return null;

    return (
        <div role="dialog" aria-label="The News Time Admin installation" aria-modal="false" className="fixed inset-x-3 bottom-4 z-[100] mx-auto max-w-md rounded-xl border border-green-200 bg-white p-4 shadow-2xl sm:bottom-6">
            <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-700" aria-hidden="true"><ShieldCheck size={23} /></div>
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900">The News Time Admin</p>
                    <p className="mt-1 text-sm leading-6 text-gray-700">நிர்வாகப் பயன்பாட்டை உங்கள் மொபைலில் நிறுவ விரும்புகிறீர்களா?</p>
                </div>
                <button type="button" aria-label="மூடுக" onClick={later} className="rounded-md p-1 text-gray-500 hover:bg-gray-100"><X size={18} /></button>
            </div>
            {instructions && (
                <div className="mt-3 rounded-lg bg-green-50 p-3 text-sm leading-6 text-gray-800">
                    {device === "ios" ? (
                        <p><Share2 size={16} className="mr-1 inline" aria-hidden="true" />Safari-யில் <strong>Share</strong> → <strong>Add to Home Screen</strong> → <strong>Add</strong> என்பதைத் தேர்ந்தெடுக்கவும். நிறுவுவதற்கு முன் /admin/login பக்கத்தைத் திறந்திருக்கவும்.</p>
                    ) : (
                        <p><Download size={16} className="mr-1 inline" aria-hidden="true" />Chrome மெனுவில் <strong>Install app</strong> அல்லது <strong>Add to Home screen</strong> என்பதைத் தேர்ந்தெடுக்கவும். உலாவி நிறுவல் வசதி வழங்காதபோது shortcut உருவாக்கலாம்.</p>
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
