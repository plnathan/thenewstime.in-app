/**
 * -----------------------------------------------------------------------------
 * Project     : thenewstime.in
 * Component   : Footer
 * Description : Public application footer with informational dialogs.
 * -----------------------------------------------------------------------------
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";

import { useAdvertisementEnquiry } from "@/contexts/AdvertisementEnquiryContext";
import { navigationItems } from "@/components/layout/Navigation/navigation.data";

type FooterDialog = "about" | "contact" | "privacy" | "terms";

const footerInformation: Record<FooterDialog, { title: string; paragraphs: string[] }> = {
    about: {
        title: "எங்களைப் பற்றி",
        paragraphs: [
            "thenewstime.in — செய்திகளை விரைவாகவும் தெளிவாகவும் வழங்கும் டிஜிட்டல் செய்தி தளம்.",
        ],
    },
    contact: {
        title: "பிற தொடர்புக்கு",
        paragraphs: [
            "thenewstime.in தொடர்பான கருத்துகள், செய்தித் தகவல்கள், திருத்தக் கோரிக்கைகள் மற்றும் பொதுவான விசாரணைகளை எங்களுடன் பகிரலாம்.",
            "தொடர்பு விவரங்கள் விரைவில் இங்கே வெளியிடப்படும். அதுவரை, அதிகாரப்பூர்வமாக வெளியிடப்படும் தொடர்பு வழிகளை மட்டும் பயன்படுத்தவும்.",
        ],
    },
    privacy: {
        title: "தனியுரிமைக் கொள்கை",
        paragraphs: [
            "பயனர்களின் தனியுரிமையை மதிப்பது எங்களுக்கு முக்கியம். இணையதளத்தைப் பயன்படுத்தும்போது சேவைச் செயல்பாடு, பாதுகாப்பு மற்றும் பயன்பாட்டு அனுபவத்தை மேம்படுத்தத் தேவையான தொழில்நுட்பத் தகவல்கள் செயலாக்கப்படலாம்.",
            "மூன்றாம் தரப்பு சேவைகள் அல்லது விளம்பரங்கள் பயன்படுத்தப்படும் இடங்களில் அவற்றின் தனியுரிமை நடைமுறைகளும் பொருந்தக்கூடும்.",
            "இது சுருக்கமான தகவல் மட்டுமே. முழுமையான தனியுரிமைக் கொள்கை சட்ட மற்றும் செயல்பாட்டு மதிப்பாய்வுக்குப் பிறகு வெளியிடப்பட வேண்டும்.",
        ],
    },
    terms: {
        title: "விதிமுறைகள் & நிபந்தனைகள்",
        paragraphs: [
            "thenewstime.in தளத்தில் வழங்கப்படும் செய்திகள் மற்றும் தகவல்கள் பொதுத் தகவல் நோக்கத்திற்காக வெளியிடப்படுகின்றன.",
            "தளத்தின் உள்ளடக்கத்தை அனுமதியின்றி மறுபதிப்பு செய்வதோ, தவறாகப் பயன்படுத்துவதோ கூடாது. வெளிப்புற இணையதளங்களுக்கான இணைப்புகளின் உள்ளடக்கம் அந்தந்த தளங்களின் பொறுப்பாகும்.",
            "இது சுருக்கமான தகவல் மட்டுமே. முழுமையான விதிமுறைகள் மற்றும் நிபந்தனைகள் சட்ட மதிப்பாய்வுக்குப் பிறகு வெளியிடப்பட வேண்டும்.",
        ],
    },
};

const informationLinks: { key: FooterDialog; label: string }[] = [
    { key: "about", label: "எங்களைப் பற்றி" },
    { key: "contact", label: "பிற தொடர்புக்கு" },
    { key: "privacy", label: "தனியுரிமைக் கொள்கை" },
    { key: "terms", label: "விதிமுறைகள் & நிபந்தனைகள்" },
];

export default function Footer() {
    const { openEnquiry } = useAdvertisementEnquiry();
    const [activeDialog, setActiveDialog] = useState<FooterDialog | null>(null);

    const handleLinkClick = () => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    };

    const dialog = activeDialog === null ? null : footerInformation[activeDialog];

    return (
        <>
            <footer className="mt-12 border-t border-gray-200 bg-gray-50">
                <div className="mx-auto max-w-7xl px-4 py-10 lg:px-6">
                    <div className="grid gap-8 md:grid-cols-3">
                        <div>
                            <Link
                                to="/"
                                onClick={handleLinkClick}
                                className="inline-block text-xl font-bold text-green-700"
                            >
                                thenewstime.in
                            </Link>
                            <p className="mt-3 max-w-sm text-sm leading-6 text-gray-600">
                                தமிழின் நம்பகமான டிஜிட்டல் செய்தித் தளம்.
                                இந்தியா மற்றும் உலகச் செய்திகளை உடனுக்குடன்
                                அறிந்து கொள்ளுங்கள்.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-sm font-semibold text-gray-900">
                                முக்கியப் பிரிவுகள்
                            </h2>
                            <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3">
                                {navigationItems
                                    .filter((item) => item.path !== "/")
                                    .sort(
                                        (a, b) =>
                                            (a.id === 11 ? 2.5 : a.id === 2 ? 2 : a.id === 3 ? 3 : a.id) -
                                            (b.id === 11 ? 2.5 : b.id === 2 ? 2 : b.id === 3 ? 3 : b.id),
                                    )
                                    .flatMap((item) => [
                                        <Link
                                            key={item.id}
                                            to={item.path}
                                            onClick={handleLinkClick}
                                            className="text-sm text-gray-600 transition hover:text-green-700"
                                        >
                                            {item.label}
                                        </Link>,
                                    ])}
                            </div>
                        </div>

                        <div>
                            <h2 className="text-sm font-semibold text-gray-900">
                                சட்டப்படியான விவரங்கள்
                            </h2>
                            <nav aria-label="சட்டப்படியான விவரங்கள்" className="mt-4 flex flex-col items-start gap-3">
                                {informationLinks.map(({ key, label }) => (
                                    <div key={key} className="flex flex-col items-start gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setActiveDialog(key)}
                                            className="cursor-pointer border-0 bg-transparent p-0 text-left text-sm font-normal text-gray-600 no-underline transition hover:text-green-700 focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
                                        >
                                            {label}
                                        </button>
                                        {key === "about" && (
                                            <button type="button" onClick={() => openEnquiry({ source: "FOOTER" })}
                                                className="text-left text-sm text-gray-600 transition hover:text-green-700">
                                                விளம்பரத் தொடர்புக்கு
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </nav>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col gap-3 border-t border-gray-200 pt-6 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
                        <p>
                            © {new Date().getFullYear()} thenewstime.in.
                            அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.
                        </p>
                        <p>time for news</p>
                    </div>
                </div>
            </footer>

            {dialog !== null && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 p-4">
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="footer-information-title"
                        className="w-full max-w-xl rounded-xl bg-white p-5 shadow-2xl sm:p-6"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <h2 id="footer-information-title" className="text-lg font-semibold text-gray-900">
                                {dialog.title}
                            </h2>
                            <button
                                type="button"
                                onClick={() => setActiveDialog(null)}
                                aria-label="மூடவும்"
                                className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-green-700"
                            >
                                <X className="h-5 w-5" aria-hidden="true" />
                            </button>
                        </div>
                        <div className="mt-4 max-h-[65vh] space-y-3 overflow-y-auto text-sm leading-7 text-gray-700">
                            {dialog.paragraphs.map((paragraph) => (
                                <p key={paragraph}>{paragraph}</p>
                            ))}
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setActiveDialog(null)}
                                className="rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
                            >
                                மூடவும்
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
