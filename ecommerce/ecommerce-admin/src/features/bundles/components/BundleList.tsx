import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, FileText, Printer, Search, Eye, Edit2, Trash2, Package, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GenericTable, type ColumnConfig } from '@/components/data-table';
import type { Bundle } from '../types/bundle.types';

interface BundleListProps {
    data: Bundle[];
}

export const BundleList = ({ data }: BundleListProps) => {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('rowsPerPage');
            return stored ? parseInt(stored) : 10;
        }
        return 10;
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [sortKey, setSortKey] = useState<string>('id');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    // Filtering & Sorting
    const filteredData = data.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => {
        const aValue = a[sortKey as keyof Bundle];
        const bValue = b[sortKey as keyof Bundle];

        if (aValue === undefined || bValue === undefined) return 0;

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    const paginatedData = filteredData.slice((page - 1) * rowsPerPage, page * rowsPerPage);
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);

    const columns: ColumnConfig<Bundle>[] = [
        { key: 'id', label: 'ID', sortable: true, className: 'font-medium text-slate-900 w-32' },
        { key: 'title', label: 'Bundle Title', sortable: true, className: 'font-medium text-slate-900 min-w-[250px]' },
        { key: 'type', label: 'Type', sortable: true, className: 'text-slate-600' },
        {
            key: 'status', label: 'Status', sortable: true, type: 'badge'
        },
        { key: 'priceType', label: 'Price Type', sortable: true, className: 'text-slate-600' },
        {
            key: 'price', label: 'Price/Discount', sortable: true,
            className: 'text-slate-900 font-medium',
            render: (_, row) => row.priceType === 'Fixed Price' ? `₹${row.price.toLocaleString()} ` : `${row.discount}% OFF`
        },
        { key: 'startDate', label: 'Start Date', sortable: true, className: 'text-slate-600 whitespace-nowrap' },
        { key: 'endDate', label: 'End Date', sortable: true, className: 'text-slate-600 whitespace-nowrap' },
        { key: 'totalSales', label: 'Sales', sortable: true, className: 'text-slate-600' },
    ];

    const actions = [
        { label: 'View', icon: <Eye size={14} />, onClick: (row: Bundle) => navigate(`/ bundles / ${row.id} `) },
        { label: 'Edit', icon: <Edit2 size={14} />, onClick: (row: Bundle) => navigate(`/ bundles / ${row.id}/edit`) },
        { label: 'Delete', icon: <Trash2 size={14} />, onClick: () => { }, danger: true },
    ];

    return (
        <div>
            {/* Card Header */}
            <div className="px-6 py-5 border-b border-slate-200/80">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <h2 className="text-lg font-semibold text-slate-900">All Bundles</h2>

                    <div className="flex items-center gap-3">
                        <div className="hidden lg:flex items-center gap-2">
                            <Button variant="outline" size="sm">
                                <Copy className="size-4 mr-2" />
                                Copy
                            </Button>
                            <Button variant="outline" size="sm">
                                <FileText className="size-4 mr-2" />
                                CSV
                            </Button>
                            <Button variant="outline" size="sm">
                                <Printer className="size-4 mr-2" />
                                Print
                            </Button>
                        </div>


                        <div className="relative w-full lg:w-64">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-slate-400" />
                            <Input
                                type="text"
                                placeholder="Search bundles..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <GenericTable
                data={paginatedData}
                loading={false}
                totalItems={filteredData.length}
                page={page}
                totalPages={totalPages}
                rowsPerPage={rowsPerPage}
                onPageChange={setPage}
                onRowsPerPageChange={setRowsPerPage}
                getRowId={(row) => row.id}
                columns={columns}
                selectable={true}
                sortKey={sortKey}
                sortDirection={sortDirection}
                onSortChange={(k, d) => {
                    setSortKey(k);
                    setSortDirection(d);
                }}
                rowActionsBuilder={() => actions}
                emptyState={
                    <div className="flex flex-col items-center gap-3 py-12">
                        <div className="size-12 rounded-full bg-slate-100 flex items-center justify-center">
                            <Package className="size-6 text-slate-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-900 mb-1">No bundles found</p>
                            <p className="text-sm text-slate-500">
                                {searchQuery ? 'Try adjusting your search query' : 'Get started by creating your first bundle'}
                            </p>
                        </div>
                        {!searchQuery && (
                            <Button
                                className="bg-slate-900 text-white hover:bg-slate-800 mt-2"
                                onClick={() => navigate('/bundles/new')}
                            >
                                <Plus className="size-4 mr-2" />
                                Add Bundle
                            </Button>
                        )}
                    </div>
                }
            />
        </div>
    );
};
