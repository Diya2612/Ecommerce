import { lazy } from "react";
import { Route } from "react-router-dom";
import { ProtectedLayout } from "@/layouts/ProtectedLayout";

// Lazy load giftcard pages
const GiftCardListPage = lazy(() => import("@/features/giftcards/pages/GiftCardListPage"));
const CreateGiftCardPage = lazy(() => import("@/features/giftcards/pages/CreateGiftCardPage"));

export const giftcardRoutes = (
  <>
    <Route path="/giftcards" element={<ProtectedLayout><GiftCardListPage /></ProtectedLayout>} />
    <Route path="/giftcards/new" element={<ProtectedLayout><CreateGiftCardPage /></ProtectedLayout>} />
    <Route path="/giftcards/:id" element={<ProtectedLayout><CreateGiftCardPage /></ProtectedLayout>} />
  </>
);