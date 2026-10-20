import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Truck, AlertTriangle } from "lucide-react";
import { getStatusLabel } from "../../utils/statusHelpers";

interface StatusChangeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data: any) => Promise<void>;
    currentStatus: string;
    targetStatus: string;
    isSubmitting?: boolean;
}

export function StatusChangeModal({
    isOpen,
    onClose,
    onConfirm,
    targetStatus,
    isSubmitting = false
}: StatusChangeModalProps) {
    // Local State
    const [trackingNumber, setTrackingNumber] = useState("");
    const [courierName, setCourierName] = useState("");
    const [adminComment, setAdminComment] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Reset state on open
    useEffect(() => {
        if (isOpen) {
            setTrackingNumber("");
            setCourierName("");
            setAdminComment("");
            setErrors({});
        }
    }, [isOpen, targetStatus]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: Record<string, string> = {};

        // Validation based on target status
        if (targetStatus === 'shipped') {
            if (!trackingNumber.trim()) {
                newErrors.trackingNumber = "Tracking number is required";
            }
        } else if (targetStatus === 'cancelled') {
            if (!adminComment.trim()) {
                newErrors.adminComment = "Reason for cancellation is required";
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Prepare payload
        const payload: any = { order_status: targetStatus };
        if (targetStatus === 'shipped') {
            payload.order_tracking = trackingNumber;
            // Optionally save courier name if backend supports it, or append to tracking string
            if (courierName) payload.order_tracking = `${courierName} - ${trackingNumber}`;
        }
        if (adminComment) {
            payload.admin_comment = adminComment;
        }

        await onConfirm(payload);
        onClose();
    };

    // Render content based on status
    const renderContent = () => {
        switch (targetStatus) {
            case 'shipped':
                return (
                    <div className="space-y-4 py-2">
                        <div className="flex items-center gap-3 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm mb-4">
                            <Truck className="size-5 shrink-0" />
                            <p>You are marking this order as <strong>Shipped</strong>. Please provide tracking details for the customer.</p>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="courier">Courier Name (Optional)</Label>
                            <Input
                                id="courier"
                                placeholder="e.g. FedEx, Bluedart"
                                value={courierName}
                                onChange={(e) => setCourierName(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="tracking">Tracking Number <span className="text-red-500">*</span></Label>
                            <Input
                                id="tracking"
                                placeholder="Enter tracking number"
                                value={trackingNumber}
                                onChange={(e) => setTrackingNumber(e.target.value)}
                                className={errors.trackingNumber ? "border-red-500" : ""}
                            />
                            {errors.trackingNumber && <p className="text-xs text-red-500">{errors.trackingNumber}</p>}
                        </div>
                    </div>
                );
            case 'cancelled':
                return (
                    <div className="space-y-4 py-2">
                        <div className="flex items-center gap-3 p-3 bg-red-50 text-red-700 rounded-lg text-sm mb-4">
                            <AlertTriangle className="size-5 shrink-0" />
                            <p>You are about to <strong>Cancel</strong> this order. This action cannot be fully undone.</p>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="reason">Cancellation Reason <span className="text-red-500">*</span></Label>
                            <Textarea
                                id="reason"
                                placeholder="Why is this order being cancelled?"
                                value={adminComment}
                                onChange={(e) => setAdminComment(e.target.value)}
                                className={errors.adminComment ? "border-red-500" : ""}
                            />
                            {errors.adminComment && <p className="text-xs text-red-500">{errors.adminComment}</p>}
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="py-4 text-slate-600">
                        Are you sure you want to change the status to <strong>{getStatusLabel(targetStatus)}</strong>?
                    </div>
                );
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !isSubmitting && !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Mark as {getStatusLabel(targetStatus)}</DialogTitle>
                    <DialogDescription>
                        Update order status details
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    {renderContent()}

                    <DialogFooter className="mt-6">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className={targetStatus === 'cancelled' ? "bg-red-600 hover:bg-red-700" : ""}
                        >
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirm Update
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
