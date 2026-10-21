"use client";
import { Home, Building, Plus, ChevronDown, Check, Edit, Trash2, Loader2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useCheckout } from '@/contexts/CheckoutContext';
import type { Address } from '@/lib/data/profile/types';
import { AddressFormModal } from '@/components/profile/client/AddressFormModal';
import { useAddresses } from '@/hooks/queries/useAddresses';

// ============================================================================
// ShippingAddressClient - Client Component
// ============================================================================
// Now fetches data via React Query instead of receiving from server

export function ShippingAddressClient() {
    const { selectedAddressId, setSelectedAddressId } = useCheckout();
    const {
        addresses,
        isLoading,
        deleteAddress,
        isDeleting
    } = useAddresses();

    const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
    const [modalOpen, setModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Select default address on mount if none selected
    useEffect(() => {
        if (!selectedAddressId && addresses.length > 0) {
            const defaultAddress = addresses.find(a => a.isDefault);
            if (defaultAddress) {
                setSelectedAddressId(defaultAddress.id);
            } else {
                setSelectedAddressId(addresses[0].id);
            }
        }
    }, [selectedAddressId, addresses, setSelectedAddressId]);

    const handleAddNew = () => {
        setEditingAddress(null);
        setModalOpen(true);
    };

    const handleEdit = (address: Address, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingAddress(address);
        setModalOpen(true);
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this address?')) return;

        setDeletingId(id);
        try {
            await deleteAddress(id);

            // If deleted address was selected, select another
            if (selectedAddressId === id) {
                const remaining = addresses.filter(a => a.id !== id);
                if (remaining.length > 0) {
                    const defaultAddr = remaining.find(a => a.isDefault) || remaining[0];
                    setSelectedAddressId(defaultAddr.id);
                } else {
                    setSelectedAddressId(null);
                }
            }
        } catch (error) {
            // Error handled by hook
        } finally {
            setDeletingId(null);
        }
    };

    const handleSelectAddress = (id: string) => {
        setSelectedAddressId(id);
    };

    const toggleExpand = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedCards(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const isSelected = (id: string) => selectedAddressId === id;
    const isCollapsed = (id: string) => !isSelected(id) && !expandedCards.has(id);

    return (
        <>
            {/* Address Selection - Fixed Height Container */}
            <div className="max-h-[500px] overflow-y-auto pr-2 mb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
                <div className="flex flex-col gap-3">
                    {addresses.map((address) => {
                        const selected = isSelected(address.id);
                        const collapsed = isCollapsed(address.id);

                        return (
                            <div
                                key={address.id}
                                onClick={() => !selected && handleSelectAddress(address.id)}
                                className={`text-left bg-white dark:bg-slate-800 border-2 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 ${selected
                                    ? 'border-[#00C4CC] shadow-lg'
                                    : 'border-gray-100 dark:border-slate-700 hover:border-[#00C4CC]/30 hover:shadow-md'
                                    }`}
                            >
                                {/* Card Header - Always Visible */}
                                <div className="p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${address.type === 'Home' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'bg-purple-50 dark:bg-purple-900/20 text-purple-600'
                                                }`}>
                                                {address.type === 'Home' ? <Home className="w-4 h-4" /> : <Building className="w-4 h-4" />}
                                            </div>
                                            <div>
                                                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                                                    {address.type}
                                                </h3>
                                                {address.isDefault && (
                                                    <span className="text-xs font-bold text-[#00C4CC] bg-[#00C4CC]/10 px-2 py-0.5 rounded-full">
                                                        DEFAULT
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {!selected && (
                                                <button
                                                    onClick={(e) => toggleExpand(address.id, e)}
                                                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                                                >
                                                    <ChevronDown
                                                        className={`w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform duration-200 ${collapsed ? '' : 'rotate-180'}`}
                                                    />
                                                </button>
                                            )}

                                            {selected ? (
                                                <div className="w-6 h-6 bg-[#00C4CC] rounded-full flex items-center justify-center">
                                                    <Check className="w-3 h-3 text-white" />
                                                </div>
                                            ) : (
                                                <div className="w-6 h-6 bg-gray-200 dark:bg-slate-600 rounded-full flex items-center justify-center hover:bg-gray-300 dark:hover:bg-slate-500 transition-colors">
                                                    <div className="w-3 h-3 bg-white rounded-full" />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {collapsed && (
                                        <div className="space-y-1">
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                {address.name}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                                                {address.addressLine}
                                            </p>
                                        </div>
                                    )}

                                    {!collapsed && (
                                        <div>
                                            <div className="space-y-1.5">
                                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                    {address.name}
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                                    {address.addressLine}
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {address.city}, {address.state} - {address.pincode}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Phone: {address.phone}
                                                </p>
                                            </div>

                                            <div className="flex gap-3 mt-4 pt-3 border-t border-gray-100 dark:border-slate-700">
                                                <button
                                                    onClick={(e) => handleEdit(address, e)}
                                                    className="flex items-center gap-1.5 text-sm font-medium text-[#00C4CC] hover:text-[#0B1F51] dark:hover:text-white transition-colors"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                    Edit
                                                </button>
                                                {!address.isDefault && (
                                                    <button
                                                        onClick={(e) => handleDelete(address.id, e)}
                                                        disabled={deletingId === address.id || isDeleting}
                                                        className="flex items-center gap-1.5 text-sm font-medium text-red-500 hover:text-red-600 transition-colors disabled:opacity-50"
                                                    >
                                                        {deletingId === address.id ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="w-4 h-4" />
                                                        )}
                                                        Delete
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Add New Button */}
            <Button
                onClick={handleAddNew}
                variant="outline"
                className="w-full border-2 border-dashed border-[#00C4CC]/30 text-[#00C4CC] hover:bg-[#00C4CC]/5 hover:border-[#00C4CC] rounded-xl h-14 font-semibold"
            >
                <Plus className="w-4 h-4 mr-2" />
                Add New Address
            </Button>

            {/* Address Form Modal */}
            <AddressFormModal
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setEditingAddress(null);
                }}
                address={editingAddress}
            />
        </>
    );
}
