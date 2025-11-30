import { useState, useCallback } from 'react';
import { PaymentOrder, RazorpayPaymentResponse } from '../types';
import { paymentsAPI } from '../lib/api';
import toast from 'react-hot-toast';

export interface UsePaymentResult {
  createOrder: (dealId: string, amount: number, phone: string) => Promise<PaymentOrder | null>;
  verifyPayment: (
    response: RazorpayPaymentResponse,
    dealId: string
  ) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Custom hook for handling Razorpay payment flow
 */
export const usePayment = (): UsePaymentResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Create a payment order
   */
  const createOrder = useCallback(
    async (dealId: string, amount: number, phone: string): Promise<PaymentOrder | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await paymentsAPI.createOrder({
          dealId,
          amount,
          phone,
        });

        if (response.data.success && response.data.data) {
          return response.data.data;
        } else {
          setError(response.data.error || 'Failed to create payment order');
          toast.error('Failed to create payment order');
          return null;
        }
      } catch (err: any) {
        const errorMsg = err.message || 'Failed to create payment order';
        setError(errorMsg);
        toast.error(errorMsg);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Verify payment signature
   */
  const verifyPayment = useCallback(
    async (response: RazorpayPaymentResponse, dealId: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const verifyResponse = await paymentsAPI.verifyPayment({
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
          dealId,
        });

        if (verifyResponse.data.success) {
          toast.success('Payment completed successfully!');
          return true;
        } else {
          const errorMsg = verifyResponse.data.error || 'Payment verification failed';
          setError(errorMsg);
          toast.error(errorMsg);
          return false;
        }
      } catch (err: any) {
        const errorMsg = err.message || 'Payment verification failed';
        setError(errorMsg);
        toast.error(errorMsg);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    createOrder,
    verifyPayment,
    isLoading,
    error,
  };
};
