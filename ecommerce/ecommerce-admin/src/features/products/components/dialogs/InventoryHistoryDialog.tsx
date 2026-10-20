import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, PackageX } from "lucide-react";
import { useInventoryHistory } from '@/features/products/hooks/useInventoryHistory';

interface InventoryHistoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    productId: string | undefined;
}

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
}

function formatActivityType(type: string): string {
    const typeMap: Record<string, string> = {
        'increase': 'Stock Added',
        'decrease': 'Stock Removed',
        'correction': 'Correction',
        'write-off': 'Write-off',
    };
    return typeMap[type] || type;
}

export function InventoryHistoryDialog({
    open,
    onOpenChange,
    productId
}: InventoryHistoryDialogProps) {
    const [page, setPage] = useState(1);
    const limit = 10;

    const { data, pagination, isLoading, isError } = useInventoryHistory({
        productId,
        page,
        limit,
        enabled: open && !!productId,
    });

    const handlePrevPage = () => {
        if (page > 1) setPage(p => p - 1);
    };

    const handleNextPage = () => {
        if (pagination && page < pagination.totalPages) {
            setPage(p => p + 1);
        }
    };

    // Reset page when dialog opens
    const handleOpenChange = (newOpen: boolean) => {
        if (newOpen) setPage(1);
        onOpenChange(newOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="w-full max-w-[95vw] lg:max-w-6xl xl:max-w-7xl max-h-[85vh] flex flex-col p-6">
                <DialogHeader className="mb-4">
                    <DialogTitle className="text-lg font-bold text-slate-800 tracking-tight">Inventory Log</DialogTitle>
                    <DialogDescription className="text-sm text-slate-500">
                        View all inventory adjustments and stock changes for this product.
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} className="h-12 w-full rounded-lg" />
                        ))}
                    </div>
                ) : isError ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                        <PackageX className="w-12 h-12 mb-3 text-slate-300" />
                        <p className="text-sm font-medium">Failed to load inventory history</p>
                        <p className="text-xs text-slate-400">Please try again later</p>
                    </div>
                ) : data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                        <PackageX className="w-12 h-12 mb-3 text-slate-300" />
                        <p className="text-sm font-medium">No inventory adjustments found</p>
                        <p className="text-xs text-slate-400">Adjustments will appear here when stock changes</p>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 overflow-auto rounded-md border border-slate-100 shadow-sm custom-scrollbar">
                            <Table>
                                <TableHeader className="bg-slate-50/80 sticky top-0 z-10 backdrop-blur-sm">
                                    <TableRow className="hover:bg-transparent border-slate-100">
                                        <TableHead className="w-[180px] text-xs font-semibold text-slate-500 uppercase tracking-wider py-3 h-auto">Date</TableHead>
                                        <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-3 h-auto">Item</TableHead>
                                        <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-3 h-auto">Activity</TableHead>
                                        <TableHead className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider py-3 h-auto">Before</TableHead>
                                        <TableHead className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider py-3 h-auto">After</TableHead>
                                        <TableHead className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider py-3 h-auto">Change</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.map((log) => (
                                        <TableRow key={log.id} className="hover:bg-slate-50/50 border-slate-50 group transition-colors">
                                            <TableCell className="align-top py-3 text-xs text-slate-500 whitespace-nowrap font-medium">
                                                {formatDate(log.adjusted_at)}
                                            </TableCell>
                                            <TableCell className="align-top py-3">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-slate-700 text-xs">
                                                        {log.target_name || 'Base Product'}
                                                    </span>
                                                    {log.variant_sku && (
                                                        <span className="text-slate-400 font-mono text-[10px]">
                                                            {log.variant_sku}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="align-top py-3">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-slate-800 text-sm font-medium flex items-center gap-1.5 flex-wrap">
                                                        {log.reason || formatActivityType(log.adjustment_type)}
                                                        {log.reference_number && (
                                                            <span className="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded text-xs font-semibold">
                                                                {log.reference_number}
                                                            </span>
                                                        )}
                                                    </span>
                                                    <span className="text-slate-400 text-xs px-1 border-l-2 border-slate-200 ml-0.5 pl-1.5">
                                                        {log.adjusted_by_name || 'System'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right align-top py-3 text-sm text-slate-400 tabular-nums">
                                                {log.quantity_before}
                                            </TableCell>
                                            <TableCell className="text-right align-top py-3 text-sm text-slate-800 font-semibold tabular-nums">
                                                {log.quantity_after}
                                            </TableCell>
                                            <TableCell className="text-right align-top py-3">
                                                <span className={`tabular-nums text-xs font-bold px-1.5 py-0.5 rounded-full ${log.quantity_change > 0
                                                    ? "bg-emerald-50 text-emerald-600"
                                                    : log.quantity_change < 0
                                                        ? "bg-amber-50 text-amber-600"
                                                        : "bg-slate-50 text-slate-600"
                                                    }`}>
                                                    {log.quantity_change > 0 ? "+" : ""}{log.quantity_change}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {pagination && pagination.totalPages > 1 && (
                            <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-4">
                                <p className="text-xs text-slate-500">
                                    Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, pagination.total)} of {pagination.total} entries
                                </p>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handlePrevPage}
                                        disabled={page === 1}
                                        className="h-8 px-3"
                                    >
                                        <ChevronLeft className="w-4 h-4 mr-1" />
                                        Prev
                                    </Button>
                                    <span className="text-xs text-slate-600 px-2">
                                        Page {page} of {pagination.totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleNextPage}
                                        disabled={page >= pagination.totalPages}
                                        className="h-8 px-3"
                                    >
                                        Next
                                        <ChevronRight className="w-4 h-4 ml-1" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
