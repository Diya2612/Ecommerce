"use client";

import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/utils/utils";

/**
 * CartSheet - Custom Sheet component for CartDrawer
 * 
 * This is a modified version of the Sheet component that:
 * 1. Spans the full width of the screen
 * 2. Has a custom overlay that doesn't close the sheet when clicking on the left side
 * 3. Allows interactive content on both sides
 * 4. Has smooth premium animations
 */

function CartSheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
    return <SheetPrimitive.Root data-slot="cart-sheet" {...props} />;
}

function CartSheetTrigger({ ...props }: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
    return <SheetPrimitive.Trigger data-slot="cart-sheet-trigger" {...props} />;
}

function CartSheetClose({ ...props }: React.ComponentProps<typeof SheetPrimitive.Close>) {
    return <SheetPrimitive.Close data-slot="cart-sheet-close" {...props} />;
}

function CartSheetPortal({ ...props }: React.ComponentProps<typeof SheetPrimitive.Portal>) {
    return <SheetPrimitive.Portal data-slot="cart-sheet-portal" {...props} />;
}

interface CartSheetContentProps extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content> {
    leftContent?: React.ReactNode;
    onOverlayClick?: () => void;
    isOpen?: boolean;
}

/**
 * Custom Sheet Content with two-column layout and premium animations
 */
const CartSheetContent = React.forwardRef<
    React.ElementRef<typeof SheetPrimitive.Content>,
    CartSheetContentProps
>(({ className, children, leftContent, onOverlayClick, isOpen, ...props }, ref) => {
    return (
        <CartSheetPortal forceMount>
            <AnimatePresence mode="wait">
                {isOpen && (
                    <>
                        {/* Animated Overlay */}
                        <SheetPrimitive.Overlay asChild forceMount>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md"
                                onClick={(e) => {
                                    if (e.target === e.currentTarget && onOverlayClick) {
                                        onOverlayClick();
                                    }
                                }}
                            />
                        </SheetPrimitive.Overlay>

                        {/* Full-width container for both columns */}
                        <div className="fixed inset-0 z-50 flex pointer-events-none">
                            {/* Left Side - Carousel with slide-in animation */}
                            {leftContent && (
                                <motion.div
                                    initial={{ opacity: 0, x: -50 }}
                                    animate={{
                                        opacity: 1,
                                        x: 0,
                                        transition: {
                                            duration: 0.4,
                                            delay: 0.1,
                                            ease: "easeOut"
                                        }
                                    }}
                                    exit={{
                                        opacity: 0,
                                        x: -50,
                                        transition: { duration: 0.2 }
                                    }}
                                    className="hidden xl:flex flex-1 items-center justify-center p-8 xl:pr-[500px]"
                                >
                                    <div
                                        className="w-auto max-w-5xl pointer-events-auto"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {leftContent}
                                    </div>
                                </motion.div>
                            )}

                            {/* Right Side - Cart Content with slide-in from right */}
                            <SheetPrimitive.Content
                                ref={ref}
                                data-slot="cart-sheet-content"
                                asChild
                                forceMount
                                onPointerDownOutside={(e) => e.preventDefault()}
                                onInteractOutside={(e) => e.preventDefault()}
                                {...props}
                            >
                                <motion.div
                                    initial={{ x: "100%" }}
                                    animate={{ x: 0 }}
                                    exit={{ x: "100%" }}
                                    transition={{
                                        type: "spring",
                                        damping: 25,
                                        stiffness: 300,
                                        mass: 0.8
                                    }}
                                    className={cn(
                                        "bg-background fixed z-50 flex flex-col shadow-2xl",
                                        "inset-y-0 right-0 h-full w-full sm:w-[500px] border-l pointer-events-auto",
                                        className
                                    )}
                                >
                                    {children}
                                    <SheetPrimitive.Close className="ring-offset-background focus:ring-ring bg-secondary absolute top-4 right-4 rounded-full w-8 h-8 flex items-center justify-center opacity-70 transition-all hover:opacity-100 hover:bg-gray-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none z-10">
                                        <XIcon className="size-4" />
                                        <span className="sr-only">Close</span>
                                    </SheetPrimitive.Close>
                                </motion.div>
                            </SheetPrimitive.Content>
                        </div>
                    </>
                )}
            </AnimatePresence>
        </CartSheetPortal>
    );
});
CartSheetContent.displayName = "CartSheetContent";

function CartSheetHeader({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="cart-sheet-header"
            className={cn("flex flex-col gap-1.5 p-4", className)}
            {...props}
        />
    );
}

function CartSheetTitle({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Title>) {
    return (
        <SheetPrimitive.Title
            data-slot="cart-sheet-title"
            className={cn("text-foreground font-semibold", className)}
            {...props}
        />
    );
}

export {
    CartSheet,
    CartSheetTrigger,
    CartSheetClose,
    CartSheetContent,
    CartSheetHeader,
    CartSheetTitle,
};
