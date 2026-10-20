import { lazy } from "react";
import { Route } from "react-router-dom";
import { ProtectedLayout } from "@/layouts/ProtectedLayout";

// Lazy load access management pages
const AccessManagementPage = lazy(() => import("@/features/access-management/pages/AccessManagementPage"));
const RolesManagementPage = lazy(() => import("@/features/access-management/pages/RolesManagementPage"));
const PermissionCataloguePage = lazy(() => import("@/features/access-management/pages/PermissionCataloguePage"));

export const accessManagementRoutes = (
  <>
    <Route path="/access-management" element={<ProtectedLayout><AccessManagementPage /></ProtectedLayout>} />
    <Route path="/access-management/roles" element={<ProtectedLayout><RolesManagementPage /></ProtectedLayout>} />
    <Route path="/access-management/permissions" element={<ProtectedLayout><PermissionCataloguePage /></ProtectedLayout>} />
  </>
);