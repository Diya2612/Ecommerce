import { Header } from "@/components/header";
import { MainLayout } from "@/components/layout/MainLayout";

/**
 * Main Routes Layout
 * 
 * This layout includes the Header and MainLayout (with Footer)
 * for all public routes like home, products, collection, etc.
 */
export default function MainRoutesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
