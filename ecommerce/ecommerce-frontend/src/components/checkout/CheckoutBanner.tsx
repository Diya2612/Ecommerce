import { CheckoutProgressSteps } from './client/CheckoutProgressSteps';
import { PageBanner } from '@/components/layout/PageBanner';

// ============================================================================
// CheckoutBanner Component
// ============================================================================

export function CheckoutBanner() {
  return (
    <PageBanner
      badge="SECURE CHECKOUT"
      badgeVariant="green"
      title="Complete Your Order"
      description="You're just a few steps away from pure, healthy water"
      align="center"
      height="xl"
      maxWidth="xl"
      showDecorativeBlurs={true}
      showWaveSeparator={true}
    >
      <div className="w-full flex justify-center">
        <div className="w-full max-w-xl">
          <CheckoutProgressSteps />
        </div>
      </div>
    </PageBanner>
  );
}
