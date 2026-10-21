import { Suspense } from 'react';
import { CheckoutBanner } from '@/components/checkout/CheckoutBanner';
import { CartItemsDisplay } from '@/components/checkout/server/CartItemsDisplay';
import { ShippingAddressSection } from '@/components/checkout/client/ShippingAddressSection';
import { PaymentMethodDisplay } from '@/components/checkout/server/PaymentMethodDisplay';
import { OrderSummary } from '@/components/checkout/server/OrderSummaryDisplay';
import { CheckoutUpsellClient } from '@/components/checkout/client/CheckoutUpsellClient';
import { CheckoutGuard } from '@/components/checkout/client/CheckoutGuard';

import { CheckoutProvider } from '@/contexts/CheckoutContext';
import { getUpsellProducts } from '@/lib/data/checkout';

// ============================================================================
// Checkout Page - Server Component (Protected Route)
// ============================================================================
// Addresses are now fetched client-side via React Query for consistency

export const dynamic = 'force-dynamic';

export default async function CheckoutPage() {
    // Only fetch upsell products server-side
    const upsellProducts = await getUpsellProducts();

    return (
        <CheckoutProvider>
            <Suspense fallback={null}>
                <CheckoutGuard>
                    <CheckoutBanner />

                    <div className="bg-white dark:bg-slate-950">
                        <div className="container mx-auto px-4 md:px-6 py-12">
                            <div className="grid lg:grid-cols-12 gap-8">
                                {/* Left Column - Checkout Sections */}
                                <div className="lg:col-span-7 space-y-6">
                                    <CartItemsDisplay />
                                    <PaymentMethodDisplay />
                                    <OrderSummary />
                                </div>

                                {/* Right Column - Delivery Address & Upsell */}
                                <div className="lg:col-span-5 space-y-6">
                                    <ShippingAddressSection />
                                    <CheckoutUpsellClient products={upsellProducts} />
                                </div>
                            </div>
                        </div>
                    </div>
                </CheckoutGuard>
            </Suspense>
        </CheckoutProvider>
    );
}
