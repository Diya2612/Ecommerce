import React, { useState } from 'react';
import { Shield, Users as UsersIcon, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GenericTable, type ColumnConfig } from '@/components/data-table';
import { FiltersBar } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MetricsGrid, type MetricItem } from '@/components/metrics';
import { usePagination, useSearch } from '@/hooks';
import { DateRangePicker } from '@/components/forms/inputs/DateRangePicker';
import { AssignRoleToUser } from '../components/AssignRoleToUser';
import { notifySuccess } from '@/utils';

interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
  status: 'active' | 'inactive';
  lastLogin: string;
}

const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@company.com',
    roles: ['ADMIN'],
    status: 'active',
    lastLogin: '2024-11-30T14:23:00',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@company.com',
    roles: ['MANAGER'],
    status: 'active',
    lastLogin: '2024-11-30T09:15:00',
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike.johnson@company.com',
    roles: ['SALES_REP'],
    status: 'active',
    lastLogin: '2024-11-29T16:45:00',
  },
  {
    id: '4',
    name: 'Sarah Williams',
    email: 'sarah.williams@company.com',
    roles: ['SUPPORT', 'SALES_REP'],
    status: 'active',
    lastLogin: '2024-11-30T11:30:00',
  },
  {
    id: '5',
    name: 'Robert Brown',
    email: 'robert.brown@company.com',
    roles: ['GUEST'],
    status: 'inactive',
    lastLogin: '2024-11-15T08:20:00',
  },
];

