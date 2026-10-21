import { Suspense } from 'react';
import { SuccessPageSkeleton } from '@/components/checkout/skeletons/SuccessPageSkeleton';
import { OrderSuccessClient } from '@/components/checkout/client/OrderSuccessClient';

interface OrderSuccessPageProps {
    searchParams: Promise<{
        orderId?: string;
        [key: string]: string | string[] | undefined;
    }>;
}

export default async function OrderSuccessPage({ searchParams }: OrderSuccessPageProps) {
    const resolvedParams = await searchParams;
    const orderId = resolvedParams.orderId;

    return (
        <Suspense fallback={<SuccessPageSkeleton />}>
            <OrderSuccessClient initialOrderId={orderId} />
        </Suspense>
    );
}
