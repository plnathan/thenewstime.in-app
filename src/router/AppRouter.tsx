import {
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { useEffect } from "react";

import HomePage from "@/pages/Home/HomePage";
import NewsDetailPage from "@/pages/NewsDetail/NewsDetailPage";

import AdminNewsPage from "@/pages/AdminNews";
import AdminNewsCreatePage from "@/pages/AdminNewsCreate";
import AdminNewsEditPage from "@/pages/AdminNewsEdit";
import NewsPage from "@/pages/News/NewsPage";
import NotFoundPage from "@/pages/NotFoundPage";

import {
  stopNavigationLoading,
} from "@/utils/navigationLoader";

const AppRouter = () => {
  return (
    <>
      <NavigationRouteWatcher />

      <Routes>
        {/* Public */}
        <Route
          path="/"
          element={<HomePage />}
        />

        <Route
          path="/news"
          element={<NewsPage />}
        />

        <Route
          path="/news/:slug"
          element={<NewsDetailPage />}
        />

        {/* ------------------------------------------------
         * Admin
         *
         * Authentication/authorization will be added
         * later by wrapping this route group with the
         * security/user/role permission layer.
         * ------------------------------------------------ */}
        <Route
          path="/admin/news"
          element={<AdminNewsPage />}
        />

        <Route
          path="/admin/news/create"
          element={<AdminNewsCreatePage />}
        />

        <Route
          path="/admin/news/:id/edit"
          element={<AdminNewsEditPage />}
        />

        <Route
          path="*"
          element={<NotFoundPage />}
        />
      </Routes>
    </>
  );
};

function NavigationRouteWatcher() {
  const location = useLocation();

  useEffect(() => {
    stopNavigationLoading();
  }, [
    location.pathname,
    location.search,
  ]);

  return null;
}

export default AppRouter;