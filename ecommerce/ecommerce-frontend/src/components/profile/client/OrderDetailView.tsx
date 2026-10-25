"use client";

import { motion } from "motion/react";
import {
  Package,
  Truck,
  CheckCircle,
  CheckCircle2,
  Clock,
  ChevronLeft,
  MapPin,
  CreditCard,
  Download,
  AlertCircle,
  Phone,
  Calendar,
  Box,
  CircleCheck,
  CircleDot,
  Circle,
  HelpCircle,
  RefreshCw,
  Loader2,
  Share2,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Order, OrderStatus } from "@/types/order";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOrderDetailQuery } from "@/hooks/queries/orders/useOrders";
import { getOrderById, getLatestInvoice, downloadInvoice } from "@/queries";
import type { InvoiceData } from "@/queries/orders/types";
import { toast } from "sonner";
import { OrderPaymentActions } from "@/components/orders/OrderPaymentActions";
import { OrderDetailsSkeleton } from "@/components/profile/skeletons/OrderDetailsSkeleton";
import {
  getPaymentStatusDisplay,
  needsPayment,
  isPaymentPending,
} from "@/lib/utils/payment-status";

interface OrderDetailViewProps {
  orderId: string;
  onBack?: () => void;
}

// Mobile Horizontal Timeline Step
function MobileTimelineStep({
  icon: Icon,
  title,
  isCompleted,
  isCurrent,
  isFirst,
  isLast,
}: {
  icon: React.ElementType;
  title: string;
  isCompleted: boolean;
  isCurrent: boolean;
  isFirst?: boolean;
  isLast?: boolean;
}) {
  return (
    <div className="flex flex-col items-center relative min-w-[70px]">
      {/* Connecting Line - Before */}
      {!isFirst && (
        <div
          className={`absolute left-0 top-4 w-1/2 h-0.5 ${isCompleted ? "bg-[#00C4CC]" : "bg-gray-200 dark:bg-slate-700"
            }`}
        />
      )}
      {/* Connecting Line - After */}
      {!isLast && (
        <div
          className={`absolute right-0 top-4 w-1/2 h-0.5 ${isCompleted || isCurrent
              ? "bg-[#00C4CC]"
              : "bg-gray-200 dark:bg-slate-700"
            }`}
        />
      )}

      {/* Icon */}
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: isCurrent ? 1.1 : 1 }}
        className={`w-8 h-8 rounded-full flex items-center justify-center z-10 transition-colors ${isCompleted
            ? "bg-green-500 text-white"
            : isCurrent
              ? "bg-[#0B1F51] text-white ring-2 ring-[#0B1F51]/20"
              : "bg-gray-200 dark:bg-slate-700 text-gray-400"
          }`}
      >
        {isCompleted ? (
          <CheckCircle2 className="w-4 h-4" />
        ) : (
          <Icon className="w-4 h-4" />
        )}
      </motion.div>

      {/* Label */}
      <span
        className={`mt-2 text-[10px] font-semibold text-center leading-tight transition-colors ${isCompleted || isCurrent
            ? "text-gray-900 dark:text-white"
            : "text-gray-400"
          }`}
      >
        {title}
      </span>
    </div>
  );
}

