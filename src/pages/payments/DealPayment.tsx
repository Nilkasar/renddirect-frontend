import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// API clients (uncomment and use when actual endpoints are available)
// import { dealsAPI, paymentsAPI } from '../../lib/api';
import { Deal } from '../../types';
import { PaymentGateway } from '../../components/PaymentGateway';
import { LoadingSpinner, BackButton } from '../../components/Common';
import { AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const DealPayment: React.FC = () => {
  const { dealId } = useParams<{ dealId: string }>();
  const navigate = useNavigate();

  const [deal, setDeal] = useState<Deal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch deal and payment data
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!dealId) {
          setError('Deal ID is required');
          return;
        }

        // In a real app, you would fetch from /deals/:dealId endpoint
        // For now we create a minimal placeholder deal so the page can render during demo
        // This should be replaced with an API call using `dealsAPI.getDeal(dealId)`
        toast('Loading deal information...');

        setDeal({
          id: dealId,
          propertyId: 'property_demo',
          ownerId: 'owner_demo',
          tenantId: 'tenant_demo',
          conversationId: 'conv_demo',
          agreedRent: 10000,
          ownerConfirmed: true,
          tenantConfirmed: true,
          status: 'COMPLETED',
          paymentStatus: 'PENDING',
          createdAt: new Date().toISOString(),
          property: {
            id: 'property_demo',
            ownerId: 'owner_demo',
            title: 'Demo Property',
            description: 'Demo description',
            city: 'Demo City',
            locality: 'Demo Locality',
            address: 'Demo Address',
            propertyType: 'FLAT',
            roomConfig: 'ONE_BHK',
            furnishing: 'SEMI_FURNISHED',
            rentAmount: 10000,
            depositAmount: 20000,
            tenantPreference: [],
            amenities: [],
            images: [],
            status: 'ACTIVE',
            viewCount: 0,
            createdAt: new Date().toISOString(),
          },
          owner: { id: 'owner_demo', email: 'owner@demo.com', firstName: 'Owner', lastName: 'Demo', role: 'OWNER', status: 'ACTIVE', createdAt: new Date().toISOString() },
          tenant: { id: 'tenant_demo', email: 'tenant@demo.com', firstName: 'Tenant', lastName: 'Demo', role: 'TENANT', status: 'ACTIVE', createdAt: new Date().toISOString() },
        });

        setIsLoading(false);
      } catch (err: any) {
        const errorMsg = err.message || 'Failed to load deal';
        setError(errorMsg);
        toast.error(errorMsg);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [dealId]);

  /**
   * Handle successful payment
   */
  const handlePaymentSuccess = () => {
    toast.success('Payment processed! Your deal is now complete.');
    setTimeout(() => {
      navigate('/tenant/home', { replace: true });
    }, 2000);
  };

  /**
   * Handle failed payment
   */
  const handlePaymentFail = () => {
    toast.error('Payment failed. Please try again.');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <BackButton className="mb-6" fallbackPath="/tenant/home" />

          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Deal</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <BackButton className="mb-6" fallbackPath="/tenant/home" />

          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <AlertCircle className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Deal Not Found</h1>
            <p className="text-gray-600 mb-6">The deal you are looking for does not exist.</p>
            <button
              onClick={() => navigate(-1)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <BackButton className="mb-4" fallbackPath="/tenant/home" />
          <h1 className="text-3xl font-bold text-gray-900">Complete Your Deal</h1>
          <p className="text-gray-600 mt-2">
            Finalize your rental agreement by completing the payment
          </p>
        </div>

        {/* Deal Summary Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Deal Summary</h2>

          <div className="space-y-3">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <span className="text-gray-700">Property:</span>
              <span className="font-semibold text-gray-900">{deal.property?.title}</span>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <span className="text-gray-700">Owner:</span>
              <span className="font-semibold text-gray-900">
                {deal.owner?.firstName} {deal.owner?.lastName}
              </span>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <span className="text-gray-700">Agreed Monthly Rent:</span>
              <span className="font-semibold text-lg text-blue-600">
                ₹{new Intl.NumberFormat('en-IN').format(deal.agreedRent)}
              </span>
            </div>

            <div className="flex justify-between items-center pt-3">
              <span className="text-gray-700">Status:</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                {deal.status === 'COMPLETED' ? 'Confirmed by Both' : 'Pending Confirmation'}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Gateway Section */}
        <div className="mb-8">
          {deal.paymentStatus === 'PAID' ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Already Completed</h2>
              <p className="text-gray-600 mb-6">
                Your payment has been successfully processed for this deal.
              </p>
              <button
                onClick={() => navigate('/tenant/home')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg"
              >
                Go to Home
              </button>
            </div>
          ) : (
            <PaymentGateway
              deal={deal}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentFail={handlePaymentFail}
            />
          )}
        </div>

        {/* Security Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">🔒 Secure & Transparent</h3>
          <ul className="space-y-2 text-blue-800 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-lg">✓</span>
              <span>Your payment information is encrypted using 256-bit SSL technology</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-lg">✓</span>
              <span>We use Razorpay, India's trusted payment gateway</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-lg">✓</span>
              <span>The platform success fee is completely refundable if the deal fails</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-lg">✓</span>
              <span>You will receive a receipt and transaction confirmation</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DealPayment;
