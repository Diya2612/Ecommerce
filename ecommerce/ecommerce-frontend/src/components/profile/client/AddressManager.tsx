"use client";

import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Home, Building, Plus, Edit, Trash2, Star, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import type { Address } from '@/lib/data/profile/types';
import { AddressFormModal } from './AddressFormModal';
import { useAddresses } from '@/hooks/queries/useAddresses';
import { MobileCard, SWIPE_ACTIONS } from '../ui/MobileCard';
import { AlertDialog } from '@/components/ui/MobileSheet';
import { triggerHaptic } from '@/hooks/gestures/useHaptic';

// Address type icon mapping
const ADDRESS_TYPE_CONFIG = {
    Home: {
        icon: Home,
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        textColor: 'text-blue-600',
    },
    Office: {
        icon: Building,
        bgColor: 'bg-purple-50 dark:bg-purple-900/20',
        textColor: 'text-purple-600',
    },
    Other: {
        icon: MapPin,
        bgColor: 'bg-orange-50 dark:bg-orange-900/20',
        textColor: 'text-orange-600',
    },
};

export function AddressManager() {
    const {
        addresses,
        isLoading,
        deleteAddress,
        setDefaultAddress,
        isDeleting,
        isSettingDefault
    } = useAddresses();

    const [modalOpen, setModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [addressToDelete, setAddressToDelete] = useState<Address | null>(null);

    const handleAddNew = useCallback(() => {
        triggerHaptic('light');
        setEditingAddress(null);
        setModalOpen(true);
    }, []);

    const handleEdit = useCallback((address: Address) => {
        triggerHaptic('light');
        setEditingAddress(address);
        setModalOpen(true);
    }, []);

    const confirmDelete = useCallback((address: Address) => {
        triggerHaptic('medium');
        setAddressToDelete(address);
        setDeleteConfirmOpen(true);
    }, []);

    const handleDelete = useCallback(async () => {
        if (!addressToDelete) return;

        setDeletingId(addressToDelete.id);
        try {
            await deleteAddress(addressToDelete.id);
            // React Query handles cache invalidation automatically
        } catch (error) {
            // Error handled by hook
        } finally {
            setDeletingId(null);
            setAddressToDelete(null);
        }
    }, [addressToDelete, deleteAddress]);

    const handleSetDefault = useCallback(async (id: string) => {
        triggerHaptic('success');
        setSettingDefaultId(id);
        try {
            await setDefaultAddress(id);
            // React Query handles cache invalidation automatically
        } catch (error) {
            // Error handled by hook
        } finally {
            setSettingDefaultId(null);
        }
    }, [setDefaultAddress]);

    const handleModalClose = useCallback(() => {
        setModalOpen(false);
        setEditingAddress(null);
    }, []);

    const displayAddresses = addresses;

    if (isLoading && displayAddresses.length === 0) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="space-y-4 lg:space-y-6 relative">
            {/* Header - Hidden on mobile (we have FAB instead) */}
            <div className="hidden lg:flex items-center justify-between">
                <div>
                    <p className="text-gray-600 dark:text-gray-400">
                        {displayAddresses.length} saved {displayAddresses.length === 1 ? 'address' : 'addresses'}
                    </p>
                </div>
                <Button
                    onClick={handleAddNew}
                    className="bg-[#0B1F51] text-white hover:bg-[#00C4CC] rounded-xl h-11 px-6 font-semibold transition-all shadow-md hover:shadow-lg"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New
                </Button>
            </div>

            {/* Mobile Count */}
            <div className="lg:hidden flex items-center justify-between">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {displayAddresses.length} saved {displayAddresses.length === 1 ? 'address' : 'addresses'}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                    Swipe for actions
                </p>
            </div>

            {/* Empty State */}
            {displayAddresses.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12 lg:py-16 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-2xl lg:rounded-3xl"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', delay: 0.1 }}
                        className="w-16 h-16 lg:w-20 lg:h-20 bg-linear-to-br from-gray-100 to-gray-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    >
                        <MapPin className="w-8 h-8 lg:w-10 lg:h-10 text-gray-400" />
                    </motion.div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No addresses yet</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-xs mx-auto px-4">
                        Add your first delivery address to proceed with checkout faster.
                    </p>
                    <Button
                        onClick={handleAddNew}
                        className="bg-[#00C4CC] text-white hover:bg-[#0B1F51] transition-all h-11 px-6 rounded-xl font-semibold"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Address
                    </Button>
                </motion.div>
            ) : (
                <>
                    {/* Mobile: Single Column with Swipe Actions */}
                    <div className="lg:hidden space-y-3">
                        <AnimatePresence mode="popLayout">
                            {displayAddresses.map((address, index) => {
                                const typeConfig = ADDRESS_TYPE_CONFIG[address.type as keyof typeof ADDRESS_TYPE_CONFIG] || ADDRESS_TYPE_CONFIG.Other;
                                const TypeIcon = typeConfig.icon;

                                return (
                                    <motion.div
                                        key={address.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -100 }}
                                        transition={{ delay: index * 0.03 }}
                                    >
                                        <MobileCard
                                            onTap={() => handleEdit(address)}
                                            leftSwipeActions={
                                                address.isDefault ? [] : [
                                                    SWIPE_ACTIONS.delete(() => confirmDelete(address)),
                                                ]
                                            }
                                            rightSwipeActions={
                                                address.isDefault ? [] : [
                                                    SWIPE_ACTIONS.setDefault(() => handleSetDefault(address.id)),
                                                ]
                                            }
                                            className="rounded-xl overflow-hidden border border-gray-100 dark:border-slate-700"
                                        >
                                            <div className={`p-4 ${address.isDefault ? 'bg-[#00C4CC]/5 dark:bg-[#00C4CC]/10' : 'bg-white dark:bg-slate-800'}`}>
                                                {/* Header Row */}
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className={`w-10 h-10 rounded-xl ${typeConfig.bgColor} flex items-center justify-center shrink-0`}>
                                                        <TypeIcon className={`w-5 h-5 ${typeConfig.textColor}`} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                                {address.type}
                                                            </span>
                                                            {address.isDefault && (
                                                                <span className="text-[10px] font-bold text-[#00C4CC] bg-[#00C4CC]/10 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                                                    <Check className="w-3 h-3" />
                                                                    PRIMARY
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                                                            {address.name}
                                                        </p>
                                                    </div>
                                                    <Edit className="w-4 h-4 text-gray-400" />
                                                </div>

                                                {/* Address Details */}
                                                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-0.5 pl-[52px]">
                                                    <p className="line-clamp-1">{address.addressLine}</p>
                                                    <p>{address.city}, {address.state} - {address.pincode}</p>
                                                    <p className="text-gray-500 dark:text-gray-500">{address.phone}</p>
                                                </div>
                                            </div>
                                        </MobileCard>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>

                    {/* Desktop: Two Column Grid */}
                    <div className="hidden lg:grid md:grid-cols-2 gap-4">
                        {displayAddresses.map((address, index) => {
                            const typeConfig = ADDRESS_TYPE_CONFIG[address.type as keyof typeof ADDRESS_TYPE_CONFIG] || ADDRESS_TYPE_CONFIG.Other;
                            const TypeIcon = typeConfig.icon;

                            return (
                                <motion.div
                                    key={address.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`relative bg-white dark:bg-slate-800 border-2 rounded-2xl p-5 hover:shadow-lg transition-all duration-300 group ${address.isDefault
                                        ? 'border-[#00C4CC] shadow-md ring-1 ring-[#00C4CC]/20'
                                        : 'border-gray-100 dark:border-slate-700 hover:border-gray-200 dark:hover:border-slate-600'
                                        }`}
                                >
                                    {/* Card Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${typeConfig.bgColor}`}>
                                                <TypeIcon className={`w-5 h-5 ${typeConfig.textColor}`} />
                                            </div>
                                            <div>
                                                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                                                    {address.type}
                                                </h3>
                                                {address.isDefault && (
                                                    <span className="text-xs font-bold text-[#00C4CC] bg-[#00C4CC]/10 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                                        <Star className="w-3 h-3 fill-current" />
                                                        PRIMARY
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Address Details */}
                                    <div className="space-y-1.5 mb-4">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                            {address.name}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2">
                                            {address.addressLine}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {address.city}, {address.state} - {address.pincode}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-500">
                                            Phone: {address.phone}
                                        </p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2 pt-4 border-t border-gray-100 dark:border-slate-700 opacity-80 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleEdit(address)}
                                            className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-[#00C4CC] dark:text-gray-400 dark:hover:text-white transition-colors"
                                        >
                                            <Edit className="w-4 h-4" />
                                            Edit
                                        </button>

                                        {!address.isDefault && (
                                            <>
                                                <span className="text-gray-300 dark:text-slate-600">|</span>
                                                <button
                                                    onClick={() => handleSetDefault(address.id)}
                                                    disabled={settingDefaultId === address.id || isSettingDefault}
                                                    className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-amber-600 dark:text-gray-400 dark:hover:text-amber-500 transition-colors disabled:opacity-50"
                                                >
                                                    {settingDefaultId === address.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Star className="w-4 h-4" />
                                                    )}
                                                    Set Default
                                                </button>
                                                <span className="text-gray-300 dark:text-slate-600">|</span>
                                                <button
                                                    onClick={() => confirmDelete(address)}
                                                    disabled={deletingId === address.id || isDeleting}
                                                    className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                                                >
                                                    {deletingId === address.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="w-4 h-4" />
                                                    )}
                                                    Delete
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </>
            )}

            {/* Floating Action Button - Mobile Only */}
            {displayAddresses.length > 0 && (
                <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleAddNew}
                    className="lg:hidden fixed bottom-24 right-4 w-14 h-14 bg-linear-to-br from-[#0B1F51] to-[#00C4CC] text-white rounded-2xl shadow-lg shadow-[#0B1F51]/30 flex items-center justify-center z-40"
                    style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
                >
                    <Plus className="w-6 h-6" />
                </motion.button>
            )}

            {/* Address Form Modal */}
            <AddressFormModal
                isOpen={modalOpen}
                onClose={handleModalClose}
                address={editingAddress}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                isOpen={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
                title="Delete Address"
                message={`Are you sure you want to delete "${addressToDelete?.type}" address?`}
                confirmLabel="Delete"
                cancelLabel="Cancel"
                onConfirm={handleDelete}
                destructive
            />
        </div>
    );
}
