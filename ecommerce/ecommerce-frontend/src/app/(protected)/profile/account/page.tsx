import { PageContainer } from '@/components/profile/client/PageContainer';
import { AccountLayoutClient } from '@/components/profile/client/AccountLayoutClient';

export default function AccountPage() {
    return (
        <PageContainer
            title="Account"
            description="Profile, password & preferences"
            iconName="Settings"
            color="text-gray-600"
            bgColor="bg-gray-50 dark:bg-gray-800"
        >
            <AccountLayoutClient />
        </PageContainer>
    );
}
