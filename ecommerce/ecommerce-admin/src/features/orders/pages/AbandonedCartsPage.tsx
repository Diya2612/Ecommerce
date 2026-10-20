
import { useMemo, useState } from 'react';
import {
    ShoppingCart,
    CheckCircle2,
    DollarSign,
    Mail,
    Eye,
    Globe,
    Smartphone
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/* Standardized Components */
import { DateRangePicker } from '@/components/forms/inputs/DateRangePicker';
import { MetricsGrid, type MetricItem } from '@/components/metrics';
import { FiltersBar, type SortOption } from '@/components/data-table';
import { GenericTable, type ColumnConfig } from '@/components/data-table';
import type { MobileRecordCardProps } from '@/components/data-table';

/* Feature Components & Hooks */
import {
    useAbandonedCartsApi,
    useAbandonedCartsMetrics,
    useSendRecoveryEmail,
    useEmailTemplates
} from '../hooks/useAbandonedCartsApi';
import { AbandonedCartEmailModal, AbandonedCartDetailsDrawer } from '../components';
import type { AbandonedOrder, RecoveryStatus } from '../types';

const AbandonedOrdersPage = () => {
    /* Hooks & State */
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [statusFilter, setStatusFilter] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({ from: null, to: null });
    const [sortConfig, setSortConfig] = useState<{ value?: string; label?: string; key: string, direction: 'asc' | 'desc' }>({ value: 'newest', label: 'Newest', key: 'abandonedAt', direction: 'desc' });

    // API Hooks
    const { data: abandonedData } = useAbandonedCartsApi({
        page,
        limit: rowsPerPage,
        status: statusFilter as any,
        search: searchQuery,
    });

    const { data: metricsData } = useAbandonedCartsMetrics();
    const { mutate: sendEmail } = useSendRecoveryEmail();
    const { data: emailTemplates } = useEmailTemplates();

    const orders = abandonedData?.carts || [];
    const pagination = abandonedData?.pagination;
    const total = pagination?.total || 0;
    const totalPages = pagination?.totalPages || 1;

    // View state
    const [viewMode, setViewMode] = useState<'list' | 'view-cart' | 'send-email'>('list');
    const [selectedCartForView, setSelectedCartForView] = useState<AbandonedOrder | null>(null);
    const [selectedRows, setSelectedRows] = useState<AbandonedOrder[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // Column visibility (default all visible)
    const [visibleColumns, setVisibleColumns] = useState(
        [
            { key: 'cartId', label: 'Cart ID', visible: true },
            { key: 'customerName', label: 'Customer', visible: true },
            { key: 'email', label: 'Email', visible: false }, // Hidden by default on mobile logic but we manage state here
            { key: 'products', label: 'Products', visible: true },
            { key: 'cartValue', label: 'Value', visible: true },
            { key: 'abandonedAt', label: 'Abandoned At', visible: true },
            { key: 'status', label: 'Status', visible: true },
            { key: 'channel', label: 'Channel', visible: true },
        ]
    );

    const toggleColumn = (key: string) => {
        setVisibleColumns(prev => prev.map(col => col.key === key ? { ...col, visible: !col.visible } : col));
    };

    /* Handlers */
    const handleViewCart = (cart: AbandonedOrder) => {
        setSelectedCartForView(cart);
        setViewMode('view-cart');
    };

    const handleSendEmail = (ids: string[]) => {
        if (ids.length === 0) return;
        // Just switch mode, selection is already in state
        setViewMode('send-email');
    };

    const handleCloseModal = () => {
        setViewMode('list');
        setSelectedCartForView(null);
    };

    const handleConfirmSendEmail = (templateId: string) => {
        const cartIds = selectedRows.length > 0 ? selectedRows.map(r => r.id) : (selectedCartForView ? [selectedCartForView.id] : []);

        if (cartIds.length === 0) return;

        sendEmail({
            cart_ids: cartIds,
            template_id: templateId
        }, {
            onSuccess: () => {
                handleCloseModal();
                setSelectedRows([]);
                setSelectedIds([]);
            }
        });
    };

    // ... (rest of the component remains same, just update MetricsGrid to use real data)

    // Transform metrics for UI
    const metrics: MetricItem[] = useMemo(() => {
        if (!metricsData) return [];
        return [
            {
                title: "Total Carts",
                value: metricsData.total_abandoned,
                helperText: "Incomplete checkouts",
                icon: ShoppingCart,
                iconBg: "#735DFF",
            },
            {
                title: "Potential Revenue",
                value: `₹${parseFloat(metricsData.potential_revenue).toFixed(0)}`,
                helperText: "Recoverable amount",
                icon: DollarSign,
                iconBg: "#F5A623",
            },
            {
                title: "Emails Sent",
                value: metricsData.emails_sent,
                helperText: "Recovery attempts",
                icon: Mail,
                iconBg: "#3498DB",
            },
            {
                title: "Recovery Rate",
                value: `${metricsData.recovery_rate}%`,
                helperText: "Successful recoveries",
                icon: CheckCircle2,
                iconBg: "#2ECC71",
            }
        ];
    }, [metricsData]);

    // ... rest of the render code updated with `isLoadingList` loading logic 


    /* Configuration */
    const filterGroups = useMemo(() => [
        {
            id: "status",
            label: "Status",
            options: [
                { label: "All Status", value: "", onSelect: () => setStatusFilter(""), isActive: statusFilter === "" },
                { label: "Not Contacted", value: "not-contacted", onSelect: () => setStatusFilter("not-contacted"), isActive: statusFilter === "not-contacted" },
                { label: "Email Sent", value: "email-sent", onSelect: () => setStatusFilter("email-sent"), isActive: statusFilter === "email-sent" },
                { label: "Recovered", value: "recovered", onSelect: () => setStatusFilter("recovered"), isActive: statusFilter === "recovered" },
            ]
        }
    ], [statusFilter]);

    const sortOptions: SortOption[] = [
        {
            label: "Newest First",
            value: "newest",
            direction: "desc",
            isActive: sortConfig.key === 'abandonedAt' && sortConfig.direction === 'desc',
            onSelect: () => setSortConfig({ key: 'abandonedAt', direction: 'desc' })
        },
        {
            label: "Oldest First",
            value: "oldest",
            direction: "asc",
            isActive: sortConfig.key === 'abandonedAt' && sortConfig.direction === 'asc',
            onSelect: () => setSortConfig({ key: 'abandonedAt', direction: 'asc' })
        },
    ];

    /* Columns Definition */
    const columns: ColumnConfig<AbandonedOrder>[] = [
        {
            key: 'cartId',
            label: 'Cart ID',
            type: 'text',
            sortable: true,
            sortKey: 'cartId',
            render: (_, row) => <span className="font-medium text-slate-900">{row.cartId}</span>
        },
        {
            key: 'customerName',
            label: 'Customer',
            type: 'text',
            sortable: true,
            sortKey: 'customerName'
        },
        {
            key: 'email',
            label: 'Email',
            type: 'text',
            className: 'text-slate-500',
            sortable: true,
            sortKey: 'email',
            hiddenOn: { sm: true }
        },
        {
            key: 'products',
            label: 'ITEMS',
            align: 'left',
            sortable: true,
            sortKey: 'products',
            render: (_, row) => (
                <span className="text-slate-700">
                    <span className="font-medium">{row.products.reduce((acc, p) => acc + p.quantity, 0)}</span> items
                </span>
            )
        },
        {
            key: 'cartValue',
            label: 'Value',
            align: 'right',
            type: 'currency',
            currencySymbol: '₹',
            sortable: true,
            sortKey: 'cartValue'
        },
        {
            key: 'abandonedAt',
            label: 'Abandoned At',
            type: 'date',
            sortable: true,
            sortKey: 'abandonedAt',
            render: (_, row) => (
                <div className="flex flex-col">
                    <span className="text-slate-900">{row.abandonedAt.split(' ')[0]}</span>
                    <span className="text-[10px] text-slate-400">{row.lastActivity}</span>
                </div>
            )
        },
        {
            key: 'status',
            label: 'Status',
            type: 'badge',
            sortable: true,
            sortKey: 'recoveryStatus',
            render: (_, row) => {
                const status: RecoveryStatus = row.recoveryStatus;
                switch (status) {
                    case 'not-contacted':
                        return <Badge variant="secondary" className="bg-slate-100 text-slate-700 border-slate-200">Not Contacted</Badge>;
                    case 'email-sent':
                        return <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">Email Sent</Badge>;
                    case 'recovered':
                        return <Badge variant="default" className="bg-emerald-100 text-emerald-700 border-emerald-200">Recovered</Badge>;
                    default:
                        return <span>{status}</span>;
                }
            }
        },
        {
            key: 'channel',
            label: 'Channel',
            align: 'center',
            sortable: true,
            sortKey: 'channel',
            render: (_, row) => row.channel === 'web' ?
                <Globe className="size-4 text-slate-400 mx-auto" /> :
                <Smartphone className="size-4 text-slate-400 mx-auto" />
        },
    ];

    const filteredColumns = useMemo(
        () => columns.filter((col) =>
            visibleColumns.find((v) => v.key === col.key)?.visible
        ),
        [visibleColumns]
    );

    /* Row Actions */
    const actions = [
        {
            label: "View Cart",
            icon: <Eye size={16} />,
            onClick: () => { } // handled by row click or button
        },
        // More page level actions... 
    ];

    const renderMobileCard = (row: AbandonedOrder): MobileRecordCardProps => ({
        title: row.customerName,
        subtitle: row.cartId,
        primaryValue: `₹${row.cartValue}`,
        badges: <Badge>{row.recoveryStatus}</Badge>,
        fields: [
            { label: 'Email', value: row.email },
            { label: 'Items', value: `${row.products.length} items` }
        ]
    });

    return (
        <div className="px-9 lg:px-8 pb-8 lg:pb-8 pt-2 space-y-7">
            {/* Header / Actions */}
            <div className="flex justify-between items-center">
                <DateRangePicker value={dateRange as any} onChange={setDateRange as any} />

                <div className="flex items-center gap-2">
                    {selectedRows.length > 0 && (
                        <Button
                            onClick={() => handleSendEmail(selectedRows.map(r => r.id))}
                            className="bg-[#0e042f] hover:bg-[#0e042f]/90 text-white"
                        >
                            <Mail className="size-4 mr-2" />
                            Send Email ({selectedRows.length})
                        </Button>
                    )}
                    {/* Placeholder for standard actions if any */}
                    {/* <ActionButtons ... /> */}
                    {/* Since 'Send Email' is contextual, we might not use ActionButtons primary here unless we map it. 
                        ActionButtons usually has fixed 'Add New' etc. 
                        Let's stick to custom button for 'Send Email' or integrate if possible.
                    */}
                </div>
            </div>

            {/* Metrics */}
            <MetricsGrid metrics={metrics} />

            {/* Controls */}
            <FiltersBar
                search={searchQuery}
                onSearchChange={(v) => { setSearchQuery(v); setPage(1); }}
                filterGroups={filterGroups}
                sortOptions={sortOptions}
                visibleColumns={visibleColumns}
                onToggleColumn={toggleColumn}
                actions={actions}
                searchPlaceholder="Search"
                onClearFilters={() => {
                    setStatusFilter("");
                    setSearchQuery("");
                    setPage(1);
                    setSortConfig({ key: 'abandonedAt', direction: 'desc' });
                }}
            />

            {/* Table */}
            <GenericTable<AbandonedOrder>
                data={orders}
                loading={false} // hook doesn't expose loading yet
                page={page}
                totalPages={totalPages}
                rowsPerPage={rowsPerPage}
                totalItems={total}
                onPageChange={setPage}
                onRowsPerPageChange={setRowsPerPage}
                getRowId={(row) => row.id}
                columns={filteredColumns}
                selectable={true}
                selectionMode="multiple"
                onSelectionChange={setSelectedRows}
                externalSelectionIds={selectedIds}
                onSelectionIdsChange={setSelectedIds}
                renderMobileCard={renderMobileCard}
                onRowClick={handleViewCart}
                sortKey={sortConfig.key}
                sortDirection={sortConfig.direction}
                onSortChange={(key, direction) => setSortConfig({ key, direction })}

                rowActionsBuilder={(row) => [
                    {
                        onClick: () => handleViewCart(row),
                        icon: <Eye size={16} />,
                        label: ""
                    },
                    {
                        onClick: () => handleSendEmail([row.id]),
                        icon: <Mail size={16} />,
                        label: ""
                    }
                ]}
            />

            {/* Modals */}
            {viewMode === 'send-email' && (
                <AbandonedCartEmailModal
                    onClose={handleCloseModal}
                    onConfirm={handleConfirmSendEmail}
                    selectedCount={selectedRows.length || 1}
                    templates={emailTemplates || []}
                />
            )}

            {viewMode === 'view-cart' && selectedCartForView && (
                <AbandonedCartDetailsDrawer
                    cart={selectedCartForView}
                    onClose={handleCloseModal}
                    onSendEmail={() => handleSendEmail([selectedCartForView.id])}
                />
            )}
        </div>
    );
};

export default AbandonedOrdersPage;
