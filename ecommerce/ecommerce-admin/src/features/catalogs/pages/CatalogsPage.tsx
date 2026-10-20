import React, { useMemo, useState, useCallback } from "react";
import { notifyInfo } from "@/utils";
import {
    Eye,
    Edit,
    Trash2,
    Copy,
    Printer,
    Activity,
    Archive,
    Plus,
    Package
} from "lucide-react";

import { DateRangePicker } from '@/components/forms/inputs/DateRangePicker';
import { ActionButtons, FiltersBar, GenericTable, type ColumnConfig, type SortOption } from '@/components/data-table';
import { MetricsGrid, type MetricItem } from '@/components/metrics';
import type { MobileRecordCardProps } from '@/components/data-table';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { usePagination, useSearch, useDateRange } from "@/hooks";
import type { Catalog } from "../types/catalog.types";
import { MOCK_CATALOG_LIST, DISCOUNT_TYPES, CATALOG_STATUSES } from "../data/mockCatalogs";
import AddCatalogPage from "./AddCatalogPage";

const CatalogsPage: React.FC = () => {
    const { dateRange, setDateRange } = useDateRange();
    const { search, setSearch } = useSearch();
    const { page, rowsPerPage, setPage, setRowsPerPage } = usePagination();
    const [status, setStatus] = useState("");
    const [discountType, setDiscountType] = useState("");
    const [sort, setSort] = useState("");
    const [showAddForm, setShowAddForm] = useState(false);

    // Use mock data for development
    const isLoading = false;

    // Filter mock data based on search, status, and discount type
    let filteredCatalogs = [...MOCK_CATALOG_LIST];

    if (search) {
        filteredCatalogs = filteredCatalogs.filter(c =>
            c.catalogName.toLowerCase().includes(search.toLowerCase()) ||
            c.description.toLowerCase().includes(search.toLowerCase()) ||
            c.catalog_id.toLowerCase().includes(search.toLowerCase())
        );
    }

    if (status) {
        filteredCatalogs = filteredCatalogs.filter(c =>
            c.status.toLowerCase() === status.toLowerCase()
        );
    }

    if (discountType) {
        filteredCatalogs = filteredCatalogs.filter(c =>
            c.discountType.toLowerCase() === discountType.toLowerCase()
        );
    }

    // Sort mock data
    if (sort === 'newest') {
        filteredCatalogs.sort((a, b) =>
            new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        );
    } else if (sort === 'oldest') {
        filteredCatalogs.sort((a, b) =>
            new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
        );
    } else if (sort === 'name_asc') {
        filteredCatalogs.sort((a, b) => a.catalogName.localeCompare(b.catalogName));
    } else if (sort === 'name_desc') {
        filteredCatalogs.sort((a, b) => b.catalogName.localeCompare(a.catalogName));
    } else if (sort === 'most_products') {
        filteredCatalogs.sort((a, b) => b.products - a.products);
    } else if (sort === 'least_products') {
        filteredCatalogs.sort((a, b) => a.products - b.products);
    }

    // Filter by date range
    if (dateRange.from || dateRange.to) {
        filteredCatalogs = filteredCatalogs.filter(catalog => {
            const catalogDate = new Date(catalog.created_at);
            const from = dateRange.from;
            const to = dateRange.to;

            if (from && to) {
                return catalogDate >= from && catalogDate <= to;
            } else if (from) {
                return catalogDate >= from;
            } else if (to) {
                return catalogDate <= to;
            }
            return true;
        });
    }

    // Pagination
    const totalCatalogs = filteredCatalogs.length;
    const totalPages = Math.ceil(totalCatalogs / rowsPerPage);
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, totalCatalogs);
    const paginatedCatalogs = filteredCatalogs.slice(startIndex, endIndex);

    // Metrics data
    const metrics: MetricItem[] = useMemo(() => [
        {
            title: 'Total Catalogs',
            value: MOCK_CATALOG_LIST.length,
            helperText: 'All catalogs',
            icon: Package,
            iconBg: '#3B82F6',
        },
        {
            title: 'Active Catalogs',
            value: MOCK_CATALOG_LIST.filter(c => c.status === 'Active').length,
            helperText: 'Currently active',
            icon: Activity,
            iconBg: '#10B981',
        },
        {
            title: 'Draft Catalogs',
            value: MOCK_CATALOG_LIST.filter(c => c.status === 'Draft').length,
            helperText: 'In draft status',
            icon: Archive,
            iconBg: '#F59E0B',
        },
        {
            title: 'Total Products',
            value: MOCK_CATALOG_LIST.reduce((sum, c) => sum + c.products, 0),
            helperText: 'Across all catalogs',
            icon: Package,
            iconBg: '#8B5CF6',
        },
    ], []);

    // Action menu items
    const actionItems = useMemo(() => [
        { label: "View Details", icon: <Eye size={16} />, onClick: () => notifyInfo("Feature not implemented yet") },
        { label: "Duplicate Catalog", icon: <Copy size={16} />, onClick: () => notifyInfo("Feature not implemented yet") },
        { label: "Print Catalog", icon: <Printer size={16} />, onClick: () => notifyInfo("Feature not implemented yet") },
        { label: "Edit Catalog", icon: <Edit size={16} />, onClick: () => notifyInfo("Feature not implemented yet") },
        { label: "Delete Catalog", icon: <Trash2 size={16} />, danger: true, onClick: () => notifyInfo("Feature not implemented yet") },
    ], []);

    // Column configuration
    const columns: ColumnConfig<Catalog>[] = [
        {
            key: "catalog_id",
            label: "Catalog ID",
            type: "text",
            sortable: true,
            render: (_, row) => (
                <span className="font-medium text-slate-900">{row.catalog_id}</span>
            )
        },
        {
            key: "catalogName",
            label: "Catalog Name",
            type: "text",
            sortable: true,
            render: (_, row) => (
                <div className="min-w-0">
                    <p className="font-medium text-slate-900 truncate">{row.catalogName}</p>
                    <p className="text-sm text-slate-500 truncate">{row.description}</p>
                </div>
            )
        },
        {
            key: "discountType",
            label: "Discount Type",
            type: "text",
            sortable: true,
            render: (_, row) => {
                const getDiscountTypeBadge = (type: string) => {
                    const badges = {
                        'Percentage': { variant: 'bg-purple-50 text-purple-700 border-purple-200' as const, text: 'Percentage' },
                        'Fixed Amount': { variant: 'bg-green-50 text-green-700 border-green-200' as const, text: 'Fixed Amount' },
                        'Buy X Get Y': { variant: 'bg-blue-50 text-blue-700 border-blue-200' as const, text: 'Buy X Get Y' }
                    };
                    return badges[type as keyof typeof badges] || badges['Percentage'];
                };

                const badge = getDiscountTypeBadge(row.discountType);
                return (
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-md border ${badge.variant}`}>
                        {badge.text}
                    </span>
                );
            }
        },
        {
            key: "discountValue",
            label: "Discount Value",
            type: "text",
            sortable: true,
            render: (_, row) => (
                <span className="font-semibold text-slate-900 tabular-nums">{row.discountValue}</span>
            )
        },
        {
            key: "products",
            label: "Products",
            type: "number",
            sortable: true,
            render: (_, row) => (
                <span className="font-medium text-slate-700 tabular-nums">{row.products}</span>
            )
        },
        {
            key: "status",
            label: "Status",
            type: "badge",
            sortable: true,
            render: (_, row) => {
                const getStatusBadge = (status: string) => {
                    const badges = {
                        'Active': { variant: 'bg-emerald-50 text-emerald-700 border-emerald-200' as const, text: 'Active' },
                        'Inactive': { variant: 'bg-slate-50 text-slate-700 border-slate-200' as const, text: 'Inactive' },
                        'Draft': { variant: 'bg-amber-50 text-amber-700 border-amber-200' as const, text: 'Draft' }
                    };
                    return badges[status as keyof typeof badges] || badges['Active'];
                };

                const badge = getStatusBadge(row.status);
                return (
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-md border ${badge.variant}`}>
                        {badge.text}
                    </span>
                );
            }
        },
        {
            key: "created_at",
            label: "Created",
            type: "date",
            sortable: true,
            render: (_, row) => (
                <span className="text-sm text-slate-600">
                    {new Date(row.created_at).toLocaleDateString()}
                </span>
            )
        }
    ];

    // Mobile card render
    const renderMobileCard = useCallback((catalog: Catalog): MobileRecordCardProps => {
        const getStatusStyles = (status: string) => {
            const styles = {
                'Active': 'bg-emerald-50 text-emerald-700 border-emerald-200',
                'Inactive': 'bg-slate-50 text-slate-700 border-slate-200',
                'Draft': 'bg-amber-50 text-amber-700 border-amber-200'
            };
            return styles[status as keyof typeof styles] || styles['Active'];
        };

        const getDiscountTypeStyles = (type: string) => {
            const styles = {
                'Percentage': 'bg-purple-50 text-purple-700 border-purple-200',
                'Fixed Amount': 'bg-green-50 text-green-700 border-green-200',
                'Buy X Get Y': 'bg-blue-50 text-blue-700 border-blue-200'
            };
            return styles[type as keyof typeof styles] || styles['Percentage'];
        };

        return {
            title: catalog.catalogName,
            subtitle: catalog.catalog_id,
            badges: (
                <div className="flex flex-wrap gap-1">
                    <Badge className={getStatusStyles(catalog.status)}>
                        {catalog.status}
                    </Badge>
                    <Badge className={getDiscountTypeStyles(catalog.discountType)}>
                        {catalog.discountType}
                    </Badge>
                </div>
            ),
            fields: [
                { label: 'Description', value: catalog.description },
                { label: 'Discount', value: catalog.discountValue },
                { label: 'Products', value: catalog.products.toString() },
                { label: 'Created', value: new Date(catalog.created_at).toLocaleDateString() }
            ]
        };
    }, []);

    // Filter options
    const statusFilterOptions = [
        { label: "All Statuses", value: "", onSelect: () => setStatus(""), isActive: status === "" },
        ...CATALOG_STATUSES.map(statusValue => ({
            label: statusValue,
            value: statusValue.toLowerCase(),
            onSelect: () => setStatus(statusValue.toLowerCase()),
            isActive: status === statusValue.toLowerCase()
        }))
    ];

    const discountTypeFilterOptions = [
        { label: "All Types", value: "", onSelect: () => setDiscountType(""), isActive: discountType === "" },
        ...DISCOUNT_TYPES.map(typeValue => ({
            label: typeValue,
            value: typeValue.toLowerCase(),
            onSelect: () => setDiscountType(typeValue.toLowerCase()),
            isActive: discountType === typeValue.toLowerCase()
        }))
    ];

    const sortOptions: SortOption[] = [
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
            label: "Name A-Z",
            value: "name_asc",
            direction: "asc",
            isActive: sort === "name_asc",
            onSelect: () => {
                setSort("name_asc");
                setPage(1);
            },
        },
        {
            label: "Name Z-A",
            value: "name_desc",
            direction: "desc",
            isActive: sort === "name_desc",
            onSelect: () => {
                setSort("name_desc");
                setPage(1);
            },
        },
        {
            label: "Most Products",
            value: "most_products",
            direction: "desc",
            isActive: sort === "most_products",
            onSelect: () => {
                setSort("most_products");
                setPage(1);
            },
        },
        {
            label: "Least Products",
            value: "least_products",
            direction: "asc",
            isActive: sort === "least_products",
            onSelect: () => {
                setSort("least_products");
                setPage(1);
            },
        }
    ];

    // If showing Add Catalog form, render it
    if (showAddForm) {
        return <AddCatalogPage onBack={() => setShowAddForm(false)} />;
    }

    return (
        <div className="px-9 lg:px-8 pb-8 lg:pb-8 pt-2 space-y-7">
            {/* Header with Date Picker and Action Buttons */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
                {/* Date Range Picker - Left Side */}
                <div className="w-auto">
                    <DateRangePicker
                        value={dateRange ? { from: dateRange.from ?? null, to: dateRange.to ?? null } : { from: null, to: null }}
                        onChange={(val) => setDateRange(val.from ? { from: val.from, to: val.to ?? null } : { from: null, to: null })}
                    />
                </div>

                {/* Action Buttons - Right Side */}
                <div className="flex items-center gap-3 flex-wrap">

                    <Button
                        onClick={() => setShowAddForm(true)}
                        className="bg-[#0E042F] text-white hover:bg-[#0E042F]/90"
                    >
                        <Plus className="size-4 mr-2" />
                        Add Catalog
                    </Button>
                </div>
            </div>

            {/* Metrics */}
            <MetricsGrid metrics={metrics} />

            {/* Filters */}
            <FiltersBar
                search={search}
                onSearchChange={(v) => { setSearch(v); setPage(1); }}
                filters={[...statusFilterOptions, ...discountTypeFilterOptions]}
                sortOptions={sortOptions}
                visibleColumns={[]}
                onToggleColumn={() => { }}
                actions={actionItems}
                onClearFilters={() => {
                    setStatus("");
                    setDiscountType("");
                    setSearch("");
                    setSort("");
                    setPage(1);
                }}
            />

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="overflow-hidden">
                    <GenericTable<Catalog>
                        data={paginatedCatalogs}
                        columns={columns}
                        loading={isLoading}
                        page={page}
                        totalPages={totalPages}
                        rowsPerPage={rowsPerPage}
                        totalItems={totalCatalogs}
                        onPageChange={setPage}
                        onRowsPerPageChange={setRowsPerPage}
                        getRowId={(catalog) => catalog.id}
                        renderMobileCard={renderMobileCard}
                    />
                </div>
            </div>
        </div>
    );
};

export default CatalogsPage;