import { lazy } from "react";
import { Route } from "react-router-dom";
import { ProtectedLayout } from "@/layouts/ProtectedLayout";

// Lazy load dashboard pages
const DashboardPage = lazy(() => import("@/features/dashboard/pages/DashboardPage"));

export const dashboardRoutes = (
  <>
    <Route path="/dashboard" element={<ProtectedLayout><DashboardPage /></ProtectedLayout>} />
  </>
);