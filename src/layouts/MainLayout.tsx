import { useNewsDetailDeliveryId } from "@/contexts/NewsDetailDeliveryContext";
/**
 * -----------------------------------------------------------------------------
 * Project     : thenewstime.in
 * Component   : MainLayout
 * Description : Public website layout and admin layout adapter.
 * -----------------------------------------------------------------------------
 */

import type { MainLayoutProps } from "./MainLayout.types";

import { useLocation } from "react-router-dom";

import { AdvertisementEnquiryProvider } from "@/contexts/AdvertisementEnquiryContext";
import Header from "@/components/layout/Header";
import LiveAdvertisementSlot from "@/components/advertisements/Advertisement/LiveAdvertisementSlot";
import Footer from "@/components/layout/Footer";
import ScrollToTopBottom from "@/components/ui/ScrollToTopBottom/ScrollToTopBottom";
import AdminLayout from "@/layouts/AdminLayout";

export default function MainLayout({
  children,
}: MainLayoutProps) {
  const { pathname } = useLocation();
  const detailNewsId = useNewsDetailDeliveryId();
  const placementPage = pathname === "/"
    ? "HOME"
    : pathname === "/news" || pathname === "/news/"
      ? "NEWS_LIST"
      : /^\/news\/[^/]+\/?$/.test(pathname)
        ? "NEWS_DETAIL"
        : null;
  const bannerCode = placementPage === "HOME" ? "HOME_BANNER"
    : placementPage === "NEWS_LIST" ? "NEWS_LIST_BANNER"
      : placementPage === "NEWS_DETAIL" ? "NEWS_DETAIL_BANNER" : null;

  const isAdminPage =
    pathname.startsWith("/admin") &&
    pathname !== "/admin/login";

  if (isAdminPage) {
    return (
      <AdminLayout>
        {children}
      </AdminLayout>
    );
  }

  return (
    <AdvertisementEnquiryProvider>
      <div className="flex min-h-screen flex-col bg-white">
        <Header />

        {bannerCode && (placementPage !== "NEWS_DETAIL" || (detailNewsId != null)) && (
          <div className="mx-auto w-full max-w-7xl has-[aside]:py-[18px] px-3 sm:px-4">
            <LiveAdvertisementSlot placementCode={bannerCode} slotNumber={1} newsId={placementPage === "NEWS_DETAIL" ? detailNewsId! : undefined} />
          </div>
        )}
        <main className="flex-1">
          {children}
        </main>

        <Footer />
        <ScrollToTopBottom />
      </div>
    </AdvertisementEnquiryProvider>
  );
}