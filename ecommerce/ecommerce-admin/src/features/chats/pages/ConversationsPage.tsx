import React, { useMemo, useState, useCallback, useEffect } from "react";
import { notifyInfo } from "@/utils";
import {
    MessageSquare,
    Clock,
    CheckCircle2,
    AlertCircle
} from "lucide-react";

import { DateRangePicker } from '@/components/forms/inputs/DateRangePicker';
import { GenericTable, type ColumnConfig } from '@/components/data-table';
import { MetricsGrid, type MetricItem } from '@/components/metrics';
import type { MobileRecordCardProps } from '@/components/data-table';
import { Badge } from "@/components/ui/badge";
import { ActionButtons, FiltersBar } from '@/components/data-table';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/lib/constants/routes';

import { usePagination, useSearch, useDateRange } from "@/hooks";
import type { Conversation } from "../types/conversation.types";
import { MOCK_CONVERSATIONS } from "../data/mockConversations";

const ConversationsPage: React.FC = () => {
    const { dateRange, setDateRange } = useDateRange();
    const { search, setSearch } = useSearch();
    const { page, rowsPerPage, setPage, setRowsPerPage } = usePagination();
    const [status, setStatus] = useState("all");
    const [sortKey, setSortKey] = useState<string>('created_at');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [isLoading, setIsLoading] = useState(true);

    // Simulate initial data load
    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 300);
        return () => clearTimeout(timer);
    }, []);

    // FiltersBar config
    const [visibleColumns, setVisibleColumns] = useState(() => [
        { key: 'customerName', label: 'Customer', visible: true },
        { key: 'status', label: 'Status & Tags', visible: true },
        { key: 'created_at', label: 'Time', visible: true },
    ]);

    const toggleColumn = (key: string) => {
        setVisibleColumns(prev => prev.map(c => c.key === key ? { ...c, visible: !c.visible } : c));
    };

    const filtersOptions = [
        { label: 'Open', value: 'open', onSelect: (v: string) => { setStatus(v); setPage(1); }, isActive: status === 'open' },
        { label: 'Pending', value: 'pending', onSelect: (v: string) => { setStatus(v); setPage(1); }, isActive: status === 'pending' },
        { label: 'Solved', value: 'solved', onSelect: (v: string) => { setStatus(v); setPage(1); }, isActive: status === 'solved' },
        { label: 'Urgent', value: 'urgent', onSelect: (v: string) => { setStatus(v); setPage(1); }, isActive: status === 'urgent' },
    ];

    const sortOptions = [
        { label: 'Newest', value: 'newest', onSelect: () => { setSortKey('created_at'); setSortDirection('desc'); }, isActive: sortKey === 'created_at' && sortDirection === 'desc', direction: 'desc' as const },
        { label: 'Oldest', value: 'oldest', onSelect: () => { setSortKey('created_at'); setSortDirection('asc'); }, isActive: sortKey === 'created_at' && sortDirection === 'asc', direction: 'asc' as const },
    ];

    // Filter conversations
    let filteredConversations = [...MOCK_CONVERSATIONS];

    if (search) {
        filteredConversations = filteredConversations.filter(c =>
            c.customerName.toLowerCase().includes(search.toLowerCase()) ||
            c.customerEmail.toLowerCase().includes(search.toLowerCase()) ||
            c.subject.toLowerCase().includes(search.toLowerCase()) ||
            c.preview.toLowerCase().includes(search.toLowerCase())
        );
    }

    if (status && status !== 'all') {
        filteredConversations = filteredConversations.filter(c =>
            c.status.toLowerCase() === status.toLowerCase()
        );
    }

    // Filter by date range
    if (dateRange.from || dateRange.to) {
        filteredConversations = filteredConversations.filter(conversation => {
            const conversationDate = new Date(conversation.created_at);
            const from = dateRange.from;
            const to = dateRange.to;

            if (from && to) {
                return conversationDate >= from && conversationDate <= to;
            } else if (from) {
                return conversationDate >= from;
            } else if (to) {
                return conversationDate <= to;
            }
            return true;
        });
    }

    // Pagination
    const totalResults = filteredConversations.length;
    const totalPages = Math.ceil(totalResults / rowsPerPage);
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedConversations = filteredConversations.slice(startIndex, endIndex);

    // Metrics data
    const metrics: MetricItem[] = useMemo(() => [
        {
            title: 'Total Conversations',
            value: MOCK_CONVERSATIONS.length,
            helperText: 'All conversations',
            icon: MessageSquare,
            iconBg: '#3B82F6',
        },
        {
            title: 'Open Conversations',
            value: MOCK_CONVERSATIONS.filter(c => c.status === 'open').length,
            helperText: 'Currently open',
            icon: AlertCircle,
            iconBg: '#10B981',
        },
        {
            title: 'Pending',
            value: MOCK_CONVERSATIONS.filter(c => c.status === 'pending').length,
            helperText: 'Awaiting response',
            icon: Clock,
            iconBg: '#F59E0B',
        },
        {
            title: 'Resolved',
            value: MOCK_CONVERSATIONS.filter(c => c.status === 'solved').length,
            helperText: 'Successfully resolved',
            icon: CheckCircle2,
            iconBg: '#8B5CF6',
        },
    ], []);

    // Get time ago
    const getTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    };

    // Get status badge styles
    const getStatusBadge = (status: string) => {
        const badges = {
            'open': { className: 'bg-slate-900 text-white border-slate-900', label: 'OPEN' },
            'pending': { className: 'bg-slate-100 text-slate-700 border-slate-200', label: 'PENDING' },
            'solved': { className: 'bg-slate-100 text-slate-700 border-slate-200', label: 'SOLVED' },
            'urgent': { className: 'bg-red-50 text-red-700 border-red-200', label: 'URGENT' }
        };
        return badges[status as keyof typeof badges] || badges['open'];
    };

    // Get priority badge
    const getPriorityBadge = (priority?: string) => {
        if (!priority) return null;
        const badges = {
            'high': { className: 'bg-red-50 text-red-700 border-red-200', label: 'HIGH' },
            'urgent': { className: 'bg-red-50 text-red-700 border-red-200', label: 'URGENT' },
            'normal': { className: 'bg-blue-50 text-blue-700 border-blue-200', label: 'NORMAL' },
            'low': { className: 'bg-slate-50 text-slate-700 border-slate-200', label: 'LOW' }
        };
        return badges[priority as keyof typeof badges] || null;
    };

    // Get tag badge
    const getTagBadge = (tag: { label: string; color: string }) => {
        const colorMap: Record<string, string> = {
            'blue': 'bg-blue-50 text-blue-700 border-blue-200',
            'red': 'bg-red-50 text-red-700 border-red-200',
            'purple': 'bg-purple-50 text-purple-700 border-purple-200',
            'green': 'bg-green-50 text-green-700 border-green-200',
            'yellow': 'bg-yellow-50 text-yellow-700 border-yellow-200',
            'indigo': 'bg-indigo-50 text-indigo-700 border-indigo-200',
            'pink': 'bg-pink-50 text-pink-700 border-pink-200',
            'teal': 'bg-teal-50 text-teal-700 border-teal-200'
        };
        return colorMap[tag.color] || colorMap['blue'];
    };

    // Column configuration
    const columns: ColumnConfig<Conversation>[] = [
        {
            key: "customerName",
            label: "Customer",
            type: "text",
            sortable: true,
            render: (_, row) => (
                <div className="min-w-0">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 font-semibold text-slate-700">
                            {row.customerName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="font-semibold text-slate-900">{row.customerName}</p>
                            <p className="text-sm text-slate-500 truncate">{row.customerEmail}</p>
                            <div className="mt-1">
                                <p className="font-medium text-slate-900 text-sm">{row.subject}</p>
                                <p className="text-sm text-slate-500 truncate">{row.preview}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            key: "status",
            label: "Status & Tags",
            type: "text",
            render: (_, row) => (
                <div className="space-y-2">
                    <div className="flex flex-wrap gap-1.5">
                        <Badge className={`${getStatusBadge(row.status).className} text-[10px] px-2 py-0.5 font-semibold`}>
                            {getStatusBadge(row.status).label}
                        </Badge>
                        {row.priority && getPriorityBadge(row.priority) && (
                            <Badge className={`${getPriorityBadge(row.priority)?.className} text-[10px] px-2 py-0.5 font-semibold`}>
                                {getPriorityBadge(row.priority)?.label}
                            </Badge>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {row.tags.map(tag => (
                            <Badge key={tag.id} className={`${getTagBadge(tag)} text-[10px] px-2 py-0.5`}>
                                {tag.label}
                            </Badge>
                        ))}
                    </div>
                </div>
            )
        },
        {
            key: "created_at",
            label: "Time",
            type: "text",
            sortable: true,
            render: (_, row) => (
                <span className="text-sm text-slate-500">{getTimeAgo(row.created_at)}</span>
            )
        }
    ];

    // Mobile card render
    const renderMobileCard = useCallback((conversation: Conversation): MobileRecordCardProps => {
        const statusBadge = getStatusBadge(conversation.status);
        const priorityBadge = conversation.priority ? getPriorityBadge(conversation.priority) : null;

        return {
            title: conversation.customerName,
            subtitle: conversation.customerEmail,
            badges: (
                <div className="flex flex-wrap gap-1">
                    <Badge className={statusBadge.className}>
                        {statusBadge.label}
                    </Badge>
                    {priorityBadge && (
                        <Badge className={priorityBadge.className}>
                            {priorityBadge.label}
                        </Badge>
                    )}
                </div>
            ),
            fields: [
                { label: 'Subject', value: conversation.subject },
                { label: 'Preview', value: conversation.preview },
                { label: 'Created', value: getTimeAgo(conversation.created_at) }
            ]
        };
    }, []);

    // Apply sorting after filters
    if (sortKey) {
        filteredConversations.sort((a, b) => {
            if (sortKey === 'created_at') {
                const av = new Date(a.created_at).getTime();
                const bv = new Date(b.created_at).getTime();
                return sortDirection === 'desc' ? bv - av : av - bv;
            }
            return 0;
        });
    }

    const navigate = useNavigate();

    return (
        <div className="flex-1 overflow-auto">
            <div className="px-9 lg:px-8 pb-8 lg:pb-8 pt-2 space-y-7">
                {/* Top Controls: DateRangePicker + Reset + Actions (moved above metrics to match global layout) */}
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 w-full max-w-[520px]">
                        <DateRangePicker
                            value={dateRange ? { from: dateRange.from ?? null, to: dateRange.to ?? null } : { from: null, to: null }}
                            onChange={(val) => setDateRange(val.from ? { from: val.from, to: val.to ?? null } : { from: null, to: null })}
                        />

                    </div>


                </div>

                {/* Metrics Grid */}
                <MetricsGrid metrics={metrics} />

                {/* Filters Bar (use global appearance; no outer card wrapper) */}
                <FiltersBar
                    search={search}
                    onSearchChange={(v: string) => { setSearch(v); setPage(1); }}
                    filters={filtersOptions}
                    sortOptions={sortOptions}
                    visibleColumns={visibleColumns}
                    onToggleColumn={toggleColumn}
                    actions={[]}
                    onClearFilters={() => {
                        setStatus('all');
                        setSearch('');
                        setDateRange({ from: null, to: null });
                        setPage(1);
                    }}
                    searchPlaceholder="Search conversations..."
                />

                {/* Main Content Card */}
                <div className="bg-white rounded-[20px] shadow-sm border border-slate-200">
                    {/* Table */}
                    <GenericTable<Conversation>
                        columns={columns}
                        data={paginatedConversations}
                        loading={isLoading}
                        page={page}
                        totalPages={totalPages}
                        rowsPerPage={rowsPerPage}
                        totalItems={totalResults}
                        onPageChange={setPage}
                        onRowsPerPageChange={setRowsPerPage}
                        getRowId={(conversation) => conversation.id}
                        renderMobileCard={renderMobileCard}
                        onRowClick={(conversation) => navigate(ROUTES.CHATS.DETAIL(conversation.id))}
                    />
                </div>
            </div>
        </div>
    );
};

export default ConversationsPage;
