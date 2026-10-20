import { useEffect } from "react";
import { useBlocker } from "react-router-dom";
import { UnsavedChangesDialog } from "@/components/dialogs/UnsavedChangesDialog";
import { useState } from "react";

/**
 * Props for the UnsavedChangesGuard component
 */
interface UnsavedChangesGuardProps {
  /**
   * Whether there are unsaved changes
   */
  hasChanges: boolean;
  /**
   * Enable or disable the guard
   */
  enabled?: boolean;
  /**
   * The content to render
   */
  children: React.ReactNode;
  /**
   * Title for the confirmation dialog
   */
  title?: string;
  /**
   * Description for the confirmation dialog
   */
  description?: string;
  /**
   * Callback when the user chooses to discard changes
   */
  onDiscard?: () => void;
  /**
   * Callback when the user chooses to continue editing
   */
  onCancel?: () => void;
}

/**
 * A component that prevents navigation when there are unsaved changes.
 * It uses react-router-dom's useBlocker hook.
 */
export const UnsavedChangesGuard = ({
  hasChanges,
  enabled = true,
  children,
  title = "Discard unsaved changes?",
  description = "You have unsaved changes that will be lost if you leave this page. Are you sure you want to discard your changes?",
  onDiscard,
  onCancel,
}: UnsavedChangesGuardProps) => {
  const [showPrompt, setShowPrompt] = useState(false);

  // Handle beforeunload (browser close/refresh)
  useEffect(() => {
    if (!enabled || !hasChanges) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
      return "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [enabled, hasChanges]);

  // Handle React Router navigation
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      enabled &&
      hasChanges &&
      currentLocation.pathname !== nextLocation.pathname,
  );

  useEffect(() => {
    if (blocker.state === "blocked") {
      setShowPrompt(true);
    } else {
      setShowPrompt(false);
    }
  }, [blocker.state]);

  const handleDiscard = () => {
    if (blocker.state === "blocked") {
      blocker.proceed();
    }
    setShowPrompt(false);
    onDiscard?.();
  };

  const handleContinueEditing = () => {
    if (blocker.state === "blocked") {
      blocker.reset();
    }
    setShowPrompt(false);
    onCancel?.();
  };

  return (
    <>
      {children}
      <UnsavedChangesDialog
        open={showPrompt}
        onOpenChange={setShowPrompt}
        onDiscard={handleDiscard}
        onContinueEditing={handleContinueEditing}
        title={title}
        description={description}
      />
    </>
  );
};
