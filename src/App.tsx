import { useLayoutEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { resetPublicPageDeliveryCache } from "@/api/advertisements/public-delivery.api";
import AppRouter from "./router/AppRouter";

import NavigationLoader from "@/components/ui/NavigationLoader/NavigationLoader";

import { AuthProvider } from "@/auth/AuthContext";

const App = () => {
  const location = useLocation();
  const lastRouteKey = useRef<string | null>(null);
  useLayoutEffect(() => {
    // StrictMode replays effects in development; clear only on actual navigation.
    if (lastRouteKey.current === location.key) return;
    lastRouteKey.current = location.key;
    resetPublicPageDeliveryCache();
  }, [location.key]);
  return (
    <AuthProvider>
      <AppRouter />
      <NavigationLoader />
    </AuthProvider>
  );
};

export default App;