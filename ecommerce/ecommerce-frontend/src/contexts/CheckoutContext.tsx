"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

interface CheckoutContextType {
  selectedAddressId: string | null;
  setSelectedAddressId: (id: string | null) => void;
  selectedPaymentMethod: string;
  setSelectedPaymentMethod: (method: string) => void;
  isPaymentProcessing: boolean;
  setIsPaymentProcessing: (isProcessing: boolean) => void;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('razorpay');
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

  return (
    <CheckoutContext.Provider
      value={{
        selectedAddressId,
        setSelectedAddressId,
        selectedPaymentMethod,
        setSelectedPaymentMethod,
        isPaymentProcessing,
        setIsPaymentProcessing
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout() {
  const context = useContext(CheckoutContext);
  if (context === undefined) {
    throw new Error('useCheckout must be used within a CheckoutProvider');
  }
  return context;
}
