"use client";

import { useState, useRef, useCallback, type ReactNode } from 'react';
import { motion, AnimatePresence, PanInfo } from 'motion/react';
import { Trash2, Check, Edit, MoreHorizontal } from 'lucide-react';

interface SwipeAction {
    id: string;
    label: string;
    icon: ReactNode;
    color: string;
    bgColor: string;
    onAction: () => void;
}

interface MobileCardProps {
    children: ReactNode;
    className?: string;
    /** Actions for left swipe (shown on right side) */
    leftSwipeActions?: SwipeAction[];
    /** Actions for right swipe (shown on left side) */
    rightSwipeActions?: SwipeAction[];
    /** Callback when card is tapped */
    onTap?: () => void;
    /** Callback when card is long-pressed */
    onLongPress?: () => void;
    /** Whether the card is disabled */
    disabled?: boolean;
    /** Enable/disable swipe */
    swipeEnabled?: boolean;
    /** Custom swipe threshold (default: 80) */
    swipeThreshold?: number;
}

// Touch Ripple Effect Component
function TouchRipple({ x, y, size }: { x: number; y: number; size: number }) {
    return (
        <motion.span
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 4, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute rounded-full bg-gray-400/30 dark:bg-white/20 pointer-events-none"
            style={{
                left: x - size / 2,
                top: y - size / 2,
                width: size,
                height: size,
            }}
        />
    );
}

// Haptic feedback utility
function triggerHaptic(style: 'light' | 'medium' | 'heavy' = 'light') {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        const duration = style === 'light' ? 10 : style === 'medium' ? 20 : 30;
        navigator.vibrate(duration);
    }
}

