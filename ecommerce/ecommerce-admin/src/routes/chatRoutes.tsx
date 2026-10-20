import { lazy } from "react";
import { Route } from "react-router-dom";
import { ProtectedLayout } from "@/layouts/ProtectedLayout";

// Lazy load chat/conversation pages
const ConversationsPage = lazy(() => import("@/features/chats/pages/ConversationsPage"));
const ConversationDetailPage = lazy(() => import("@/features/chats/pages/ConversationDetailPage"));

export const chatRoutes = (
    <>
        <Route path="/conversations" element={<ProtectedLayout><ConversationsPage /></ProtectedLayout>} />
        <Route path="/conversations/:id" element={<ProtectedLayout><ConversationDetailPage /></ProtectedLayout>} />
    </>
);
