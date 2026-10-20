import React, { Suspense } from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
  Navigate,
  Outlet
} from "react-router-dom";

import { ErrorBoundary } from "@/components/layouts/ErrorBoundary";
import { PageLoaderSkeleton } from "@/components/ui/loading-skeletons";

import "./index.css";

// Import route modules individually to prevent circular dependency
// Order alphabetically to avoid any initialization order issues
import { accessManagementRoutes } from "@/routes/accessManagementRoutes";
import { authRoutes } from "@/routes/authRoutes";
import { bundleRoutes } from "@/routes/bundleRoutes";
import { catalogRoutes } from "@/routes/catalogRoutes";
import { chatRoutes } from "@/routes/chatRoutes";
import { customerRoutes } from "@/routes/customerRoutes";
import { dashboardRoutes } from "@/routes/dashboardRoutes";
import { discountRoutes } from "@/routes/discountRoutes";
import { giftcardRoutes } from "@/routes/giftcardRoutes";
import { inventoryRoutes } from "@/routes/inventoryRoutes";
import { notificationRoutes } from "@/routes/notificationRoutes";
import { orderRoutes } from "@/routes/orderRoutes";
import { productRoutes } from "@/routes/productRoutes";
import { profileRoutes } from "@/routes/profileRoutes";
import { settingsRoutes } from "@/routes/settingsRoutes";
import { tierRoutes } from "@/routes/tierRoutes";

import "./index.css";

const RootLayout = () => (
  <ErrorBoundary>
    <Suspense fallback={<PageLoaderSkeleton />}>
      <Outlet />
    </Suspense>
  </ErrorBoundary>
);

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<RootLayout />}>
      {/* Default route - redirect to dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Auth routes */}
      {authRoutes}

      {/* Protected routes */}
      {dashboardRoutes}
      {productRoutes}
      {orderRoutes}
      {customerRoutes}
      {settingsRoutes}
      {discountRoutes}
      {giftcardRoutes}
      {notificationRoutes}
      {bundleRoutes}
      {profileRoutes}
      {accessManagementRoutes}
      {inventoryRoutes}
      {catalogRoutes}
      {tierRoutes}
      {chatRoutes}

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Route>
  )
);

const App: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default App;
