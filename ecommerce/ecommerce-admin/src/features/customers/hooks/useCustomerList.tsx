import { useState, useMemo, useEffect, useCallback } from 'react';
import { notifySuccess, notifyError } from '@/utils';
import { useListState } from '@/hooks/useListState';
import { Users, CheckCircle, Archive, Trash2, MapPin, Clock } from 'lucide-react';
import type { MetricItem } from "@/components/metrics";
import type { ColumnConfig } from '@/components/data-table';
import type { MobileRecordCardProps } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { ROUTES } from '@/lib/constants';
import type { Customer } from '../types/customer.types';
import { customerService } from '../services/customerService';
import { mapApiUserToCustomer } from '../utils/apiMappers';
import { normalizeCustomersResponse } from '../utils/apiResponseHandler';

export const useCustomerList = () => {
  // 1. Centralized State
  const {
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    search,
    setSearch,
    // status: statuses, // Removed from destructuring
    // setStatus: setStatuses, // Removed from destructuring
    dateRange,
    setDateRange,
    sort,
    setSort,
    visibleColumns,
    toggleColumn,
    resetFilters: resetListState
  } = useListState({
    defaultVisibleColumns: [
      { key: "customerId", label: "ID", visible: true },
      { key: "name", label: "Name", visible: true },
      { key: "displayName", label: "Display Name", visible: false },
      // { key: "type", label: "Type", visible: true },
      { key: "email", label: "Email", visible: true },
      { key: "phone", label: "Phone", visible: false },
      { key: "gender", label: "Gender", visible: false },
      { key: "location", label: "Location", visible: false },
      { key: "metrics", label: "Orders", visible: false },
      { key: "lastLogin", label: "Last Login", visible: false },
      { key: "created_at", label: "Joined Date", visible: false },
      { key: "dob", label: "DOB", visible: false },
      { key: "tags", label: "Tags", visible: false },
      { key: "status", label: "Status", visible: true },
    ]
  });

  // Custom filter state
  const [statuses, setStatuses] = useState<string[]>([]); // Default to all
  const [gender, setGender] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [ordersFilter, setOrdersFilter] = useState<string[]>([]);
  const [dateFilter, setDateFilter] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch Customers from API
  const fetchCustomers = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = {
        page,
        limit: rowsPerPage,
        type: 'all',
        status: statuses.length > 0 ? statuses.join(',') : undefined,
        gender: gender.length > 0 ? gender.join(',') : undefined,
        tags: tags.length > 0 ? tags.join(',') : undefined,
        ordersStatus: ordersFilter.length > 0 ? ordersFilter.join(',') : undefined,
        search: search || undefined,
        sort: sort || undefined,
        fromDate: (() => {
          if (!dateRange?.from) return undefined;
          const d = new Date(dateRange.from);
          d.setHours(0, 0, 0, 0);
          return d.toISOString();
        })(),
        toDate: (() => {
          if (dateRange?.to) {
             const d = new Date(dateRange.to);
             d.setHours(23, 59, 59, 999);
             return d.toISOString();
          } else if (dateRange?.from) {
             const d = new Date(dateRange.from);
             d.setHours(23, 59, 59, 999);
             return d.toISOString();
          }
          return undefined;
        })(),
        _t: Date.now() // Cache buster
      };

      const response = await customerService.getCustomers(params);

      // Normalize API response using utility
      const normalized = normalizeCustomersResponse(response);
      const mappedCustomers: Customer[] = normalized.data.map(mapApiUserToCustomer);

      setCustomers(mappedCustomers);
      setTotal(normalized.pagination.total);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      notifyError("Failed to load customers");
    } finally {
      setIsLoading(false);
    }
  }, [page, rowsPerPage, statuses, gender, tags, ordersFilter, search, sort, dateRange]);

  const fetchTags = useCallback(async () => {
    try {
      const tags = await customerService.getTags();
      setAvailableTags(tags || []);
    } catch (error) {
      console.error("Failed to fetch tags:", error);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
    fetchTags();
  }, [fetchCustomers, fetchTags]);

  // Client-side filtering removed - all handled by API
  const sortedCustomers = customers;

  /*
  const sortedCustomers = useMemo(() => {
    // Logic removed
    return customers; 
  }, ...);
  */

  const totalPages = Math.ceil(total / rowsPerPage);

  // Table Columns Definition
  const columns: ColumnConfig<Customer>[] = useMemo(() => [
    {
      key: 'customerId',
      label: 'ID',
      type: 'text',
      sortable: true,
      sortKey: 'customerId',

      render: (_, row) => (
        <span className="text-xs font-medium text-slate-700">{row.customerId || '-'}</span>
      ),
    },
    {
      key: 'name',
      label: 'NAME',
      type: 'text',
      sortable: true,
      sortKey: 'name',
      link: (row) => ROUTES.CUSTOMERS.DETAIL(row.id),
      linkClassName: 'text-black font-semibold',
      render: (_, row) => (
        <div>
          <p className="text-sm font-semibold text-black">{row.firstName} {row.lastName}</p>
          {(row.type === 'Distributor' || row.type === 'Wholesale') && row.gstin && (
            <p className="text-xs text-slate-500">GSTIN: {row.gstin}</p>
          )}
        </div>
      ),
    },
    {
      key: 'displayName',
      label: 'DISPLAY NAME',
      type: 'text',
      sortable: true,
      sortKey: 'displayName',
      render: (_, row) => (
        <span className="text-sm text-slate-700">{row.displayName || '-'}</span>
      ),
    },
    /*
    {
      key: 'type',
      label: 'TYPE',
      type: 'badge',
      sortable: true,
      sortKey: 'type',
      render: (_, row) => (
        <Badge variant="outline" className="rounded-full">
          {row.type}
        </Badge>
      ),
    },
    */
    {
      key: 'email',
      label: 'EMAIL',
      type: 'text',
      sortable: true,
      sortKey: 'email',

      render: (_, row) => (
        <span className="text-sm text-slate-700">{row.email}</span>
      ),
    },
    {
      key: 'phone',
      label: 'PHONE NUMBER',
      type: 'text',
      sortable: true,
      sortKey: 'phone',

      render: (_, row) => (
        <span className="text-sm text-slate-700">{row.phone}</span>
      ),
    },
    {
      key: 'created_at',
      label: 'JOINED DATE', // Changed generic 'DATE' to 'JOINED DATE'
      type: 'text',
      sortable: true,
      sortKey: 'created_at',

      render: (_, row) => (
        <span className="text-sm text-slate-700">
          {row.created_at ? new Date(row.created_at).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          }) : '-'}
        </span>
      ),
    },
    /* Segment Column Removed as per request
    {
      key: 'segment',
      label: 'SEGMENT',
      type: 'badge',
      sortable: true,
      sortKey: 'segment',
      render: (_, row) => (
        <Badge variant="outline" className="rounded-full border-blue-200 bg-blue-50 text-blue-700">
          {row.segment || 'Regular'}
        </Badge>
      ),
    },
    */
    {
      key: 'gender',
      label: 'GENDER',
      type: 'text',
      sortable: true,
      sortKey: 'gender',
      render: (_, row) => (
        <span className="text-sm capitalize text-slate-700">
          {(row.gender || '').replace(/_/g, ' ')}
        </span>
      ),
    },
    /* Verification Column Removed as per request
    {
      key: 'verification',
      label: 'VERIFIED',
      render: (_, row) => (
        ...
      ),
    },
    */
    {
      key: 'location',
      label: 'LOCATION',
      type: 'text',
      sortable: true,
      sortKey: 'city',
      render: (_, row) => (
        <div className="flex items-center gap-1 text-sm text-slate-700">
          <MapPin size={14} className="text-slate-400" />
          <span>{row.city}, {row.country}</span>
        </div>
      ),
    },
    {
      key: 'lastLogin',
      label: 'LAST LOGIN',
      type: 'text',
      sortable: true,
      sortKey: 'lastLogin',
      render: (_, row) => (
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <Clock size={14} />
          <span>{row.lastLogin ? new Date(row.lastLogin).toLocaleDateString() : 'Never'}</span>
        </div>
      ),
    },
    {
      key: 'metrics',
      label: 'ORDERS',
      type: 'text',
      sortable: true,
      sortKey: 'total_orders',
      render: (_, row) => (
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-slate-900">{row.total_orders || 0} Orders</span>
        </div>
      ),
    },
    {
      key: 'dob',
      label: 'DOB',
      type: 'text',
      sortable: true,
      sortKey: 'dateOfBirth',
      render: (_, row) => (
        <span className="text-sm text-slate-700">
          {row.dateOfBirth ? new Date(row.dateOfBirth).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          }) : '-'}
        </span>
      ),
    },
    {
      key: 'segment',
      label: 'SEGMENT',
      type: 'badge',
      sortable: true,
      sortKey: 'segment',
      render: (_, row) => (
        <Badge variant="outline" className="rounded-full border-blue-200 bg-blue-50 text-blue-700">
          {row.segment || 'Regular'}
        </Badge>
      ),
    },
    {
      key: 'tags',
      label: 'TAGS',
      type: 'badge',
      sortable: true,
      sortKey: 'tags',
      render: (_, row) => (
        <div className="flex flex-wrap gap-1">
          {row.tags && row.tags.length > 0 ? (
            row.tags.slice(0, 3).map((tag, i) => (
              <Badge key={i} variant="outline" className="rounded-md border-gray-200 bg-gray-50 text-gray-600 text-[10px] px-2 py-0.5">
                {tag}
              </Badge>
            ))
          ) : (
            <span className="text-xs text-slate-400">-</span>
          )}
          {row.tags && row.tags.length > 3 && (
            <span className="text-[10px] text-gray-400">+{row.tags.length - 3}</span>
          )}
        </div>
      ),
    },

    {
      key: 'status',
      label: 'STATUS',
      type: 'badge',
      sortable: true,
      sortKey: 'status',

      render: (_, row) => {
        let variant: "default" | "secondary" | "destructive" | "outline" = "default";
        let className = "rounded-full ";

        switch (row.status) {
          case 'Active':
            variant = "default";
            className += "bg-green-100 text-green-700";
            break;
          case 'Inactive':
            variant = "secondary";
            className += "bg-gray-100 text-gray-700";
            break;
          default:
            variant = "secondary";
            className += "bg-gray-100 text-gray-700";
        }

        return (
          <Badge variant={variant} className={className}>
            {row.status || 'Active'}
          </Badge>
        );
      },
    },
  ], []);

  const filteredColumns = useMemo(
    () => columns.filter((col) =>
      visibleColumns.find((v) => v.key === col.key)?.visible
    ),
    [columns, visibleColumns]
  );

  const renderMobileCard = (row: Customer): MobileRecordCardProps => {
    return {
      title: `${row.firstName} ${row.lastName}`,
      subtitle: row.customerId || row.id,
      /*
      badges: (
        <Badge
          variant={row.type === 'Retail' ? 'secondary' : 'default'}
          className="rounded-full"
        >
          {row.type}
        </Badge>
      ),
      */
      fields: [
        { label: 'Email', value: row.email },
        { label: 'Phone', value: row.phone },
        { label: 'Orders', value: String(row.total_orders || 0) },
        { label: 'Status', value: row.status || 'Active' },
      ],
    };
  };

  // Metrics State
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0
  });

  // Fetch Metrics
  const fetchStats = useCallback(async () => {
    try {
      const stats = await customerService.getCustomerMetrics();
      setStats(stats);
    } catch (error) {
      console.error("Failed to fetch customer stats", error);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const metrics: MetricItem[] = useMemo(() => {
    return [
      { title: "Total Customers", value: stats.total, helperText: "All registered customers", icon: Users, iconBg: "#735DFF" },
      { title: "Active", value: stats.active, helperText: "Active customers", icon: CheckCircle, iconBg: "#2ECC71" },
      { title: "Inactive", value: stats.inactive, helperText: "Inactive/Blocked customers", icon: Archive, iconBg: "#F5A623" },
    ];
  }, [stats]);

  const onClearFilters = () => {
    resetListState();
    setGender([]);
    setOrdersFilter([]);
    setDateFilter("");
    setDateRange(undefined);
    setTags([]);
    setStatuses([]);
  };

  const statusFilterOptions = [
    { label: "All Status", value: "", onSelect: () => { setStatuses([]); setPage(1); }, isActive: statuses.length === 0 },
    { label: "Active", value: "active", onSelect: () => { setStatuses(prev => prev.includes('active') ? prev.filter(s => s !== 'active') : [...prev, 'active']); setPage(1); }, isActive: statuses.includes("active") },
    { label: "Inactive", value: "inactive", onSelect: () => { setStatuses(prev => prev.includes('inactive') ? prev.filter(s => s !== 'inactive') : [...prev, 'inactive']); setPage(1); }, isActive: statuses.includes("inactive") },
  ];

  const dateFilterOptions = [
    { label: "All Dates", value: "", onSelect: () => { setDateFilter(""); setDateRange(undefined); }, isActive: dateFilter === "" },
    {
      label: "Today", value: "today", onSelect: () => {
        setDateFilter("today");
        const today = new Date();
        setDateRange({ from: today, to: today });
      }, isActive: dateFilter === "today"
    },
    {
      label: "Last 7 Days", value: "last-7-days", onSelect: () => {
        setDateFilter("last-7-days");
        const to = new Date();
        const from = new Date();
        from.setDate(to.getDate() - 7);
        setDateRange({ from, to });
      }, isActive: dateFilter === "last-7-days"
    },
    {
      label: "Last 30 Days", value: "last-30-days", onSelect: () => {
        setDateFilter("last-30-days");
        const to = new Date();
        const from = new Date();
        from.setDate(to.getDate() - 30);
        setDateRange({ from, to });
      }, isActive: dateFilter === "last-30-days"
    },
  ]; // Removed segment options

  const ordersFilterOptions = [
    { label: "All Orders", value: "", onSelect: () => { setOrdersFilter([]); setPage(1); }, isActive: ordersFilter.length === 0 },
    { label: "No Orders", value: "no-orders", onSelect: () => { setOrdersFilter(prev => prev.includes('no-orders') ? prev.filter(o => o !== 'no-orders') : [...prev, 'no-orders']); setPage(1); }, isActive: ordersFilter.includes("no-orders") },
    { label: "Has Orders", value: "has-orders", onSelect: () => { setOrdersFilter(prev => prev.includes('has-orders') ? prev.filter(o => o !== 'has-orders') : [...prev, 'has-orders']); setPage(1); }, isActive: ordersFilter.includes("has-orders") },
    { label: "High Volume (>10)", value: "high-value", onSelect: () => { setOrdersFilter(prev => prev.includes('high-value') ? prev.filter(o => o !== 'high-value') : [...prev, 'high-value']); setPage(1); }, isActive: ordersFilter.includes("high-value") },
  ];

  const genderFilterOptions = [
    { label: "All Genders", value: "", onSelect: () => { setGender([]); setPage(1); }, isActive: gender.length === 0 },
    { label: "Male", value: "male", onSelect: () => { setGender(prev => prev.includes('male') ? prev.filter(g => g !== 'male') : [...prev, 'male']); setPage(1); }, isActive: gender.includes("male") },
    { label: "Female", value: "female", onSelect: () => { setGender(prev => prev.includes('female') ? prev.filter(g => g !== 'female') : [...prev, 'female']); setPage(1); }, isActive: gender.includes("female") },
    { label: "Other", value: "other", onSelect: () => { setGender(prev => prev.includes('other') ? prev.filter(g => g !== 'other') : [...prev, 'other']); setPage(1); }, isActive: gender.includes("other") },
    { label: "Prefer Not to Say", value: "prefer_not_to_say", onSelect: () => { setGender(prev => prev.includes('prefer_not_to_say') ? prev.filter(g => g !== 'prefer_not_to_say') : [...prev, 'prefer_not_to_say']); setPage(1); }, isActive: gender.includes("prefer_not_to_say") },
  ];

  // const segmentFilterOptions = [ ... ]; // Removed

  const tagsFilterOptions = [
    {
      label: "All Tags",
      value: "",
      onSelect: () => { setTags([]); setPage(1); },
      isActive: tags.length === 0
    },
    ...availableTags.map(tag => ({
      label: tag,
      value: tag,
      onSelect: () => { setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]); setPage(1); },
      isActive: tags.includes(tag)
    }))
  ];

  const sortOptions = [
    { label: "Newest First", value: "newest", direction: "desc", isActive: sort === "newest", onSelect: () => { setSort("newest"); setPage(1); } },
    { label: "Oldest First", value: "oldest", direction: "asc", isActive: sort === "oldest", onSelect: () => { setSort("oldest"); setPage(1); } },
    { label: "Name (A-Z)", value: "name_asc", direction: "asc", isActive: sort === "name_asc", onSelect: () => { setSort("name_asc"); setPage(1); } },
    { label: "Name (Z-A)", value: "name_desc", direction: "desc", isActive: sort === "name_desc", onSelect: () => { setSort("name_desc"); setPage(1); } },
    { label: "Most Orders", value: "orders_desc", direction: "desc", isActive: sort === "orders_desc", onSelect: () => { setSort("orders_desc"); setPage(1); } },
  ];

  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Derive selectedCustomers from customers if needed, but for bulk delete we mostly need IDs
  const selectedCustomers = useMemo(() => {
    return customers.filter(c => selectedCustomerIds.includes(c.id));
  }, [customers, selectedCustomerIds]);

  const handleSelectionChange = useCallback(() => {
    // This is called by GenericTable when current page selections change.
    // However, GenericTable now also supports onSelectionIdsChange.
    // We'll prefer using onSelectionIdsChange if we use the new GenericTable features.
  }, []);

  const handleSelectionIdsChange = useCallback((ids: string[]) => {
    setSelectedCustomerIds(ids);
  }, []);

  const handleBulkDelete = useCallback(() => {
    if (selectedCustomers.length === 0) return;
    setShowDeleteDialog(true);
  }, [selectedCustomers]);

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      const ids = selectedCustomerIds;
      await customerService.bulkDeleteCustomers(ids);
      notifySuccess(`Successfully deleted ${ids.length} customers`);

      // Clear selection and refresh list
      setSelectedCustomerIds([]);
      setShowDeleteDialog(false);
      fetchCustomers();
      // Update metrics too
      customerService.getCustomerMetrics().then(setStats);
    } catch (error) {
      console.error('Bulk delete failed:', error);
      notifyError('Failed to delete customers');
    } finally {
      setIsDeleting(false);
    }
  };

  const actions = [
    // {
    //   label: "Archive Customer",
    //   icon: <Archive size={16} />,
    //   onClick: () => toast.info(`${selectedCustomers.length} customers archived (mock)`),
    //   disabled: selectedCustomers.length === 0
    // },
    {
      label: "Delete Customer",
      icon: <Trash2 size={16} />,
      danger: true,
      onClick: handleBulkDelete,
      disabled: selectedCustomers.length === 0
    },
  ];

  const handleSortChange = (key: string, direction: 'asc' | 'desc') => {
    setSort(`${key}_${direction}`);
    setPage(1);
  };

  return {
    dateRange: dateRange ? { from: dateRange.from || null, to: dateRange.to || null } : { from: null, to: null },
    setDateRange: (v: any) => setDateRange(v.from ? { from: v.from, to: v.to ?? undefined } : undefined),
    search,
    setSearch: (v: string) => { setSearch(v); setPage(1); },
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    status: statuses,
    setStatus: (v: string[]) => { setStatuses(v); setPage(1); },
    // type,
    // setType: (v: string) => { setType(v); setPage(1); },
    sort,
    setSort,
    customers: sortedCustomers,
    total,
    isLoading,
    totalPages,
    metrics,
    onClearFilters,
    visibleColumns,
    toggleColumn,
    filteredColumns,
    renderMobileCard,
    handleSortChange,
    statusFilterOptions,
    // typeFilterOptions,
    genderFilterOptions,
    // segmentFilterOptions,
    dateFilterOptions,
    ordersFilterOptions,

    tagsFilterOptions,
    sortOptions,
    actions,
    handleSelectionChange,
    handleSelectionIdsChange,
    refetch: () => { fetchCustomers(); fetchStats(); },
    showDeleteDialog,
    setShowDeleteDialog,
    isDeleting,
    handleConfirmDelete,
    selectedCustomers,
    selectedCustomerIds
  };
};
