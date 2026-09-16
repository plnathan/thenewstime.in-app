import {
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import {
  useEffect,
} from "react";

import HomePage from "@/pages/Home/HomePage";
import NewsDetailPage from "@/pages/NewsDetail/NewsDetailPage";

import AdminLoginPage from "@/pages/AdminLogin/AdminLoginPage";
import AdminNewsPage from "@/pages/AdminNews";
import AdminNewsCreatePage from "@/pages/AdminNewsCreate";
import AdminNewsEditPage from "@/pages/AdminNewsEdit";

import AccessDeniedPage from "@/pages/AccessDenied/AccessDeniedPage";

import NewsPage from "@/pages/News/NewsPage";
import NotFoundPage from "@/pages/NotFoundPage";

import ProtectedRoute from "../components/auth/ProtectedRoute";
import PermissionRoute from "@/components/auth/PermissionRoute";

import {
  stopNavigationLoading,
} from "@/utils/navigationLoader";

import {
  SecurityUserFormPage,
  SecurityUsersPage,
} from "@/pages/Security/Users";

import {
  SecurityRoleFormPage,
  SecurityRolesPage,
} from "@/pages/Security/Roles";

import SecurityRolePermissionsPage from "@/pages/Security/Roles/SecurityRolePermissionsPage";

import {
  SecurityPermissionFormPage,
  SecurityPermissionsPage,
} from "@/pages/Security/Permissions";

const AppRouter = () => {
  return (
    <> <NavigationRouteWatcher />

      <Routes>
        {/* ------------------------------------------------
     * Public
     * ------------------------------------------------ */}

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
     * Admin Authentication
     *
     * Public login entry point:
     *
     * /admin/login
     * ------------------------------------------------ */}

        <Route
          path="/admin/login"
          element={<AdminLoginPage />}
        />

        {/* ------------------------------------------------
     * Protected Admin
     *
     * Every route inside this group requires
     * successful authentication.
     * ------------------------------------------------ */}

        <Route element={<ProtectedRoute />}>
          {/* ----------------------------------------------
       * Access Denied
       *
       * This page is authenticated but does not
       * require an additional permission itself.
       * ---------------------------------------------- */}

          <Route
            path="/admin/access-denied"
            element={<AccessDeniedPage />}
          />

          {/* ----------------------------------------------
       * News Management
       *
       * These routes currently remain protected by
       * authentication only.
       *
       * We intentionally do NOT add an assumed
       * news permission here until the backend
       * News permission definitions are supplied.
       * ---------------------------------------------- */}

          <Route
            path="/admin"
            element={<AdminNewsPage />}
          />

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

          {/* ----------------------------------------------
       * Security - Users
       * ---------------------------------------------- */}

          <Route
            path="/admin/security/users"
            element={
              <PermissionRoute
                permissionCode="users.read"
              >
                <SecurityUsersPage />
              </PermissionRoute>
            }
          />

          <Route
            path="/admin/security/users/create"
            element={
              <PermissionRoute
                permissionCode="users.create"
              >
                <SecurityUserFormPage />
              </PermissionRoute>
            }
          />

          <Route
            path="/admin/security/users/:id/edit"
            element={
              <PermissionRoute
                permissionCode="users.update"
              >
                <SecurityUserFormPage />
              </PermissionRoute>
            }
          />

          {/* ----------------------------------------------
       * Security - Roles
       * ---------------------------------------------- */}

          <Route
            path="/admin/security/roles"
            element={
              <PermissionRoute
                permissionCode="roles.read"
              >
                <SecurityRolesPage />
              </PermissionRoute>
            }
          />

          <Route
            path="/admin/security/roles/create"
            element={
              <PermissionRoute
                permissionCode="roles.create"
              >
                <SecurityRoleFormPage />
              </PermissionRoute>
            }
          />

          <Route
            path="/admin/security/roles/:id/edit"
            element={
              <PermissionRoute
                permissionCode="roles.update"
              >
                <SecurityRoleFormPage />
              </PermissionRoute>
            }
          />

          <Route
            path="/admin/security/roles/:id/permissions"
            element={
              <PermissionRoute
                permissionCode="roles.assign"
              >
                <SecurityRolePermissionsPage />
              </PermissionRoute>
            }
          />

          {/* ----------------------------------------------
       * Security - Permissions
       * ---------------------------------------------- */}

          <Route
            path="/admin/security/permissions"
            element={
              <PermissionRoute
                permissionCode="permissions.read"
              >
                <SecurityPermissionsPage />
              </PermissionRoute>
            }
          />

          <Route
            path="/admin/security/permissions/create"
            element={
              <PermissionRoute
                permissionCode="permissions.create"
              >
                <SecurityPermissionFormPage />
              </PermissionRoute>
            }
          />

          <Route
            path="/admin/security/permissions/:id/edit"
            element={
              <PermissionRoute
                permissionCode="permissions.update"
              >
                <SecurityPermissionFormPage />
              </PermissionRoute>
            }
          />
        </Route>

        {/* ------------------------------------------------
     * Not Found
     * ------------------------------------------------ */}

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
