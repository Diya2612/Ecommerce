import { lazy } from "react";
import { Route } from "react-router-dom";
import { ProtectedLayout } from "@/layouts/ProtectedLayout";

// Lazy load tier pages
const TierListPage = lazy(() => import("@/features/tiers/pages/TierListPage"));
const AddTierPage = lazy(() => import("@/features/tiers/pages/AddTierPage"));
const TierDetailPage = lazy(() => import("@/features/tiers/pages/TierDetailPage"));

export const tierRoutes = (
    <>
        <Route path="/tiers" element={<ProtectedLayout><TierListPage /></ProtectedLayout>} />
        <Route path="/tiers/new" element={<ProtectedLayout><AddTierPage /></ProtectedLayout>} />
        <Route path="/tiers/:id" element={<ProtectedLayout><TierDetailPage /></ProtectedLayout>} />
    </>
);
