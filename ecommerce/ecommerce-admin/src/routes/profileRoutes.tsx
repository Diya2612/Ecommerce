import { lazy } from "react";
import { Route } from "react-router-dom";
import { ProtectedLayout } from "@/layouts/ProtectedLayout";

// Lazy load profile pages
const ProfilePage = lazy(() => import("@/features/profile/pages/ProfilePage"));

export const profileRoutes = (
  <>
    <Route path="/profile" element={<ProtectedLayout><ProfilePage /></ProtectedLayout>} />
  </>
);