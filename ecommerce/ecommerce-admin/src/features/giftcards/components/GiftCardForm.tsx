import React from 'react';
import { useGiftCardForm } from '../hooks/useGiftCardForm';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PageHeader } from '@/components/layouts/headers';

import { GiftCardInfo } from "./form/GiftCardInfo";
import { PersonalisationOptions } from "./form/PersonalisationOptions";
import { DeliveryOptions } from "./form/DeliveryOptions";
import { SecurityAttributes } from "./form/SecurityAttributes";
import { RedemptionData } from "./form/RedemptionData";
import { ValuePricing } from "./form/ValuePricing";
import { ValidityRules } from "./form/ValidityRules";
import { StatusTracking } from "./form/StatusTracking";

export const GiftCardForm: React.FC = () => {
  const {
    isEditMode,
    formData,
    handleChange,
    dateRange,
    setDateRange,
    giftCardCode,
    giftCardBalance,
    giftCardStatus,
    redemptionCount,
    handleSubmit,
    navigate,
  } = useGiftCardForm();

  return (
    <div className="flex-1 w-full">
      <PageHeader
        title={isEditMode ? (giftCardCode || "Edit Gift Card") : "Create New Gift Card"}
        subtitle={isEditMode ? undefined : "Configure gift card settings and details"}
        breadcrumbs={[
          { label: 'Gift Cards', onClick: () => navigate("/giftcards") },
          { label: isEditMode ? 'Edit' : 'Add New', active: true }
        ]}
        backIcon="arrow"
        onBack={() => navigate("/giftcards")}
        titleSuffix={isEditMode && (
          <>
            <span className={cn(
              "px-2 py-0.5 rounded-full text-xs font-medium",
              giftCardStatus === "active" && "bg-emerald-50 text-emerald-700",
              giftCardStatus === "redeemed" && "bg-blue-50 text-blue-700",
              giftCardStatus === "expired" && "bg-red-50 text-red-700",
              giftCardStatus === "inactive" && "bg-gray-100 text-gray-600"
            )}>
              {giftCardStatus}
            </span>
            {giftCardBalance > 0 && (
              <span className="text-sm text-muted-foreground">
                • ₹{giftCardBalance} balance
              </span>
            )}
            {redemptionCount > 0 && (
              <span className="text-sm text-muted-foreground">
                • {redemptionCount} redemptions
              </span>
            )}
          </>
        )}
        actions={
          <div className="flex gap-3">
            <Button variant="outline" className="h-10" onClick={() => navigate("/giftcards")}>
              Discard
            </Button>
            <Button
              className="h-10 bg-[#0e032f] hover:bg-[#0e032f]/90"
              onClick={handleSubmit}
            >
              {isEditMode ? "Update Gift Card" : "Save Gift Card"}
            </Button>
          </div>
        }
      />

      <div className="px-6 lg:px-8 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (Main Details) */}
          <div className="lg:col-span-8 space-y-6">
            <GiftCardInfo
              title={formData.title}
              code={formData.code}
              category={formData.category}
              onChange={handleChange}
            />
            <PersonalisationOptions
              senderName={formData.senderName}
              receiverName={formData.receiverName}
              message={formData.message}
              emailTemplate={formData.emailTemplate}
              onChange={handleChange}
            />
            <DeliveryOptions
              deliveryMethod={formData.deliveryMethod}
              receiverEmail={formData.receiverEmail}
              scheduleDelivery={formData.scheduleDelivery}
              onChange={handleChange}
            />
            <SecurityAttributes
              securityPin={formData.securityPin}
              onChange={handleChange}
            />
            <RedemptionData
              balance={giftCardBalance}
              redemptionCount={redemptionCount}
            />
          </div>

          {/* Right Column (Settings & Status) */}
          <div className="lg:col-span-4 space-y-6">
            <ValuePricing
              value={formData.value}
              price={formData.price}
              currency={formData.currency}
              taxApplicable={formData.taxApplicable}
              onChange={handleChange}
            />
            <ValidityRules
              startDate={dateRange.from}
              endDate={dateRange.to}
              minOrderValue={formData.minOrderValue}
              multipleCards={formData.multipleCards}
              usageType={formData.usageType}
              onDateChange={setDateRange}
              onChange={handleChange}
            />
            <StatusTracking
              status={formData.status}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
