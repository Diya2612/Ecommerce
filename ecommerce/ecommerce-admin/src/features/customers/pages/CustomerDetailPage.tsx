import { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ROUTES } from "@/lib/constants";
import { CustomerForm } from "../components";
import type { CustomerFormData, UpdateCustomerPayload } from "../types/customer.types";
import type { ActivityItem } from '@/components/activity/types';
import { customerService } from "../services/customerService";
import { mapApiUserToCustomerFormData } from "../utils/apiMappers";
import { extractLocalPhoneNumber } from "../utils/phoneUtils";
import { toast } from "sonner";
import { useOrders } from "@/features/orders/hooks/useOrdersApi";
import { useCustomerPayments } from "../hooks/useCustomerPayments";
import { uploadService } from "@/services/uploadService";

export default function CustomerDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [fetchedCustomer, setFetchedCustomer] =
    useState<CustomerFormData | null>(null);

  // Fetch customer if not in store or to ensure fresh data
  useEffect(() => {
    const loadCustomer = async () => {
      if (!id) return;

      try {
        const data = await customerService.getCustomerById(id);

        // Map API response to CustomerFormData using shared mapper
        const mappedData = mapApiUserToCustomerFormData(data);
        setFetchedCustomer(mappedData);
      } catch (error) {
        console.error("Failed to load customer:", error);
        toast.error("Failed to load customer details");
      }
    };

    loadCustomer();
  }, [id]);

  // Pagination state
  const [ordersPage, setOrdersPage] = useState(1);
  const [paymentsPage, setPaymentsPage] = useState(1);
  const ORDERS_LIMIT = 10;
  const PAYMENTS_LIMIT = 10;

  // Fetch orders for this customer
  const { data: ordersWithPagination, isLoading: isOrdersLoading } = useOrders({
    user_id: id,
    limit: ORDERS_LIMIT,
    page: ordersPage,
    sort_by: "created_at",
    sort_order: "desc",
  });

  // Fetch payments for this customer
  const {
    payments,
    pagination: paymentsPagination,
    loading: isPaymentsLoading,
  } = useCustomerPayments({
    userId: id || "",
    limit: PAYMENTS_LIMIT,
    page: paymentsPage,
  });

  // Activity state
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isActivitiesLoading, setIsActivitiesLoading] = useState(false);
  const [activityFilter, setActivityFilter] = useState<string>('all');

  // Fetch customer activities
  useEffect(() => {
    const loadActivities = async () => {
      if (!id) return;
      setIsActivitiesLoading(true);
      try {
        const response = await customerService.getCustomerActivity(id, {
          limit: 50,
          category: activityFilter !== 'all' ? activityFilter : undefined,
        });
        setActivities(response.activities || []);
      } catch (error) {
        console.error("Failed to load activities:", error);
        setActivities([]);
      } finally {
        setIsActivitiesLoading(false);
      }
    };

    loadActivities();
  }, [id, activityFilter]);

  const orders = useMemo(() => {
    if (!ordersWithPagination?.data?.orders) return [];

    return ordersWithPagination.data.orders.map((order: any) => {
      // Map API status to UI status
      let status: "Delivered" | "Cancelled" | "Pending" | "Processing" =
        "Processing";
      const s = order.orderStatus?.toLowerCase();

      if (s === "delivered") status = "Delivered";
      else if (s === "cancelled" || s === "refunded") status = "Cancelled";
      else if (s === "pending") status = "Pending";
      else status = "Processing"; // confirmed, processing, shipped

      return {
        id: order.orderId,
        orderNumber: order.orderNumber,
        date: order.orderDate,
        itemCount: order.itemsCount || 0,
        status,
        amount: typeof order.grandTotal === "number" ? order.grandTotal : 0,
      };
    });
  }, [ordersWithPagination]);

  // Use fetched customer data
  const customerData = useMemo(() => {
    return fetchedCustomer;
  }, [fetchedCustomer]);

  const customerName = customerData
    ? `${customerData.firstName} ${customerData.lastName}`
    : "Loading...";

  const breadcrumbs = [
    { label: "Customers", href: ROUTES.CUSTOMERS.LIST },
    { label: customerName },
  ];

  const handleSubmit = async (data: CustomerFormData) => {
    if (!id) return;
    try {
      // 0. Handle Image Upload (Offline-First)
      let finalProfileImageUrl: string | undefined | null = typeof data.profileImage === "string" ? data.profileImage : undefined;

      if (data.profileImageFile) {
        toast.info("Uploading profile image...");
        const folder = `customers/${id}`;
        try {
          const response = await uploadService.uploadFile(data.profileImageFile, { folder });
          if (response?.file_url) {
            finalProfileImageUrl = response.file_url;
          }
        } catch (uploadError) {
          console.error("Failed to upload image:", uploadError);
          toast.error("Failed to upload profile image. Saving other details...");
          // Optional: stop here? Or continue saving without image?
        }
      } else if (data.profileImage === null) {
        // Explicit deletion
        finalProfileImageUrl = null; // sanitize will allow this now
      }

      // Helper to convert empty strings to undefined
      const sanitize = <T,>(val: T): T | undefined | null => {
        if (val === "") return undefined;
        // Allow null to pass through (for explicit deletion)
        if (val === null) return null;
        if (Array.isArray(val) && val.length === 0) return undefined;
        return val;
      };



      // Helper to map segment to valid enum
      const mapSegment = (seg?: string): ("new" | "regular" | "vip" | "at_risk")[] | undefined => {
        if (!seg) return undefined;
        const normalized = seg.toLowerCase().replace(/\s+/g, "_");
        const valid = ["new", "regular", "vip", "at_risk"] as const;
        return valid.includes(normalized as any) ? [normalized as any] : undefined;
      };

      const payload: UpdateCustomerPayload = {
        first_name: data.firstName.trim(),
        last_name: data.lastName.trim(),
        // Deprecated user_type removed

        tags:
          data.internalTags && data.internalTags.length > 0
            ? data.internalTags
            : undefined,
        date_of_birth: sanitize(data.dateOfBirth),
        gender: data.gender ? (data.gender.toLowerCase() as UpdateCustomerPayload["gender"]) : undefined,
        preferred_language: sanitize(data.language?.[0]),
        languages:
          data.language && data.language.length > 0 ? data.language : undefined,

        // Business Profile Fields (Deprecated - removed from backend schema)
        // company_legal_name, tax_id, credit_limit, payment_terms removed.

        // Profile Image
        profile_image_url: finalProfileImageUrl,

        // Customer Profile fields
        segments: mapSegment(data.segment?.[0]),
        notes: sanitize(data.internalNotes),
        account_status: data.status === 'Active' ? 'active' : 'inactive',
        store_credit_balance: data.creditBalance && data.creditBalance > 0 ? data.creditBalance : undefined,

        // Marketing
        marketing_opt_in:
          data.marketingPreferences?.includes("marketing") || undefined,
        sms_opt_in: data.marketingPreferences?.includes("sms") || undefined,
        email_opt_in: data.marketingPreferences?.includes("email") || undefined,
        whatsapp_opt_in:
          data.marketingPreferences?.includes("whatsapp") || undefined,

        // Risk & Loyalty & Subscription
        risk_profile: sanitize(data.riskProfile),
        loyalty_enrolled: data.loyaltyEnrolled || undefined,
        loyalty_tier: sanitize(data.loyaltyTier),
        loyalty_points:
          data.loyaltyPoints && data.loyaltyPoints > 0
            ? data.loyaltyPoints
            : undefined,
        loyalty_enrollment_date: sanitize(data.loyaltyEnrollmentDate),
        subscription_plan: sanitize(data.subscriptionPlan),
        subscription_status: sanitize(data.subscriptionStatus),
        billing_cycle: sanitize(data.billingCycle),
        subscription_start_date: sanitize(data.subscriptionStartDate),
        auto_renew: data.autoRenew || undefined,

        // Secondary contacts with verified status
        secondary_email: sanitize(data.secondaryEmail),
        secondary_email_type: sanitize(data.secondaryEmailType),
        secondary_phone_number: sanitize(data.secondaryPhone ? extractLocalPhoneNumber(data.secondaryPhone) : undefined),
        secondary_phone_type: sanitize(data.secondaryPhoneType),

        // Primary contacts
        phone_number: sanitize(data.phone ? extractLocalPhoneNumber(data.phone) : undefined),

        // Also send primary types
        email_type: sanitize(data.emailType),
        phone_type: sanitize(data.phoneType),
        // Include verified status for primary/secondary swap support
        email_verified: data.emailVerified ?? undefined,
        secondary_email_verified: data.secondaryEmailVerified ?? undefined,
        metadata: data.metadata,
      };

      // Remove undefined values (but keep nulls)
      const cleanPayload = Object.fromEntries(
        Object.entries(payload).filter(([_, v]) => v !== undefined),
      ) as UpdateCustomerPayload;

      // Call API to update customer
      await customerService.updateCustomer(id, cleanPayload);

      // Save addresses if present
      if (data.addresses && data.addresses.length > 0) {
        const mapAddressType = (type?: string): "home" | "office" | "other" => {
          if (!type) return "home";
          const lower = type.toLowerCase();
          if (lower === "home") return "home";
          if (lower === "office") return "office";
          return "other";
        };

        const addressPromises = data.addresses.map(async (addr) => {
          const mappedType = mapAddressType(addr.addressType);
          const addressPayload = {
            address_type: mappedType,
            address_name: mappedType === "other" ? (addr.name || "Custom Address") : undefined,
            name:
              addr.name ||
              `${data.firstName} ${data.lastName}`.trim() ||
              "Customer",
            phone: extractLocalPhoneNumber(data.phone) || "N/A",
            addressLine1: addr.streetAddress1 || "Address",
            addressLine2: addr.streetAddress2 || undefined,
            city: addr.city || "City",
            state: addr.state || "State",
            pincode: addr.pincode || "000000",
            country: addr.country || "India",
            isDefaultBilling: addr.isDefaultBilling,
            isDefaultShipping: addr.isDefaultShipping,
            deliveryInstructions: addr.landmark,
          };

          try {
            // Check if this is a real database UUID (not a temp/frontend ID)
            const isRealDbId =
              addr.id &&
              /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
                addr.id,
              );

            if (isRealDbId) {
              // Update existing address
              await customerService.updateAddress(id, addr.id, addressPayload);
            } else {
              // Create new address
              await customerService.createAddress(id, addressPayload);
            }
          } catch (addrError) {
            console.error("Failed to save address:", addrError);
          }
        });

        // Handle deleted addresses
        // Identify addresses that were in fetchedCustomer but are NOT in the current data.addresses
        // and have a real UUID (were not temp addresses)
        if (fetchedCustomer && fetchedCustomer.addresses) {
          const currentAddressIds = new Set(data.addresses.map((a) => a.id));
          const deletedAddresses = fetchedCustomer.addresses.filter(
            (originalAddr) => {
              const isRealDbId =
                originalAddr.id &&
                /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
                  originalAddr.id,
                );
              return isRealDbId && !currentAddressIds.has(originalAddr.id);
            },
          );

          deletedAddresses.forEach((addr) => {
            addressPromises.push(
              (async () => {
                try {
                  await customerService.deleteAddress(id, addr.id);
                } catch (err) {
                  console.error("Failed to delete address:", err);
                }
              })(),
            );
          });
        }

        await Promise.all(addressPromises);
      }

      toast.success("Customer updated successfully");

      // Redirect to list page
      navigate(ROUTES.CUSTOMERS.LIST);
    } catch (error: any) {
      console.error(error);

      // Extract error message, ensuring it's a string
      const rawMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "";
      const errorMessage =
        typeof rawMessage === "string"
          ? rawMessage
          : JSON.stringify(rawMessage);
      const errorLower = errorMessage.toLowerCase();

      // Check for duplicate email error
      const isDuplicateEmail =
        (errorLower.includes("email") ||
          errorLower.includes("unique_email") ||
          errorLower.includes("users_email_key")) &&
        (errorLower.includes("exist") ||
          errorLower.includes("duplicate") ||
          errorLower.includes("unique") ||
          errorLower.includes("already") ||
          errorLower.includes("constraint"));

      if (isDuplicateEmail || error?.response?.status === 409) {
        toast.error("Email already exists");
      } else {
        toast.error(errorMessage || "Failed to update customer");
      }
    } finally {
      // Finished
    }
  };

  const handleNavigateToOrder = (orderId: string) => {
    navigate(ROUTES.ORDERS.DETAIL(orderId));
  };

  // Removed loading spinner to faster perceived performance

  // The form will populate when data arrives

  return (
    <CustomerForm
      initialData={customerData || undefined}
      onSubmit={handleSubmit}
      isEditMode={true}
      breadcrumbs={breadcrumbs}
      customerName={customerName}
      customerId={id}
      orders={orders} // Pass orders
      payments={payments} // Pass payments
      ordersPagination={{
        currentPage: ordersPage,
        totalPages: ordersWithPagination?.data?.pagination?.totalPages || 1,
        onPageChange: setOrdersPage,
        isLoading: isOrdersLoading,
      }}
      paymentsPagination={{
        currentPage: paymentsPage,
        totalPages: paymentsPagination?.total_pages || 1,
        onPageChange: setPaymentsPage,
        isLoading: isPaymentsLoading,
      }}
      onNavigateToOrder={handleNavigateToOrder}
      // Activity timeline props
      activities={activities}
      isActivitiesLoading={isActivitiesLoading}
      activityFilter={activityFilter}
      onActivityFilterChange={setActivityFilter}
      onDelete={async () => {
        if (!id) return;
        try {
          // 1. Call API
          await customerService.deleteCustomer(id);

          // 2. Success & Redirect
          toast.success("Customer deleted successfully");
          navigate(ROUTES.CUSTOMERS.LIST);
        } catch (error) {
          console.error("Failed to delete customer:", error);
          toast.error("Failed to delete customer");
        }
      }}
    />
  );
}
