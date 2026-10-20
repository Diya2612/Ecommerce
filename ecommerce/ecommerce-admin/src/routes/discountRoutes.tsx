import { lazy } from "react";
import { Route } from "react-router-dom";
import { ProtectedLayout } from "@/layouts/ProtectedLayout";

// Lazy load discount pages
const DiscountListPage = lazy(() => import("@/features/discounts/pages/DiscountListPage"));
const DiscountPage = lazy(() => import("@/features/discounts/pages/DiscountPage"));

export const discountRoutes = (
  <>
    <Route path="/discounts" element={<ProtectedLayout><DiscountListPage /></ProtectedLayout>} />
    <Route path="/discounts/new" element={<ProtectedLayout><DiscountPage /></ProtectedLayout>} />
    <Route path="/discounts/:id" element={<ProtectedLayout><DiscountPage /></ProtectedLayout>} />
  </>
);