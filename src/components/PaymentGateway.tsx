import React, { useEffect, useState } from 'react';
import { Deal, RazorpayOptions, RazorpayPaymentResponse } from '../types';
import { usePayment } from '../hooks/usePayment';
import { LoadingSpinner } from './Common';
import { CreditCard, CheckCircle, AlertCircle, Info } from 'lucide-react';
import toast from 'react-hot-toast';

interface PaymentGatewayProps {
  deal: Deal;
  onPaymentSuccess?: () => void;
  onPaymentFail?: () => void;
}

/**
 * Payment Gateway Component
 * Handles Razorpay payment integration for deal completion fees
 */
export const PaymentGateway: React.FC<PaymentGatewayProps> = ({
  deal,
  onPaymentSuccess,
  onPaymentFail,
}) => {
  const { createOrder, verifyPayment, isLoading } = usePayment();
  const [paymentStep, setPaymentStep] = useState<'info' | 'processing' | 'completed' | 'failed'>(
    'info'
  );
  const [successFee, setSuccessFee] = useState(0);

  /**
   * Calculate success fee based on agreed rent
   */
  useEffect(() => {
    const calculateFee = (rentAmount: number): number => {
      if (rentAmount <= 10000) {
        return 500;
      } else if (rentAmount <= 25000) {
        return Math.round(rentAmount * 0.05);
      } else if (rentAmount <= 50000) {
        return Math.round(rentAmount * 0.04);
      } else {
        return Math.round(rentAmount * 0.03);
      }
    };

    const fee = calculateFee(deal.agreedRent);
    setSuccessFee(fee);
  }, [deal.agreedRent]);

  /**
   * Load Razorpay script
   */
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => {
        toast.error('Failed to load Razorpay. Please try again.');
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  /**
   * Handle Razorpay payment callback
   */
  const handleRazorpayCallback = async (response: RazorpayPaymentResponse) => {
    setPaymentStep('processing');

    const verified = await verifyPayment(response, deal.id);

    if (verified) {
      setPaymentStep('completed');
      setTimeout(() => {
        onPaymentSuccess?.();
      }, 1500);
    } else {
      setPaymentStep('failed');
      onPaymentFail?.();
    }
  };

  /**
   * Initiate payment
   */
  const handlePayment = async () => {
    // Check if Razorpay key is available
    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (!razorpayKey) {
      toast.error('Payment gateway is not configured. Please contact support.');
      return;
    }

    // Load Razorpay script
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) return;

    setPaymentStep('processing');

    // Create payment order
    const order = await createOrder(deal.id, successFee, deal.tenant?.phone || '');
    if (!order) {
      setPaymentStep('failed');
      onPaymentFail?.();
      return;
    }

    // Prepare Razorpay options
    const options: RazorpayOptions = {
      key: razorpayKey,
      amount: order.amountInPaise,
      currency: order.currency,
      name: 'RentDirect',
      description: `Platform fee for property rental agreement`,
      order_id: order.orderId,
      prefill: {
        name: deal.tenant?.firstName || '',
        email: deal.tenant?.email || '',
        contact: deal.tenant?.phone || '',
      },
      theme: {
        color: '#3b82f6',
      },
      handler: handleRazorpayCallback,
      modal: {
        ondismiss: () => {
          setPaymentStep('failed');
          toast.error('Payment cancelled');
          onPaymentFail?.();
        },
      },
    };

    // Open Razorpay checkout
    const razorpay = new (window as any).Razorpay(options);
    razorpay.open();
  };

  // Information step - show payment details
  if (paymentStep === 'info') {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Payment</h2>
          <p className="text-gray-600">
            A one-time platform fee is required to finalize the rental agreement
          </p>
        </div>

        {/* Payment Details */}
        <div className="bg-gray-50 rounded-lg p-5 mb-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <span className="text-gray-700">Property Monthly Rent:</span>
              <span className="font-semibold text-lg text-gray-900">
                ₹{new Intl.NumberFormat('en-IN').format(deal.agreedRent)}
              </span>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <span className="text-gray-700">Platform Success Fee:</span>
              <span className="font-semibold text-lg text-blue-600">
                ₹{new Intl.NumberFormat('en-IN').format(successFee)}
              </span>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-gray-900 font-bold">Total Amount Due:</span>
              <span className="text-2xl font-bold text-blue-600">
                ₹{new Intl.NumberFormat('en-IN').format(successFee)}
              </span>
            </div>
          </div>
        </div>

        {/* Fee Breakdown Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex gap-3">
          <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Platform Success Fee Calculation</p>
            <ul className="space-y-1 text-xs">
              <li>• Up to ₹10,000: ₹500</li>
              <li>• ₹10,001 - ₹25,000: 5% of rent</li>
              <li>• ₹25,001 - ₹50,000: 4% of rent</li>
              <li>• Above ₹50,000: 3% of rent</li>
            </ul>
          </div>
        </div>

        {/* Party Details */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 font-semibold mb-1">Tenant</p>
            <p className="text-lg font-semibold text-gray-900">
              {deal.tenant?.firstName} {deal.tenant?.lastName}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 font-semibold mb-1">Owner</p>
            <p className="text-lg font-semibold text-gray-900">
              {deal.owner?.firstName} {deal.owner?.lastName}
            </p>
          </div>
        </div>

        {/* Payment Button */}
        <button
          onClick={handlePayment}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <CreditCard className="h-5 w-5" />
          {isLoading ? 'Processing...' : 'Pay Securely with Razorpay'}
        </button>

        <p className="text-center text-xs text-gray-500 mt-4">
          Powered by Razorpay. Your payment is secure and encrypted.
        </p>
      </div>
    );
  }

  // Processing step - loading
  if (paymentStep === 'processing') {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <div className="flex justify-center mb-4">
          <LoadingSpinner size="md" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing Payment</h3>
        <p className="text-gray-600">Please wait while we process your payment...</p>
      </div>
    );
  }

  // Success step
  if (paymentStep === 'completed') {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle className="h-16 w-16 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h3>
        <p className="text-gray-600 mb-4">Your payment has been successfully processed.</p>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-green-800">
            <span className="font-semibold">Amount Paid:</span> ₹
            {new Intl.NumberFormat('en-IN').format(successFee)}
          </p>
          <p className="text-sm text-green-800 mt-2">
            <span className="font-semibold">Reference ID:</span> {deal.id}
          </p>
        </div>

        <p className="text-sm text-gray-600">
          You will be redirected shortly. Thank you for using RentDirect!
        </p>
      </div>
    );
  }

  // Failed step
  if (paymentStep === 'failed') {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="flex justify-center mb-4">
          <AlertCircle className="h-16 w-16 text-red-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h3>
        <p className="text-gray-600 mb-6">Something went wrong while processing your payment.</p>

        <button
          onClick={() => {
            setPaymentStep('info');
          }}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return null;
};
