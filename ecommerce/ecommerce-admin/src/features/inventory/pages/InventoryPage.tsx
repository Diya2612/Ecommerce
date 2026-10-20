import { useState, useMemo, useEffect, useCallback } from 'react';
import {
    Package,
    AlertTriangle,
    AlertCircle,
    Ban,
    ShieldAlert,
    Edit3,
    PackageX,
    CheckCircle,
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { FiltersBar, type FilterGroup, type SortOption } from "@/components/data-table/FiltersBar";
import { GenericTable, type ColumnConfig, type MobileRecordCardProps } from '@/components/data-table';


import { DateRangePicker } from '@/components/forms/inputs/DateRangePicker';

import { MetricsGrid, type MetricItem } from '@/components/metrics';
import { useDateRange } from "@/hooks";

import type {
    InventoryItem,
    InventoryState,
    QuickFilter
} from '../types';
import { locations } from '../constants';

// Inventory API hooks
import { useInventory, useAdjustInventory } from '../hooks/useInventory';
import type { InventoryFilters } from '../services/inventoryApi.types';
import { useTiers } from '../../tiers/hooks/useTiers';

// Components
import { QuantityStepper, TransferStockModal, InventoryHistoryPanel, BulkReceiveModal, BulkAdjustModal, BulkTransferModal, BulkMarkDamagedModal } from '../components';

const InventoryPage = () => {
    const [selectedLocation] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedItems, setSelectedItems] = useState<InventoryItem[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [editingItemId, setEditingItemId] = useState<string | null>(null);
    const [editingValue, setEditingValue] = useState<number>(0);
    const [selectedHistoryItemId, setSelectedHistoryItemId] = useState<string | null>(null);

    // Pagination state
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('rowsPerPage');
            return stored ? Number(stored) : 10;
        }
        return 10;
    });
    const [showHistoryPanel, setShowHistoryPanel] = useState(false);

    const [showBulkReceiveModal, setShowBulkReceiveModal] = useState(false);
    const [showBulkAdjustModal, setShowBulkAdjustModal] = useState(false);
    const [showBulkTransferModal, setShowBulkTransferModal] = useState(false);
    const [showBulkMarkDamagedModal, setShowBulkMarkDamagedModal] = useState(false);

    // Transfer modal states
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [transferItem, setTransferItem] = useState<InventoryItem | null>(null);

    // Quick filter states
    const [quickFilters, setQuickFilters] = useState<QuickFilter[]>([]);

    // Filter states
    const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
    const [brandFilter] = useState<string[]>([]);
    const [stateFilter] = useState<InventoryState[]>([]);
    const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
    const [sortState, setSortState] = useState<{ value: string; direction: 'asc' | 'desc' }>({ value: 'lastUpdated', direction: 'desc' });

    const { dateRange, setDateRange } = useDateRange();

    // Build API filters from current state
    const apiFilters: InventoryFilters = useMemo(() => {
        const filters = {
            page,
            limit: rowsPerPage,
            search: searchQuery || undefined,
            condition: stateFilter.length === 1 ? stateFilter[0].toLowerCase() as any : undefined,
            status: undefined,
            sortBy: sortState.value, // Passing UI key directly, backend handles mapping
            sortOrder: sortState.direction,
            location: selectedLocation === 'all' ? undefined : locations.find(l => l.id === selectedLocation)?.name,
            category: categoryFilter.length === 1 ? categoryFilter[0] : undefined,
            quickFilter: quickFilters.length === 1 ? quickFilters[0] : undefined, // Send quick filter to backend
            startDate: (() => {
                if (!dateRange?.from) return undefined;
                const date = new Date(dateRange.from);
                date.setHours(0, 0, 0, 0);
                return date.toISOString();
            })(),
            endDate: (() => {
                // If to date exists, use it as end of day
                if (dateRange?.to) {
                    const date = new Date(dateRange.to);
                    date.setHours(23, 59, 59, 999);
                    return date.toISOString();
                }
                // If only from date exists, treat as single day (end of that day)
                else if (dateRange?.from) {
                    const date = new Date(dateRange.from);
                    date.setHours(23, 59, 59, 999);
                    return date.toISOString();
                }
                return undefined;
            })(),
            _rid: Date.now().toString(),
        };

        return filters;
    }, [page, rowsPerPage, searchQuery, stateFilter, sortState, selectedLocation, categoryFilter, quickFilters, dateRange, locations]);

    // Fetch inventory data from API (filtered — for the table)
    const { data: inventoryResponse, isLoading, error, isError } = useInventory(apiFilters);

    // Dedicated lightweight metric queries (limit:1 — only pagination.total matters)
    // These are decoupled from the table filters so they never change when paginating/filtering
    const { data: totalResponse }      = useInventory({ limit: 1 });
    const { data: activeResponse }     = useInventory({ limit: 1, condition: 'sellable' });
    const { data: outOfStockResponse } = useInventory({ limit: 1, status: 'out_of_stock' });
    const { data: lowStockResponse }   = useInventory({ limit: 1, status: 'low_stock' });

    const metrics: MetricItem[] = useMemo(() => [
        {
            title: 'Total Products',
            value: totalResponse?.data?.pagination?.total ?? 0,
            helperText: 'Total inventory records',
            icon: Package,
            iconBg: '#3B82F6',
        },
        {
            title: 'Active',
            value: activeResponse?.data?.pagination?.total ?? 0,
            helperText: 'Sellable stock',
            icon: CheckCircle,
            iconBg: '#10B981',
        },
        {
            title: 'Out of Stock',
            value: outOfStockResponse?.data?.pagination?.total ?? 0,
            helperText: 'Needs replenishment',
            icon: AlertCircle,
            iconBg: '#EF4444',
        },
        {
            title: 'Low Stock',
            value: lowStockResponse?.data?.pagination?.total ?? 0,
            helperText: 'Running low',
            icon: AlertTriangle,
            iconBg: '#F59E0B',
        },
    ], [totalResponse, activeResponse, outOfStockResponse, lowStockResponse]);

    // Debug logging in development
    useEffect(() => {
        if (import.meta.env.DEV) {
            console.log('[InventoryPage] API Filters:', apiFilters);
            console.log('[InventoryPage] Response:', inventoryResponse);
            console.log('[InventoryPage] Loading:', isLoading);
            console.log('[InventoryPage] Error:', error);
        }
    }, [apiFilters, inventoryResponse, isLoading, error]);

    // Mutations
    const adjustInventoryMutation = useAdjustInventory();

    // Extract inventory items from response (drives the table)
    const inventoryData = useMemo(() => {
        return inventoryResponse?.data?.inventory || [];
    }, [inventoryResponse]);

    // Fetch categories
    const { data: tiersData } = useTiers({ level: 1, status: 'active' });
    const categoryOptions = useMemo(() => tiersData?.map((t: any) => ({ label: t.name, value: t.id })) || [], [tiersData]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setPage(1);
    }, [searchQuery, stateFilter, selectedLocation, categoryFilter, quickFilters, dateRange]);

    // Toggle quick filter
    const toggleQuickFilter = (filter: QuickFilter) => {
        setQuickFilters((prev) =>
            prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]
        );
    };

    // const currentLocation = locations.find((l) => l.id === selectedLocation);

    // Server-side filtering
    const sortedData = inventoryData;

    const handleEdit = (item: InventoryItem) => {
        setEditingItemId(item.id);
        setEditingValue(item.available);
    };

    const handleConfirmEdit = (itemId: string, reason: string) => {
        const item = inventoryData.find(i => i.id === itemId);
        if (!item) return;

        const quantityChange = editingValue - item.available;

        if (quantityChange === 0) {
            setEditingItemId(null);
            return;
        }

        // Call adjust inventory API
        adjustInventoryMutation.mutate({
            id: itemId,
            data: {
                quantity_change: quantityChange,
                reason,
                notes: quantityChange > 0
                    ? `Added ${quantityChange} units via admin panel`
                    : `Removed ${Math.abs(quantityChange)} units via admin panel`,
            },
        }, {
            onSuccess: () => {
                setEditingItemId(null);
            },
        });
    };

    const handleCancelEdit = () => {
        setEditingItemId(null);
    };

    const handleConfirmTransfer = (destinationId: string, quantity: number, reason: string) => {
        if (!transferItem) return;

        const destination = locations.find((l) => l.id === destinationId);
        const source = locations.find((l) => l.id === selectedLocation);

        console.log('Transfer confirmed:', {
            item: transferItem?.productName,
            from: source?.name,
            to: destination?.name,
            quantity,
            reason,
        });

        // TODO: Need product_id from inventory item
        // Backend API requires product_id, from_location_id, to_location_id
        // Current admin panel uses location names, need to map to IDs
        // For now, log the transfer intent

        // When backend locations API is ready:
        // createTransferMutation.mutate({
        //     product_id: transferItem.id, // This is actually inventory_id, need product_id
        //     from_location_id: selectedLocation,
        //     to_location_id: destinationId,
        //     quantity,
        //     reason: reason as any,
        // }, {
        //     onSuccess: () => {
        //         setShowTransferModal(false);
        //         setTransferItem(null);
        //     },
        // });

        setShowTransferModal(false);
        setTransferItem(null);
    };

    // Bulk operation handlers
    const getSelectedInventoryItems = () => {
        return selectedItems;
    };



    const handleBulkReceive = (receives: any) => {
        console.log('Bulk receive confirmed:', receives);
        setSelectedItems([]);
        setSelectedIds([]);
    };





    // Columns Configuration
    const columns: ColumnConfig<InventoryItem>[] = useMemo(() => [
        {
            key: 'productName',
            label: 'Product',
            sortable: true,
            sortKey: 'productName',
            className: 'min-w-[280px] w-[50%]',
            render: (_: any, item: InventoryItem) => {
                const stateIcon = getStateIcon(item.state);
                return (
                    <div className="flex items-center gap-3">
                        <img
                            src={item.thumbnail}
                            alt={item.productName}
                            className="size-10 rounded-lg object-cover bg-slate-100"
                        />
                        <div className="w-[200px]">
                            <div className="flex items-center gap-1.5 overflow-hidden">
                                <p className="text-sm font-medium text-slate-900 truncate" title={item.productName}>{item.productName}</p>
                                {stateIcon && (
                                    <span
                                        className={cn(
                                            "shrink-0",
                                            item.state === 'Damaged' ? 'text-red-600' :
                                                item.state === 'Quarantined' ? 'text-orange-600' : 'text-slate-600'
                                        )}
                                        title={item.state}
                                    >
                                        {stateIcon}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-slate-500 truncate">{item.brand}</p>
                        </div>
                    </div>
                );
            }
        },
        {
            key: 'committed',
            label: 'Committed',
            align: 'right',
            sortable: true,
            sortKey: 'committed',
            className: 'text-slate-700 w-[15%]'
        },
        {
            key: 'available',
            label: 'Available',
            align: 'right',
            sortable: true,
            sortKey: 'available',
            className: 'w-[15%]',
            render: (_: any, item: InventoryItem) => {
                const isEditing = editingItemId === item.id;
                const stockIndicator = getStockIndicator(item.available);

                return (
                    <div className="relative flex justify-end">
                        <div className="flex items-center justify-end gap-2">
                            {stockIndicator && (
                                <span className={stockIndicator.color} title={stockIndicator.label}>
                                    {stockIndicator.icon}
                                </span>
                            )}
                            <div className={cn("inline-flex items-center gap-1.5 h-8 px-3 rounded-lg", isEditing ? 'bg-indigo-50 border border-indigo-200' : '')}>
                                <span className="text-sm font-medium text-slate-900">{item.available}</span>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleEdit(item); }}
                                    className="p-0.5 hover:bg-slate-100 rounded transition-colors"
                                >
                                    <Edit3 className="size-3.5 text-slate-500" />
                                </button>
                            </div>
                        </div>
                        {isEditing && (
                            <div className="md:contents" onClick={e => e.stopPropagation()}>
                                <QuantityStepper
                                    value={editingValue}
                                    onChange={setEditingValue}
                                    onConfirm={(reason) => handleConfirmEdit(item.id, reason)}
                                    onCancel={handleCancelEdit}
                                    originalValue={item.available}
                                />
                            </div>
                        )}
                    </div>
                );
            }
        },
        // {
        //     key: 'blocked',
        //     label: 'BLOCKED',
        //     align: 'right',
        //     className: 'w-[8%]',
        //     render: (_: any, item: InventoryItem) => item.blocked > 0 ? (
        //         <span className="text-sm font-medium text-orange-700 cursor-help" title={`${item.blocked} units blocked`}>
        //             {item.blocked}
        //         </span>
        //     ) : <span className="text-slate-400">—</span>
        // },
        {
            key: 'lastUpdated',
            label: 'Last Updated',
            sortable: true,
            sortKey: 'lastUpdated',
            className: 'w-[20%]',
            render: (_: any, item: InventoryItem) => (
                <div className="flex flex-col">
                    <span className="text-sm text-slate-700">{item.lastUpdated}</span>
                    <span className="text-xs text-slate-500">{item.lastUpdatedBy}</span>
                </div>
            )
        },
        // {
        //     key: 'actions',
        //     label: 'ACTIONS',
        //     align: 'right',
        //     className: 'w-[80px]',
        //     render: (_: any, item: InventoryItem) => (
        //         <div className="flex items-center justify-end gap-1">
        //             <button
        //                 onClick={(e) => {
        //                     e.stopPropagation();
        //                     setSelectedHistoryItemId(item.id);
        //                     setShowHistoryPanel(true);
        //                 }}
        //                 className="p-1.5 hover:bg-slate-100 rounded-md transition-colors"
        //                 title="View history"
        //             >
        //                 <History className="size-4 text-slate-600" />
        //             </button>
        //             <button
        //                 onClick={(e) => {
        //                     e.stopPropagation();
        //                     handleTransfer(item);
        //                 }}
        //                 className="p-1.5 hover:bg-slate-100 rounded-md transition-colors"
        //                 title="Transfer stock"
        //             >
        //                 <ArrowRightLeft className="size-4 text-slate-600" />
        //             </button>
        //         </div>
        //     )
        // }
    ], [editingItemId, editingValue]);

    // Derived State for FiltersBar
    const visibleColumns = useMemo(() => {
        return columns.map(col => ({
            key: String(col.key),
            label: String(col.label),
            visible: !hiddenColumns.includes(String(col.key))
        }));
    }, [columns, hiddenColumns]);

    const activeColumns = useMemo(() => {
        return columns.filter(col => !hiddenColumns.includes(String(col.key)));
    }, [columns, hiddenColumns]);

    // const uniqueCategories = useMemo(() => Array.from(new Set(inventoryData.map(i => i.category))), [inventoryData]);
    // const uniqueBrands = useMemo(() => Array.from(new Set(inventoryData.map(i => i.brand))), [inventoryData]);

    const filterGroups: FilterGroup[] = useMemo(() => [
        // {
        //     id: 'location',
        //     label: 'Warehouse',
        //     options: [
        //         {
        //             label: 'All Locations',
        //             value: 'all',
        //             icon: <Warehouse className="size-3" />,
        //             isActive: selectedLocation === 'all',
        //             onSelect: () => setSelectedLocation('all')
        //         },
        //         ...locations.map(loc => ({
        //             label: loc.name,
        //             value: loc.id,
        //             icon: <Warehouse className="size-3" />,
        //             isActive: selectedLocation === loc.id,
        //             onSelect: () => setSelectedLocation(loc.id)
        //         }))
        //     ]
        // },
        {
            id: 'quick',
            label: 'Quick Filters',
            options: [
                {
                    label: 'All Products',
                    value: '',
                    isActive: quickFilters.length === 0,
                    onSelect: () => setQuickFilters([])
                },
                { label: 'Low Stock', value: 'low-stock', isActive: quickFilters.includes('low-stock' as QuickFilter), onSelect: () => toggleQuickFilter('low-stock' as QuickFilter) },
                { label: 'Zero Available', value: 'zero-available', isActive: quickFilters.includes('zero-available' as QuickFilter), onSelect: () => toggleQuickFilter('zero-available' as QuickFilter) },
                // { label: 'Blocked > 0', value: 'blocked', isActive: quickFilters.includes('blocked' as QuickFilter), onSelect: () => toggleQuickFilter('blocked' as QuickFilter) },
                { label: 'Recently Updated', value: 'recently-updated', isActive: quickFilters.includes('recently-updated' as QuickFilter), onSelect: () => toggleQuickFilter('recently-updated' as QuickFilter) },
            ]
        },
        // {
        //     id: 'state',
        //     label: 'Inventory State',
        //     options: (['Sellable', 'Damaged', 'Quarantined', 'Expired'] as InventoryState[]).map(s => ({
        //         label: s,
        //         value: s,
        //         isActive: stateFilter.includes(s),
        //         onSelect: () => setStateFilter(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
        //     }))
        // },
        // {
        //     id: 'category',
        //     label: 'Category',
        //     options: categoryOptions.map(c => ({
        //         label: c.label,
        //         value: c.value,
        //         isActive: categoryFilter.includes(c.value),
        //         onSelect: () => setCategoryFilter(prev => prev.includes(c.value) ? prev.filter(x => x !== c.value) : [c.value]) // Single select effectively if we only pass one to backend, but UI allows multi.
        //     }))
        // },
        // {
        //     id: 'brand',
        //     label: 'Brand',
        //     options: uniqueBrands.map(b => ({
        //         label: b,
        //         value: b,
        //         isActive: brandFilter.includes(b),
        //         onSelect: () => setBrandFilter(prev => prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b])
        //     }))
        // }
    ], [selectedLocation, quickFilters, stateFilter, categoryFilter, brandFilter, categoryOptions]);

    const sortOptions: SortOption[] = [
        { label: 'Name', value: 'productName', onSelect: (v) => setSortState({ value: v, direction: 'asc' }), isActive: sortState.value === 'productName' },
        { label: 'Last Updated', value: 'lastUpdated', onSelect: (v) => setSortState({ value: v, direction: 'desc' }), isActive: sortState.value === 'lastUpdated' },
        { label: 'Available Stock', value: 'available', onSelect: (v) => setSortState({ value: v, direction: 'desc' }), isActive: sortState.value === 'available' },
    ];

    const filterActions: any[] = [];

    const handleClearAllFilters = () => {
        setSearchQuery('');
        setCategoryFilter([]);
        setQuickFilters([]);
    };

    const getStockIndicator = (available: number) => {
        if (available === 0) {
            return { color: 'text-red-600', label: 'Out of Stock', icon: <AlertCircle className="size-3" /> };
        } else if (available < 10) {
            return { color: 'text-amber-600', label: 'Low Stock', icon: <AlertTriangle className="size-3" /> };
        }
        return null;
    };

    const getStateIcon = (state: InventoryState) => {
        switch (state) {
            case 'Damaged':
                return <PackageX className="size-3" />;
            case 'Quarantined':
                return <ShieldAlert className="size-3" />;
            case 'Expired':
                return <Ban className="size-3" />;
            default:
                return null;
        }
    };



    const renderMobileCard = useCallback((row: InventoryItem): MobileRecordCardProps => {
        const stateStr = (row.state || "").toLowerCase();
        const badgeStyle = stateStr === "sellable"
            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : stateStr === "damaged"
                ? "bg-red-50 text-red-700 border-red-200"
                : "bg-gray-100 text-gray-600 border-gray-200";

        return {
            title: row.productName,
            subtitle: row.brand || row.id,
            primaryValue: (
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">{row.available} available</span>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(row);
                        }}
                        className="p-1 px-1.5 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1 text-indigo-600 font-bold"
                    >
                        <Edit3 className="size-3.5" />
                        <span className="text-[10px] uppercase">Edit</span>
                    </button>
                </div>
            ),
            imageUrl: row.thumbnail || undefined,
            badges: (
                <span className={`px-2 py-0.5 rounded-full text-[10px] border ${badgeStyle} capitalize`}>
                    {row.state || "—"}
                </span>
            ),
            fields: [
                {
                    label: "Committed",
                    value: String(row.committed || 0),
                },
                {
                    label: "Available",
                    value: String(row.available || 0),
                },
                {
                    label: "Updated",
                    value: row.lastUpdated || "—",
                },
            ],
        };
    }, []);

    return (
        <div className="px-9 lg:px-8 pb-8 lg:pb-8 pt-2 space-y-7">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4 flex-wrap">
                    {/* Date Range Picker */}
                    <div className="w-auto">
                        <DateRangePicker
                            value={dateRange ? { from: dateRange.from ?? null, to: dateRange.to ?? null } : { from: null, to: null }}
                            onChange={(val) => setDateRange(val?.from ? { from: val.from, to: val.to ?? null } : { from: null, to: null })}
                        />
                    </div>
                </div>
            </div>

            {/* Metrics Grid */}
            <MetricsGrid metrics={metrics} />

            {/* Main Card */}

            {/* Search & Filters */}
            <FiltersBar
                search={searchQuery}
                onSearchChange={setSearchQuery}
                filterGroups={filterGroups}
                sortOptions={sortOptions}
                visibleColumns={visibleColumns}
                onToggleColumn={(key) => setHiddenColumns(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])}
                actions={filterActions}
                onClearFilters={handleClearAllFilters}

            />

            <GenericTable
                data={sortedData}
                columns={activeColumns}
                loading={isLoading}
                page={page}
                rowsPerPage={rowsPerPage}
                totalItems={inventoryResponse?.data?.pagination?.total || 0}
                totalPages={inventoryResponse?.data?.pagination?.totalPages || 1}
                onPageChange={setPage}
                onRowsPerPageChange={setRowsPerPage}
                getRowId={(item) => item.id}
                selectable={true}
                selectionMode="multiple"
                onSelectionChange={setSelectedItems}
                onSelectionIdsChange={setSelectedIds}
                externalSelectionIds={selectedIds}
                emptyState={
                    isError ? (
                        <div className="flex flex-col items-center gap-2 py-12">
                            <AlertCircle className="size-12 text-red-400" />
                            <p className="text-red-600 font-medium">Error loading inventory</p>
                            <p className="text-sm text-slate-500">
                                {error instanceof Error ? error.message : 'Failed to fetch inventory data'}
                            </p>
                            <p className="text-xs text-slate-400 mt-2">Check browser console for details</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2 py-12">
                            <Package className="size-12 text-slate-300" />
                            <p className="text-slate-600">No inventory items found</p>
                            <p className="text-sm text-slate-500">Try adjusting your filters or search query</p>
                        </div>
                    )
                }
                sortKey={sortState.value}
                sortDirection={sortState.direction}
                onSortChange={(key, direction) => setSortState({ value: key, direction })}
                renderMobileCard={renderMobileCard}
            />

            {/* Inventory History Panel */}
            <InventoryHistoryPanel
                isOpen={showHistoryPanel}
                onClose={() => {
                    setShowHistoryPanel(false);
                    setSelectedHistoryItemId(null);
                }}
                inventoryId={selectedHistoryItemId || ''}
                itemName={inventoryData.find(i => i.id === selectedHistoryItemId)?.productName || 'Unknown Item'}
            />

            {/* Bulk Receive Modal */}
            <BulkReceiveModal
                isOpen={showBulkReceiveModal}
                onClose={() => setShowBulkReceiveModal(false)}
                selectedItems={getSelectedInventoryItems()}
                onConfirm={(data) => handleBulkReceive(data)}
            />

            {/* Bulk Adjust Modal */}
            <BulkAdjustModal
                isOpen={showBulkAdjustModal}
                onClose={() => setShowBulkAdjustModal(false)}
                selectedItems={getSelectedInventoryItems()}
                onConfirm={(data) => {
                    console.log('Bulk Adjust Data:', data);
                    // Implement actual adjustment logic here
                }}
            />

            {/* Bulk Transfer Modal */}
            <BulkTransferModal
                isOpen={showBulkTransferModal}
                onClose={() => setShowBulkTransferModal(false)}
                selectedItems={getSelectedInventoryItems()}
                locations={locations}
                onConfirm={(data) => {
                    // Implement actual transfer logic here
                    console.log('Bulk Transfer Data:', data);
                    setShowBulkTransferModal(false);
                }}
            />

            {/* Bulk Mark Damaged Modal */}
            <BulkMarkDamagedModal
                isOpen={showBulkMarkDamagedModal}
                onClose={() => setShowBulkMarkDamagedModal(false)}
                selectedItems={getSelectedInventoryItems()}
                onConfirm={(data) => {
                    console.log('Bulk Mark Damaged Data:', data);
                    // Implement actual logic here
                }}
            />


            {/* Transfer Stock Modal */}
            {transferItem && (
                <TransferStockModal
                    isOpen={showTransferModal}
                    onClose={() => {
                        setShowTransferModal(false);
                        setTransferItem(null);
                    }}
                    item={transferItem}
                    currentLocationId={selectedLocation}
                    locations={locations}
                    onConfirm={handleConfirmTransfer}
                />
            )}
        </div>
    );
}

export default InventoryPage;