// Vertical Timeline Step (Desktop)
function TimelineStep({
  icon: Icon,
  title,
  description,
  time,
  isCompleted,
  isCurrent,
  isLast,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  time?: string;
  isCompleted: boolean;
  isCurrent: boolean;
  isLast?: boolean;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors ${isCompleted
              ? "bg-green-500 text-white"
              : isCurrent
                ? "bg-[#0B1F51] text-white ring-4 ring-[#0B1F51]/10 shadow-lg"
                : "bg-gray-100 dark:bg-slate-800 text-gray-400"
            }`}
        >
          {isCompleted ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <Icon className="w-5 h-5" />
          )}
        </motion.div>
        {!isLast && (
          <div
            className={`w-0.5 flex-1 min-h-[40px] transition-colors ${isCompleted ? "bg-green-500" : "bg-gray-200 dark:bg-slate-700"
              }`}
          />
        )}
      </div>

      <div className={`pb-8 ${isLast ? "pb-0" : ""}`}>
        <div className="flex items-center gap-3 mb-1">
          <h4
            className={`font-semibold transition-colors ${isCompleted || isCurrent
                ? "text-gray-900 dark:text-white"
                : "text-gray-400"
              }`}
          >
            {title}
          </h4>
          {isCurrent && (
            <span className="text-[10px] uppercase tracking-wider bg-[#31CDD4]/10 text-[#31CDD4] px-2 py-0.5 rounded-full font-bold">
              Current Status
            </span>
          )}
        </div>
        <p
          className={`text-sm transition-colors ${isCompleted || isCurrent
              ? "text-gray-600 dark:text-gray-400"
              : "text-gray-400"
            }`}
        >
          {description}
        </p>
        {time && (isCompleted || isCurrent) && (
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {time}
          </p>
        )}
      </div>
    </div>
  );
}

// Status badge component
function StatusBadge({ status }: { status: OrderStatus }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    pending: { bg: "bg-gray-100", text: "text-gray-700", label: "Pending" },
    confirmed: { bg: "bg-blue-100", text: "text-blue-700", label: "Confirmed" },
    processing: {
      bg: "bg-amber-100",
      text: "text-amber-700",
      label: "Processing",
    },
    shipped: { bg: "bg-purple-100", text: "text-purple-700", label: "Shipped" },
    delivered: {
      bg: "bg-green-100",
      text: "text-green-700",
      label: "Delivered",
    },
    cancelled: { bg: "bg-red-100", text: "text-red-700", label: "Cancelled" },
    refunded: {
      bg: "bg-orange-100",
      text: "text-orange-700",
      label: "Refunded",
    },
  };
  const c = config[status] || config.pending;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}
    >
      {status === "delivered" && <CheckCircle className="w-3 h-3" />}
      {status === "shipped" && <Truck className="w-3 h-3" />}
      {status === "processing" && <Package className="w-3 h-3" />}
      {status === "cancelled" && <AlertCircle className="w-3 h-3" />}
      {c.label}
    </span>
  );
}

// Payment status badge
function PaymentStatusBadge({ status }: { status: string }) {
  const display = getPaymentStatusDisplay(status);
  const Icon = display.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${display.bgColor} ${display.color}`}
    >
      <Icon className="w-3 h-3" />
      {display.label}
    </span>
  );
}

