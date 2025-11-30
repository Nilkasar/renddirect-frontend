import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { propertiesAPI, dealsAPI, chatAPI } from '../../lib/api';
import { Property, Deal, Conversation } from '../../types';
import { PropertyCard, LoadingSpinner, BackButton } from '../../components/Common';
import { Bookmark, MessageSquare, CheckCircle, Search, IndianRupee, Home } from 'lucide-react';
import toast from 'react-hot-toast';

const TenantDashboard: React.FC = () => {
  const [bookmarks, setBookmarks] = useState<Property[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'chats' | 'deals'>('bookmarks');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [bookmarksRes, conversationsRes, dealsRes] = await Promise.all([
        propertiesAPI.getBookmarks(),
        chatAPI.getConversations(),
        dealsAPI.getAll(),
      ]);

      if (bookmarksRes.data.success) {
        setBookmarks(bookmarksRes.data.data);
      }
      if (conversationsRes.data.success) {
        setConversations(conversationsRes.data.data);
      }
      if (dealsRes.data.success) {
        setDeals(dealsRes.data.data);
      }
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveBookmark = async (propertyId: string) => {
    try {
      await propertiesAPI.removeBookmark(propertyId);
      setBookmarks((prev) => prev.filter((p) => p.id !== propertyId));
      toast.success('Bookmark removed');
    } catch (error) {
      toast.error('Failed to remove bookmark');
    }
  };

  const formatRent = (amount: number) => {
    return new Intl.NumberFormat('en-IN').format(amount);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <BackButton fallbackPath="/tenant/home" className="mb-4" />
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
              <p className="text-gray-600">Track your saved properties and conversations</p>
            </div>
            <Link to="/properties" className="btn-primary flex items-center gap-2">
              <Search className="h-5 w-5" />
              Find Properties
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="card p-6 text-center">
            <Bookmark className="h-8 w-8 mx-auto mb-2 text-primary-600" />
            <div className="text-2xl font-bold">{bookmarks.length}</div>
            <div className="text-sm text-gray-500">Saved Properties</div>
          </div>
          <div className="card p-6 text-center">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold">{conversations.length}</div>
            <div className="text-sm text-gray-500">Active Chats</div>
          </div>
          <div className="card p-6 text-center">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
            <div className="text-2xl font-bold">
              {deals.filter((d) => d.status === 'COMPLETED').length}
            </div>
            <div className="text-sm text-gray-500">Deals Completed</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b mb-6">
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'bookmarks'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Saved ({bookmarks.length})
          </button>
          <button
            onClick={() => setActiveTab('chats')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'chats'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Chats ({conversations.length})
          </button>
          <button
            onClick={() => setActiveTab('deals')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'deals'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Deals ({deals.length})
          </button>
        </div>

        {/* Content */}
        {activeTab === 'bookmarks' && (
          <div>
            {bookmarks.length === 0 ? (
              <div className="text-center py-12">
                <Bookmark className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No saved properties
                </h3>
                <p className="text-gray-500 mb-4">
                  Save properties you like to view them later
                </p>
                <Link to="/properties" className="btn-primary">
                  Browse Properties
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bookmarks.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    showBookmark
                    isBookmarked
                    onBookmark={handleRemoveBookmark}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'chats' && (
          <div>
            {conversations.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No conversations yet
                </h3>
                <p className="text-gray-500 mb-4">
                  Start chatting with property owners
                </p>
                <Link to="/properties" className="btn-primary">
                  Find Properties
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {conversations.map((conv) => (
                  <Link
                    key={conv.id}
                    to={`/messages/${conv.id}`}
                    className="card p-4 flex items-center gap-4 hover:shadow-lg transition-shadow"
                  >
                    <div className="w-20 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      {conv.property.images?.[0] ? (
                        <img
                          src={conv.property.images[0]}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Home className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {conv.property.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Owner: {conv.owner.firstName} {conv.owner.lastName}
                      </p>
                    </div>
                    {conv.deal && (
                      <span
                        className={
                          conv.deal.status === 'COMPLETED'
                            ? 'badge-success'
                            : 'badge-warning'
                        }
                      >
                        {conv.deal.status === 'COMPLETED' ? 'Deal Done' : 'Pending'}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'deals' && (
          <div>
            {deals.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No deals yet
                </h3>
                <p className="text-gray-500 mb-4">
                  Complete your first rental deal on the platform
                </p>
                <Link to="/properties" className="btn-primary">
                  Browse Properties
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {deals.map((deal) => (
                  <div key={deal.id} className="card p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">
                          {deal.property?.title}
                        </h3>
                        <p className="text-gray-500">
                          {deal.property?.city}
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                          Owner: {deal.owner?.firstName} {deal.owner?.lastName}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center text-xl font-bold text-gray-900">
                          <IndianRupee className="h-5 w-5" />
                          {formatRent(deal.agreedRent)}
                          <span className="text-sm font-normal text-gray-500 ml-1">
                            /month
                          </span>
                        </div>
                        <span
                          className={`mt-2 inline-block ${
                            deal.status === 'COMPLETED'
                              ? 'badge-success'
                              : 'badge-warning'
                          }`}
                        >
                          {deal.status}
                        </span>
                      </div>
                    </div>
                    {deal.status === 'COMPLETED' && deal.successFeeAmount && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-gray-600">
                          Success fee paid: <span className="font-medium">₹{deal.successFeeAmount}</span>
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TenantDashboard;
