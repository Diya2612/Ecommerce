import { PageContainer } from '@/components/profile/client/PageContainer';
import { OrdersTab } from '@/components/profile/server/OrdersTab';

export default function OrdersPage() {
    return (
        <PageContainer
            title="My Orders"
            description="Track, return, or buy things again"
            iconName="ShoppingBag"
            color="text-blue-600"
            bgColor="bg-blue-50 dark:bg-blue-900/20"
        >
            <OrdersTab />
        </PageContainer>
    );
}
