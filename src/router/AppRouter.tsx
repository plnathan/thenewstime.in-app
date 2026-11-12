import SystemMaintenancePage from "@/pages/Security/SystemMaintenancePage";
import ServiceUnavailablePage from "@/pages/ServiceUnavailable/ServiceUnavailablePage";
import {
  useEffect,
} from "react";

import {
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import AdminDashboardPage from "@/pages/Dashboard/AdminDashboardPage";
import SecurityAdministrationHomePage from "@/pages/Security/SecurityAdministrationHomePage";
import NewsAdministrationHomePage from "@/pages/NewsAdministration/NewsAdministrationHomePage";
import NewsCategoryConfigurationPage from "@/pages/NewsAdministration/NewsCategoryConfigurationPage";
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

import AdvertisementEnquiriesPage from "@/pages/Advertisements/Advertisement/AdvertisementEnquiriesPage";
import AdvertisementManagementHomePage from "@/pages/Advertisements/Advertisement/AdvertisementManagementHomePage";
import AdvertisementManagementPage from "@/pages/Advertisements/Advertisement/AdvertisementManagement";
import AdvertisementSearchPage from "@/pages/Advertisements/Advertisement/AdvertisementSearch";
import AdvertisementCreatePage from "@/pages/Advertisements/Advertisement/AdvertisementCreate";
import AdvertisementWorkspacePage from "@/pages/Advertisements/Advertisement/AdvertisementWorkspacePage";

import ClientSearchPage from "@/pages/Advertisements/Clients/ClientSearchPage";
import ClientConfigurationPage from "@/pages/Advertisements/Clients/ClientConfigurationPage";
import BusinessTypeConfigurationPage from "@/pages/Advertisements/Clients/BusinessTypeConfigurationPage";

import AdvertisementPlacementPage from "@/pages/Advertisements/Advertisement/AdvertisementPlacementPage";
import AdvertisementFormatsPage from "@/pages/Advertisements/Formats/AdvertisementFormatsPage";
import AdvertisementRateCardsPage from "@/pages/Advertisements/RateCards/AdvertisementRateCardsPage";
import FinancialApprovalThresholdsPage from "@/pages/Advertisements/FinancialApprovals/FinancialApprovalThresholdsPage";

const AppRouter = () => {
  return (
    <>
      <NavigationRouteWatcher />
      <AdminPageTitleWatcher />

      <Routes>
        <Route path="/service-unavailable" element={<ServiceUnavailablePage />} />

        {/* ------------------------------------------------
                 * Public website
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
                 * Admin authentication
                 * ------------------------------------------------ */}

        <Route
          path="/admin/login"
          element={<AdminLoginPage />}
        />

        {/* ------------------------------------------------
                 * Protected admin routes
                 * ------------------------------------------------ */}

        <Route element={<ProtectedRoute />}>
          {/* ----------------------------------------------
                     * Access denied
                     * ---------------------------------------------- */}

          <Route
            path="/admin/access-denied"
            element={<AccessDeniedPage />}
          />

          {/* ----------------------------------------------
                     * News management
                     * ---------------------------------------------- */}

          <Route
            path="/admin"
            element={<AdminDashboardPage />}
          />

          <Route
            path="/admin/news"
            element={<NewsAdministrationHomePage />}
          />

          <Route path="/admin/news/list" element={<AdminNewsPage />} />
          <Route path="/admin/news/categories" element={<NewsCategoryConfigurationPage />} />

          <Route
            path="/admin/news/create"
            element={<AdminNewsCreatePage />}
          />

          <Route
            path="/admin/news/:id/edit"
            element={<AdminNewsEditPage />}
          />

          <Route path="/admin/security" element={<SecurityAdministrationHomePage />} />
          <Route path="/admin/security/maintenance" element={<PermissionRoute permissionCode="permissions.read"><SystemMaintenancePage /></PermissionRoute>} />

          {/* ----------------------------------------------
                     * Security - users
                     * ---------------------------------------------- */}

          <Route
            path="/admin/security/users"
            element={
              <PermissionRoute permissionCode="users.read">
                <SecurityUsersPage />
              </PermissionRoute>
            }
          />

          <Route
            path="/admin/security/users/create"
            element={
              <PermissionRoute permissionCode="users.create">
                <SecurityUserFormPage />
              </PermissionRoute>
            }
          />

          <Route
            path="/admin/security/users/:id/edit"
            element={
              <PermissionRoute permissionCode="users.update">
                <SecurityUserFormPage />
              </PermissionRoute>
            }
          />

          {/* ----------------------------------------------
                     * Security - roles
                     * ---------------------------------------------- */}

          <Route
            path="/admin/security/roles"
            element={
              <PermissionRoute permissionCode="roles.read">
                <SecurityRolesPage />
              </PermissionRoute>
            }
          />

          <Route
            path="/admin/security/roles/create"
            element={
              <PermissionRoute permissionCode="roles.create">
                <SecurityRoleFormPage />
              </PermissionRoute>
            }
          />

          <Route
            path="/admin/security/roles/:id/edit"
            element={
              <PermissionRoute permissionCode="roles.update">
                <SecurityRoleFormPage />
              </PermissionRoute>
            }
          />

          <Route
            path="/admin/security/roles/:id/permissions"
            element={
              <PermissionRoute permissionCode="roles.assign">
                <SecurityRolePermissionsPage />
              </PermissionRoute>
            }
          />

          {/* ----------------------------------------------
                     * Security - permissions
                     * ---------------------------------------------- */}

          <Route
            path="/admin/security/permissions"
            element={
              <PermissionRoute permissionCode="permissions.read">
                <SecurityPermissionsPage />
              </PermissionRoute>
            }
          />

          <Route
            path="/admin/security/permissions/create"
            element={
              <PermissionRoute permissionCode="permissions.create">
                <SecurityPermissionFormPage />
              </PermissionRoute>
            }
          />

          <Route
            path="/admin/security/permissions/:id/edit"
            element={
              <PermissionRoute permissionCode="permissions.update">
                <SecurityPermissionFormPage />
              </PermissionRoute>
            }
          />

          {/* ----------------------------------------------
                     * Advertisement management home
                     *
                     * This is the new entry point for the module.
                     * ---------------------------------------------- */}

          <Route
            path="/admin/advertisements"
            element={
              <PermissionRoute permissionCode="advertisements.read">
                <AdvertisementManagementHomePage />
              </PermissionRoute>
            }
          />

          {/* ----------------------------------------------
                     * Advertisement records
                     * ---------------------------------------------- */}

          <Route path="/admin/advertisements/enquiries" element={
            <PermissionRoute permissionCode="advertisements.read"><AdvertisementEnquiriesPage /></PermissionRoute>
          } />
          <Route
            path="/admin/advertisements/list"
            element={
              <PermissionRoute permissionCode="advertisements.read">
                <AdvertisementManagementPage />
              </PermissionRoute>
            }
          />

          <Route
            path="/admin/advertisements/search"
            element={
              <PermissionRoute permissionCode="advertisements.read">
                <AdvertisementSearchPage />
              </PermissionRoute>
            }
          />

          <Route
            path="/admin/advertisements/create"
            element={<AdvertisementCreatePage />}
          />

          {/* ----------------------------------------------
                     * Advertisement clients
                     * ---------------------------------------------- */}

          <Route
            path="/admin/advertisements/clients"
            element={
              <PermissionRoute permissionCode="advertisements.read">
                <ClientSearchPage />
              </PermissionRoute>
            }
          />

          <Route
            path="/admin/advertisements/client-configuration"
            element={
              <PermissionRoute permissionCode="advertisements.clients.read">
                <ClientConfigurationPage />
              </PermissionRoute>
            }
          />

          {/* ----------------------------------------------
                     * Placement configuration
                     * ---------------------------------------------- */}

          <Route
            path="/admin/advertisements/business-types"
            element={<PermissionRoute permissionCode="advertisements.clients.read"><BusinessTypeConfigurationPage /></PermissionRoute>}
          />

          <Route
            path="/admin/advertisements/placements"
            element={
              <PermissionRoute permissionCode="advertisements.read">
                <AdvertisementPlacementPage />
              </PermissionRoute>
            }
          />

          <Route path="/admin/advertisements/formats" element={<PermissionRoute permissionCode="advertisements.formats.read"><AdvertisementFormatsPage /></PermissionRoute>} />

          {/* ----------------------------------------------
                     * Rate card configuration
                     * ---------------------------------------------- */}

          <Route
            path="/admin/advertisements/rate-cards"
            element={
              <PermissionRoute permissionCode="advertisements.read">
                <AdvertisementRateCardsPage />
              </PermissionRoute>
            }
          />

          <Route
            path="/admin/advertisements/financial-approval-thresholds"
            element={
              <PermissionRoute permissionCode="advertisements.financial_approval_thresholds.read">
                <FinancialApprovalThresholdsPage />
              </PermissionRoute>
            }
          />

          {/* ----------------------------------------------
                     * Advertisement draft/edit workflow
                     *
                     * Keep these routes distinct from the workspace.
                     * ---------------------------------------------- */}

          <Route
            path="/admin/advertisements/:id/edit"
            element={<AdvertisementCreatePage />}
          />

          {/* ----------------------------------------------
                     * Advertisement workspace
                     * ---------------------------------------------- */}

          <Route
            path="/admin/advertisements/:id/workspace"
            element={<AdvertisementWorkspacePage />}
          />

          <Route
            path="/admin/advertisements/:id"
            element={<AdvertisementWorkspacePage />}
          />
        </Route>

        {/* ------------------------------------------------
                 * Not found
                 * ------------------------------------------------ */}

        <Route
          path="*"
          element={<NotFoundPage />}
        />
      </Routes>
    </>
  );
};

/** Set admin tab titles without interfering with public article titles. */
function AdminPageTitleWatcher() {
  const { pathname } = useLocation();

  useEffect(() => {
    const path = pathname.replace(/\/+$/, "") || "/";
    const advertisementRoot = "/admin/advertisements";
    let title: string | null = null;

    if (path === "/admin") {
      title = "Administration Dashboard";
    } else if (path === "/admin/security") {
      title = "Security Administration";
    } else if (path === "/admin/security/maintenance") {
      title = "System Maintenance";
    } else if (path === "/admin/security/users") {
      title = "User Management";
    } else if (path === "/admin/security/users/create") {
      title = "Create User";
    } else if (/^\/admin\/security\/users\/\d+\/edit$/.test(path)) {
      title = "Edit User";
    } else if (path === "/admin/security/roles") {
      title = "Role Management";
    } else if (path === "/admin/security/roles/create") {
      title = "Create Role";
    } else if (/^\/admin\/security\/roles\/\d+\/edit$/.test(path)) {
      title = "Edit Role";
    } else if (/^\/admin\/security\/roles\/\d+\/permissions$/.test(path)) {
      title = "Role Permissions";
    } else if (path === "/admin/security/permissions") {
      title = "Permission Management";
    } else if (path === "/admin/security/permissions/create") {
      title = "Create Permission";
    } else if (/^\/admin\/security\/permissions\/\d+\/edit$/.test(path)) {
      title = "Edit Permission";
    } else if (path === "/admin/news") {
      title = "News Administration";
    } else if (path.startsWith("/admin/news/")) {
      title = "News Management";
    } else if (path === advertisementRoot || path === `${advertisementRoot}/list`) {
      title = "Advertisement Management";
    } else if (path === `${advertisementRoot}/search`) {
      title = "Search Advertisement";
    } else if (path === `${advertisementRoot}/client-configuration`) {
      title = "Client Configuration";
    } else if (path === `${advertisementRoot}/business-types`) {
      title = "Business Type Configuration";
    } else if (path === `${advertisementRoot}/formats`) {
      title = "Format Configuration";
    } else if (path === `${advertisementRoot}/placements`) {
      title = "Placement Configuration";
    } else if (path === `${advertisementRoot}/rate-cards`) {
      title = "Rate Card Configuration";
    } else if (path === `${advertisementRoot}/financial-approval-thresholds`) {
      title = "Financial Approval Thresholds Configuration";
    } else if (path === `${advertisementRoot}/create`) {
      title = "Create Advertisement";
    } else if (/^\/admin\/advertisements\/\d+(?:\/workspace)?$/.test(path)) {
      title = "Advertisement Workspace";
    } else if (/^\/admin\/advertisements\/\d+\/edit$/.test(path)) {
      title = "Create Advertisement";
    }

    if (title !== null) {
      document.title = `${title} | www.thenewstime.in`;
    }
  }, [pathname]);

  return null;
}

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