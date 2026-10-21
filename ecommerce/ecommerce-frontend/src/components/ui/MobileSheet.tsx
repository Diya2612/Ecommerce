"use client";

import { useState, useRef, useCallback, useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence, PanInfo, useAnimation } from 'motion/react';
import { X } from 'lucide-react';

type SnapPoint = number | 'content';

interface MobileSheetProps {
    /** Whether the sheet is open */
    isOpen: boolean;
    /** Callback when sheet should close */
    onClose: () => void;
    /** Sheet content */
    children: ReactNode;
    /** Snap points as percentages (e.g., [0.25, 0.5, 0.9]) or 'content' for auto-height */
    snapPoints?: SnapPoint[];
    /** Initial snap point index */
    initialSnap?: number;
    /** Show drag handle */
    showHandle?: boolean;
    /** Show close button */
    showCloseButton?: boolean;
    /** Title for the sheet header */
    title?: string;
    /** Custom header content */
    header?: ReactNode;
    /** Custom footer content */
    footer?: ReactNode;
    /** Enable keyboard avoidance */
    avoidKeyboard?: boolean;
    /** Backdrop blur */
    backdropBlur?: boolean;
    /** Custom max height (default: 90vh) */
    maxHeight?: string;
}

// Haptic feedback utility
function triggerHaptic(style: 'light' | 'medium' | 'heavy' = 'light') {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        const duration = style === 'light' ? 10 : style === 'medium' ? 20 : 30;
        navigator.vibrate(duration);
    }
}

