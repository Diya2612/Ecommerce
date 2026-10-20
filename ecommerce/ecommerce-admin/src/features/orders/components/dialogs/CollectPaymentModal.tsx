import { useState, useEffect } from "react";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CollectPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
  balanceDue: number;
  onPaymentRecord?: (data: any) => void;
}

export function CollectPaymentModal({
  isOpen,
  onClose,
  orderNumber,
  balanceDue,
  onPaymentRecord,
}: CollectPaymentModalProps) {
  const [amount, setAmount] = useState<number>(balanceDue);
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [referenceNumber, setReferenceNumber] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      setAmount(balanceDue);
      setPaymentMethod("");
      setReferenceNumber("");
    }
  }, [isOpen, balanceDue]);

  const handleClose = () => {
    onClose();
  };

  const handleRecordPayment = () => {
    if (onPaymentRecord) {
      onPaymentRecord({
        amount,
        paymentMethod,
        referenceNumber,
      });
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b relative">
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
          <DialogTitle className="text-xl font-bold text-slate-900">
            Collect Payment - #{orderNumber}
          </DialogTitle>
          <p className="text-sm text-slate-500 mt-1">
            Record a payment for this order
          </p>
        </DialogHeader>

        <div className="p-6 space-y-5">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">Amount</Label>
            <Input 
              type="number" 
              step="0.01" 
              min="0"
              value={amount}
              onChange={e => setAmount(parseFloat(e.target.value) || 0)}
              className="bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 rounded-xl h-10 font-medium" 
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger className="bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 rounded-xl h-10">
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upi">UPI</SelectItem>
                <SelectItem value="credit_card">Credit Card</SelectItem>
                <SelectItem value="debit_card">Debit Card</SelectItem>
                <SelectItem value="net_banking">Net Banking</SelectItem>
                <SelectItem value="cash">Cash on Delivery</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">Reference Number</Label>
            <Input 
              value={referenceNumber}
              onChange={e => setReferenceNumber(e.target.value)}
              placeholder="Transaction ID / Receipt Number" 
              className="bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 rounded-xl h-10" 
            />
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
            onClick={handleRecordPayment}
            disabled={amount <= 0 || !paymentMethod}
            className="bg-[#0e042f] hover:bg-[#0e042f]/90 text-white rounded-xl h-10 px-6 font-medium"
          >
            Record Payment
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
