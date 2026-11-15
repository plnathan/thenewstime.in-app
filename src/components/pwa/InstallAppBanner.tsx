import { PUBLIC_INSTALL_EVENT } from "./installBannerEvents";
import { useEffect, useState } from "react";
import { Download, Share2, X } from "lucide-react";

type InstallPromptEvent = Event & {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

type Platform = "android" | "ios" | null;
const DISMISS_KEY = "tnt-install-banner-dismissed-v1";

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
        return false;
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
    const [alreadyInstalled, setAlreadyInstalled] = useState(false);

    useEffect(() => {
        const openManually = () => {
            setInstructions(false);
            setAlreadyInstalled(isInstalled());
            setVisible(true);
        };
        window.addEventListener(PUBLIC_INSTALL_EVENT, openManually);
        return () => window.removeEventListener(PUBLIC_INSTALL_EVENT, openManually);
    }, []);

    useEffect(() => {
        const detected = getPlatform();
        if (isInstalled()) return;
        const onBeforeInstallPrompt = (event: Event) => {
            event.preventDefault();
            setPromptEvent(event as InstallPromptEvent);
            if (detected && !isSuppressed() && !isInstalled()) setVisible(true);
        };
        const onInstalled = () => {
            setVisible(false);
            setPromptEvent(null);
            setAlreadyInstalled(true);
        };
        window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
        window.addEventListener("appinstalled", onInstalled);
        // Show a non-intrusive invitation on both Android and iOS.
        // Android browsers may never dispatch beforeinstallprompt; in that case,
        // the OK action shows manual installation instructions.
        const timer = window.setTimeout(() => {
            setPlatform(detected);
            if (detected && !isSuppressed() && !isInstalled()) setVisible(true);
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
    const accept = async () => {
        if (alreadyInstalled || isInstalled()) {
            setAlreadyInstalled(true);
            return;
        }
        if (platform === "ios" || !promptEvent) {
            setInstructions(true);
            return;
        }
        setBusy(true);
        try {
            await promptEvent.prompt();
            await promptEvent.userChoice;
            setPromptEvent(null);
            setVisible(false);
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
                <button type="button" aria-label="மூடுக" onClick={() => setVisible(false)} className="rounded-md p-1 text-gray-500 hover:bg-gray-100"><X size={18} /></button>
            </div>
            {alreadyInstalled && (
                <p className="mt-3 rounded-lg bg-green-50 p-3 text-sm font-medium text-green-800" role="status">இந்தச் செயலி ஏற்கனவே நிறுவப்பட்டுள்ளது. நீங்கள் தற்போது நிறுவப்பட்ட செயலியில் உள்ளீர்கள்.</p>
            )}
            {instructions && !alreadyInstalled && (
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
                {!alreadyInstalled && <button type="button" onClick={() => { void accept(); }} disabled={busy} className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-60">சரி</button>}
            </div>
        </div>
    );
}
