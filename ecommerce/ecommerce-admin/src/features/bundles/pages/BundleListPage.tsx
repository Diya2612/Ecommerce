import React, { useMemo, useState, useEffect } from 'react';
import { Package, ShoppingCart, TrendingUp, DollarSign, Edit2, Copy, Printer, Archive, XCircle } from 'lucide-react';
import { DateRangePicker } from '@/components/forms/inputs/DateRangePicker';
import { ActionButtons, FiltersBar, GenericTable, type ColumnConfig, type SortOption, type MobileRecordCardProps } from '@/components/data-table';
import { MetricsGrid, type MetricItem } from '@/components/metrics';
import { usePagination, useSearch, useDateRange } from "@/hooks";
import { mockBundles } from '../data/bundle.constants';
import type { Bundle } from '../types/bundle.types';
import { notifyInfo } from '@/utils';

const BundleListPage: React.FC = () => {
    const { dateRange, setDateRange } = useDateRange();
    const { search, setSearch } = useSearch();
    const { page, rowsPerPage, setPage, setRowsPerPage } = usePagination();
    const [status, setStatus] = useState("");
    const [type, setType] = useState("");
    const [sort, setSort] = useState("");

    // Use mock data for development
    const [isLoading, setIsLoading] = useState(true);
    const error = null;

    // Simulate initial data load
    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 300);
        return () => clearTimeout(timer);
    }, []);

    // Filter mock data based on search, status, and type
    let filteredBundles = [...mockBundles];

    if (search) {
        filteredBundles = filteredBundles.filter(b =>
            b.title.toLowerCase().includes(search.toLowerCase()) ||
            b.id.toLowerCase().includes(search.toLowerCase()) ||
            b.type.toLowerCase().includes(search.toLowerCase())
        );
    }

    if (status) {
        filteredBundles = filteredBundles.filter(b =>
            b.status?.toLowerCase() === status.toLowerCase()
        );
    }

    if (type) {
        filteredBundles = filteredBundles.filter(b =>
            b.type?.toLowerCase() === type.toLowerCase()
        );
    }

    // Sort mock data
    if (sort === 'title_asc') {
        filteredBundles.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sort === 'title_desc') {
        filteredBundles.sort((a, b) => b.title.localeCompare(a.title));
    } else if (sort === 'sales_desc' || sort === 'totalSales_desc') {
        filteredBundles.sort((a, b) => b.totalSales - a.totalSales);
    } else if (sort === 'sales_asc' || sort === 'totalSales_asc') {
        filteredBundles.sort((a, b) => a.totalSales - b.totalSales);
    } else if (sort === 'newest' || sort === 'startDate_desc') {
        filteredBundles.sort((a, b) => new Date(b.startDate || 0).getTime() - new Date(a.startDate || 0).getTime());
    } else if (sort === 'oldest' || sort === 'startDate_asc') {
        filteredBundles.sort((a, b) => new Date(a.startDate || 0).getTime() - new Date(b.startDate || 0).getTime());
    } else if (sort === 'price_asc') {
        filteredBundles.sort((a, b) => a.price - b.price);
    } else if (sort === 'price_desc') {
        filteredBundles.sort((a, b) => b.price - a.price);
    } else if (sort === 'revenue_desc') {
        filteredBundles.sort((a, b) => b.revenue - a.revenue);
    } else if (sort === 'revenue_asc') {
        filteredBundles.sort((a, b) => a.revenue - b.revenue);
    } else if (sort === 'type_asc') {
        filteredBundles.sort((a, b) => a.type.localeCompare(b.type));
    } else if (sort === 'type_desc') {
        filteredBundles.sort((a, b) => b.type.localeCompare(a.type));
    } else if (sort === 'status_asc') {
        filteredBundles.sort((a, b) => a.status.localeCompare(b.status));
    } else if (sort === 'status_desc') {
        filteredBundles.sort((a, b) => b.status.localeCompare(a.status));
    } else if (sort === 'id_asc') {
        filteredBundles.sort((a, b) => a.id.localeCompare(b.id));
    } else if (sort === 'id_desc') {
        filteredBundles.sort((a, b) => b.id.localeCompare(a.id));
    } else if (sort === 'endDate_asc') {
        filteredBundles.sort((a, b) => new Date(a.endDate || 0).getTime() - new Date(b.endDate || 0).getTime());
    } else if (sort === 'endDate_desc') {
        filteredBundles.sort((a, b) => new Date(b.endDate || 0).getTime() - new Date(a.endDate || 0).getTime());
    }

    // Pagination
    const total = filteredBundles.length;
    const totalPages = Math.ceil(total / rowsPerPage);
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const bundles = filteredBundles.slice(startIndex, endIndex);

    // -----------------------------
    // Metrics
    // -----------------------------
    const metrics: MetricItem[] = useMemo(() => {
        const active = bundles.filter((b) => b.status?.toLowerCase() === "active").length;
        const inactive = bundles.filter((b) => b.status?.toLowerCase() === "inactive").length;
        const totalRevenue = bundles.reduce((sum, b) => sum + b.revenue, 0);
        const totalSales = bundles.reduce((sum, b) => sum + b.totalSales, 0);

        return [
            { title: "Total Bundles", value: total, helperText: "All product bundles", icon: Package, iconBg: "#735DFF" },
            { title: "Active Bundles", value: active, helperText: "Available for sale", icon: ShoppingCart, iconBg: "#2ECC71" },
            { title: "Inactive Bundles", value: inactive, helperText: "Hidden bundles", icon: TrendingUp, iconBg: "#E74C3C" },
            { title: "Total Sales", value: totalSales, helperText: "Units sold", icon: TrendingUp, iconBg: "#F5A623" },
            { title: "Revenue Generated", value: `₹${(totalRevenue / 100000).toFixed(1)}L`, helperText: "Total earnings", icon: DollarSign, iconBg: "#9B59B6" },
        ];
    }, [bundles, total]);

    // -----------------------------
    // Filters Configuration
    // -----------------------------
    const statusFilterOptions = [
        { label: "All Status", value: "", onSelect: () => setStatus(""), isActive: status === "" },
        { label: "Active", value: "active", onSelect: () => setStatus("active"), isActive: status === "active" },
        { label: "Inactive", value: "inactive", onSelect: () => setStatus("inactive"), isActive: status === "inactive" },
    ];

    const typeFilterOptions = [
        { label: "All Types", value: "", onSelect: () => setType(""), isActive: type === "" },
        { label: "Fixed Bundle", value: "fixed bundle", onSelect: () => setType("fixed bundle"), isActive: type === "fixed bundle" },
        { label: "Mix & Match", value: "mix & match", onSelect: () => setType("mix & match"), isActive: type === "mix & match" },
    ];

    const sortOptions = [
        {
            label: "Newest First",
            value: "newest",
            direction: "desc",
            isActive: sort === "newest",
            onSelect: () => {
                setSort("newest");
                setPage(1);
            },
        },
        {
            label: "Oldest First",
            value: "oldest",
            direction: "asc",
            isActive: sort === "oldest",
            onSelect: () => {
                setSort("oldest");
                setPage(1);
            },
        },
        {
            label: "Title A-Z",
            value: "title_asc",
            direction: "asc",
            isActive: sort === "title_asc",
            onSelect: () => {
                setSort("title_asc");
                setPage(1);
            },
        },
        {
            label: "Title Z-A",
            value: "title_desc",
            direction: "desc",
            isActive: sort === "title_desc",
            onSelect: () => {
                setSort("title_desc");
                setPage(1);
            },
        },
        {
            label: "Price (Low → High)",
            value: "price_asc",
            direction: "asc",
            isActive: sort === "price_asc",
            onSelect: () => {
                setSort("price_asc");
                setPage(1);
            },
        },
        {
            label: "Price (High → Low)",
            value: "price_desc",
            direction: "desc",
            isActive: sort === "price_desc",
            onSelect: () => {
                setSort("price_desc");
                setPage(1);
            },
        },
        {
            label: "Most Sales",
            value: "sales_desc",
            direction: "desc",
            isActive: sort === "sales_desc",
            onSelect: () => {
                setSort("sales_desc");
                setPage(1);
            },
        },
        {
            label: "Least Sales",
            value: "sales_asc",
            direction: "asc",
            isActive: sort === "sales_asc",
            onSelect: () => {
                setSort("sales_asc");
                setPage(1);
            },
        },
        {
            label: "Highest Revenue",
            value: "revenue_desc",
            direction: "desc",
            isActive: sort === "revenue_desc",
            onSelect: () => {
                setSort("revenue_desc");
                setPage(1);
            },
        },
        {
            label: "Lowest Revenue",
            value: "revenue_asc",
            direction: "asc",
            isActive: sort === "revenue_asc",
            onSelect: () => {
                setSort("revenue_asc");
                setPage(1);
            },
        },
    ] as const satisfies SortOption[];

    // Visible Columns
    const [visibleColumns, setVisibleColumns] = useState([
        { key: "id", label: "ID", visible: true },
        { key: "title", label: "Bundle Title", visible: true },
        { key: "type", label: "Type", visible: true },
        { key: "status", label: "Status", visible: true },
        { key: "priceType", label: "Price Type", visible: true },
        { key: "price", label: "Price/Discount", visible: true },
        { key: "startDate", label: "Start Date", visible: true },
        { key: "endDate", label: "End Date", visible: true },
        { key: "totalSales", label: "Sales", visible: true },
    ]);

    const toggleColumn = (key: string) => {
        setVisibleColumns((prev) =>
            prev.map((c) => (c.key === key ? { ...c, visible: !c.visible } : c))
        );
    };

    // -----------------------------
    // Table Columns
    // -----------------------------
    const columns: ColumnConfig<Bundle>[] = [
        { key: 'id', label: 'ID', type: 'text', className: 'font-medium text-slate-900 w-20 sm:w-32', sortable: true, hiddenOnMobile: true },
        {
            key: 'title', label: 'Bundle Title', type: 'text',
            className: 'font-medium text-slate-900 min-w-[200px] sm:min-w-[250px]',
            link: (row) => `/bundles/${row.id}`,
            linkClassName: "text-black font-semibold",
            sortable: true, sortKey: 'title'
        },
        { key: 'type', label: 'Type', type: 'text', className: 'text-slate-600', sortable: true, sortKey: 'type', hiddenOnMobile: true },
        { key: 'status', label: 'Status', type: 'badge', sortable: true, sortKey: 'status' },
        { key: 'priceType', label: 'Price Type', type: 'text', className: 'text-slate-600', hiddenOnMobile: true },
        {
            key: 'price', label: 'Price/Discount', type: 'text',
            className: 'text-slate-900 font-medium',
            render: (_, row) => row.priceType === 'Fixed Price' ? `₹${row.price.toLocaleString()}` : `${row.discount}% OFF`,
            sortable: true, sortKey: 'price'
        },
        { key: 'startDate', label: 'Start Date', type: 'date', className: 'text-slate-600 whitespace-nowrap', sortable: true, sortKey: 'startDate', hiddenOnMobile: true },
        { key: 'endDate', label: 'End Date', type: 'date', className: 'text-slate-600 whitespace-nowrap', sortable: true, sortKey: 'endDate', hiddenOnMobile: true },
        { key: 'totalSales', label: 'Sales', type: 'number', className: 'text-slate-600', sortable: true, sortKey: 'totalSales' },
    ];

    // Filter actual columns based on visibility
    const filteredColumns = useMemo(
        () => columns.filter((col) =>
            visibleColumns.find((v) => v.key === col.key)?.visible
        ),
        [visibleColumns]
    );

    // -----------------------------
    // Actions Menu
    // -----------------------------
    const actions = [
        { label: "Duplicate Bundle", icon: <Copy size={16} />, onClick: () => notifyInfo("Duplicate not implemented") },
        { label: "Print Info", icon: <Printer size={16} />, onClick: () => notifyInfo("Print not implemented") },
        { label: "Update Status", icon: <Edit2 size={16} />, onClick: () => notifyInfo("Update status not implemented") },
        { label: "Archive Bundle", icon: <Archive size={16} />, onClick: () => notifyInfo("Archive not implemented") },
        { label: "Delete Bundle", icon: <XCircle size={16} />, danger: true, onClick: () => notifyInfo("Delete not implemented") },
    ];

    const renderMobileCard = (row: Bundle): MobileRecordCardProps => {
        const status = (row.status || "").toLowerCase();
        const badgeStyle =
            status === "active"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-gray-100 text-gray-600 border-gray-200";

        return {
            title: row.title,
            subtitle: `ID: ${row.id}`,
            primaryValue: row.priceType === 'Fixed Price' ? `₹${row.price.toLocaleString()}` : `${row.discount}% OFF`,
            badges: (
                <span
                    className={`px-2 py-0.5 rounded-full text-[10px] border ${badgeStyle}`}
                >
                    {row.status || "—"}
                </span>
            ),
            fields: [
                {
                    label: "Type",
                    value: row.type || "—",
                },
                {
                    label: "Sales",
                    value: row.totalSales?.toString() || "—",
                },
                {
                    label: "Revenue",
                    value: row.revenue ? `₹${(row.revenue / 100000).toFixed(1)}L` : "—",
                },
                {
                    label: "Start Date",
                    value: row.startDate
                        ? new Date(row.startDate).toLocaleDateString()
                        : "—",
                },
            ],
        };
    };

    return (
        <div className="px-9 lg:px-8 pb-8 lg:pb-8 pt-2 space-y-7">
            {/* Date range + Actions */}
            <div className="flex justify-between items-center">
                <DateRangePicker value={dateRange} onChange={setDateRange} />

                <ActionButtons
                    primaryLabel="Create Bundle"
                    primaryTo="/bundles/new"
                />
            </div>

            {/* Metrics */}
            <MetricsGrid metrics={metrics} />

            {/* Error */}
            {error && (
                <div className="text-xs text-red-500 bg-red-50 p-2 rounded-lg border border-red-100">
                    Failed to load bundles. Please try again.
                </div>
            )}

            {/* Filters Bar */}
            <FiltersBar
                search={search}
                onSearchChange={(v) => { setSearch(v); setPage(1); }}
                filters={[...statusFilterOptions, ...typeFilterOptions]}
                sortOptions={sortOptions}
                visibleColumns={visibleColumns}
                onToggleColumn={toggleColumn}
                actions={actions}
                onClearFilters={() => {
                    setStatus("");
                    setType("");
                    setSearch("");
                    setSort("");
                    setPage(1);
                }}
            />

            {/* Table */}
            <GenericTable<Bundle>
                data={bundles}
                loading={isLoading}
                page={page}
                totalPages={totalPages}
                rowsPerPage={rowsPerPage}
                totalItems={total}
                onPageChange={setPage}
                onRowsPerPageChange={setRowsPerPage}
                getRowId={(row) => row.id}
                columns={filteredColumns}
                selectable={true}
                sortKey={sort.split('_')[0] || ''}
                sortDirection={(sort.split('_')[1] as 'asc' | 'desc') || 'asc'}
                onSortChange={(key, direction) => {
                    const sortValue = `${key}_${direction}`;
                    setSort(sortValue);
                    setPage(1);
                }}
                renderMobileCard={renderMobileCard}
            />
        </div>
    );
};

export default BundleListPage;