export function OrderDetailView({ orderId, onBack }: OrderDetailViewProps) {
  const router = useRouter();
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.push("/profile/orders");
    }
  };

  // Local state for direct fetching
  const [order, setOrder] = useState<Order | null>(null);
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [isInvoiceLoading, setIsInvoiceLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Direct fetch effect
  useEffect(() => {
    let mounted = true;

    async function fetchOrder() {
      if (!orderId) return;

      try {
        setLoading(true);
        setError(null);
        // console.log('[OrderDetailView] Starting direct fetch for:', orderId);

        // wrapper to catch any async errors
        const data = await getOrderById(orderId);

        // console.log('[OrderDetailView] Fetch success:', data);

        if (mounted) {
          setOrder(data);
        }
      } catch (err) {
        // console.error('[OrderDetailView] Fetch error:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : "Failed to load order");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchOrder();

    // Fetch invoice
    async function fetchInvoice() {
      if (!orderId) return;

      try {
        setIsInvoiceLoading(true);
        const data = await getLatestInvoice(orderId);
        if (mounted) {
          setInvoice(data);


        }
      } catch (err) {

        // Invoice might not exist yet, ignore error
      } finally {
        if (mounted) setIsInvoiceLoading(false);
      }
    }
    fetchInvoice();

    return () => {
      mounted = false;
    };
  }, [orderId]);

  const refresh = async () => {
    // Re-run the effect logic manually
    setLoading(true);
    setError(null);
    try {
      const data = await getOrderById(orderId);
      setOrder(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to refresh order");
    } finally {
      setLoading(false);
    }
  };

  // Kept for compatibility with existing code structure
  const refreshing = false;
  const queryError = error ? new Error(error) : null;

  // Derived state for compatibility
  const errorMessage = error;

  const handleDownloadInvoice = async () => {
    // Phase 1: Try direct link (fastest, CDN)
    if (invoice?.version?.pdf_url) {

      window.open(invoice.version.pdf_url, "_blank");
      return;
    }

    // Phase 2: Fallback to blob download (if URL missing)
    if (!invoice?.version?.id) return;

    try {
      setDownloading(true);
      const blob = await downloadInvoice(invoice.version.id);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Invoice-${invoice.invoice_number}.pdf`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      toast.success("Invoice downloaded successfully");
    } catch (err) {
      console.error("Download error:", err);
      toast.error("Failed to download invoice");
    } finally {
      setDownloading(false);
    }
  };

  // Share order (native share API)
  const handleShare = async () => {
    if (navigator.share && order) {
      try {
        await navigator.share({
          title: `Order #${order.order_number}`,
          text: `Check out my order #${order.order_number}`,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled or not supported
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success("Order link copied!");
    }
  };

  if (loading) {
    return <OrderDetailsSkeleton />;
  }

  if (error || !order) {
    return (
      <div className="text-center py-12 lg:py-16">
        <div className="w-14 h-14 lg:w-16 lg:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-7 h-7 lg:w-8 lg:h-8 text-red-500" />
        </div>
        <h3 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white mb-2">
          {error || "Order Not Found"}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          The order you're looking for doesn't exist or couldn't be loaded.
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={() => refresh()} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
          <Button onClick={handleBack} variant="outline" className="gap-2">
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>
        </div>
      </div>
    );
  }

  // Timeline configuration
  const getTimelineSteps = (status: OrderStatus) => {
    const orderDate = new Date(order.created_at).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const steps = [
      {
        icon: CheckCircle2,
        title: "Placed",
        fullTitle: "Order Placed",
        description: "Your order has been placed successfully",
        time: orderDate,
      },
      {
        icon: Package,
        title: "Processing",
        fullTitle: "Processing",
        description: "Seller is preparing your order",
      },
      {
        icon: Truck,
        title: "Shipped",
        fullTitle: "Shipped",
        description: "Your order is on the way",
      },
      {
        icon: MapPin,
        title: "Delivered",
        fullTitle: "Delivered",
        description: "Order delivered to your address",
      },
    ];

    let currentIndex = 0;
    switch (status) {
      case "pending":
        currentIndex = 0;
        break;
      case "confirmed":
      case "processing":
        currentIndex = 1;
        break;
      case "shipped":
        currentIndex = 2;
        break;
      case "delivered":
        currentIndex = 3;
        break;
      default:
        currentIndex = 0;
    }

    return steps.map((step, index) => ({
      ...step,
      isCompleted: status === "delivered" || index < currentIndex,
      isCurrent: index === currentIndex && status !== "delivered",
      isLast: index === steps.length - 1,
      isFirst: index === 0,
    }));
  };

  const timeline = getTimelineSteps(order.order_status);
  const isCancelled = order.order_status === "cancelled";
  const isRefunded = order.order_status === "refunded";
  const totalAmount = parseFloat(order.total_amount);
  const showPaymentActions =
    order.payment_method === "razorpay" &&
    needsPayment(order.payment_status) &&
    !isCancelled &&
    !isRefunded;

  const date = new Date(order.created_at).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4 lg:space-y-6"
    >
      {/* Mobile Header - Compact */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                #{order.order_number}
              </span>
              <StatusBadge status={order.order_status} />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{date}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="w-9 h-9 rounded-xl"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Mobile Horizontal Timeline */}
        {!isCancelled && !isRefunded && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-100 dark:border-slate-700 mb-4 overflow-x-auto">
            <div className="flex justify-between min-w-[280px]">
              {timeline.map((step, index) => (
                <MobileTimelineStep
                  key={index}
                  icon={step.icon}
                  title={step.title}
                  isCompleted={step.isCompleted}
                  isCurrent={step.isCurrent}
                  isFirst={step.isFirst}
                  isLast={step.isLast}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:flex flex-row items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl h-10 w-10"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Order #{order.order_number}
              </h2>
              <StatusBadge status={order.order_status} />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Placed on {date}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {/* Invoice button hidden as requested */}
          {false && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleDownloadInvoice}
              disabled={
                (!invoice && !isInvoiceLoading) ||
                downloading ||
                isInvoiceLoading ||
                order.payment_status !== "paid"
              }
            >
              {downloading || isInvoiceLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Invoice
            </Button>
          )}
          <Button variant="outline" size="sm" className="gap-2">
            <HelpCircle className="w-4 h-4" />
            Help
          </Button>
        </div>
      </div>

      {/* Cancelled/Refunded Alert */}
      {(isCancelled || isRefunded) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl p-4 lg:p-5 flex items-start gap-3 lg:gap-4 ${isCancelled
              ? "bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800"
              : "bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800"
            }`}
        >
          {isCancelled ? (
            <AlertCircle className="w-5 h-5 lg:w-6 lg:h-6 text-red-500 shrink-0 mt-0.5" />
          ) : (
            <RefreshCw className="w-5 h-5 lg:w-6 lg:h-6 text-orange-500 shrink-0 mt-0.5" />
          )}
          <div>
            <h4
              className={`font-semibold text-sm lg:text-base ${isCancelled ? "text-red-800 dark:text-red-300" : "text-orange-800 dark:text-orange-300"}`}
            >
              {isCancelled ? "Order Cancelled" : "Order Refunded"}
            </h4>
            <p
              className={`text-xs lg:text-sm mt-1 ${isCancelled ? "text-red-600 dark:text-red-400" : "text-orange-600 dark:text-orange-400"}`}
            >
              {isCancelled
                ? "Refund will be processed within 5-7 business days."
                : "Amount will be credited to your original payment method."}
            </p>
          </div>
        </motion.div>
      )}

      {/* Main Layout */}
      <div className="grid lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Left Column - Items */}
        <div className="lg:col-span-2 space-y-4 lg:space-y-6">
          {/* Desktop Timeline */}
          {!isCancelled && !isRefunded && (
            <div className="hidden lg:block bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#31CDD4]" />
                Order Timeline
              </h3>
              <div className="pl-1">
                {timeline.map((step, index) => (
                  <TimelineStep
                    key={index}
                    icon={step.icon}
                    title={step.fullTitle}
                    description={step.description}
                    time={step.time}
                    isCompleted={step.isCompleted}
                    isCurrent={step.isCurrent}
                    isLast={step.isLast}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Order Items */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
            <div className="px-4 lg:px-6 py-3 lg:py-4 border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-sm lg:text-base">
                <Box className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" />
                Items ({order.items?.length || 0})
              </h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-slate-700">
              {order.items?.map((item) => (
                <div key={item.id} className="p-4 lg:p-5 flex gap-3 lg:gap-5">
                  {/* Image */}
                  <div className="relative shrink-0">
                    <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gray-50 dark:bg-slate-700 rounded-xl relative overflow-hidden border border-gray-100 dark:border-slate-600">
                      <Image
                        src={item.product_image || "/placeholder.png"}
                        alt={item.product_name}
                        fill
                        sizes="(max-width: 1024px) 64px, 80px"
                        className="object-contain p-2"
                      />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#0B1F51] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md ring-2 ring-white dark:ring-slate-800 z-10">
                      {item.quantity}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm lg:text-base line-clamp-2 mb-1">
                      {item.product_name}
                    </h4>
                    <div className="flex items-center gap-3 text-xs lg:text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-semibold text-[#0B1F51] dark:text-[#31CDD4]">
                        ₹{parseFloat(item.cost_price).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="text-right shrink-0">
                    <p className="font-bold text-gray-900 dark:text-white text-sm lg:text-base">
                      ₹{parseFloat(item.line_total).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Summary */}
        <div className="space-y-4 lg:space-y-6">
          {/* Order Summary */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4 lg:p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm lg:text-base">
              Summary
            </h3>
            <div className="space-y-2.5 lg:space-y-3 text-sm">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span className="text-gray-900 dark:text-white">
                  ₹{parseFloat(order.subtotal).toLocaleString()}
                </span>
              </div>
              {parseFloat(order.discount_amount) > 0 && (
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Discount</span>
                  <span className="text-green-600">
                    -₹{parseFloat(order.discount_amount).toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Shipping</span>
                <span
                  className={
                    parseFloat(order.shipping_amount) === 0
                      ? "text-green-600 font-medium"
                      : "text-gray-900 dark:text-white"
                  }
                >
                  {parseFloat(order.shipping_amount) === 0
                    ? "FREE"
                    : `₹${parseFloat(order.shipping_amount).toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Tax</span>
                <span className="text-gray-900 dark:text-white">
                  ₹{parseFloat(order.tax_amount).toLocaleString()}
                </span>
              </div>
              <div className="border-t border-dashed border-gray-200 dark:border-slate-700 pt-2.5 lg:pt-3 mt-2.5 lg:mt-3">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    Total
                  </span>
                  <span className="text-base lg:text-lg font-bold text-gray-900 dark:text-white">
                    ₹{totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4 lg:p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 lg:mb-4 flex items-center gap-2 text-sm lg:text-base">
              <CreditCard className="w-4 h-4 text-blue-600" />
              Payment
            </h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Method</span>
                <span className="font-medium text-gray-900 dark:text-white capitalize">
                  {order.payment_method || "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">Status</span>
                <PaymentStatusBadge status={order.payment_status} />
              </div>
            </div>

            {showPaymentActions && (
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                <OrderPaymentActions
                  orderId={order.id}
                  orderNumber={order.order_number}
                  paymentStatus={order.payment_status}
                  paymentMethod={order.payment_method}
                  totalAmount={order.total_amount}
                  onPaymentSuccess={() => refresh()}
                />
              </div>
            )}
          </div>

          {/* Shipping Address */}
          {order.shipping_address && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4 lg:p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 lg:mb-4 flex items-center gap-2 text-sm lg:text-base">
                <MapPin className="w-4 h-4 text-blue-600" />
                Delivery Address
              </h3>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <p className="font-semibold text-gray-900 dark:text-white">
                  {order.shipping_address.name}
                </p>
                <p>{order.shipping_address.address_line1}</p>
                {order.shipping_address.address_line2 && (
                  <p>{order.shipping_address.address_line2}</p>
                )}
                <p>
                  {order.shipping_address.city}, {order.shipping_address.state}{" "}
                  - {order.shipping_address.pincode}
                </p>
                <div className="flex items-center gap-2 pt-2 text-gray-500 dark:text-gray-400">
                  <Phone className="w-4 h-4" />
                  {order.shipping_address.phone}
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions - Mobile Only */}
          <div className="lg:hidden grid grid-cols-1 gap-3">
            {/* Invoice button hidden as requested */}
            {false && (
              <Button
                variant="outline"
                className="h-11 gap-2 rounded-xl"
                onClick={handleDownloadInvoice}
                disabled={
                  (!invoice && !isInvoiceLoading) ||
                  downloading ||
                  isInvoiceLoading ||
                  order.payment_status !== "paid"
                }
              >
                {downloading || isInvoiceLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Invoice
              </Button>
            )}
            <Button variant="outline" className="h-11 gap-2 rounded-xl">
              <MessageCircle className="w-4 h-4" />
              Support
            </Button>
          </div>

          {/* Help Card - Desktop */}
          <div className="hidden lg:block bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-5 border border-blue-100 dark:border-blue-800">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              Need Help?
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Have questions about your order? Our support team is here to help.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full bg-white dark:bg-slate-800"
            >
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
