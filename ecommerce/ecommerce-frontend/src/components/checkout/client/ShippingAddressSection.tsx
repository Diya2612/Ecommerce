"use client";

import { motion } from 'motion/react';
import { useAddresses } from '@/hooks/queries/useAddresses';
import { ShippingAddressClient } from './ShippingAddressClient';
import { AddressListSkeleton } from '../skeletons/AddressListSkeleton';

// ============================================================================
// ShippingAddressSection - Client Component
// ============================================================================
// Wrapper that handles data fetching via React Query
// Replaces the old server component pattern

export function ShippingAddressSection() {
    const { isLoading } = useAddresses();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-slate-900 rounded-card border border-black/6 dark:border-slate-800 p-5"
        >
            <h3 className="text-[20px] font-semibold text-[#0B1F51] dark:text-white mb-4 tracking-[-0.01em]">
                Delivery Address
            </h3>
            <p className="text-[13px] text-gray-600 dark:text-gray-400 mb-4">
                Select or add a delivery address
            </p>

            {isLoading ? (
                <AddressListSkeleton count={2} />
            ) : (
                <ShippingAddressClient />
            )}
        </motion.div>
    );
}
