
import { Footer } from "@/components/home/Footer";
import { LayoutOverlays } from "./client/LayoutOverlays";
import { getRecommendedProducts, getUpsellProducts } from "@/lib/data/cart";
import { HideOnMobileProfile } from "./client/HideOnMobileProfile";

export async function MainLayout({ children }: { children: React.ReactNode }) {
  // Fetch data for global cart drawer on the server
  // This ensures the data is ready for initial hydration and interactive elements
  const [recommendedProducts, upsellProducts] = await Promise.all([
    getRecommendedProducts(),
    getUpsellProducts()
  ]);

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-950 font-sans text-[#1C2A54] dark:text-white">


      {/* Main Content - Grows to fill space (sticky footer pattern) */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer - Hidden on mobile for profile pages */}
      <HideOnMobileProfile>
        <Footer />
      </HideOnMobileProfile>

      {/* Global Overlays - Cart Drawer, Chat Widget */}
      <LayoutOverlays
        recommendedProducts={recommendedProducts}
        upsellProducts={upsellProducts}
      />
    </div>
  );
}

