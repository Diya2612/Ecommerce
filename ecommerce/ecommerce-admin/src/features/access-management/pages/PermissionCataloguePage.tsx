import React, { useState } from 'react';
import { Plus, Edit, Trash2, AlertCircle, Shield, Database, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GenericTable, type ColumnConfig } from '@/components/data-table';
import { FiltersBar } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { MetricsGrid, type MetricItem } from '@/components/metrics';
import { usePagination, useSearch } from '@/hooks';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DateRangePicker } from '@/components/forms/inputs/DateRangePicker';
import { AddEditPermission } from '../components/AddEditPermission';
import { notifySuccess } from '@/utils';
import { mockPermissions, type Permission } from '../data/mockPermissionsData';

const PermissionCataloguePage: React.FC = () => {
  const { search, setSearch } = useSearch();
  const { page, rowsPerPage, setPage, setRowsPerPage } = usePagination();
  const [moduleFilter, setModuleFilter] = useState<string>('');
  const [selectedPermissionId, setSelectedPermissionId] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({ from: null, to: null });

  // Sort state
  const [sortKey, setSortKey] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Sort handler
  const handleSort = (key: string, direction?: 'asc' | 'desc') => {
    if (direction) {
      setSortKey(key);
      setSortDirection(direction);
    } else {
      // Toggle direction if same key, otherwise start with asc
      if (sortKey === key) {
        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
      } else {
        setSortKey(key);
        setSortDirection('asc');
      }
    }
    setPage(1); // Reset to first page when sorting
  };

  // Visible columns state (used by FiltersBar)
  const [visibleColumns, setVisibleColumns] = useState([
    { key: 'key', label: 'PERMISSION KEY', visible: true },
    { key: 'module', label: 'MODULE', visible: true },
    { key: 'label', label: 'LABEL', visible: true },
    { key: 'description', label: 'DESCRIPTION', visible: true },
    { key: 'isCritical', label: 'CRITICAL', visible: true },
    { key: 'actions', label: 'ACTIONS', visible: true },
  ]);

  const onToggleColumn = (key: string) => {
    setVisibleColumns((prev) => prev.map((c) => (c.key === key ? { ...c, visible: !c.visible } : c)));
  };

  // Show form if creating new or editing
  if (isCreatingNew || selectedPermissionId) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50 p-6">
        <AddEditPermission
          permissionId={selectedPermissionId || undefined}
          onBack={() => {
            setIsCreatingNew(false);
            setSelectedPermissionId(null);
          }}
          onSave={(permissionData) => {
            console.log('Saving permission:', permissionData);
            notifySuccess(selectedPermissionId ? 'Permission updated successfully' : 'Permission created successfully');
            setIsCreatingNew(false);
            setSelectedPermissionId(null);
          }}
        />
      </div>
    );
  }

  // Filter data
  let filteredPermissions = [...mockPermissions];

  if (search) {
    filteredPermissions = filteredPermissions.filter(
      (perm) =>
        perm.key.toLowerCase().includes(search.toLowerCase()) ||
        perm.label.toLowerCase().includes(search.toLowerCase()) ||
        perm.description.toLowerCase().includes(search.toLowerCase())
    );
  }

  if (moduleFilter) {
    filteredPermissions = filteredPermissions.filter((perm) => perm.module === moduleFilter);
  }

  // Apply sorting
  if (sortKey) {
    filteredPermissions.sort((a, b) => {
      let aValue: any = a[sortKey as keyof Permission];
      let bValue: any = b[sortKey as keyof Permission];

      // Handle different data types
      if (sortKey === 'createdDate') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else if (sortKey === 'isCritical') {
        aValue = aValue ? 1 : 0;
        bValue = bValue ? 1 : 0;
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // Pagination
  const total = filteredPermissions.length;
  const totalPages = Math.ceil(total / rowsPerPage);
  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentPermissions = filteredPermissions.slice(startIndex, endIndex);

  // Get unique modules
  const modules = Array.from(new Set(mockPermissions.map((p) => p.module)));

  // Metrics
  const metrics: MetricItem[] = [
    {
      title: 'Total Permissions',
      value: mockPermissions.length,
      helperText: 'All defined permissions',
      icon: Shield,
      iconBg: '#3B82F6',
    },
    {
      title: 'Critical Permissions',
      value: mockPermissions.filter((p) => p.isCritical).length,
      helperText: 'Require special attention',
      icon: AlertCircle,
      iconBg: '#EF4444',
    },
    {
      title: 'Total Modules',
      value: modules.length,
      helperText: 'Permission categories',
      icon: Database,
      iconBg: '#10B981',
    },
  ];

  // Columns
  const columns: ColumnConfig<Permission>[] = [
    {
      key: 'key',
      label: 'PERMISSION KEY',
      type: 'text',
      sortable: true,
      sortKey: 'key',
      render: (val) => (
        <code className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-900">
          {val as string}
        </code>
      ),
    },
    {
      key: 'module',
      label: 'MODULE',
      type: 'text',
      sortable: true,
      sortKey: 'module',
      render: (val) => (
        <Badge variant="outline" className="capitalize">
          {val as string}
        </Badge>
      ),
    },
    {
      key: 'label',
      label: 'LABEL',
      type: 'text',
      sortable: true,
      sortKey: 'label',
      render: (val) => <span className="text-slate-900">{val as string}</span>,
    },
    {
      key: 'description',
      label: 'DESCRIPTION',
      type: 'text',
      render: (val) => (
        <span className="text-slate-600 line-clamp-2 max-w-sm">{val as string}</span>
      ),
    },
    {
      key: 'isCritical',
      label: 'CRITICAL',
      type: 'text',
      align: 'center',
      sortable: true,
      sortKey: 'isCritical',
      render: (val) =>
        val ? (
          <Badge variant="destructive">⚠️ Critical</Badge>
        ) : (
          <span className="text-slate-400 text-sm">—</span>
        ),
    },
    {
      key: 'actions',
      label: 'ACTIONS',
      align: 'center',
      render: (_, row) => (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedPermissionId(row.id);
            }}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              console.log('Delete permission:', row.id);
            }}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  const filterOptions = [
    { label: 'All Modules', value: '', onSelect: () => setModuleFilter(''), isActive: moduleFilter === '' },
    ...modules.map((module) => ({
      label: module.charAt(0).toUpperCase() + module.slice(1),
      value: module,
      onSelect: () => setModuleFilter(module),
      isActive: moduleFilter === module,
    })),
  ];

  const sortOptions = [
    { 
      label: 'Permission Key (A-Z)', 
      value: 'key_asc', 
      direction: 'asc' as const, 
      isActive: sortKey === 'key' && sortDirection === 'asc', 
      onSelect: () => handleSort('key', 'asc') 
    },
    { 
      label: 'Permission Key (Z-A)', 
      value: 'key_desc', 
      direction: 'desc' as const, 
      isActive: sortKey === 'key' && sortDirection === 'desc', 
      onSelect: () => handleSort('key', 'desc') 
    },
    { 
      label: 'Module (A-Z)', 
      value: 'module_asc', 
      direction: 'asc' as const, 
      isActive: sortKey === 'module' && sortDirection === 'asc', 
      onSelect: () => handleSort('module', 'asc') 
    },
    { 
      label: 'Module (Z-A)', 
      value: 'module_desc', 
      direction: 'desc' as const, 
      isActive: sortKey === 'module' && sortDirection === 'desc', 
      onSelect: () => handleSort('module', 'desc') 
    },
    { 
      label: 'Label (A-Z)', 
      value: 'label_asc', 
      direction: 'asc' as const, 
      isActive: sortKey === 'label' && sortDirection === 'asc', 
      onSelect: () => handleSort('label', 'asc') 
    },
    { 
      label: 'Label (Z-A)', 
      value: 'label_desc', 
      direction: 'desc' as const, 
      isActive: sortKey === 'label' && sortDirection === 'desc', 
      onSelect: () => handleSort('label', 'desc') 
    },
    { 
      label: 'Critical First', 
      value: 'isCritical_desc', 
      direction: 'desc' as const, 
      isActive: sortKey === 'isCritical' && sortDirection === 'desc', 
      onSelect: () => handleSort('isCritical', 'desc') 
    },
    { 
      label: 'Non-Critical First', 
      value: 'isCritical_asc', 
      direction: 'asc' as const, 
      isActive: sortKey === 'isCritical' && sortDirection === 'asc', 
      onSelect: () => handleSort('isCritical', 'asc') 
    },
  ];

  // Create sort options array with handlers for FiltersBar
  const sortOptionsWithHandlers = sortOptions.map(option => ({
    ...option,
    onSelect: option.onSelect
  }));

  // Only pass displayed columns to the table
  const displayedColumns = columns.filter((c) => {
    const col = visibleColumns.find((vc) => vc.key === String(c.key));
    return col ? col.visible : true;
  });

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Top Header with Date Range and Action Buttons */}
      <div className="px-4 sm:px-6 lg:px-8 pt-2 pb-4">
        <div className="flex items-center justify-between">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          
          <div className="flex items-center gap-3">
            <Button className="bg-slate-900 text-white hover:bg-slate-800 h-10">
              <Download className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Button className="bg-slate-900 text-white hover:bg-slate-800 h-10">
              <Upload className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button
              className="bg-slate-900 text-white hover:bg-slate-800 h-10"
              onClick={() => setIsCreatingNew(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Permission
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-0 space-y-6">
        {/* Warning Banner */}
        <Alert className="bg-amber-50 border-amber-200">
          <AlertCircle className="w-5 h-5 text-amber-600" />
          <AlertDescription className="text-amber-900">
            <strong>Platform Owner Access Only:</strong> This catalogue defines all available
            permissions in the system. Changes here will affect all roles and users. Be careful
            when deleting or modifying permissions.
          </AlertDescription>
        </Alert>

        {/* Metrics */}
        <MetricsGrid metrics={metrics} />

        {/* Filters */}
        <FiltersBar
          search={search}
          onSearchChange={setSearch}
          filters={filterOptions}
          sortOptions={sortOptionsWithHandlers}
          actions={[]}
          visibleColumns={visibleColumns}
          onToggleColumn={onToggleColumn}
          searchPlaceholder="Search"
          onClearFilters={() => {
            setSearch('');
            setModuleFilter('');
            setSortKey('');
            setSortDirection('asc');
            setPage(1);
          }}
        />

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <GenericTable<Permission>
            columns={displayedColumns}
            data={currentPermissions}
            loading={false}
            page={page}
            rowsPerPage={rowsPerPage}
            totalPages={totalPages}
            totalItems={total}
            onPageChange={setPage}
            onRowsPerPageChange={setRowsPerPage}
            getRowId={(row) => row.id}
            selectable={false}
            onRowClick={(permission) => setSelectedPermissionId(permission.id)}
            sortKey={sortKey}
            sortDirection={sortDirection}
            onSortChange={handleSort}
            renderMobileCard={(permission) => ({
              title: permission.label,
              subtitle: permission.key,
              fields: [
                { label: 'Module', value: permission.module, badge: true },
                { label: 'Description', value: permission.description },
                { label: 'Critical', value: permission.isCritical ? 'Yes' : 'No', badge: permission.isCritical },
              ],
              actions: [
                {
                  label: 'Edit',
                  onClick: () => setSelectedPermissionId(permission.key),
                  variant: 'default',
                },
              ],
            })}
          />
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-slate-600 text-sm">
              Showing {startIndex + 1} to {Math.min(endIndex, total)} of {total} permissions
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Previous
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  variant={page === p ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPage(p)}
                >
                  {p}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PermissionCataloguePage;
