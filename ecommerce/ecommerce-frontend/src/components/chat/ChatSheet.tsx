"use client";

import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { XIcon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/utils/utils";

/**
 * ChatSheet - Custom Sheet component for ChatDrawer
 * 
 * Standardized Radix UI implementation for the Chat Drawer.
 * Features:
 * 1. Full-screen blur overlay
 * 2. Slide-in animation from right
 * 3. Responsive width sizing
 * 4. Accessibility primitives
 */

function ChatSheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
    // modal={false} prevents scroll-lock and body shifting
    return <SheetPrimitive.Root data-slot="chat-sheet" modal={false} {...props} />;
}

function ChatSheetTrigger({ ...props }: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
    return <SheetPrimitive.Trigger data-slot="chat-sheet-trigger" {...props} />;
}

function ChatSheetClose({ ...props }: React.ComponentProps<typeof SheetPrimitive.Close>) {
    return <SheetPrimitive.Close data-slot="chat-sheet-close" {...props} />;
}

function ChatSheetPortal({ ...props }: React.ComponentProps<typeof SheetPrimitive.Portal>) {
    return <SheetPrimitive.Portal data-slot="chat-sheet-portal" {...props} />;
}

interface ChatSheetContentProps extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content> {
    onOverlayClick?: () => void;
}

const ChatSheetContent = React.forwardRef<
    React.ElementRef<typeof SheetPrimitive.Content>,
    ChatSheetContentProps
>(({ className, children, onOverlayClick, ...props }, ref) => {
    return (
        <ChatSheetPortal>
            {/* No overlay - AWS style floating chat window */}
            <SheetPrimitive.Overlay className="fixed inset-0 z-60 pointer-events-none" />

            {/* Chat Content Panel - Bottom-Right Pop-Up (AWS Style) */}
            <SheetPrimitive.Content
                ref={ref}
                data-slot="chat-sheet-content"
                className={cn(
                    "bg-background fixed z-70 flex flex-col shadow-2xl pointer-events-auto",
                    // Bottom-right positioning (like AWS chat widget)
                    "bottom-24 right-6 md:bottom-8 md:right-8",
                    // Fixed dimensions for pop-up window (increased height)
                    "w-[calc(100vw-3rem)] md:w-[380px] lg:w-[420px]",
                    "h-[calc(100vh-8rem)] md:h-[600px] lg:h-[700px]",
                    "max-h-[750px]",
                    // Rounded corners and border
                    "rounded-2xl border border-gray-200 dark:border-slate-700",
                    // Scale & fade animations (pop-up style)
                    "data-[state=open]:animate-in data-[state=closed]:animate-out",
                    "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
                    "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
                    "data-[state=closed]:slide-out-to-bottom-4 data-[state=open]:slide-in-from-bottom-4",
                    "data-[state=closed]:duration-200 data-[state=open]:duration-300",
                    className
                )}
                {...props}
            >
                {/* Visually hidden title for accessibility */}
                <VisuallyHidden.Root>
                    <SheetPrimitive.Title>Chat Assistant</SheetPrimitive.Title>
                </VisuallyHidden.Root>
                {children}
            </SheetPrimitive.Content>
        </ChatSheetPortal>
    );
});
ChatSheetContent.displayName = "ChatSheetContent";

export {
    ChatSheet,
    ChatSheetTrigger,
    ChatSheetClose,
    ChatSheetContent,
};
