import React, { useMemo, useState, useCallback } from 'react';
import { Edit, Trash2, Layers, Users, TreePine } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { notifySuccess, notifyError, notifyInfo } from '@/utils';

import { DateRangePicker } from '@/components/forms/inputs/DateRangePicker';
import { ActionButtons, FiltersBar, GenericTable } from '@/components/data-table';
import { MetricsGrid, type MetricItem } from '@/components/metrics';
import type { MobileRecordCardProps } from '@/components/data-table';

import type { Tier } from '@/features/tiers/types';
import { ROUTES } from '@/lib/constants';
import { useTiers, QUERY_KEYS, useBulkDeleteTiers } from '../hooks/useTiers';
import { useQueryClient } from '@tanstack/react-query';
import { tierService } from '../services/tierService';
import {
  TIER_FILTER_OPTIONS,
  TIER_SORT_OPTIONS,
  TIER_COLUMN_KEYS
} from '../constants';
import { getTierColumnConfig } from '../config/columns.config';

interface DateRange {
  from?: Date;
  to?: Date;
}

/**
 * TierListPage Component
 * 
 * Main page component for tier management that provides a hierarchical
 * categorization system. Follows the same pattern as other list pages
 * in the application with DateRangePicker, ActionButtons, MetricsGrid, and FiltersBar.
 */
import { ConfirmationDialog } from '@/components/dialogs/ConfirmationDialog';

/**
 * TierListPage Component
 * 
 * Main page component for tier management that provides a hierarchical
 * categorization system. Follows the same pattern as other list pages
 * in the application with DateRangePicker, ActionButtons, MetricsGrid, and FiltersBar.
 */
const TierListPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // State management
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string[]>([]);
  const [tierLevel, setTierLevel] = useState<string[]>(['1']);
  const [usage, setUsage] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedTiers, setSelectedTiers] = useState<Tier[]>([]);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('rowsPerPage');
      return stored ? Number(stored) : 10;
    }
    return 10;
  });
  const [sortKey, setSortKey] = useState<keyof Tier>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Dialog state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);


  // Filters for API
  const queryParams = useMemo(() => ({
    search: search || undefined,
    status: status.length > 0 ? status.join(',') : undefined,
    level: tierLevel.length > 0 ? tierLevel.join(',') : undefined,
    usage: usage.length > 0 ? usage.join(',') : undefined
  }), [search, status, tierLevel, usage]);

  // Fetch with server-side filtering (for Table)
  const { data: tiers = [], isLoading } = useTiers(queryParams);

  // Fetch ALL tiers for Metrics (no filters) to get correct counts across all levels
  const { data: allTiers = [] } = useTiers({});

  // Metrics data
  const metrics: MetricItem[] = useMemo(() => [
    {
      title: 'Total Tiers',
      value: allTiers.length,
      tooltip: 'Total number of tiers across all levels',
      icon: Layers,
      iconBg: '#3B82F6',
    },
    {
      title: 'Tier 1 Categories',
      value: allTiers.filter(tier => tier.level === 1).length,
      tooltip: 'Number of top-level tier categories',
      icon: TreePine,
      iconBg: '#10B981',
    },
    {
      title: 'Active Tiers',
      value: allTiers.filter(tier => tier.status === 'active').length,
      tooltip: 'Number of active tiers',
      icon: Users,
      iconBg: '#8B5CF6',
    },
    {
      title: 'Inactive Tiers',
      value: allTiers.filter(tier => tier.status === 'inactive').length,
      tooltip: 'Number of inactive tiers',
      icon: Edit,
      iconBg: '#F59E0B',
    }
  ], [allTiers]);

  // Client-side sorting and filtering of fetched data
  const filteredTiers = useMemo(() => {
    let data = [...tiers];

    // Filter by date range if set
    if (dateRange?.from) {
      const fromDate = new Date(dateRange.from);
      fromDate.setHours(0, 0, 0, 0);

      data = data.filter((tier) => {
        if (!tier.createdAt) return false;
        const tierDate = new Date(tier.createdAt);
        tierDate.setHours(0, 0, 0, 0);

        if (dateRange.to) {
          const toDate = new Date(dateRange.to);
          toDate.setHours(23, 59, 59, 999);
          return tierDate >= fromDate && tierDate <= toDate;
        }

        // Single date - show tiers from that exact day
        return tierDate.getTime() === fromDate.getTime();
      });
    }

    return data.sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (!aValue && !bValue) return 0;
      if (!aValue) return 1;
      if (!bValue) return -1;

      if (sortKey === 'createdAt' || sortKey === 'updatedAt') {
        return sortDirection === 'asc'
          ? new Date(aValue as string).getTime() - new Date(bValue as string).getTime()
          : new Date(bValue as string).getTime() - new Date(aValue as string).getTime();
      }

      const comparison = String(aValue).localeCompare(String(bValue));
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [tiers, sortKey, sortDirection, dateRange]);

  // Column configuration
  const baseColumns = useMemo(() => [
    { key: TIER_COLUMN_KEYS.NAME, label: 'Tier Name' },
    { key: TIER_COLUMN_KEYS.USAGE, label: 'Usage' },
    { key: TIER_COLUMN_KEYS.STATUS, label: 'Status' },
    { key: TIER_COLUMN_KEYS.CREATED, label: 'Created' },
    { key: TIER_COLUMN_KEYS.UPDATED, label: 'Last Updated' },
  ], []);

  // Visible columns state
  const [visibleColumns, setVisibleColumns] = useState(
    baseColumns.map(col => ({ key: col.key, label: col.label, visible: true }))
  );

  const toggleColumn = useCallback((key: string) => {
    setVisibleColumns(prev =>
      prev.map(col =>
        col.key === key ? { ...col, visible: !col.visible } : col
      )
    );
  }, []);

  // Filters Bar Options
  const filterGroups = useMemo(() => [
    TIER_FILTER_OPTIONS.STATUS(status, (v) => { setStatus(v); setPage(1); }, setPage),
    TIER_FILTER_OPTIONS.LEVEL(tierLevel, (v) => { setTierLevel(v); setPage(1); }, setPage),
    TIER_FILTER_OPTIONS.USAGE(usage, (v) => { setUsage(v); setPage(1); }, setPage),
  ], [status, tierLevel, usage]);

  const currentSortOptions = useMemo(() =>
    TIER_SORT_OPTIONS(
      sortKey === "createdAt" ? (sortDirection === "desc" ? "newest" : "oldest") : (sortDirection === "asc" ? "name_asc" : "name_desc"),
      (v) => {
        if (v === 'newest') { setSortKey('createdAt'); setSortDirection('desc'); }
        else if (v === 'oldest') { setSortKey('createdAt'); setSortDirection('asc'); }
        else if (v === 'name_asc') { setSortKey('name'); setSortDirection('asc'); }
        else if (v === 'name_desc') { setSortKey('name'); setSortDirection('desc'); }
      },
      setPage
    ),
    [sortKey, sortDirection]);

  // Actions menu
  // Handle bulk delete
  // Handle bulk delete
  const bulkDeleteTierMutation = useBulkDeleteTiers();
  // We need all tiers to calculate descendants, available from `allTiers` which is fetched for metrics
  // Check if allTiers has data. If not, we might need to rely on what we have or fetch hierarchy.
  // Actually `allTiers` is flat list of all items. We can build a map or just search it.

  const [idsToDelete, setIdsToDelete] = useState<string[]>([]);

  const handleBulkDelete = useCallback(() => {
    if (selectedTiers.length === 0) return;

    // Helper to build hierarchy map for fast lookup
    const buildHierarchy = (tiers: Tier[]) => {
      const map = new Map<string, string[]>(); // parentId -> childIds
      tiers.forEach(t => {
        if (t.parentId) {
          const children = map.get(t.parentId) || [];
          children.push(t.id);
          map.set(t.parentId, children);
        }
      });
      return map;
    };

    const hierarchyMap = buildHierarchy(allTiers);

    const getAllDescendants = (id: string): string[] => {
      const children = hierarchyMap.get(id) || [];
      let descendants = [...children];
      children.forEach(childId => {
        descendants = [...descendants, ...getAllDescendants(childId)];
      });
      return descendants;
    };

    // Collect all IDs: selected + their descendants
    // We also need to map IDs to their levels to sort them
    const idsToLevel = new Map<string, number>();
    allTiers.forEach(t => idsToLevel.set(t.id, t.level));

    const allIds = new Set<string>();
    selectedTiers.forEach(tier => {
      allIds.add(tier.id);
      getAllDescendants(tier.id).forEach(descId => allIds.add(descId));
    });

    // Sort IDs by level descending (highest level first) to avoid constraint violations
    const sortedIds = Array.from(allIds).sort((a, b) => {
      const levelA = idsToLevel.get(a) || 0;
      const levelB = idsToLevel.get(b) || 0;
      return levelB - levelA; // Descending: 4 -> 3 -> 2 -> 1
    });

    setIdsToDelete(sortedIds);
    setShowDeleteDialog(true);
  }, [selectedTiers, allTiers]);


  const handleConfirmDelete = async () => {
    // setIsDeleting(true);
    try {
      if (selectedTiers.length === 0) return;
      // Send only selected IDs, backend handles recursive deletion
      await bulkDeleteTierMutation.mutateAsync(selectedTiers.map(t => t.id));

      notifySuccess('Tiers deleted successfully');
      setIdsToDelete([]);
      setShowDeleteDialog(false);
      setSelectedTiers([]);

      // Force refetch to update list
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });

    } catch (error: any) {
      console.error('Tier selection delete error:', error);
      const message = error?.response?.data?.message || error?.response?.data?.error?.message || error?.message || 'Failed to delete tiers';
      notifyError(message);
    } finally {
      // No cleanup needed
    }
  };

  /*
  const [showCascadeDialog, setShowCascadeDialog] = useState(false);

  const handleCascadeDelete = async () => {
    setIsDeleting(true);
    try {
      const ids = selectedTiers.map(t => t.id);
      await tierService.bulkDeleteTiers(ids); // No second argument if we don't support it

      notifySuccess(`Successfully deleted tiers`);
      setSelectedTiers([]);
      setShowCascadeDialog(false);
      window.location.reload();
    } catch (error: any) {
      const message = error?.response?.data?.error?.message || error?.response?.data?.message || error.message || '';
      notifyError(message || 'Failed to delete tiers');
    } finally {
      setIsDeleting(false);
    }
  };
  */

  // Actions menu
  const actions = useMemo(() => [
    {
      label: "Delete Tier",
      icon: <Trash2 size={16} />,
      danger: true,
      disabled: selectedTiers.length === 0,
      onClick: handleBulkDelete
    },
  ], [selectedTiers, handleBulkDelete]);

  // Handle tier name click to go to detail page
  const handleTierClick = useCallback((tier: Tier) => {
    navigate(`${ROUTES.TIERS?.DETAIL(tier.id) || `/tiers/${tier.id}`}`);
  }, [navigate]);

  // Mobile card render
  const renderMobileCard = useCallback((tier: Tier): MobileRecordCardProps => {
    const statusStyles: Record<Tier['status'], string> = {
      active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      inactive: 'bg-slate-50 text-slate-700 border-slate-200'
    };

    const parent = tier.parentId ? tiers.find((t: Tier) => t.id === tier.parentId)?.name : null;

    return {
      title: tier.name,
      subtitle: tier.description || '',
      primaryValue: `Level ${tier.level}`,
      badges: (
        <div className="flex gap-1.5">
          <span className={`px-2 py-0.5 rounded-full text-[10px] border ${statusStyles[tier.status]} capitalize`}>
            {tier.status}
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] border bg-slate-100 text-slate-700">
            Level {tier.level}
          </span>
        </div>
      ),
      fields: [
        {
          label: "Parent",
          value: parent || "—",
        },
        {
          label: "Status",
          value: tier.status,
        },
        {
          label: "Created",
          value: new Date(tier.createdAt || new Date()).toLocaleDateString(),
        },
      ],
    };
  }, [handleTierClick, tiers]);

  const handleSelectionChange = useCallback((selected: Tier[]) => {
    setSelectedTiers(selected);
  }, []);


  // Pagination calculations
  const totalPages = Math.ceil(filteredTiers.length / rowsPerPage);
  const startIndex = (page - 1) * rowsPerPage;
  const paginatedData = filteredTiers.slice(startIndex, startIndex + rowsPerPage);

  // Clear filters
  const clearFilters = useCallback(() => {
    setStatus([]);
    setTierLevel(['1']);
    setUsage([]);
    setSearch("");
    setDateRange(undefined);
    setPage(1);
    setSelectedTiers([]);
  }, []);

  return (
    <div className="px-9 lg:px-8 pb-8 lg:pb-8 pt-2 space-y-7">
      {/* Date Range + Actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="w-auto">
            <DateRangePicker
              value={dateRange ? { from: dateRange.from ?? null, to: dateRange.to ?? null } : { from: null, to: null }}
              onChange={(val) => setDateRange(val.from ? { from: val.from, to: val.to ?? undefined } : undefined)}
            />
          </div>
        </div>

        <ActionButtons
          primaryLabel="Create Tier"
          primaryTo={ROUTES.TIERS?.CREATE || '/tiers/new'}
        />
      </div>

      {/* Metrics */}
      <MetricsGrid metrics={metrics} />

      {/* Filters Bar */}
      <FiltersBar
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        filterGroups={filterGroups as any}
        sortOptions={currentSortOptions as any}
        visibleColumns={visibleColumns}
        onToggleColumn={toggleColumn}
        actions={actions}
        onClearFilters={clearFilters}
      />

      {/* Table */}
      <GenericTable<Tier>
        data={paginatedData}
        columns={getTierColumnConfig(visibleColumns) as any}
        loading={isLoading}
        page={page}
        totalPages={totalPages}
        rowsPerPage={rowsPerPage}
        totalItems={filteredTiers.length}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        getRowId={(tier) => tier.id}
        renderMobileCard={renderMobileCard}

        onRowClick={handleTierClick}
        selectable={true}
        onSelectionChange={handleSelectionChange}
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSortChange={(key, direction) => {
          setSortKey(key as keyof Tier);
          setSortDirection(direction);
        }}
      />
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title={`Delete ${idsToDelete.length} Tier(s)`}
        description={`Are you sure you want to delete ${selectedTiers.length} selected tier(s)? \n\nThis will result in the deletion of ${idsToDelete.length} total tiers (including ${idsToDelete.length - selectedTiers.length} sub-tiers). This action cannot be undone.`}
        confirmText={bulkDeleteTierMutation.isPending ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        variant="destructive"
        isLoading={bulkDeleteTierMutation.isPending}
      />
    </div>
  );
};

export default TierListPage;