import { lazy } from "react";
import { Route } from "react-router-dom";
import { ProtectedLayout } from "@/layouts/ProtectedLayout";

// Lazy load inventory pages
const InventoryPage = lazy(() => import("@/features/inventory/pages/InventoryPage"));

export const inventoryRoutes = (
    <>
        <Route path="/inventory" element={<ProtectedLayout><InventoryPage /></ProtectedLayout>} />
    </>
);
