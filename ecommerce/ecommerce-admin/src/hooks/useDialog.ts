import { useState, useCallback } from 'react';

/**
 * Return type for useDialog hook
 */
export interface UseDialogReturn {
  /** Current open/closed state of the dialog */
  isOpen: boolean;
  /** Open the dialog */
  open: () => void;
  /** Close the dialog */
  close: () => void;
  /** Toggle dialog open/closed state */
  toggle: () => void;
  /** Set dialog state directly */
  setIsOpen: (value: boolean) => void;
}

/**
 * Custom hook for managing dialog/modal state
 * Provides a consistent API for opening, closing, and toggling dialogs
 * 
 * @param defaultOpen - Initial state of the dialog (default: false)
 * 
 * @example
 * ```tsx
 * const deleteDialog = useDialog();
 * const editDialog = useDialog(false);
 * 
 * return (
 *   <>
 *     <Button onClick={deleteDialog.open}>Delete</Button>
 *     <ConfirmationDialog
 *       isOpen={deleteDialog.isOpen}
 *       onClose={deleteDialog.close}
 *       onConfirm={handleDelete}
 *     />
 *   </>
 * );
 * ```
 */
export function useDialog(defaultOpen = false): UseDialogReturn {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return {
    isOpen,
    open,
    close,
    toggle,
    setIsOpen,
  };
}
