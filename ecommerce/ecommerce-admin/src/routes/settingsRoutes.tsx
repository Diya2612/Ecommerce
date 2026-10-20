import { lazy } from "react";
import { Route } from "react-router-dom";
import { ProtectedLayout } from "@/layouts/ProtectedLayout";

// Lazy load settings pages
const SettingsOverviewPage = lazy(() => import("@/features/settings/pages/SettingsOverviewPage"));
const StoreDetailsPage = lazy(() => import("@/features/settings/pages/StoreDetailsPage"));
const UsersPermissionsPage = lazy(() => import("@/features/settings/pages/UsersPermissionsPage"));
const SettingsRolesPage = lazy(() => import("@/features/settings/pages/SettingsRolesPage"));
const LocationsPage = lazy(() => import("@/features/settings/pages/LocationsPage"));
const ShippingPage = lazy(() => import("@/features/settings/pages/ShippingPage"));
const PaymentsPage = lazy(() => import("@/features/settings/pages/PaymentsPage"));
const CheckoutPage = lazy(() => import("@/features/settings/pages/CheckoutPage"));
const TaxesPage = lazy(() => import("@/features/settings/pages/TaxesPage"));
const MarketsPage = lazy(() => import("@/features/settings/pages/MarketsPage"));
const LanguagesPage = lazy(() => import("@/features/settings/pages/LanguagesPage"));
const NotificationsPage = lazy(() => import("@/features/settings/pages/NotificationsPage"));
const AppsPage = lazy(() => import("@/features/settings/pages/AppsPage"));
const MetafieldsPage = lazy(() => import("@/features/settings/pages/MetafieldsPage"));
const PoliciesPage = lazy(() => import("@/features/settings/pages/PoliciesPage"));
const CustomPolicyPage = lazy(() => import("@/features/settings/pages/CustomPolicyPage"));
const PlanPage = lazy(() => import("@/features/settings/pages/PlanPage"));
const BillingPage = lazy(() => import("@/features/settings/pages/BillingPage"));

export const settingsRoutes = (
  <>
    <Route path="/settings" element={<ProtectedLayout><SettingsOverviewPage /></ProtectedLayout>} />
    <Route path="/settings/store" element={<ProtectedLayout><StoreDetailsPage /></ProtectedLayout>} />
    <Route path="/settings/users" element={<ProtectedLayout><UsersPermissionsPage /></ProtectedLayout>} />
    <Route path="/settings/roles" element={<ProtectedLayout><SettingsRolesPage /></ProtectedLayout>} />
    <Route path="/settings/locations" element={<ProtectedLayout><LocationsPage /></ProtectedLayout>} />
    <Route path="/settings/shipping" element={<ProtectedLayout><ShippingPage /></ProtectedLayout>} />
    <Route path="/settings/payments" element={<ProtectedLayout><PaymentsPage /></ProtectedLayout>} />
    <Route path="/settings/checkout" element={<ProtectedLayout><CheckoutPage /></ProtectedLayout>} />
    <Route path="/settings/taxes" element={<ProtectedLayout><TaxesPage /></ProtectedLayout>} />
    <Route path="/settings/markets" element={<ProtectedLayout><MarketsPage /></ProtectedLayout>} />
    <Route path="/settings/languages" element={<ProtectedLayout><LanguagesPage /></ProtectedLayout>} />
    <Route path="/settings/notifications" element={<ProtectedLayout><NotificationsPage /></ProtectedLayout>} />
    <Route path="/settings/apps" element={<ProtectedLayout><AppsPage /></ProtectedLayout>} />
    <Route path="/settings/metafields" element={<ProtectedLayout><MetafieldsPage /></ProtectedLayout>} />
    <Route path="/settings/policies" element={<ProtectedLayout><PoliciesPage /></ProtectedLayout>} />
    <Route path="/settings/policies/custom/new" element={<ProtectedLayout><CustomPolicyPage /></ProtectedLayout>} />
    <Route path="/settings/policies/custom/:id" element={<ProtectedLayout><CustomPolicyPage /></ProtectedLayout>} />
    <Route path="/settings/plan" element={<ProtectedLayout><PlanPage /></ProtectedLayout>} />
    <Route path="/settings/billing" element={<ProtectedLayout><BillingPage /></ProtectedLayout>} />
  </>
);