import { lazy } from "react";
import { Route, Navigate } from "react-router-dom";

// Lazy load auth pages
const LoginPage = lazy(() => import("@/features/auth/pages/LoginPage"));
const AuthCallback = lazy(() => import("@/features/auth/pages/AuthCallback"));

export const authRoutes = (
  <>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/signup" element={<Navigate to="/login" replace />} />
    <Route path="/auth/callback" element={<AuthCallback />} />
  </>
);