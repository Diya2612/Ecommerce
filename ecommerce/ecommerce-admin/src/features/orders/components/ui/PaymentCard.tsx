import { CreditCard } from "lucide-react";
import { FormSection } from "@/components/forms/FormSection";
import { cn } from "@/lib/utils";

interface PaymentCardProps {
  paymentStatus: string;
  paymentMethod: string;
  paymentTerms?: string;
}

const STATUS_STYLES: Record<string, string> = {
  paid: "bg-emerald-100 text-emerald-700 border-emerald-200",
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  failed: "bg-red-100 text-red-700 border-red-200",
  refunded: "bg-blue-100 text-blue-700 border-blue-200",
  partially_refunded: "bg-orange-100 text-orange-700 border-orange-200",
};

const METHOD_LABELS: Record<string, string> = {
  cod: "Cash on Delivery",
  prepaid: "Prepaid",
  partial: "Partial",
  credit: "Credit",
  upi: "UPI",
  card: "Card",
  netbanking: "Net Banking",
};

const TERMS_LABELS: Record<string, string> = {
  net_30: "Net 30",
  net_15: "Net 15",
  net_60: "Net 60",
  immediate: "Immediate",
  cod: "Cash on Delivery",
};

function InfoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-b-0">
      <span className="text-xs text-slate-500">{label}</span>
      <div className="text-xs font-medium text-slate-800">{children}</div>
    </div>
  );
}

export function PaymentCard({
  paymentStatus,
  paymentMethod,
  paymentTerms,
}: PaymentCardProps) {
  const statusStyle =
    STATUS_STYLES[paymentStatus] ?? "bg-slate-100 text-slate-600 border-slate-200";
  const statusLabel =
    paymentStatus.charAt(0).toUpperCase() +
    paymentStatus.slice(1).replace("_", " ");

  const methodLabel =
    METHOD_LABELS[paymentMethod] ??
    paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1);

  const termsLabel = paymentTerms
    ? TERMS_LABELS[paymentTerms] ?? paymentTerms
    : "Net 30";

  return (
    <FormSection icon={CreditCard} title="Payment">
      <div className="-mx-1">
        <InfoRow label="Terms">{termsLabel}</InfoRow>
        <InfoRow label="Status">
          <span
            className={cn(
              "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border",
              statusStyle
            )}
          >
            {statusLabel}
          </span>
        </InfoRow>
        <InfoRow label="Method">{methodLabel}</InfoRow>
      </div>
    </FormSection>
  );
}