export function MobileCard({
    children,
    className = '',
    leftSwipeActions = [],
    rightSwipeActions = [],
    onTap,
    onLongPress,
    disabled = false,
    swipeEnabled = true,
    swipeThreshold = 80,
}: MobileCardProps) {
    const [swipeOffset, setSwipeOffset] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [ripples, setRipples] = useState<{ id: number; x: number; y: number; size: number }[]>([]);
    const cardRef = useRef<HTMLDivElement>(null);
    const longPressTimer = useRef<NodeJS.Timeout | null>(null);
    const hasTriggeredLongPress = useRef(false);
    const rippleId = useRef(0);

    // Calculate which actions to show based on swipe direction
    const showLeftActions = swipeOffset < -20;
    const showRightActions = swipeOffset > 20;
    const actionWidth = 70;

    // Handle pan/swipe gestures
    const handleDragStart = useCallback(() => {
        setIsDragging(true);
    }, []);

    const handleDrag = useCallback((event: any, info: PanInfo) => {
        if (!swipeEnabled || disabled) return;

        const maxOffset = Math.max(leftSwipeActions.length, rightSwipeActions.length) * actionWidth + 20;
        let offset = info.offset.x;

        // Apply rubber-banding at edges
        if (offset < 0 && leftSwipeActions.length === 0) {
            offset = offset * 0.3;
        } else if (offset > 0 && rightSwipeActions.length === 0) {
            offset = offset * 0.3;
        } else if (Math.abs(offset) > maxOffset) {
            const excess = Math.abs(offset) - maxOffset;
            offset = Math.sign(offset) * (maxOffset + excess * 0.2);
        }

        setSwipeOffset(offset);
    }, [swipeEnabled, disabled, leftSwipeActions.length, rightSwipeActions.length]);

    const handleDragEnd = useCallback((event: any, info: PanInfo) => {
        setIsDragging(false);

        if (!swipeEnabled || disabled) {
            setSwipeOffset(0);
            return;
        }

        const velocity = Math.abs(info.velocity.x);
        const shouldSnap = Math.abs(info.offset.x) > swipeThreshold || velocity > 500;

        if (shouldSnap) {
            // Snap to reveal actions
            const actions = info.offset.x < 0 ? leftSwipeActions : rightSwipeActions;
            if (actions.length > 0) {
                const snapOffset = Math.sign(info.offset.x) * actions.length * actionWidth;
                setSwipeOffset(snapOffset);
                triggerHaptic('medium');
            } else {
                setSwipeOffset(0);
            }
        } else {
            // Reset position
            setSwipeOffset(0);
        }
    }, [swipeEnabled, disabled, swipeThreshold, leftSwipeActions, rightSwipeActions]);

    // Handle touch ripple
    const handleTouchStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
        if (disabled) return;

        const rect = cardRef.current?.getBoundingClientRect();
        if (!rect) return;

        const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
        const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
        const size = Math.max(rect.width, rect.height) * 0.3;

        const id = rippleId.current++;
        setRipples(prev => [...prev, { id, x, y, size }]);

        // Clear ripple after animation
        setTimeout(() => {
            setRipples(prev => prev.filter(r => r.id !== id));
        }, 600);

        // Long press detection
        hasTriggeredLongPress.current = false;
        if (onLongPress) {
            longPressTimer.current = setTimeout(() => {
                hasTriggeredLongPress.current = true;
                triggerHaptic('heavy');
                onLongPress();
            }, 500);
        }
    }, [disabled, onLongPress]);

    const handleTouchEnd = useCallback(() => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    }, []);

    const handleClick = useCallback(() => {
        if (disabled || isDragging || Math.abs(swipeOffset) > 10) return;
        if (hasTriggeredLongPress.current) return;

        if (onTap) {
            triggerHaptic('light');
            onTap();
        }
    }, [disabled, isDragging, swipeOffset, onTap]);

    // Close swipe actions
    const closeActions = useCallback(() => {
        setSwipeOffset(0);
    }, []);

    // Execute action and close
    const executeAction = useCallback((action: SwipeAction) => {
        triggerHaptic('medium');
        action.onAction();
        closeActions();
    }, [closeActions]);

    return (
        <div ref={cardRef} className={`relative overflow-hidden ${className}`}>
            {/* Action Buttons - Left Side (for right swipe) */}
            <AnimatePresence>
                {showRightActions && rightSwipeActions.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute left-0 top-0 bottom-0 flex items-stretch"
                    >
                        {rightSwipeActions.map((action, index) => (
                            <motion.button
                                key={action.id}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => executeAction(action)}
                                className={`flex flex-col items-center justify-center gap-1 ${action.bgColor}`}
                                style={{ width: actionWidth }}
                            >
                                <span className={action.color}>{action.icon}</span>
                                <span className={`text-[10px] font-medium ${action.color}`}>
                                    {action.label}
                                </span>
                            </motion.button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Action Buttons - Right Side (for left swipe) */}
            <AnimatePresence>
                {showLeftActions && leftSwipeActions.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute right-0 top-0 bottom-0 flex items-stretch"
                    >
                        {leftSwipeActions.map((action, index) => (
                            <motion.button
                                key={action.id}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => executeAction(action)}
                                className={`flex flex-col items-center justify-center gap-1 ${action.bgColor}`}
                                style={{ width: actionWidth }}
                            >
                                <span className={action.color}>{action.icon}</span>
                                <span className={`text-[10px] font-medium ${action.color}`}>
                                    {action.label}
                                </span>
                            </motion.button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Card Content */}
            <motion.div
                drag={swipeEnabled && !disabled ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.1}
                onDragStart={handleDragStart}
                onDrag={handleDrag}
                onDragEnd={handleDragEnd}
                animate={{ x: swipeOffset }}
                transition={isDragging ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 30 }}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleTouchStart}
                onMouseUp={handleTouchEnd}
                onClick={handleClick}
                className={`relative bg-white dark:bg-slate-800 ${disabled ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}`}
                style={{ touchAction: 'pan-y' }}
            >
                {/* Touch Ripples */}
                {ripples.map(ripple => (
                    <TouchRipple key={ripple.id} x={ripple.x} y={ripple.y} size={ripple.size} />
                ))}

                {children}
            </motion.div>

            {/* Overlay to close actions when tapping outside */}
            {Math.abs(swipeOffset) > 20 && (
                <div
                    className="fixed inset-0 z-[-1]"
                    onClick={closeActions}
                />
            )}
        </div>
    );
}

// Pre-built action configurations
export const SWIPE_ACTIONS = {
    delete: (onAction: () => void): SwipeAction => ({
        id: 'delete',
        label: 'Delete',
        icon: <Trash2 className="w-5 h-5" />,
        color: 'text-white',
        bgColor: 'bg-red-500',
        onAction,
    }),
    edit: (onAction: () => void): SwipeAction => ({
        id: 'edit',
        label: 'Edit',
        icon: <Edit className="w-5 h-5" />,
        color: 'text-white',
        bgColor: 'bg-blue-500',
        onAction,
    }),
    setDefault: (onAction: () => void): SwipeAction => ({
        id: 'default',
        label: 'Default',
        icon: <Check className="w-5 h-5" />,
        color: 'text-white',
        bgColor: 'bg-green-500',
        onAction,
    }),
    more: (onAction: () => void): SwipeAction => ({
        id: 'more',
        label: 'More',
        icon: <MoreHorizontal className="w-5 h-5" />,
        color: 'text-white',
        bgColor: 'bg-gray-500',
        onAction,
    }),
};
