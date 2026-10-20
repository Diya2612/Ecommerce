import { lazy } from "react";
import { Route } from "react-router-dom";
import { ProtectedLayout } from "@/layouts/ProtectedLayout";

// Lazy load bundle pages
const BundleListPage = lazy(() => import("@/features/bundles/pages/BundleListPage"));
const BundleDetailPage = lazy(() => import("@/features/bundles/pages/BundleDetailPage"));
const AddBundlePage = lazy(() => import("@/features/bundles/pages/AddBundlePage"));

export const bundleRoutes = (
  <>
    <Route path="/bundles" element={<ProtectedLayout><BundleListPage /></ProtectedLayout>} />
    <Route path="/bundles/:id" element={<ProtectedLayout><BundleDetailPage /></ProtectedLayout>} />
    <Route path="/bundles/new" element={<ProtectedLayout><AddBundlePage /></ProtectedLayout>} />
  </>
);