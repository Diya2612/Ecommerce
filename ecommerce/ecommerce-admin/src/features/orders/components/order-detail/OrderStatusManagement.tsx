import { useState } from 'react';
import {
    Package,
    CreditCard,
    Truck,
    XCircle,
    AlertTriangle,
    Info,
    ChevronDown,
    Check,
    Lock,
    Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { StatusChangeModal } from "../..";
import {
    useUpdateOrderStatus,
    useUpdatePayment,
    useUpdateFulfillment,
} from '@/features/orders/hooks/useOrdersApi';
import {
    canTransitionOrder,
    canTransitionPayment,
    canTransitionFulfillment,
    getStatusWarnings,
    getStatusLabel,
    getPaymentLabel,
    getFulfillmentLabel,
    getStatusColor,
    getPaymentColor,
    getFulfillmentColor,
    isTerminalState,
    type StatusWarning,
} from '@/features/orders/utils/statusHelpers';
import { notifySuccess, notifyError } from '@/utils';
import type { OrderFormData } from '@/features/orders/types';

interface OrderStatusManagementProps {
    orderId: string;
    orderStatus: string;
    paymentStatus: string;
    fulfillmentStatus: string;
    trackingNumber?: string;
    onStatusChange?: (changes: Partial<OrderFormData>) => void;
}

const ORDER_STATUSES = [
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'refunded', label: 'Refunded' },
    { value: 'returned', label: 'Returned' },
];

const PAYMENT_STATUSES = [
    { value: 'pending', label: 'Pending' },
    { value: 'paid', label: 'Paid' },
    { value: 'refunded', label: 'Refunded' },
    { value: 'failed', label: 'Failed' },
    // { value: 'partially_refunded', label: 'Partially Refunded' },
];

const FULFILLMENT_STATUSES = [
    { value: 'unfulfilled', label: 'Unfulfilled' },
    { value: 'partial', label: 'Partial' },
    { value: 'fulfilled', label: 'Fulfilled' },
    { value: 'returned', label: 'Returned' },
    { value: 'cancelled', label: 'Cancelled' },
];

