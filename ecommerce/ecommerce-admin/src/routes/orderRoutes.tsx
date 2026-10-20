import { lazy } from "react";
import { Route } from "react-router-dom";
import { ProtectedLayout } from "@/layouts/ProtectedLayout";

// Lazy load order pages
const OrderListPage = lazy(() => import("@/features/orders/pages/OrderListPage"));
const OrderDetailPage = lazy(() => import("@/features/orders/pages/OrderDetailPage"));
const AddOrderPage = lazy(() => import("@/features/orders/pages/AddOrderPage"));
const DraftOrdersPage = lazy(() => import("@/features/orders/pages/DraftOrdersPage"));
const DraftOrderEditPage = lazy(() => import("../features/orders/pages/DraftOrderEditPage"));
const AbandonedCartsPage = lazy(() => import("@/features/orders/pages/AbandonedCartsPage"));

export const orderRoutes = (
  <>
    <Route path="/orders" element={<ProtectedLayout><OrderListPage /></ProtectedLayout>} />
    <Route path="/orders/:id" element={<ProtectedLayout><OrderDetailPage /></ProtectedLayout>} />
    <Route path="/orders/new" element={<ProtectedLayout><AddOrderPage /></ProtectedLayout>} />
    <Route path="/orders/draft" element={<ProtectedLayout><DraftOrdersPage /></ProtectedLayout>} />
    <Route path="/orders/draft/:id" element={<ProtectedLayout><DraftOrderEditPage /></ProtectedLayout>} />
    <Route path="/orders/abandoned-cart" element={<ProtectedLayout><AbandonedCartsPage /></ProtectedLayout>} />
  </>
);