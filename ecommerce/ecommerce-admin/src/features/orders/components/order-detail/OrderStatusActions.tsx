import { useState } from "react";
import { Check, ChevronDown, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "../..";
import { useUpdateOrderStatus, useUpdatePayment, useUpdateFulfillment } from "@/features/orders/hooks/useOrdersApi";
import type { OrderFormData } from "@/features/orders/types";
import { canTransitionOrder, getStatusLabel } from "@/features/orders/utils/statusHelpers";
import { StatusChangeModal } from "../..";
import { notifySuccess, notifyError } from "@/utils";

interface OrderStatusActionsProps {
    orderId: string;
    orderStatus: string;
    paymentStatus: string;
    fulfillmentStatus: string;
    onStatusChange?: (changes: Partial<OrderFormData>) => void;
}

const PAYMENT_STATUSES = [
    { value: 'pending', label: 'Pending' },
    { value: 'paid', label: 'Paid' },
    { value: 'refunded', label: 'Refunded' },
    { value: 'failed', label: 'Failed' },
];

const FULFILLMENT_STATUSES = [
    { value: 'unfulfilled', label: 'Unfulfilled' },
    { value: 'fulfilled', label: 'Fulfilled' },
    { value: 'returned', label: 'Returned' },
    { value: 'cancelled', label: 'Cancelled' },
];

export function OrderStatusActions({
    orderId,
    orderStatus,
    paymentStatus,
    fulfillmentStatus,
    onStatusChange
}: OrderStatusActionsProps) {
    const updateOrderStatus = useUpdateOrderStatus();
    const updatePayment = useUpdatePayment();
    const updateFulfillment = useUpdateFulfillment();

    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        targetStatus: string;
        type: 'order' | 'payment' | 'fulfillment';
    }>({
        isOpen: false,
        targetStatus: '',
        type: 'order'
    });

    const isUpdating = updateOrderStatus.isPending || updatePayment.isPending || updateFulfillment.isPending;

    const handleStatusClick = (type: 'order' | 'payment' | 'fulfillment', value: string) => {
        // If it's the current status, do nothing
        if (type === 'order' && value === orderStatus) return;
        if (type === 'payment' && value === paymentStatus) return;
        if (type === 'fulfillment' && value === fulfillmentStatus) return;

        // For specific complex transitions, open modal
        if (type === 'order') {
            if (value === 'shipped' || value === 'cancelled') {
                setModalConfig({ isOpen: true, targetStatus: value, type: 'order' });
                return;
            }
        }

        // Otherwise direct update
        performUpdate(type, value);
    };

    const performUpdate = async (type: 'order' | 'payment' | 'fulfillment', value: string, extraData: any = {}) => {
        try {
            if (type === 'order') {
                await updateOrderStatus.mutateAsync({
                    id: orderId,
                    data: { order_status: value, ...extraData }
                });
                onStatusChange?.({ orderStatus: value as any });
                notifySuccess(`Order marked as ${getStatusLabel(value)}`);
            } else if (type === 'payment') {
                await updatePayment.mutateAsync({
                    id: orderId,
                    data: { payment_status: value as any, ...extraData }
                });
                onStatusChange?.({ paymentStatus: value as any });
                notifySuccess(`Payment status updated to ${value}`);
            } else if (type === 'fulfillment') {
                await updateFulfillment.mutateAsync({
                    id: orderId,
                    data: { fulfillment_status: value as any, ...extraData }
                });
                onStatusChange?.({ fulfillmentStatus: value as any });
                notifySuccess(`Fulfillment status updated to ${value}`);
            }
        } catch (error: any) {
            console.error("Failed to update status", error);
            notifyError(error?.message || "Failed to update status");
        }
    };

    const handleModalConfirm = async (data: any) => {
        await performUpdate(modalConfig.type, modalConfig.targetStatus, data);
    };

    // Standard list for display ordering - EXCLUDES 'paid' (which is a payment status)
    const DISPLAY_ORDER = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded', 'returned'];

    return (
        <>
            <div className="flex flex-wrap items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 gap-1 p-0 hover:bg-transparent focus-visible:ring-0" disabled={isUpdating}>
                            <StatusBadge status={orderStatus} type="order" />
                            {isUpdating ?
                                <Loader2 className="h-3 w-3 animate-spin text-slate-400" /> :
                                <ChevronDown className="h-3 w-3 text-slate-400 opacity-50" />
                            }
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56">
                        <DropdownMenuLabel>Update Order Status</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {DISPLAY_ORDER.map((statusValue) => {
                            const isAllowed = canTransitionOrder(orderStatus, statusValue);
                            const isCurrent = orderStatus?.toLowerCase() === statusValue;

                            return (
                                <DropdownMenuItem
                                    key={statusValue}
                                    onClick={() => isAllowed && handleStatusClick('order', statusValue)}
                                    disabled={!isAllowed}
                                    className={`justify-between ${!isAllowed ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <span className="flex items-center gap-2">
                                        {getStatusLabel(statusValue)}
                                        {!isAllowed && !isCurrent && <Lock className="h-3 w-3 text-slate-300" />}
                                    </span>
                                    {isCurrent && <Check className="h-4 w-4 text-primary" />}
                                </DropdownMenuItem>
                            );
                        })}
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 gap-1 p-0 hover:bg-transparent" disabled={isUpdating}>
                            <StatusBadge status={paymentStatus} type="payment" />
                            <ChevronDown className="h-3 w-3 text-slate-400 opacity-50" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56">
                        <DropdownMenuLabel>Update Payment Status</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {PAYMENT_STATUSES.map((status) => (
                            <DropdownMenuItem
                                key={status.value}
                                onClick={() => handleStatusClick('payment', status.value)}
                                className="justify-between"
                            >
                                {status.label}
                                {paymentStatus?.toLowerCase() === status.value && <Check className="h-4 w-4" />}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 gap-1 p-0 hover:bg-transparent" disabled={isUpdating}>
                            <StatusBadge status={fulfillmentStatus} type="fulfillment" />
                            <ChevronDown className="h-3 w-3 text-slate-400 opacity-50" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56">
                        <DropdownMenuLabel>Update Fulfillment Status</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {FULFILLMENT_STATUSES.map((status) => (
                            <DropdownMenuItem
                                key={status.value}
                                onClick={() => handleStatusClick('fulfillment', status.value)}
                                className="justify-between"
                            >
                                {status.label}
                                {fulfillmentStatus?.toLowerCase() === status.value && <Check className="h-4 w-4" />}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <StatusChangeModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                onConfirm={handleModalConfirm}
                currentStatus={orderStatus}
                targetStatus={modalConfig.targetStatus}
                isSubmitting={isUpdating}
            />
        </>
    );
}
