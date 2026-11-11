import { useAdvertisementEnquiry } from "@/contexts/AdvertisementEnquiryContext";
import { useEffect, useState } from "react";
import {
    getPublicPlacementDelivery,
    getPublicPlacementSlots,
    type PublicDeliveryItem,
} from "@/api/advertisements/public-delivery.api";
import {
    PUBLIC_PLACEMENT_SIZES,
    type PublicPlacementCode,
} from "@/constants/publicPlacementSizes";

type ModalCode = Extract<PublicPlacementCode, "HOME_MODAL" | "NEWS_LIST_MODAL" | "NEWS_DETAIL_MODAL">;

interface Props {
    placementCode: ModalCode;
    newsId?: number;
}

interface ModalState {
    item: PublicDeliveryItem;
    placementId: number;
    displayFrequency: "EVERY_VISIT" | "ONCE_PER_SESSION" | "ONCE_PER_DAY" | "ONCE_PER_PERIOD" | null;
    frequencyValue: number | null;
    autoCloseEnabled: boolean;
    autoCloseSeconds: number | null;
    closeButtonEnabled: boolean;
    closeOnOverlayClick: boolean;
}

const sessionKey = (code: ModalCode, placementId: number) =>
    `thenewstime.ad-modal.dismissed.${code}.${placementId}`;

function ModalContent({ placementCode, newsId }: Props) {
    const { openEnquiry } = useAdvertisementEnquiry();
    const [state, setState] = useState<ModalState | null>(null);
    const [viewport, setViewport] = useState(() => typeof window === "undefined" ? 1200 : window.innerWidth);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        const onResize = () => setViewport(window.innerWidth);
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    useEffect(() => {
        let active = true;
        async function resolve() {
            try {
                const slots = await getPublicPlacementSlots(placementCode, newsId);
                const first = slots[0];
                if (!first) return;
                const result = await getPublicPlacementDelivery(placementCode, first.id, newsId);
                const frequency = result.placement?.displayFrequency ?? "EVERY_VISIT";
                const key = sessionKey(placementCode, first.id);
                const last = frequency === "ONCE_PER_SESSION"
                    ? Number(window.sessionStorage.getItem(key))
                    : Number(window.localStorage.getItem(key));
                const elapsed = Date.now() - last;
                const period = frequency === "ONCE_PER_DAY" ? 86_400_000
                    : frequency === "ONCE_PER_PERIOD" ? Math.max(1, result.placement?.frequencyValue ?? 1) * 86_400_000
                        : 0;
                if (frequency === "ONCE_PER_SESSION" && last > 0) return;
                if (period > 0 && last > 0 && elapsed < period) return;
                if (!active || result.placement?.id !== first.id) return;
                const item = result.advertisements.find((candidate) =>
                    candidate.creative !== null || candidate.creatives.length > 0,
                );
                if (item) setState({
                    item, placementId: first.id, displayFrequency: frequency,
                    frequencyValue: result.placement?.frequencyValue ?? null,
                    autoCloseEnabled: result.placement?.autoCloseEnabled ?? false,
                    autoCloseSeconds: result.placement?.autoCloseSeconds ?? null,
                    closeButtonEnabled: result.placement?.closeButtonEnabled ?? true,
                    closeOnOverlayClick: result.placement?.closeOnOverlayClick ?? true,
                });
            } catch {
                // Public pages must continue rendering if modal delivery is unavailable.
            }
        }
        void resolve();
        return () => { active = false; };
    }, [placementCode, newsId]);

    useEffect(() => {
        if (!state || dismissed) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                const key = sessionKey(placementCode, state.placementId);
                if (state.displayFrequency === "ONCE_PER_SESSION") window.sessionStorage.setItem(key, String(Date.now()));
                else if (state.displayFrequency !== "EVERY_VISIT") window.localStorage.setItem(key, String(Date.now()));
                setDismissed(true);
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [state, dismissed, placementCode]);

    useEffect(() => {
        if (!state || dismissed || !state.autoCloseEnabled || !state.autoCloseSeconds || state.autoCloseSeconds <= 0) return;
        const timeout = window.setTimeout(() => {
            const key = sessionKey(placementCode, state.placementId);
            if (state.displayFrequency === "ONCE_PER_SESSION") window.sessionStorage.setItem(key, String(Date.now()));
            else if (state.displayFrequency !== "EVERY_VISIT") window.localStorage.setItem(key, String(Date.now()));
            setDismissed(true);
        }, state.autoCloseSeconds * 1000);
        return () => window.clearTimeout(timeout);
    }, [state, dismissed, placementCode]);

    if (!state || dismissed) return null;
    const dimensions = PUBLIC_PLACEMENT_SIZES[placementCode];
    const size = viewport < 768 ? dimensions.mobile : viewport < 1024 ? dimensions.tablet : dimensions.desktop;
    const variant = viewport < 768 ? "MOBILE" : "DESKTOP";
    const creative = state.item.creatives.find((entry) => entry.variant === variant)
        ?? state.item.creative
        ?? state.item.creatives[0];
    if (!creative) return null;

    const close = () => {
        const key = sessionKey(placementCode, state.placementId);
        if (state.displayFrequency === "ONCE_PER_SESSION") window.sessionStorage.setItem(key, String(Date.now()));
        else if (state.displayFrequency !== "EVERY_VISIT") window.localStorage.setItem(key, String(Date.now()));
        setDismissed(true);
    };
    const media = creative.creativeType === "IMAGE"
        ? <img src={creative.mediaUrl} alt={creative.altText ?? state.item.name} className="block max-h-[78dvh] max-w-full h-auto w-auto object-contain" />
        : creative.creativeType === "VIDEO"
            ? <video src={creative.mediaUrl} className="block max-h-[78dvh] max-w-full h-auto w-auto object-contain" controls playsInline preload="metadata" />
            : <div className="flex h-full items-center justify-center p-4 text-center text-sm">{creative.title ?? state.item.name}</div>;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
            role="presentation"
            onMouseDown={(event) => { if (state.closeOnOverlayClick && event.target === event.currentTarget) close(); }}
        >
            <div className="relative flex max-h-[90dvh] max-w-[94vw] flex-col items-end">
                {state.closeButtonEnabled && (
                    <button type="button" aria-label="Close advertisement" onClick={close}
                        className="relative z-20 mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-white text-2xl font-bold text-gray-900 shadow-lg ring-1 ring-gray-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">×</button>
                )}
                <section role="dialog" aria-modal="true" aria-label="Advertisement"
                    className="flex max-h-[80dvh] max-w-[94vw] items-center justify-center overflow-hidden rounded-xl bg-white shadow-2xl"
                    style={{ width: "fit-content", maxWidth: Math.max(size.width, 280) }}>
                    {state.item.isHouseAd
                        ? <button type="button" className="block max-h-[78dvh] max-w-full" onClick={() => {
                            openEnquiry({ source: "HOUSE_AD", sourceAdvertisementId: state.item.advertisementId, sourcePlacementId: state.placementId });
                            close();
                        }}>{media}</button>
                        : state.item.isClickable && state.item.destinationUrl
                            ? <a className="block max-h-[78dvh] max-w-full" href={state.item.destinationUrl}
                                target={state.item.openInNewTab ? "_blank" : undefined} rel="noopener noreferrer">{media}</a>
                            : media}
                </section>
            </div>
        </div>
    );
}

/** A route-specific modal; remount on article or placement changes. */
export default function PublicAdvertisementModal(props: Props) {
    return <ModalContent key={`${props.placementCode}:${props.newsId ?? "none"}`} {...props} />;
}
