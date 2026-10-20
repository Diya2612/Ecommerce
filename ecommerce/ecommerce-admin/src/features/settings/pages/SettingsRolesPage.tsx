import React, { useState } from "react";
import {
    Shield,
    Users,
    UserCheck,
    Lock,
    Edit,
    Trash2,
    ChevronRight,
    Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { logger } from "@/utils/logger";

import { MetricsGrid, type MetricItem } from '@/components/metrics';
import { FiltersBar, type SortOption } from '@/components/data-table';
import { GenericTable, type ColumnConfig, type RowAction } from '@/components/data-table';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { usePagination, useSearch } from "@/hooks";
import { MOCK_ROLES } from "../data/mockSettings";
import type { Role } from "../types/settings.types";

const SettingsRolesPage: React.FC = () => {
    const navigate = useNavigate();
    const { search, setSearch } = useSearch();
    const { page, rowsPerPage, setPage, setRowsPerPage } = usePagination();
    const [status, setStatus] = useState("");
    const [sort, setSort] = useState("");
    const [selectedRows, setSelectedRows] = useState<Role[]>([]);

    // Metrics
    const metrics: MetricItem[] = [
        {
            title: "Total Roles",
            value: "8",
            icon: Shield,
            iconBg: "bg-indigo-500",
            iconClass: "text-white",
        },
        {
            title: "Total Users",
            value: "24",
            icon: Users,
            iconBg: "bg-blue-500",
            iconClass: "text-white",
        },
        {
            title: "Active Users",
            value: "21",
            icon: UserCheck,
            iconBg: "bg-emerald-500",
            iconClass: "text-white",
        },
        {
            title: "Restricted Users",
            value: "3",
            icon: Lock,
            iconBg: "bg-amber-500",
            iconClass: "text-white",
        },
    ];

    // Filter and sort data
    let filteredRoles = [...MOCK_ROLES];

    if (search) {
        filteredRoles = filteredRoles.filter(
            (role) =>
                role.name.toLowerCase().includes(search.toLowerCase()) ||
                role.permissions.toLowerCase().includes(search.toLowerCase())
        );
    }

    if (sort === "name_asc") {
        filteredRoles.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "name_desc") {
        filteredRoles.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sort === "users_desc") {
        filteredRoles.sort((a, b) => b.users - a.users);
    }

    // Pagination
    const totalItems = filteredRoles.length;
    const totalPages = Math.ceil(totalItems / rowsPerPage);
    const paginatedData = filteredRoles.slice(
        (page - 1) * rowsPerPage,
        page * rowsPerPage
    );

    // Columns configuration
    const columns: ColumnConfig<Role>[] = [
        {
            key: "name",
            label: "ROLE NAME",
            type: "text",
            sortable: true,
            render: (value: unknown) => (
                <span className="font-semibold text-indigo-600">{String(value)}</span>
            ),
        },
        {
            key: "type",
            label: "ACCESS TYPE",
            type: "badge",
            render: (value: unknown) => (
                <Badge variant="outline" className="bg-slate-50 border-slate-200 text-slate-700">
                    {String(value)}
                </Badge>
            ),
        },
        {
            key: "permissions",
            label: "PERMISSIONS",
            type: "text",
            render: (value: unknown) => (
                <span className="text-slate-600 text-sm max-w-[200px] truncate block" title={String(value)}>
                    {String(value)}
                </span>
            ),
        },
        {
            key: "users",
            label: "TOTAL USERS",
            type: "number",
            align: "center",
            render: (value: unknown) => (
                <div className="flex items-center justify-center gap-1.5 font-medium text-slate-700">
                    <Users size={14} className="text-slate-400" />
                    {String(value)}
                </div>
            ),
        },
        {
            key: "createdBy",
            label: "CREATED BY",
            type: "text",
            render: (value: unknown) => {
                const name = String(value);
                return (
                    <div className="flex items-center gap-2 text-slate-600">
                        <div className="size-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">
                            {name.charAt(0)}
                        </div>
                        <span className="text-sm">{name}</span>
                    </div>
                );
            },
        },
    ];

    // Row actions
    const rowActionsBuilder = (role: Role): RowAction<Role>[] => [
        {
            label: "Edit",
            icon: <Edit size={16} />,
            onClick: () => logger.info("Edit role:", role.id),
        },
        {
            label: "Delete",
            icon: <Trash2 size={16} />,
            onClick: () => logger.info("Delete role:", role.id),
            danger: true,
        },
    ];

    // Filters configuration
    const filterOptions = [
        {
            label: "All Types",
            value: "",
            onSelect: () => setStatus(""),
            isActive: status === "",
        },
        {
            label: "Full Access",
            value: "full",
            onSelect: () => setStatus("full"),
            isActive: status === "full",
        },
        {
            label: "Frontend",
            value: "frontend",
            onSelect: () => setStatus("frontend"),
            isActive: status === "frontend",
        },
        {
            label: "Backend",
            value: "backend",
            onSelect: () => setStatus("backend"),
            isActive: status === "backend",
        },
    ];

    const sortOptions: SortOption[] = [
        {
            label: "Name A–Z",
            value: "name_asc",
            onSelect: () => setSort("name_asc"),
            isActive: sort === "name_asc",
            direction: "asc",
        },
        {
            label: "Name Z–A",
            value: "name_desc",
            onSelect: () => setSort("name_desc"),
            isActive: sort === "name_desc",
            direction: "desc",
        },
        {
            label: "Most Users",
            value: "users_desc",
            onSelect: () => setSort("users_desc"),
            isActive: sort === "users_desc",
            direction: "desc",
        },
    ];

    const actions = [
        {
            label: "Export Roles",
            icon: <></>,
            onClick: () => logger.info("Export roles"),
        },
        {
            label: "Refresh",
            icon: <></>,
            onClick: () => window.location.reload(),
        },
    ];

    const visibleColumns = columns.map((col) => ({
        key: String(col.key),
        label: col.label,
        visible: true,
    }));

    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <nav className="flex items-center text-sm text-slate-500 font-medium mb-2">
                            <span
                                onClick={() => navigate("/dashboard")}
                                className="hover:text-slate-800 cursor-pointer transition-colors"
                            >
                                Dashboard
                            </span>
                            <ChevronRight size={14} className="mx-2 text-slate-400" />
                            <span
                                onClick={() => navigate("/settings")}
                                className="hover:text-slate-800 cursor-pointer transition-colors"
                            >
                                Settings
                            </span>
                            <ChevronRight size={14} className="mx-2 text-slate-400" />
                            <span className="text-slate-900 font-semibold">Roles & Permissions</span>
                        </nav>
                        <h1 className="text-2xl font-bold text-slate-900">
                            Roles & Permissions
                        </h1>
                    </div>
                    <Button className="gap-2">
                        <Plus size={18} />
                        Add New Role
                    </Button>
                </div>
            </header>

            {/* Metrics */}
            <div className="px-6 pt-6">
                <MetricsGrid metrics={metrics} />
            </div>

            {/* Filters */}
            <div className="px-6 py-4">
                <FiltersBar
                    search={search}
                    onSearchChange={setSearch}
                    filters={filterOptions}
                    sortOptions={sortOptions}
                    visibleColumns={visibleColumns}
                    onToggleColumn={() => { }}
                    actions={actions}
                    searchPlaceholder="Search roles..."
                />
            </div>

            {/* Bulk Actions */}
            {selectedRows.length > 0 && (
                <div className="px-6 pb-4">
                    <div className="flex items-center justify-between p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                        <span className="text-sm font-medium text-indigo-900">
                            {selectedRows.length} role{selectedRows.length > 1 ? 's' : ''} selected
                        </span>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedRows([])}
                            >
                                Clear Selection
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => logger.info("Delete selected")}
                            >
                                <Trash2 size={16} className="mr-2" />
                                Delete Selected
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="px-6 pb-6">
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    <GenericTable
                        data={paginatedData}
                        loading={false}
                        page={page}
                        totalPages={totalPages}
                        rowsPerPage={rowsPerPage}
                        totalItems={totalItems}
                        onPageChange={setPage}
                        onRowsPerPageChange={setRowsPerPage}
                        getRowId={(row) => row.id}
                        columns={columns}
                        selectable
                        selectionMode="multiple"
                        onSelectionChange={setSelectedRows}
                        rowActionsBuilder={rowActionsBuilder}
                        onRowClick={(row) => logger.info("Row clicked:", row.id)}
                    />
                </div>
            </div>
        </div>
    );
};

export default SettingsRolesPage;
