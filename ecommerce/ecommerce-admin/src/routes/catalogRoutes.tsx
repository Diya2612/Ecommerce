import { lazy } from "react";
import { Route, useNavigate } from "react-router-dom";
import { ProtectedLayout } from "@/layouts/ProtectedLayout";

// Lazy load catalog pages
const CatalogsPage = lazy(() => import("@/features/catalogs/pages/CatalogsPage"));
const AddCatalogPage = lazy(() => import("@/features/catalogs/pages/AddCatalogPage"));

const AddCatalogWrapper = () => {
    const navigate = useNavigate();
    return <AddCatalogPage onBack={() => navigate("/catalogs")} />;
};

// eslint-disable-next-line react-refresh/only-export-components

export const catalogRoutes = (
    <>
        <Route path="/catalogs" element={<ProtectedLayout><CatalogsPage /></ProtectedLayout>} />
        <Route path="/catalogs/new" element={<ProtectedLayout><AddCatalogWrapper /></ProtectedLayout>} />
    </>
);
