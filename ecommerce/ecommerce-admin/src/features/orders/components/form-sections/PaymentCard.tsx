import { CreditCard, Lock, Wallet, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FormSection } from "@/components/forms";
import { cn } from "@/lib/utils";

export interface PaymentCardProps {
  /** Whether the order is in draft (unsaved) state */
  isDraftMode: boolean;
  /** Payment status from formData */
  paymentStatus: string;
  /** Payment method (prepaid, cod, partial, etc.) */
  paymentMethod?: string;
  /** Order currency symbol */
  currencySymbol?: string;
  /** Grand total amount */
  grandTotal: number;
  /** Amount already paid */
  advancePaid?: number;
  /** Balance still due */
  balanceDue?: number;
  /** Whether razorpay is currently loading */
  razorpayStatus?: "idle" | "loading_sdk" | "creating_order" | "awaiting_payment" | "verifying" | "awaiting_confirmation" | "success" | "failed" | "cancelled" | "error";
  /** Whether the Mark as Paid mutation is in progress */
  isMarkingPaid?: boolean;
  /** Whether the order has at least one item */
  hasItems: boolean;
  /** orderId — undefined means the order hasn't been saved yet */
  orderId?: string;
  /** Triggered when user clicks "Pay with Razorpay" */
  onPayWithCard: () => void;
  /** Triggered when user clicks "Mark as Paid" */
  onMarkAsPaid: () => void;
  /** Triggered when user clicks "Email Payment Invoice" */
  onEmailInvoice: () => void;
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  prepaid: "Prepaid",
  cod: "Cash on Delivery",
  partial: "Partial Payment",
  credit: "Credit / Net Terms",
  bank_transfer: "Bank Transfer",
  upi: "UPI",
  cheque: "Cheque",
  razorpay: "Razorpay",
};

const PAYMENT_STATUS_CONFIG: Record<
  string,
  { label: string; className: string; icon: React.ComponentType<{ className?: string }> }
> = {
  paid: {
    label: "Paid",
    className: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle2,
  },
  partially_paid: {
    label: "Partially Paid",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: AlertCircle,
  },
  pending: {
    label: "Pending",
    className: "bg-slate-100 text-slate-700 border-slate-200",
    icon: Clock,
  },
  refunded: {
    label: "Refunded",
    className: "bg-purple-100 text-purple-800 border-purple-200",
    icon: AlertCircle,
  },
  partially_refunded: {
    label: "Partially Refunded",
    className: "bg-purple-100 text-purple-800 border-purple-200",
    icon: AlertCircle,
  },
  failed: {
    label: "Failed",
    className: "bg-red-100 text-red-800 border-red-200",
    icon: AlertCircle,
  },
};

export function PaymentCard({
  isDraftMode,
  paymentStatus,
  paymentMethod,
  currencySymbol = "₹",
  grandTotal,
  advancePaid = 0,
  balanceDue,
  razorpayStatus = "idle",
  isMarkingPaid = false,
  hasItems,
  orderId,
  onPayWithCard,
  onMarkAsPaid,
  onEmailInvoice,
}: PaymentCardProps) {
  const statusConfig = PAYMENT_STATUS_CONFIG[paymentStatus] ?? PAYMENT_STATUS_CONFIG.pending;
  const StatusIcon = statusConfig.icon;
  const resolvedBalance = balanceDue ?? grandTotal - advancePaid;
  const isPaid = paymentStatus === "paid";
  const isRazorpayBusy =
    razorpayStatus === "loading_sdk" || razorpayStatus === "creating_order";

  const formattedAmount = (amount: number) =>
    `${currencySymbol}${amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  return (
    <FormSection
      icon={CreditCard}
      title="Payment"
      badge={
        <Badge className={cn("text-xs border", statusConfig.className)}>
          <StatusIcon className="w-3 h-3 mr-1" />
          {statusConfig.label}
        </Badge>
      }
      className={cn(isDraftMode && "opacity-70")}
    >
      {/* Draft Locked State */}
      {isDraftMode && (
        <div className="py-4 text-center rounded-lg bg-slate-50 border border-slate-200">
          <Lock className="w-6 h-6 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-slate-600 font-medium mb-1">
            Save Order to Accept Payment
          </p>
          <p className="text-xs text-slate-500">
            Payment collection and online payment links are available after the
            order is created
          </p>
        </div>
      )}

      {/* Active Payment Content */}
      {!isDraftMode && (
        <>
          {/* Payment Method Row */}
          {paymentMethod && (
            <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <Wallet className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-xs text-slate-600 font-medium">Method</span>
              </div>
              <span className="text-xs font-semibold text-slate-800">
                {PAYMENT_METHOD_LABELS[paymentMethod] ?? paymentMethod}
              </span>
            </div>
          )}

          {/* Financial Summary */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Grand Total</span>
              <span className="font-semibold text-slate-800">{formattedAmount(grandTotal)}</span>
            </div>
            {advancePaid > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Paid</span>
                <span className="font-medium text-green-700">{formattedAmount(advancePaid)}</span>
              </div>
            )}
            <Separator className="my-1" />
            <div className="flex justify-between text-xs">
              <span className="font-medium text-slate-700">Balance Due</span>
              <span
                className={cn(
                  "font-bold",
                  resolvedBalance > 0 ? "text-orange-600" : "text-green-600"
                )}
              >
                {formattedAmount(resolvedBalance)}
              </span>
            </div>
          </div>

          {/* Paid Confirmation Banner */}
          {isPaid && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
              <p className="text-xs text-green-800 font-medium">
                Payment received in full
              </p>
            </div>
          )}

          {/* Action Buttons */}
          {!isPaid && (
            <div className="space-y-2 pt-1">
              <Button
                variant="default"
                size="sm"
                onClick={onPayWithCard}
                disabled={!hasItems || isRazorpayBusy || !orderId}
                className="w-full h-8 text-xs bg-[#0e042f] hover:bg-[#0e042f]/90 text-white rounded-lg"
              >
                <CreditCard className="w-3.5 h-3.5 mr-1.5" />
                {isRazorpayBusy ? "Loading..." : "Pay with Razorpay"}
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onMarkAsPaid}
                  disabled={!hasItems || isMarkingPaid || !orderId}
                  className="h-8 text-xs rounded-lg"
                >
                  {isMarkingPaid ? "Updating..." : "Mark as Paid"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onEmailInvoice}
                  disabled={!hasItems}
                  className="h-8 text-xs rounded-lg"
                >
                  Email Invoice
                </Button>
              </div>

              {!orderId && (
                <p className="text-[11px] text-slate-400 text-center pt-0.5">
                  Save the order first to collect payment
                </p>
              )}
            </div>
          )}
        </>
      )}
    </FormSection>
  );
}
