import { X, Edit, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface EditOrderConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
  onConfirm: () => void;
}

export function EditOrderConfirmModal({
  isOpen,
  onClose,
  orderNumber,
  onConfirm,
}: EditOrderConfirmModalProps) {
  
  const handleClose = () => {
    onClose();
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b relative shrink-0">
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
          <DialogTitle className="text-xl font-bold flex items-center gap-2 text-slate-900">
            <Edit className="h-5 w-5 text-indigo-600" />
            Edit Order #{orderNumber}
          </DialogTitle>
          <p className="text-sm text-slate-500 mt-1 pl-7">
            Confirm that you want to edit this order
          </p>
        </DialogHeader>

        <div className="p-6 space-y-6">
          
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-semibold text-amber-800 text-sm">Important:</h4>
              <p className="text-sm text-amber-700">Editing this order may affect:</p>
              <ul className="list-disc pl-4 space-y-1 text-sm text-amber-700 marker:text-amber-500">
                <li>Inventory allocation</li>
                <li>Billing and invoicing</li>
                <li>Fulfillment schedule</li>
                <li>Payment records</li>
              </ul>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-slate-700">You'll be able to edit:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-sm text-slate-600 marker:text-slate-400">
              <li>Products, quantities, and variants</li>
              <li>Pricing and discounts</li>
              <li>Customer and shipping information</li>
              <li>Payment terms</li>
              <li>Fulfillment settings</li>
            </ul>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-600">
            <strong className="text-slate-900 font-semibold">Note:</strong> All changes will be tracked in the order history with version control. Certain edits may require approval.
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 pt-0 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            className="rounded-xl h-9 sm:h-[44px] px-4 sm:px-6"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-10 px-6 font-medium gap-2"
          >
            <Edit className="w-4 h-4" />
            Continue Editing
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
