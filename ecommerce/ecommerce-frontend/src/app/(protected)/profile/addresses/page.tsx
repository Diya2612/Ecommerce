import { AddressManager } from '@/components/profile/client/AddressManager';
import { PageContainer } from '@/components/profile/client/PageContainer';

// ============================================================================
// Addresses Page - Server Component (Protected Route)
// ============================================================================
// Addresses are fetched client-side via React Query for consistency

export default function AddressesPage() {
    return (
        <PageContainer
            title="Addresses"
            description="Manage your shipping addresses"
            iconName="MapPin"
            color="text-orange-600"
            bgColor="bg-orange-50 dark:bg-orange-900/20"
        >
            <AddressManager />
        </PageContainer>
    );
}
