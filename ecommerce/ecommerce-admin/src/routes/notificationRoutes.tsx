import { lazy } from "react";
import { Route } from "react-router-dom";
import { ProtectedLayout } from "@/layouts/ProtectedLayout";

// Lazy load notification pages
const NotificationsListPage = lazy(() => import("@/features/notifications/pages/NotificationsListPage"));

export const notificationRoutes = (
  <>
    <Route path="/notifications" element={<ProtectedLayout><NotificationsListPage /></ProtectedLayout>} />
  </>
);