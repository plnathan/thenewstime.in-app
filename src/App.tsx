import { useLayoutEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { resetPublicPageDeliveryCache } from "@/api/advertisements/public-delivery.api";
import AppRouter from "./router/AppRouter";
import InstallAppBanner from "@/components/pwa/InstallAppBanner";
import AdminInstallBanner from "@/components/pwa/AdminInstallBanner";
import NavigationLoader from "@/components/ui/NavigationLoader/NavigationLoader";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import PublicMaintenanceGate from "@/components/common/PublicMaintenanceGate";
import { AuthProvider } from "@/auth/AuthContext";

const App = () => {
  const location = useLocation();
  const lastRouteKey = useRef<string | null>(null);
  const isAdmin = location.pathname === "/admin" || location.pathname.startsWith("/admin/");

  useLayoutEffect(() => {
    const href = isAdmin ? "/admin.webmanifest" : "/site.webmanifest";
    let link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "manifest";
      document.head.appendChild(link);
    }
    if (link.getAttribute("href") !== href) link.setAttribute("href", href);
  }, [isAdmin]);

  useLayoutEffect(() => {
    if (lastRouteKey.current === location.key) return;
    lastRouteKey.current = location.key;
    resetPublicPageDeliveryCache();
  }, [location.key]);

  return (
    <AuthProvider>
      <ErrorBoundary resetKey={location.pathname}>
        <PublicMaintenanceGate>
          <AppRouter />
        </PublicMaintenanceGate>
      </ErrorBoundary>
      <NavigationLoader />
      {isAdmin ? <AdminInstallBanner /> : <InstallAppBanner />}
    </AuthProvider>
  );
};

export default App;
