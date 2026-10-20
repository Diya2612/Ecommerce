import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { PageLoaderSkeleton } from "@/components/ui/loading-skeletons";

interface ProtectedProps {
    children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedProps) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <PageLoaderSkeleton />;
    }

    if (!user) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location.pathname }}
            />
        );
    }

    return <>{children}</>;
};

export default ProtectedRoute;