export function OrderStatusManagement({
    orderId,
    orderStatus,
    paymentStatus,
    fulfillmentStatus,
    trackingNumber,
    onStatusChange,
}: OrderStatusManagementProps) {
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
        type: 'order',
    });

    const isUpdating =
        updateOrderStatus.isPending ||
        updatePayment.isPending ||
        updateFulfillment.isPending;

    const isTerminal = isTerminalState(orderStatus);

    // Get status warnings
    const warnings = getStatusWarnings(orderStatus, paymentStatus, fulfillmentStatus);

    const handleStatusClick = (
        type: 'order' | 'payment' | 'fulfillment',
        value: string
    ) => {
        if (type === 'order' && value === orderStatus) return;
        if (type === 'payment' && value === paymentStatus) return;
        if (type === 'fulfillment' && value === fulfillmentStatus) return;

        // For shipped status, open modal for tracking
        if (type === 'order' && (value === 'shipped' || value === 'cancelled')) {
            setModalConfig({ isOpen: true, targetStatus: value, type: 'order' });
            return;
        }

        performUpdate(type, value);
    };

    const performUpdate = async (
        type: 'order' | 'payment' | 'fulfillment',
        value: string,
        extraData: Record<string, unknown> = {}
    ) => {
        try {
            if (type === 'order') {
                await updateOrderStatus.mutateAsync({
                    id: orderId,
                    data: { order_status: value as 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded', ...extraData },
                });
                // Cast to the expected type - the API returns valid status values
                const changes: Partial<OrderFormData> = { orderStatus: value } as Partial<OrderFormData>;

                // Backend auto-updates fulfillment when order is shipped/delivered
                // Sync frontend state to match backend behavior
                if (value === 'shipped' && fulfillmentStatus === 'unfulfilled') {
                    changes.fulfillmentStatus = 'Fulfilled' as OrderFormData['fulfillmentStatus'];
                } else if (value === 'delivered') {
                    changes.fulfillmentStatus = 'Fulfilled' as OrderFormData['fulfillmentStatus'];
                } else if (value === 'cancelled') {
                    changes.fulfillmentStatus = 'Cancelled' as OrderFormData['fulfillmentStatus'];
                } else if (value === 'returned') {
                    changes.fulfillmentStatus = 'returned' as unknown as OrderFormData['fulfillmentStatus'];
                }

                onStatusChange?.(changes);
                notifySuccess(`Order marked as ${getStatusLabel(value)}`);
            } else if (type === 'payment') {
                await updatePayment.mutateAsync({
                    id: orderId,
                    data: { payment_status: value as 'pending' | 'paid' | 'refunded' | 'failed' | 'partially_refunded', ...extraData },
                });
                onStatusChange?.({ paymentStatus: value } as Partial<OrderFormData>);
                notifySuccess(`Payment status updated to ${getPaymentLabel(value)}`);
            } else if (type === 'fulfillment') {
                await updateFulfillment.mutateAsync({
                    id: orderId,
                    data: { fulfillment_status: value as 'Pending' | 'Partial' | 'Fulfilled' | 'Cancelled', ...extraData },
                });
                onStatusChange?.({ fulfillmentStatus: value } as Partial<OrderFormData>);
                notifySuccess(`Fulfillment status updated to ${getFulfillmentLabel(value)}`);
            }
        } catch (error: unknown) {
            const err = error as { message?: string };
            notifyError(err?.message || 'Failed to update status');
        }
    };

    const handleModalConfirm = async (data: Record<string, unknown>) => {
        await performUpdate(modalConfig.type, modalConfig.targetStatus, data);
    };

    const getWarningIcon = (warning: StatusWarning) => {
        switch (warning.type) {
            case 'error':
                return <XCircle className="size-4 shrink-0" />;
            case 'warning':
                return <AlertTriangle className="size-4 shrink-0" />;
            default:
                return <Info className="size-4 shrink-0" />;
        }
    };

    const getWarningStyles = (warning: StatusWarning) => {
        switch (warning.type) {
            case 'error':
                return 'bg-red-50 text-red-700 border-red-200';
            case 'warning':
                return 'bg-amber-50 text-amber-700 border-amber-200';
            default:
                return 'bg-blue-50 text-blue-700 border-blue-200';
        }
    };

    const getBadgeVariant = (color: string) => {
        const variantMap: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            success: 'default',
            warning: 'secondary',
            info: 'secondary',
            destructive: 'destructive',
            default: 'outline',
            outline: 'outline',
            secondary: 'secondary',
        };
        return variantMap[color] || 'outline';
    };

    return (
        <>
            <Card className="rounded-xl shadow-sm border-slate-200 overflow-hidden">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <Package className="size-5 text-icon-muted" />
                            <CardTitle className="text-base font-semibold text-slate-900">
                                Status Management
                            </CardTitle>
                        </div>
                        {isUpdating && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full border border-blue-100">
                                <Loader2 className="size-3.5 animate-spin text-blue-600" />
                                <span className="text-xs font-medium text-blue-600">Updating...</span>
                            </div>
                        )}
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Status Cards Grid */}
                    <div className="grid grid-cols-1 gap-3">
                        {/* Order Status */}
                        <div className="p-3 rounded-lg border border-slate-100 bg-transparent">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-1.5 rounded-lg bg-white border border-slate-200">
                                        <Package className="size-4 text-slate-600" />
                                    </div>
                                    <span className="text-sm font-semibold text-slate-800">
                                        Order
                                    </span>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 gap-2 px-3 hover:bg-slate-100 rounded-lg"
                                            disabled={isUpdating}
                                        >
                                            <Badge
                                                variant={getBadgeVariant(getStatusColor(orderStatus))}
                                                className="font-medium"
                                            >
                                                {getStatusLabel(orderStatus)}
                                            </Badge>
                                            <ChevronDown className="size-3.5 text-slate-500" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48 rounded-xl">
                                        {ORDER_STATUSES.map((status) => {
                                            const isAllowed = canTransitionOrder(orderStatus, status.value);
                                            const isCurrent = orderStatus?.toLowerCase() === status.value;

                                            return (
                                                <DropdownMenuItem
                                                    key={status.value}
                                                    onClick={() =>
                                                        isAllowed && handleStatusClick('order', status.value)
                                                    }
                                                    disabled={!isAllowed && !isCurrent}
                                                    className={cn(
                                                        'justify-between rounded-lg',
                                                        !isAllowed && !isCurrent && 'opacity-50'
                                                    )}
                                                >
                                                    <span className="flex items-center gap-2 font-medium">
                                                        {status.label}
                                                        {!isAllowed && !isCurrent && (
                                                            <Lock className="size-3 text-slate-400" />
                                                        )}
                                                    </span>
                                                    {isCurrent && <Check className="size-4 text-emerald-600" />}
                                                </DropdownMenuItem>
                                            );
                                        })}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        {/* Payment Status */}
                        <div className="p-3 rounded-lg border border-slate-100 bg-transparent">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-1.5 rounded-lg bg-white border border-slate-200">
                                        <CreditCard className="size-4 text-slate-600" />
                                    </div>
                                    <span className="text-sm font-semibold text-slate-800">
                                        Payment
                                    </span>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 gap-2 px-3 hover:bg-slate-100 rounded-lg"
                                            disabled={isUpdating}
                                        >
                                            <Badge
                                                variant={getBadgeVariant(getPaymentColor(paymentStatus))}
                                                className="font-medium"
                                            >
                                                {getPaymentLabel(paymentStatus)}
                                            </Badge>
                                            <ChevronDown className="size-3.5 text-slate-500" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48 rounded-xl">
                                        {PAYMENT_STATUSES.map((status) => {
                                            const isAllowed = canTransitionPayment(paymentStatus, status.value);
                                            const isCurrent = paymentStatus?.toLowerCase() === status.value;

                                            return (
                                                <DropdownMenuItem
                                                    key={status.value}
                                                    onClick={() =>
                                                        isAllowed && handleStatusClick('payment', status.value)
                                                    }
                                                    disabled={!isAllowed && !isCurrent}
                                                    className={cn(
                                                        'justify-between rounded-lg',
                                                        !isAllowed && !isCurrent && 'opacity-50'
                                                    )}
                                                >
                                                    <span className="flex items-center gap-2 font-medium">
                                                        {status.label}
                                                        {!isAllowed && !isCurrent && (
                                                            <Lock className="size-3 text-slate-400" />
                                                        )}
                                                    </span>
                                                    {isCurrent && <Check className="size-4 text-emerald-600" />}
                                                </DropdownMenuItem>
                                            );
                                        })}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        {/* Fulfillment Status */}
                        <div className="p-3 rounded-lg border border-slate-100 bg-transparent">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-1.5 rounded-lg bg-white border border-slate-200">
                                        <Truck className="size-4 text-slate-600" />
                                    </div>
                                    <span className="text-sm font-semibold text-slate-800">
                                        Fulfillment
                                    </span>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 gap-2 px-3 hover:bg-slate-100 rounded-lg"
                                            disabled={isUpdating}
                                        >
                                            <Badge
                                                variant={getBadgeVariant(getFulfillmentColor(fulfillmentStatus))}
                                                className="font-medium"
                                            >
                                                {getFulfillmentLabel(fulfillmentStatus)}
                                            </Badge>
                                            <ChevronDown className="size-3.5 text-slate-500" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48 rounded-xl">
                                        {FULFILLMENT_STATUSES.map((status) => {
                                            const isAllowed = canTransitionFulfillment(
                                                fulfillmentStatus,
                                                status.value
                                            );
                                            const isCurrent = fulfillmentStatus?.toLowerCase() === status.value;

                                            return (
                                                <DropdownMenuItem
                                                    key={status.value}
                                                    onClick={() =>
                                                        isAllowed && handleStatusClick('fulfillment', status.value)
                                                    }
                                                    disabled={!isAllowed && !isCurrent}
                                                    className={cn(
                                                        'justify-between rounded-lg',
                                                        !isAllowed && !isCurrent && 'opacity-50'
                                                    )}
                                                >
                                                    <span className="flex items-center gap-2 font-medium">
                                                        {status.label}
                                                        {!isAllowed && !isCurrent && (
                                                            <Lock className="size-3 text-slate-400" />
                                                        )}
                                                    </span>
                                                    {isCurrent && <Check className="size-4 text-emerald-600" />}
                                                </DropdownMenuItem>
                                            );
                                        })}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </div>

                    {/* Warnings Section */}
                    {warnings.length > 0 && (
                        <>
                            <div className="border-t border-slate-100" />
                            <div className="space-y-2">
                                {warnings.map((warning, index) => (
                                    <div
                                        key={index}
                                        className={cn(
                                            'flex items-start gap-2.5 p-3 rounded-xl text-xs border shadow-sm',
                                            getWarningStyles(warning)
                                        )}
                                    >
                                        {getWarningIcon(warning)}
                                        <span className="font-medium leading-relaxed">{warning.message}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* Tracking Info */}
                    {trackingNumber && (
                        <>
                            <div className="border-t border-slate-100" />
                            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-xl">
                                <span className="text-sm font-semibold text-blue-700">Tracking Number</span>
                                <span className="font-mono text-sm font-medium text-blue-900">{trackingNumber}</span>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            <StatusChangeModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
                onConfirm={handleModalConfirm}
                currentStatus={orderStatus}
                targetStatus={modalConfig.targetStatus}
                isSubmitting={isUpdating}
            />
        </>
    );
}
