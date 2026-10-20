import React, { useState } from 'react';
import { Plus, Edit, CheckCircle, XCircle, Shield, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GenericTable, type ColumnConfig } from '@/components/data-table';
import { FiltersBar } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { MetricsGrid, type MetricItem } from '@/components/metrics';
import { usePagination, useSearch } from '@/hooks';
import { DateRangePicker } from '@/components/forms/inputs/DateRangePicker';
import { notifySuccess } from '@/utils';
import { CreateEditRole } from '../components/CreateEditRole';

interface Role {
  id: string;
  name: string;
  label: string;
  description: string;
  usersCount: number;
  createdDate: string;
  status: 'active' | 'inactive';
  isSystem: boolean;
}

const mockRoles: Role[] = [
  {
    id: '1',
    name: 'ADMIN',
    label: 'Administrator',
    description: 'Full system access with all permissions',
    usersCount: 5,
    createdDate: '2024-01-15',
    status: 'active',
    isSystem: true,
  },
  {
    id: '2',
    name: 'MANAGER',
    label: 'Manager',
    description: 'Can manage orders, products, and view reports',
    usersCount: 12,
    createdDate: '2024-02-10',
    status: 'active',
    isSystem: false,
  },
  {
    id: '3',
    name: 'SALES_REP',
    label: 'Sales Representative',
    description: 'Can create and manage orders and customers',
    usersCount: 28,
    createdDate: '2024-03-05',
    status: 'active',
    isSystem: false,
  },
  {
    id: '4',
    name: 'SUPPORT',
    label: 'Support Agent',
    description: 'Can view orders and customer information',
    usersCount: 15,
    createdDate: '2024-03-12',
    status: 'active',
    isSystem: false,
  },
  {
    id: '5',
    name: 'GUEST',
    label: 'Guest',
    description: 'Read-only access to basic information',
    usersCount: 3,
    createdDate: '2024-04-01',
    status: 'inactive',
    isSystem: true,
  },
];

