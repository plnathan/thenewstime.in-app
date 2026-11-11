import { useEffect, useId, useState, useRef, type FormEvent } from "react";
import { X, Clock3, Send } from "lucide-react";
import { submitAdvertisementEnquiry, type EnquiryPage, type AdvertisementEnquiryInput } from "@/api/advertisements/advertisement-enquiries.api";
import type { EnquiryOrigin } from "@/contexts/AdvertisementEnquiryContext";

const slots: Record<EnquiryPage, { value: string; label: string }[]> = {
    HOME: ["HOME_TOP", "HOME_BANNER", "HOME_BETWEEN_SECTIONS", "HOME_SIDEBAR", "HOME_BOTTOM", "HOME_MODAL"].map(value => ({ value, label: value.replaceAll("_", " ") })),
    NEWS_LIST: ["NEWS_LIST_TOP", "NEWS_LIST_BETWEEN", "NEWS_LIST_SIDEBAR", "NEWS_LIST_BOTTOM", "NEWS_LIST_MODAL"].map(value => ({ value, label: value.replaceAll("_", " ") })),
    NEWS_DETAIL: ["NEWS_DETAIL_TOP", "NEWS_DETAIL_BETWEEN", "NEWS_DETAIL_SIDEBAR", "NEWS_DETAIL_BOTTOM", "NEWS_DETAIL_MODAL"].map(value => ({ value, label: value.replaceAll("_", " ") })),
};
interface Props { origin: EnquiryOrigin; onClose: () => void; }
const field = "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100";
const label = "mb-1 block text-sm font-medium text-gray-700";
export default function AdvertisementEnquiryModal({ origin, onClose }: Props) {
    const titleId = useId();
    const [name, setName] = useState("");
    const [company, setCompany] = useState("");
    const [mobile, setMobile] = useState("");
    const [email, setEmail] = useState("");
    const [adType, setAdType] = useState("");
    const [pages, setPages] = useState<EnquiryPage[]>([]);
    const [placements, setPlacements] = useState<string[]>([]);
    const [start, setStart] = useState("");
    const [end, setEnd] = useState("");
    const [details, setDetails] = useState("");
    const [website, setWebsite] = useState("");
    const [captchaToken, setCaptchaToken] = useState("");
    const captchaElement = useRef<HTMLDivElement>(null);
    const captchaSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;
    useEffect(() => {
        if (!captchaSiteKey || !captchaElement.current) return;
        let active = true;
        let widgetId: string | undefined;
        type Turnstile = { render: (element: HTMLElement, options: Record<string, unknown>) => string; remove: (id: string) => void };
        const turnstileWindow = window as Window & { turnstile?: Turnstile };
        const render = () => {
            if (!active || !captchaElement.current || !turnstileWindow.turnstile || widgetId) return;
            widgetId = turnstileWindow.turnstile.render(captchaElement.current, {
                sitekey: captchaSiteKey, action: "advertisement_enquiry",
                callback: (token: string) => setCaptchaToken(token),
                "expired-callback": () => setCaptchaToken(""),
                "error-callback": () => setCaptchaToken("")
            });
        };
        let script = document.querySelector<HTMLScriptElement>('script[data-enquiry-turnstile]');
        if (!script) {
            script = document.createElement("script");
            script.dataset.enquiryTurnstile = "true";
            script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
            script.async = true;
            document.head.appendChild(script);
        }
        script.addEventListener("load", render);
        render();
        return () => { active = false; script?.removeEventListener("load", render); if (widgetId) turnstileWindow.turnstile?.remove(widgetId); };
    }, [captchaSiteKey]);
    const [sending, setSending] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    useEffect(() => {
        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const key = (event: KeyboardEvent) => { if (event.key === "Escape" && !sending) onClose(); };
        window.addEventListener("keydown", key);
        return () => { document.body.style.overflow = previous; window.removeEventListener("keydown", key); };
    }, [onClose, sending]);
    const available = pages.flatMap(page => slots[page]);
    const togglePage = (page: EnquiryPage) => {
        const next = pages.includes(page) ? pages.filter(p => p !== page) : [...pages, page];
        setPages(next);
        const valid = new Set(next.flatMap(p => slots[p].map(slot => slot.value)));
        setPlacements(current => current.filter(p => valid.has(p)));
    };
    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (sending) return;
        if (import.meta.env.PROD && !captchaToken) { setError("Please complete the security check."); return; }
        if (start && end && end < start) { setError("End date cannot be before start date."); return; }
        setSending(true); setError("");
        const payload: AdvertisementEnquiryInput = {
            fullName: name.trim(), mobileNumber: mobile.trim(), source: origin.source,
            ...(company.trim() ? { companyName: company.trim() } : {}),
            ...(email.trim() ? { email: email.trim() } : {}),
            ...(adType ? { advertisementType: adType as AdvertisementEnquiryInput["advertisementType"] } : {}),
            ...(pages.length ? { pageTypes: pages } : {}),
            ...(placements.length ? { placementTypes: placements } : {}),
            ...(start ? { preferredStartDate: start } : {}),
            ...(end ? { preferredEndDate: end } : {}),
            ...(details.trim() ? { additionalRequirements: details.trim() } : {}),
            ...(origin.source === "HOUSE_AD" && origin.sourceAdvertisementId ? { sourceAdvertisementId: origin.sourceAdvertisementId } : {}),
            ...(origin.source === "HOUSE_AD" && origin.sourcePlacementId ? { sourcePlacementId: origin.sourcePlacementId } : {}),
            website,
            ...(captchaToken ? { captchaToken } : {}),
        };
        try { await submitAdvertisementEnquiry(payload); setSuccess(true); }
        catch { setError("Unable to send your enquiry. Please try again."); }
        finally { setSending(false); }
    };
    return (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/60 p-3 sm:p-6" onMouseDown={event => { if (event.target === event.currentTarget && !sending) onClose(); }}>
            <div role="dialog" aria-modal="true" aria-labelledby={titleId} className="relative max-h-[94vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
                <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b bg-white px-5 py-4 sm:px-7">
                    <div><h2 id={titleId} className="text-xl font-bold text-green-800">Advertisement Enquiry</h2><p className="text-xs text-gray-500">The News Time · thenewstime.in</p></div>
                    <button type="button" onClick={onClose} disabled={sending} aria-label="Close enquiry" className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"><X size={20} /></button>
                </div>
                {success ? <div className="space-y-4 px-6 py-12 text-center"><h3 className="text-xl font-semibold text-green-800">Enquiry sent successfully</h3><p>Thank you. Our advertising team will contact you after reviewing your request.</p><button onClick={onClose} className="rounded-lg bg-green-700 px-5 py-2 text-white">Close</button></div> :
                    <form onSubmit={event => void submit(event)} className="space-y-5 px-5 py-5 sm:px-7">
                        <div className="rounded-xl bg-green-50 p-4 text-sm text-green-950"><p className="flex items-center gap-2 font-semibold"><Clock3 size={17} /> Contact Hours: 9:00 AM – 6:00 PM</p><p className="mt-2">You may submit an advertisement enquiry at any time, 24/7. Our team will contact you after reviewing your request.</p></div>
                        <h3 className="border-b pb-2 font-semibold">Contact Information</h3>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div><label htmlFor="enquiry-name" className={label}>Full Name *</label><input id="enquiry-name" required minLength={2} maxLength={120} value={name} onChange={e => setName(e.target.value)} className={field} /></div>
                            <div><label htmlFor="enquiry-company" className={label}>Company / Organization</label><input id="enquiry-company" maxLength={160} value={company} onChange={e => setCompany(e.target.value)} className={field} /></div>
                            <div><label htmlFor="enquiry-mobile" className={label}>Mobile Number *</label><input id="enquiry-mobile" required minLength={8} maxLength={20} value={mobile} onChange={e => setMobile(e.target.value)} className={field} placeholder="+91 9876543210" /></div>
                            <div><label htmlFor="enquiry-email" className={label}>Email Address</label><input id="enquiry-email" type="email" maxLength={254} value={email} onChange={e => setEmail(e.target.value)} className={field} /></div>
                        </div>
                        <h3 className="border-b pb-2 font-semibold">Advertisement Preferences <span className="text-sm font-normal text-gray-500">(All optional)</span></h3>
                        <div><label htmlFor="enquiry-type" className={label}>Advertisement Type</label><select id="enquiry-type" className={field} value={adType} onChange={e => setAdType(e.target.value)}><option value="">Not sure / No preference</option><option value="DISPLAY">Display / Banner</option><option value="SIDEBAR">Sidebar</option><option value="MODAL">Popup / Modal</option><option value="OTHER">Other</option></select></div>
                        <fieldset><legend className={label}>Page Name (select any)</legend><div className="flex flex-wrap gap-4">{(["HOME", "NEWS_LIST", "NEWS_DETAIL"] as const).map(page => <label key={page} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={pages.includes(page)} onChange={() => togglePage(page)} />{page === "HOME" ? "Home Page" : page === "NEWS_LIST" ? "News List" : "News Detail"}</label>)}</div></fieldset>
                        <fieldset><legend className={label}>Advertisement Slots (select any)</legend>{available.length ? <div className="grid max-h-36 gap-2 overflow-y-auto rounded-lg border p-3 sm:grid-cols-2">{available.map(slot => <label key={slot.value} className="flex items-center gap-2 text-xs"><input type="checkbox" checked={placements.includes(slot.value)} onChange={() => setPlacements(current => current.includes(slot.value) ? current.filter(p => p !== slot.value) : [...current, slot.value])} />{slot.label}</label>)}</div> : <p className="text-xs text-gray-500">Choose a page to see available slot types, or leave blank.</p>}</fieldset>
                        <div className="grid gap-4 sm:grid-cols-2"><div><label htmlFor="enquiry-start" className={label}>Preferred Start Date</label><input id="enquiry-start" type="date" className={field} value={start} onChange={e => setStart(e.target.value)} /></div><div><label htmlFor="enquiry-end" className={label}>Preferred End Date</label><input id="enquiry-end" type="date" className={field} value={end} onChange={e => setEnd(e.target.value)} /></div></div>
                        <div><label htmlFor="enquiry-details" className={label}>Additional Requirements (Optional)</label><textarea id="enquiry-details" rows={3} maxLength={2000} className={field} value={details} onChange={e => setDetails(e.target.value)} /></div>
                        <div className="hidden" aria-hidden="true"><label htmlFor="enquiry-website">Website</label><input id="enquiry-website" tabIndex={-1} autoComplete="off" value={website} onChange={e => setWebsite(e.target.value)} /></div>
                        {captchaSiteKey && <div ref={captchaElement} aria-label="Security verification" />}
                        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
                        <div className="flex justify-end gap-3 border-t pt-4"><button type="button" onClick={onClose} disabled={sending} className="rounded-lg border px-5 py-2 text-sm">Cancel</button><button type="submit" disabled={sending} className="flex items-center gap-2 rounded-lg bg-green-700 px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"><Send size={16} />{sending ? "Sending..." : "Send Enquiry"}</button></div>
                    </form>}
            </div>
        </div>
    );
}
