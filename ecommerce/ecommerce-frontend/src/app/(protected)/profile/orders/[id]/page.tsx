import { OrderDetailView } from '@/components/profile/client/OrderDetailView';

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function OrderDetailsPage(props: PageProps) {
    const params = await props.params;
    return <OrderDetailView orderId={params.id} />;
}
