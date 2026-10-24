import { CreditCard, Lock, CheckCircle2, Clock, AlertCircle, Zap } from "lucide-react";
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
  /** Payment method (prepaid, cod, etc.) */
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
            Payment collection is available after the order is created
          </p>
        </div>
      )}

      {/* Active Payment Content */}
      {!isDraftMode && (
        <>
          {/* Payment Method — Razorpay Online */}
          <div className="flex items-center justify-between bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-2.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-[#072654] flex items-center justify-center shrink-0">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800">Razorpay</p>
                <p className="text-[10px] text-slate-500">Online Payment</p>
              </div>
            </div>
            <Badge className="text-[10px] bg-indigo-100 text-indigo-700 border-indigo-200 border">
              Active
            </Badge>
          </div>

          {/* COD — Hidden for now, reserved for future */}
          {/* 
          <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-slate-500" />
              <p className="text-xs font-semibold text-slate-800">Cash on Delivery</p>
            </div>
          </div>
          */}

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
              {/* Primary: Pay via Razorpay */}
              <Button
                variant="default"
                size="sm"
                onClick={onPayWithCard}
                disabled={!hasItems || isRazorpayBusy || !orderId}
                className="w-full h-9 text-xs bg-[#072654] hover:bg-[#072654]/90 text-white rounded-lg font-medium gap-2"
              >
                <Zap className="w-3.5 h-3.5" />
                {isRazorpayBusy ? "Loading Razorpay..." : "Pay via Razorpay"}
              </Button>

              {/* Secondary: Mark as Paid manually */}
              <Button
                variant="outline"
                size="sm"
                onClick={onMarkAsPaid}
                disabled={!hasItems || isMarkingPaid || !orderId}
                className="w-full h-8 text-xs rounded-lg border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                {isMarkingPaid ? "Updating..." : "Mark as Paid"}
              </Button>

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
