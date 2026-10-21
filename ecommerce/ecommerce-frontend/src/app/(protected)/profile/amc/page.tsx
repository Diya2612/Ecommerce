import { AMCTab } from '@/components/profile/server/AMCTab';
import { getUserAMCPlans } from '@/lib/data/profile';

import { PageContainer } from '@/components/profile/client/PageContainer';

import type { AMCPlan } from '@/lib/data/profile/types';

export default async function AMCPage() {
    let amcPlans: AMCPlan[] = [];

    try {
        amcPlans = await getUserAMCPlans();
    } catch (error) {
        console.error('AMC page fetch error:', error);
    }

    return (
        <PageContainer
            title="AMC Plans"
            description="Annual maintenance contracts"
            iconName="Award"
            color="text-green-600"
            bgColor="bg-green-50 dark:bg-green-900/20"
        >
            <AMCTab amcPlans={amcPlans} />
        </PageContainer>
    );
}
