import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MOCK_GIFT_CARDS } from "../data/giftcard.constants";

export const useGiftCardForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  // Form State
  const [formData, setFormData] = useState({
    code: "",
    title: "",
    category: "general",
    type: "fixed",
    value: "",
    price: "",
    currency: "INR",
    taxApplicable: false,
    minOrderValue: "",
    multipleCards: true,
    usageType: "multiple",
    status: "active",
    senderName: "",
    receiverName: "",
    message: "",
    emailTemplate: "generic",
    deliveryMethod: "both",
    receiverEmail: "",
    scheduleDelivery: false,
    securityPin: "",
  });

  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });

  // Derived state for compatibility
  const giftCardCode = formData.code;
  const giftCardBalance = Number(formData.value) || 0; // Simplified for display
  const giftCardStatus = formData.status;
  const redemptionCount = 0; // Mock

  // Load gift card data for edit mode
  useEffect(() => {
    if (isEditMode && id) {
      const giftCard = MOCK_GIFT_CARDS.find((g) => g.id === id);
      if (giftCard) {
        setFormData((prev) => ({
          ...prev,
          code: giftCard.code,
          title: giftCard.title,
          value: giftCard.value.toString(),
          price: giftCard.value.toString(),
          status: giftCard.status as any,
          receiverName: giftCard.recipient_name || "",
          receiverEmail: giftCard.recipient_email || "",
        }));

        if (giftCard.created_at) {
          const createdAt = giftCard.created_at;
          setDateRange(prev => ({ ...prev, from: new Date(createdAt) }));
        }
        if (giftCard.expires_at) {
          const expiresAt = giftCard.expires_at;
          setDateRange(prev => ({ ...prev, to: new Date(expiresAt) }));
        }
      }
    }
  }, [isEditMode, id]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    console.log("Submitting gift card form...", formData);
  };

  return {
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
  };
};
