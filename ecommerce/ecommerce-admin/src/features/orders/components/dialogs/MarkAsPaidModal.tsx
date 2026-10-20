
import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface MarkAsPaidModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isLoading?: boolean;
}

export function MarkAsPaidModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: MarkAsPaidModalProps) {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    onConfirm(reason);
    setReason(""); // Reset after confirm
  };
  
  const handleOpenChange = (open: boolean) => {
      if (!open) {
          onClose();
          setReason("");
      }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mark Order as Paid</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="payment-reason">Payment Note / Reason (Optional)</Label>
            <Textarea
              id="payment-reason"
              placeholder="e.g., Received via Bank Transfer, Cash, etc."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="resize-none h-24"
              maxLength={255}
            />
            <p className="text-xs text-slate-500 text-right">
              {reason.length}/255
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