const RolesManagementPage: React.FC = () => {
  const { search, setSearch } = useSearch();
  const { page, rowsPerPage, setPage, setRowsPerPage } = usePagination();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'view' | 'edit' | 'create' | null>(null);
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
    { key: 'label', label: 'ROLE NAME', visible: true },
    { key: 'description', label: 'DESCRIPTION', visible: true },
    { key: 'usersCount', label: 'USERS', visible: true },
    { key: 'createdDate', label: 'CREATED DATE', visible: true },
    { key: 'status', label: 'STATUS', visible: true },
    { key: 'actions', label: 'ACTIONS', visible: true },
  ]);

  const onToggleColumn = (key: string) => {
    setVisibleColumns((prev) => prev.map((c) => (c.key === key ? { ...c, visible: !c.visible } : c)));
  };

  // Show form if editing/viewing/creating
  if (viewMode) {
    return (
      <CreateEditRole
        roleId={selectedRoleId || undefined}
        mode={viewMode}
        onBack={() => {
          setSelectedRoleId(null);
          setViewMode(null);
        }}
        onSave={(roleData) => {
          console.log('Role saved:', roleData);
          notifySuccess(
            viewMode === 'create' ? 'Role created successfully' : 'Role updated successfully'
          );
          setSelectedRoleId(null);
          setViewMode(null);
        }}
      />
    );
  }

  // Filter data
  let filteredRoles = [...mockRoles];

  if (search) {
    filteredRoles = filteredRoles.filter(
      (role) =>
        role.name.toLowerCase().includes(search.toLowerCase()) ||
        role.label.toLowerCase().includes(search.toLowerCase()) ||
        role.description.toLowerCase().includes(search.toLowerCase())
    );
  }

  if (statusFilter === 'active') {
    filteredRoles = filteredRoles.filter((role) => role.status === 'active');
  } else if (statusFilter === 'inactive') {
    filteredRoles = filteredRoles.filter((role) => role.status === 'inactive');
  } else if (statusFilter === 'system') {
    filteredRoles = filteredRoles.filter((role) => role.isSystem);
  }

  // Apply sorting
  if (sortKey) {
    filteredRoles.sort((a, b) => {
      let aValue: any = a[sortKey as keyof Role];
      let bValue: any = b[sortKey as keyof Role];

      // Handle different data types
      if (sortKey === 'createdDate') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else if (sortKey === 'usersCount') {
        aValue = Number(aValue);
        bValue = Number(bValue);
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
  const total = filteredRoles.length;
  const totalPages = Math.ceil(total / rowsPerPage);
  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentRoles = filteredRoles.slice(startIndex, endIndex);

  // Metrics
  const metrics: MetricItem[] = [
    {
      title: 'Total Roles',
      value: mockRoles.length,
      helperText: 'All defined roles',
      icon: Shield,
      iconBg: '#3B82F6',
    },
    {
      title: 'Active Roles',
      value: mockRoles.filter((r) => r.status === 'active').length,
      helperText: 'Currently active',
      icon: CheckCircle,
      iconBg: '#10B981',
    },
    {
      title: 'Inactive Roles',
      value: mockRoles.filter((r) => r.status === 'inactive').length,
      helperText: 'Deactivated roles',
      icon: XCircle,
      iconBg: '#F59E0B',
    },
  ];

  // Columns
  const columns: ColumnConfig<Role>[] = [
    {
      key: 'label',
      label: 'ROLE NAME',
      type: 'text',
      sortable: true,
      sortKey: 'label',
      render: (_val, row) => (
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-900">{row.label}</span>
            {row.isSystem && (
              <Badge variant="outline" className="text-xs">
                System
              </Badge>
            )}
          </div>
          <span className="text-slate-500 text-xs">{row.name}</span>
        </div>
      ),
    },
    {
      key: 'description',
      label: 'DESCRIPTION',
      type: 'text',
      render: (val) => (
        <span className="text-slate-600 line-clamp-2 max-w-md">{val as string}</span>
      ),
    },
    {
      key: 'usersCount',
      label: 'USERS',
      type: 'text',
      align: 'center',
      sortable: true,
      sortKey: 'usersCount',
      render: (val) => <Badge variant="secondary">{val as number}</Badge>,
    },
    {
      key: 'createdDate',
      label: 'CREATED DATE',
      type: 'date',
      sortable: true,
      sortKey: 'createdDate',
      render: (val) => (
        <span className="text-slate-600">
          {new Date(val as string).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'STATUS',
      type: 'text',
      sortable: true,
      sortKey: 'status',
      render: (val) => (
        <Badge variant={val === 'active' ? 'emerald' : 'slate'} className="capitalize">
          {val as string}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'ACTIONS',
      align: 'center',
      render: (_, row) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedRoleId(row.id);
            setViewMode('edit');
          }}
          aria-label="Edit role"
        >
          <Edit className="w-4 h-4" />
        </Button>
      ),
    },
  ];

  // Only pass displayed columns to the table
  const displayedColumns = columns.filter((c) => {
    const col = visibleColumns.find((vc) => vc.key === String(c.key));
    return col ? col.visible : true;
  });

  const filterOptions = [
    { label: 'All Roles', value: '', onSelect: () => setStatusFilter(''), isActive: statusFilter === '' },
    { label: 'Active', value: 'active', onSelect: () => setStatusFilter('active'), isActive: statusFilter === 'active' },
    { label: 'Inactive', value: 'inactive', onSelect: () => setStatusFilter('inactive'), isActive: statusFilter === 'inactive' },
    { label: 'System Roles', value: 'system', onSelect: () => setStatusFilter('system'), isActive: statusFilter === 'system' },
  ];

  const sortOptions = [
    { 
      label: 'Role Name (A-Z)', 
      value: 'label_asc', 
      direction: 'asc' as const, 
      isActive: sortKey === 'label' && sortDirection === 'asc', 
      onSelect: () => handleSort('label', 'asc') 
    },
    { 
      label: 'Role Name (Z-A)', 
      value: 'label_desc', 
      direction: 'desc' as const, 
      isActive: sortKey === 'label' && sortDirection === 'desc', 
      onSelect: () => handleSort('label', 'desc') 
    },
    { 
      label: 'Users (Low to High)', 
      value: 'usersCount_asc', 
      direction: 'asc' as const, 
      isActive: sortKey === 'usersCount' && sortDirection === 'asc', 
      onSelect: () => handleSort('usersCount', 'asc') 
    },
    { 
      label: 'Users (High to Low)', 
      value: 'usersCount_desc', 
      direction: 'desc' as const, 
      isActive: sortKey === 'usersCount' && sortDirection === 'desc', 
      onSelect: () => handleSort('usersCount', 'desc') 
    },
    { 
      label: 'Created Date (Newest)', 
      value: 'createdDate_desc', 
      direction: 'desc' as const, 
      isActive: sortKey === 'createdDate' && sortDirection === 'desc', 
      onSelect: () => handleSort('createdDate', 'desc') 
    },
    { 
      label: 'Created Date (Oldest)', 
      value: 'createdDate_asc', 
      direction: 'asc' as const, 
      isActive: sortKey === 'createdDate' && sortDirection === 'asc', 
      onSelect: () => handleSort('createdDate', 'asc') 
    },
    { 
      label: 'Status (A-Z)', 
      value: 'status_asc', 
      direction: 'asc' as const, 
      isActive: sortKey === 'status' && sortDirection === 'asc', 
      onSelect: () => handleSort('status', 'asc') 
    },
    { 
      label: 'Status (Z-A)', 
      value: 'status_desc', 
      direction: 'desc' as const, 
      isActive: sortKey === 'status' && sortDirection === 'desc', 
      onSelect: () => handleSort('status', 'desc') 
    },
  ];

  // Create sort options array with handlers for FiltersBar
  const sortOptionsWithHandlers = sortOptions.map(option => ({
    ...option,
    onSelect: option.onSelect
  }));

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
              onClick={() => {
                setSelectedRoleId(null);
                setViewMode('create');
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Role
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-0 space-y-6">
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
            setStatusFilter('');
            setSortKey('');
            setSortDirection('asc');
            setPage(1);
          }}
        />

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <GenericTable<Role>
            columns={displayedColumns}
            data={currentRoles}
            loading={false}
            page={page}
            rowsPerPage={rowsPerPage}
            totalPages={totalPages}
            totalItems={total}
            onPageChange={setPage}
            onRowsPerPageChange={setRowsPerPage}
            getRowId={(row) => row.id}
            selectable={false}
            onRowClick={(role) => { setSelectedRoleId(role.id); setViewMode('edit'); }}
            sortKey={sortKey}
            sortDirection={sortDirection}
            onSortChange={handleSort}
            renderMobileCard={(role) => ({
              title: role.label,
              subtitle: role.name,
              fields: [
                { label: 'Description', value: role.description },
                { label: 'Users', value: role.usersCount.toString() },
                { label: 'Status', value: role.status, badge: true },
                { label: 'Created', value: new Date(role.createdDate).toLocaleDateString() },
              ],
              actions: [
                {
                  label: 'Edit Role',
                  onClick: () => {
                    setSelectedRoleId(role.id);
                    setViewMode('edit');
                  },
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
              Showing {startIndex + 1} to {Math.min(endIndex, total)} of {total} roles
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

export default RolesManagementPage;