const AccessManagementPage: React.FC = () => {
  const { search, setSearch } = useSearch();
  const { page, rowsPerPage, setPage, setRowsPerPage } = usePagination();
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({ from: null, to: null });
  // Sorting state: sort.value is the key (e.g., 'name', 'lastLogin')
  const [sort, setSort] = useState<{ value: string; direction?: 'asc' | 'desc' } | null>({ value: 'name', direction: 'asc' });

  // Show form if user is selected
  if (selectedUserId) {
    return (
      <div className="flex-1 w-full">
        <div className="px-4 sm:px-6 lg:px-8 pb-8">
          <AssignRoleToUser
            userId={selectedUserId}
            onBack={() => setSelectedUserId(null)}
            onSave={(userId, roles) => {
              console.log('Saving roles for user:', userId, roles);
              notifySuccess('User roles updated successfully');
              setSelectedUserId(null);
            }}
          />
        </div>
      </div>
    );
  }

  // Filter data
  let filteredUsers = [...mockUsers];

  if (search) {
    filteredUsers = filteredUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
    );
  }

  if (roleFilter) {
    filteredUsers = filteredUsers.filter((user) => user.roles.includes(roleFilter));
  }

  if (statusFilter) {
    filteredUsers = filteredUsers.filter((user) => user.status === statusFilter);
  }

  // Apply sorting
  if (sort) {
    filteredUsers.sort((a, b) => {
      const dir = sort.direction === 'asc' ? 1 : -1;
      switch (sort.value) {
        case 'name':
          return dir * a.name.localeCompare(b.name);
        case 'lastLogin':
          return dir * (new Date(a.lastLogin).getTime() - new Date(b.lastLogin).getTime());
        case 'status':
          // active first when desc, otherwise inactive first
          const aVal = a.status === 'active' ? 1 : 0;
          const bVal = b.status === 'active' ? 1 : 0;
          return dir * (aVal - bVal);
        default:
          return 0;
      }
    });
  }

  // Pagination
  const total = filteredUsers.length;
  const totalPages = Math.ceil(total / rowsPerPage);
  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const formatLastLogin = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Metrics
  const metrics: MetricItem[] = [
    {
      title: 'Total Users',
      value: mockUsers.length,
      helperText: 'All registered users',
      icon: UsersIcon,
      iconBg: '#3B82F6',
    },
    {
      title: 'Active Users',
      value: mockUsers.filter((u) => u.status === 'active').length,
      helperText: 'Currently active',
      icon: CheckCircle,
      iconBg: '#10B981',
    },
    {
      title: 'Inactive Users',
      value: mockUsers.filter((u) => u.status === 'inactive').length,
      helperText: 'Deactivated accounts',
      icon: XCircle,
      iconBg: '#F59E0B',
    },
  ];

  // Columns
  const columns: ColumnConfig<User>[] = [
    {
      key: 'name',
      label: 'USER',
      type: 'text',
      sortable: true,
      sortKey: 'name',
      render: (_val, row) => (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitials(row.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-slate-900">{row.name}</div>
            <div className="text-sm text-slate-500">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'roles',
      label: 'ROLES',
      type: 'text',
      render: (val: any) => (
        <div className="flex gap-1 flex-wrap">
          {val.map((role: string) => (
            <Badge key={role} variant="secondary">
              {role}
            </Badge>
          ))}
        </div>
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
      key: 'lastLogin',
      label: 'LAST LOGIN',
      type: 'text',
      sortable: true,
      sortKey: 'lastLogin',
      render: (val) => (
        <span className="text-slate-600 text-sm">{formatLastLogin(val as string)}</span>
      ),
    },
    {
      key: 'actions',
      label: 'ACTIONS',
      align: 'center',
      render: (_, row) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedUserId(row.id);
          }}
        >
          <Shield className="w-4 h-4 mr-2" />
          Manage Roles
        </Button>
      ),
    },
  ];

  const filterOptions = [
    { label: 'All Roles', value: '', onSelect: () => setRoleFilter(''), isActive: roleFilter === '' },
    { label: 'Admin', value: 'ADMIN', onSelect: () => setRoleFilter('ADMIN'), isActive: roleFilter === 'ADMIN' },
    { label: 'Manager', value: 'MANAGER', onSelect: () => setRoleFilter('MANAGER'), isActive: roleFilter === 'MANAGER' },
    { label: 'Sales Rep', value: 'SALES_REP', onSelect: () => setRoleFilter('SALES_REP'), isActive: roleFilter === 'SALES_REP' },
    { label: 'Support', value: 'SUPPORT', onSelect: () => setRoleFilter('SUPPORT'), isActive: roleFilter === 'SUPPORT' },
    { label: 'All Status', value: '', onSelect: () => setStatusFilter(''), isActive: statusFilter === '' && !roleFilter },
    { label: 'Active', value: 'active', onSelect: () => setStatusFilter('active'), isActive: statusFilter === 'active' },
    { label: 'Inactive', value: 'inactive', onSelect: () => setStatusFilter('inactive'), isActive: statusFilter === 'inactive' },
  ];

  const sortOptionsWithHandlers = [
    { label: 'Name (A-Z)', value: 'name', direction: 'asc' as const, isActive: sort?.value === 'name' && sort?.direction === 'asc', onSelect: () => setSort({ value: 'name', direction: 'asc' }) },
    { label: 'Name (Z-A)', value: 'name', direction: 'desc' as const, isActive: sort?.value === 'name' && sort?.direction === 'desc', onSelect: () => setSort({ value: 'name', direction: 'desc' }) },
    { label: 'Last Login (Newest)', value: 'lastLogin', direction: 'desc' as const, isActive: sort?.value === 'lastLogin' && sort?.direction === 'desc', onSelect: () => setSort({ value: 'lastLogin', direction: 'desc' }) },
    { label: 'Last Login (Oldest)', value: 'lastLogin', direction: 'asc' as const, isActive: sort?.value === 'lastLogin' && sort?.direction === 'asc', onSelect: () => setSort({ value: 'lastLogin', direction: 'asc' }) },
    { label: 'Status (Active first)', value: 'status', direction: 'desc' as const, isActive: sort?.value === 'status' && sort?.direction === 'desc', onSelect: () => setSort({ value: 'status', direction: 'desc' }) },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Top Header with Date Range */}
      <div className="px-4 sm:px-6 lg:px-8 pt-2 pb-4">
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>

      {/* Content */}
      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-0 space-y-4">
        {/* Metrics */}
        <MetricsGrid metrics={metrics} />

        {/* Filters */}
        <FiltersBar
          search={search}
          onSearchChange={setSearch}
          filters={filterOptions}
          sortOptions={sortOptionsWithHandlers}
          actions={[]}
          visibleColumns={[]}
          onToggleColumn={() => { }}
          searchPlaceholder="Search"
          onClearFilters={() => {
            setSearch('');
            setRoleFilter('');
            setStatusFilter('');
            setPage(1);
          }}
        />

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <GenericTable<User>
            columns={columns}
            data={currentUsers}
            loading={false}
            page={page}
            rowsPerPage={rowsPerPage}
            totalPages={totalPages}
            totalItems={total}
            onPageChange={setPage}
            onRowsPerPageChange={setRowsPerPage}
            getRowId={(row) => row.id}
            selectable={false}
            sortKey={sort?.value || undefined}
            sortDirection={sort?.direction}
            onSortChange={(key, direction) => setSort({ value: key, direction })}
            onRowClick={(row) => setSelectedUserId(row.id)}
            renderMobileCard={(user) => ({
              title: user.name,
              subtitle: user.email,
              fields: [
                { label: 'Roles', value: user.roles.join(', ') },
                { label: 'Status', value: user.status, badge: true },
                { label: 'Last Login', value: new Date(user.lastLogin).toLocaleDateString() },
              ],
              actions: [
                {
                  label: 'Manage Roles',
                  onClick: () => setSelectedUserId(user.id),
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
              Showing {startIndex + 1} to {Math.min(endIndex, total)} of {total} users
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

export default AccessManagementPage;
