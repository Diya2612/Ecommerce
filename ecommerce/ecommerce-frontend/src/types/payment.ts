export interface CreatePaymentOrderResponse {
    razorpay_order_id: string;
    amount: number;
    currency: string;
    order_number: string;
    prefill?: {
        name?: string;
        email?: string;
        contact?: string;
    };
    razorpay_key_id: string;
}

export interface VerifyPaymentRequest {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

export interface VerifyPaymentResponse {
    success: boolean;
    message: string;
    order_id?: string;
}
