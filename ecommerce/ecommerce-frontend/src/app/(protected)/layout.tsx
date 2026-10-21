import { Header } from "@/components/header";
import { MainLayout } from "@/components/layout/MainLayout";
import { HideOnMobileProfile } from "@/components/layout/client/HideOnMobileProfile";

/**
 * Protected Routes Layout
 * 
 * This layout includes the Header and MainLayout for protected routes.
 * Auth check is performed by the middleware.
 * 
 * Note: Header is hidden on mobile for profile pages since they have
 * their own mobile navigation (MobileProfileHeader + MobileProfileNav).
 */
export default function ProtectedRoutesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <HideOnMobileProfile>
                <Header />
            </HideOnMobileProfile>
            <MainLayout>
                {children}
            </MainLayout>
        </>
    );
}

