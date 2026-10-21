import { CartContent } from '@/components/cart/client/CartContent';
import { FreeShippingProgress } from '@/components/cart/client/FreeShippingProgress';
import { CartItemsList } from '@/components/cart/client/CartItemsList';
import { CartSummary } from '@/components/cart/client/CartSummary';
import { CartUpsellClient } from '@/components/cart/client/CartUpsellClient';
import { getUpsellProducts } from '@/lib/data/cart';

// ============================================================================
// Cart Page - Server Component with Client Islands
// ============================================================================
// Server-rendered cart page structure with client islands for interactivity

export default async function CartPage() {
  // Fetch data server-side
  const upsellProducts = await getUpsellProducts();

  return (
    <CartContent>
      <div className="min-h-screen bg-gray-50/50 dark:bg-slate-950 pt-32 pb-20">
        <div className="container mx-auto px-4 md:px-6">
          <h1 className="text-4xl font-bold text-[#0B1F51] dark:text-white mb-8">Shopping Cart</h1>

          <div className="grid lg:grid-cols-12 gap-8">
            {/* Left Column - Cart Items */}
            <div className="lg:col-span-8 space-y-6">
              {/* Free Shipping Progress - Client Island */}
              <FreeShippingProgress />

              {/* Items List - Client Island */}
              <CartItemsList />

              {/* Upsell Block */}
              {/* <div className="mt-8">
                <h2 className="text-xl font-bold text-[#0B1F51] dark:text-white mb-4">You might also like</h2>
                <CartUpsellClient products={upsellProducts} />
              </div> */}
            </div>

            {/* Right Column - Order Summary - Client Island */}
            <div className="lg:col-span-4">
              <CartSummary />
            </div>
          </div>
        </div>
      </div>
    </CartContent>
  );
}
