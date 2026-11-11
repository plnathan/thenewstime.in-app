import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import AdvertisementEnquiryModal from "@/components/advertisements/Advertisement/AdvertisementEnquiryModal";
import type { EnquirySource } from "@/api/advertisements/advertisement-enquiries.api";

export interface EnquiryOrigin {
    source: EnquirySource;
    sourceAdvertisementId?: number;
    sourcePlacementId?: number;
}
interface EnquiryContextValue { openEnquiry: (origin: EnquiryOrigin) => void; }
const EnquiryContext = createContext<EnquiryContextValue | null>(null);
export function useAdvertisementEnquiry() {
    const context = useContext(EnquiryContext);
    if (!context) throw new Error("AdvertisementEnquiryProvider is missing");
    return context;
}
export function AdvertisementEnquiryProvider({ children }: { children: ReactNode }) {
    const [origin, setOrigin] = useState<EnquiryOrigin | null>(null);
    const openEnquiry = useCallback((next: EnquiryOrigin) => setOrigin(next), []);
    const close = useCallback(() => setOrigin(null), []);
    return (
        <EnquiryContext.Provider value={{ openEnquiry }}>
            {children}
            {origin && <AdvertisementEnquiryModal origin={origin} onClose={close} />}
        </EnquiryContext.Provider>
    );
}
