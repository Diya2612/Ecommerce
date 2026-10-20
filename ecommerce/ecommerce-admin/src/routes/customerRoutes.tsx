import { Route } from "react-router-dom";
import { ProtectedLayout } from "@/layouts/ProtectedLayout";

// Static imports for direct and fast page load
import CustomerListPage from "@/features/customers/pages/CustomerListPage";
import CustomerDetailPage from "@/features/customers/pages/CustomerDetailPage";
import AddCustomerPage from "@/features/customers/pages/AddCustomerPage";

export const customerRoutes = (
  <>
    <Route path="/customers" element={<ProtectedLayout><CustomerListPage /></ProtectedLayout>} />
    <Route path="/customers/:id" element={<ProtectedLayout><CustomerDetailPage /></ProtectedLayout>} />
    <Route path="/customers/new" element={<ProtectedLayout><AddCustomerPage /></ProtectedLayout>} />
  </>
);
