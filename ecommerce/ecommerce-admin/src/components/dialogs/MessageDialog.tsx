/**
 * MessageDialog Component
 * 
 * A reusable dialog component for displaying messages, warnings, or information
 * to users with optional actions.
 * 
 * Use Cases:
 * - Warning messages
 * - Information dialogs
 * - Confirmation dialogs with custom actions
 * - Error messages with actions
 * 
 * @example
 * ```tsx
 * <MessageDialog
 *   open={showWarning}
 *   onOpenChange={setShowWarning}
 *   title="Warning"
 *   description="This action cannot be undone."
 *   variant="warning"
 *   primaryAction={{
 *     label: "Continue",
 *     onClick: handleContinue
 *   }}
 *   secondaryAction={{
 *     label: "Cancel",
 *     onClick: handleCancel
 *   }}
 * />
 * ```
 */

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type MessageDialogVariant = 'default' | 'warning' | 'error' | 'info' | 'success';

export interface DialogAction {
  label: string;
  onClick: () => void | Promise<void>;
  variant?: 'default' | 'destructive' | 'outline' | 'ghost';
  disabled?: boolean;
  isLoading?: boolean;
}

export interface MessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  variant?: MessageDialogVariant;
  primaryAction?: DialogAction;
  secondaryAction?: DialogAction;
  hideActions?: boolean;
}

/**
 * MessageDialog - A flexible, reusable dialog component for messages and confirmations
 */
export function MessageDialog({
  open,
  onOpenChange,
  title,
  description,
  variant = 'default',
  primaryAction,
  secondaryAction,
  hideActions = false,
}: MessageDialogProps) {
  const handlePrimaryAction = async () => {
    if (primaryAction?.onClick) {
      await primaryAction.onClick();
    }
  };

  const handleSecondaryAction = async () => {
    if (secondaryAction?.onClick) {
      await secondaryAction.onClick();
    } else {
      onOpenChange(false);
    }
  };

  const isLoading = primaryAction?.isLoading || secondaryAction?.isLoading;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle
            className={cn(
              variant === 'error' && 'text-red-600',
              variant === 'warning' && 'text-amber-600',
              variant === 'success' && 'text-emerald-600',
              variant === 'info' && 'text-blue-600'
            )}
          >
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="whitespace-pre-line">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        {!hideActions && (
          <AlertDialogFooter>
            {secondaryAction && (
              <AlertDialogCancel
                onClick={(e) => {
                  e.preventDefault();
                  handleSecondaryAction();
                }}
                disabled={isLoading || secondaryAction.disabled}
              >
                {secondaryAction.isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {secondaryAction.label}
                  </>
                ) : (
                  secondaryAction.label
                )}
              </AlertDialogCancel>
            )}
            
            {primaryAction && (
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  handlePrimaryAction();
                }}
                disabled={isLoading || primaryAction.disabled}
                className={cn(
                  primaryAction.variant === 'destructive' && 'bg-red-600 hover:bg-red-700',
                  primaryAction.variant === 'outline' && 'bg-transparent border border-slate-300 text-slate-900 hover:bg-slate-100',
                  primaryAction.variant === 'ghost' && 'bg-transparent text-slate-900 hover:bg-slate-100'
                )}
              >
                {primaryAction.isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {primaryAction.label}
                  </>
                ) : (
                  primaryAction.label
                )}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