export function MobileSheet({
    isOpen,
    onClose,
    children,
    snapPoints = [0.5, 0.9],
    initialSnap = 0,
    showHandle = true,
    showCloseButton = false,
    title,
    header,
    footer,
    avoidKeyboard = true,
    backdropBlur = true,
    maxHeight = '90vh',
}: MobileSheetProps) {
    const [currentSnap, setCurrentSnap] = useState(initialSnap);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const sheetRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const controls = useAnimation();
    const isDragging = useRef(false);

    // Lock body scroll when sheet is open
    useEffect(() => {
        if (isOpen) {
            const scrollY = window.scrollY;
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = '100%';
            document.body.style.overflow = 'hidden';

            return () => {
                document.body.style.position = '';
                document.body.style.top = '';
                document.body.style.width = '';
                document.body.style.overflow = '';
                window.scrollTo(0, scrollY);
            };
        }
    }, [isOpen]);

    // Handle keyboard for avoidance
    useEffect(() => {
        if (!avoidKeyboard || typeof window === 'undefined') return;

        const handleResize = () => {
            // On mobile, window resize with visualViewport gives keyboard height
            if (window.visualViewport) {
                const heightDiff = window.innerHeight - window.visualViewport.height;
                setKeyboardHeight(heightDiff > 50 ? heightDiff : 0);
            }
        };

        window.visualViewport?.addEventListener('resize', handleResize);
        return () => window.visualViewport?.removeEventListener('resize', handleResize);
    }, [avoidKeyboard]);

    // Calculate snap point heights
    const getSnapHeight = useCallback((snap: SnapPoint): number => {
        if (snap === 'content' && contentRef.current) {
            return Math.min(contentRef.current.scrollHeight + 100, window.innerHeight * 0.9);
        }
        return window.innerHeight * (snap as number);
    }, []);

    // Get current height
    const getCurrentHeight = useCallback(() => {
        return getSnapHeight(snapPoints[currentSnap]);
    }, [currentSnap, snapPoints, getSnapHeight]);

    // Handle drag gestures
    const handleDragEnd = useCallback((event: any, info: PanInfo) => {
        isDragging.current = false;
        const velocity = info.velocity.y;
        const offset = info.offset.y;

        // Quick flick down to close
        if (velocity > 500) {
            triggerHaptic('medium');
            onClose();
            return;
        }

        // Quick flick up to expand
        if (velocity < -500 && currentSnap < snapPoints.length - 1) {
            triggerHaptic('light');
            setCurrentSnap(currentSnap + 1);
            return;
        }

        // Find nearest snap point based on current position
        const currentHeight = getCurrentHeight();
        const newHeight = currentHeight - offset;

        let nearestSnap = currentSnap;
        let minDistance = Infinity;

        snapPoints.forEach((snap, index) => {
            const snapHeight = getSnapHeight(snap);
            const distance = Math.abs(newHeight - snapHeight);
            if (distance < minDistance) {
                minDistance = distance;
                nearestSnap = index;
            }
        });

        // Close if dragged below minimum threshold
        if (newHeight < getSnapHeight(snapPoints[0]) * 0.5) {
            triggerHaptic('medium');
            onClose();
            return;
        }

        if (nearestSnap !== currentSnap) {
            triggerHaptic('light');
        }
        setCurrentSnap(nearestSnap);
    }, [currentSnap, snapPoints, getCurrentHeight, getSnapHeight, onClose]);

    // Handle backdrop click
    const handleBackdropClick = useCallback(() => {
        triggerHaptic('light');
        onClose();
    }, [onClose]);

    // Handle close button
    const handleClose = useCallback(() => {
        triggerHaptic('light');
        onClose();
    }, [onClose]);

    // Animate to current snap point
    useEffect(() => {
        if (isOpen) {
            const height = getCurrentHeight();
            controls.start({
                height,
                transition: { type: 'spring', stiffness: 300, damping: 30 }
            });
        }
    }, [isOpen, currentSnap, controls, getCurrentHeight]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={handleBackdropClick}
                        className={`fixed inset-0 z-50 bg-black/50 ${backdropBlur ? 'backdrop-blur-sm' : ''}`}
                    />

                    {/* Sheet */}
                    <motion.div
                        ref={sheetRef}
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        drag="y"
                        dragConstraints={{ top: 0, bottom: 0 }}
                        dragElastic={{ top: 0.05, bottom: 0.5 }}
                        onDragStart={() => { isDragging.current = true; }}
                        onDragEnd={handleDragEnd}
                        style={{
                            height: getCurrentHeight(),
                            paddingBottom: keyboardHeight,
                            maxHeight,
                        }}
                        className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.12)] flex flex-col overflow-hidden"
                    >
                        {/* Drag Handle */}
                        {showHandle && (
                            <div className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing shrink-0">
                                <div className="w-10 h-1 bg-gray-300 dark:bg-slate-600 rounded-full" />
                            </div>
                        )}

                        {/* Header */}
                        {(title || header || showCloseButton) && (
                            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-slate-800 shrink-0">
                                {header || (
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {title}
                                    </h2>
                                )}
                                {showCloseButton && (
                                    <button
                                        onClick={handleClose}
                                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Content */}
                        <div
                            ref={contentRef}
                            className="flex-1 overflow-y-auto overscroll-contain"
                            style={{ touchAction: 'pan-y' }}
                        >
                            {children}
                        </div>

                        {/* Footer */}
                        {footer && (
                            <div className="px-4 py-3 border-t border-gray-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900">
                                {footer}
                            </div>
                        )}

                        {/* Safe Area Spacer */}
                        <div
                            className="shrink-0"
                            style={{ height: 'env(safe-area-inset-bottom, 0px)' }}
                        />
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

// Action Sheet variant for quick actions
interface ActionSheetOption {
    id: string;
    label: string;
    icon?: ReactNode;
    destructive?: boolean;
    disabled?: boolean;
    onSelect: () => void;
}

interface ActionSheetProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message?: string;
    options: ActionSheetOption[];
    cancelLabel?: string;
}

export function ActionSheet({
    isOpen,
    onClose,
    title,
    message,
    options,
    cancelLabel = 'Cancel',
}: ActionSheetProps) {
    const handleSelect = (option: ActionSheetOption) => {
        if (option.disabled) return;
        triggerHaptic('medium');
        option.onSelect();
        onClose();
    };

    const handleCancel = () => {
        triggerHaptic('light');
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                    />

                    {/* Sheet */}
                    <motion.div
                        initial={{ y: '100%', opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: '100%', opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="fixed bottom-0 left-0 right-0 z-50 p-3"
                        style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
                    >
                        {/* Actions Group */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-xl mb-2">
                            {/* Header */}
                            {(title || message) && (
                                <div className="px-4 py-3 text-center border-b border-gray-100 dark:border-slate-700">
                                    {title && (
                                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                                            {title}
                                        </h3>
                                    )}
                                    {message && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                            {message}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Options */}
                            {options.map((option, index) => (
                                <button
                                    key={option.id}
                                    onClick={() => handleSelect(option)}
                                    disabled={option.disabled}
                                    className={`w-full px-4 py-3.5 flex items-center justify-center gap-2.5 text-base font-medium transition-colors ${index < options.length - 1 ? 'border-b border-gray-100 dark:border-slate-700' : ''
                                        } ${option.disabled
                                            ? 'opacity-40 cursor-not-allowed'
                                            : option.destructive
                                                ? 'text-red-600 active:bg-red-50 dark:active:bg-red-900/20'
                                                : 'text-blue-600 dark:text-blue-400 active:bg-blue-50 dark:active:bg-blue-900/20'
                                        }`}
                                >
                                    {option.icon}
                                    {option.label}
                                </button>
                            ))}
                        </div>

                        {/* Cancel Button */}
                        <button
                            onClick={handleCancel}
                            className="w-full px-4 py-3.5 bg-white dark:bg-slate-800 rounded-2xl text-base font-semibold text-blue-600 dark:text-blue-400 active:bg-gray-50 dark:active:bg-slate-700 transition-colors shadow-xl"
                        >
                            {cancelLabel}
                        </button>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

// Alert Dialog variant
interface AlertDialogProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    destructive?: boolean;
}

export function AlertDialog({
    isOpen,
    onClose,
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    onConfirm,
    destructive = false,
}: AlertDialogProps) {
    const handleConfirm = () => {
        triggerHaptic('medium');
        onConfirm();
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6"
                    >
                        {/* Dialog */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            className="w-full max-w-xs bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-xl"
                        >
                            {/* Content */}
                            <div className="px-4 pt-5 pb-4 text-center">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    {title}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {message}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex border-t border-gray-100 dark:border-slate-700">
                                <button
                                    onClick={onClose}
                                    className="flex-1 px-4 py-3.5 text-base font-medium text-blue-600 dark:text-blue-400 active:bg-gray-50 dark:active:bg-slate-700 border-r border-gray-100 dark:border-slate-700"
                                >
                                    {cancelLabel}
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    className={`flex-1 px-4 py-3.5 text-base font-semibold ${destructive
                                            ? 'text-red-600 active:bg-red-50 dark:active:bg-red-900/20'
                                            : 'text-blue-600 dark:text-blue-400 active:bg-blue-50 dark:active:bg-blue-900/20'
                                        }`}
                                >
                                    {confirmLabel}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
