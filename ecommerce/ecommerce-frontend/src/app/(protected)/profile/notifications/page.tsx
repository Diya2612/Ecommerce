import { NotificationList } from '@/components/notifications/NotificationList';
import { PageContainer } from '@/components/profile/client/PageContainer';

export const metadata = {
    title: 'Notifications | Anant Enterprises',
    description: 'View and manage your notifications',
};

export default function NotificationsPage() {
    return (
        <PageContainer
            title="Notifications"
            description="Stay updated with your latest alerts and messages"
            iconName="Bell"
            color="text-blue-600"
            bgColor="bg-blue-50 dark:bg-blue-900/20"
        >
            <NotificationList />
        </PageContainer>
    );
}
