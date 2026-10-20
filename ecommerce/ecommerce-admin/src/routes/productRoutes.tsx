import { lazy } from "react";
import { Route } from "react-router-dom";
import { ProtectedLayout } from "@/layouts/ProtectedLayout";

// Lazy load product pages
const ProductListPage = lazy(() => import("@/features/products/pages/ProductListPage"));
const ProductDetailPage = lazy(() => import("@/features/products/pages/ProductDetailPage"));
const AddProductPage = lazy(() => import("@/features/products/pages/AddProductPage"));
const ReviewListPage = lazy(() => import("@/features/reviews/pages/ReviewListPage").then(m => ({ default: m.ReviewListPage })));

export const productRoutes = (
  <>
    <Route path="/products" element={<ProtectedLayout><ProductListPage /></ProtectedLayout>} />
    <Route path="/products/add" element={<ProtectedLayout><AddProductPage /></ProtectedLayout>} />
    <Route path="/products/reviews" element={<ProtectedLayout><ReviewListPage /></ProtectedLayout>} />
    <Route path="/products/:id" element={<ProtectedLayout><ProductDetailPage /></ProtectedLayout>} />
  </>
);