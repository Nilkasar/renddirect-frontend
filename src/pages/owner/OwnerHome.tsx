import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { propertiesAPI, dealsAPI, chatAPI } from '../../lib/api';
import { Property, Deal, Conversation } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../../components/Common';
import {
  Plus, Building, Eye, MessageSquare, CheckCircle,
  ArrowRight, Home, Users, BarChart3, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const OwnerHome: React.FC = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [stats, setStats] = useState({
    totalProperties: 0,
    activeProperties: 0,
    rentedProperties: 0,
    draftProperties: 0,
    totalViews: 0,
    totalChats: 0,
    totalDeals: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [propertiesRes, statsRes, dealsRes, chatsRes] = await Promise.all([
        propertiesAPI.getMyProperties(),
        propertiesAPI.getOwnerStats(),
        dealsAPI.getAll(),
        chatAPI.getConversations(),
      ]);

      if (propertiesRes.data.success) {
        setProperties(propertiesRes.data.data);
      }
      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }
      if (dealsRes.data.success) {
        setDeals(dealsRes.data.data);
      }
      if (chatsRes.data.success) {
        setConversations(chatsRes.data.data);
      }
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatRent = (amount: number) => {
    return new Intl.NumberFormat('en-IN').format(amount);
  };

  const pendingDeals = deals.filter(d => d.status !== 'COMPLETED' && d.status !== 'CANCELLED');
  const recentChats = conversations.slice(0, 5);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Welcome Header */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold">
                Welcome back, {user?.firstName}! 🏠
              </h1>
              <p className="text-blue-100 mt-1">
                Manage your properties and connect with potential tenants
              </p>
            </div>
            <Link
              to="/owner/properties/new"
              className="btn bg-white text-blue-600 hover:bg-blue-50 flex items-center gap-2 self-start"
            >
              <Plus className="h-5 w-5" />
              Add New Property
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="card p-5 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Properties</p>
                <p className="text-3xl font-bold">{stats.totalProperties}</p>
              </div>
              <Building className="h-10 w-10 text-blue-200" />
            </div>
            <div className="mt-3 flex gap-3 text-sm">
              <span className="text-green-200">{stats.activeProperties} active</span>
              <span className="text-yellow-200">{stats.draftProperties} draft</span>
            </div>
          </div>

          <div className="card p-5 bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Total Views</p>
                <p className="text-3xl font-bold">{stats.totalViews}</p>
              </div>
              <Eye className="h-10 w-10 text-green-200" />
            </div>
            <div className="mt-3 text-sm text-green-200">
              Across all properties
            </div>
          </div>

          <div className="card p-5 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Enquiries</p>
                <p className="text-3xl font-bold">{stats.totalChats}</p>
              </div>
              <MessageSquare className="h-10 w-10 text-purple-200" />
            </div>
            <div className="mt-3 text-sm text-purple-200">
              {conversations.length} active chats
            </div>
          </div>

          <div className="card p-5 bg-gradient-to-br from-yellow-500 to-orange-500 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">Deals Closed</p>
                <p className="text-3xl font-bold">{stats.totalDeals}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-yellow-200" />
            </div>
            <div className="mt-3 text-sm text-yellow-200">
              {stats.rentedProperties} properties rented
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Alerts/Pending Actions */}
            {pendingDeals.length > 0 && (
              <div className="card bg-yellow-50 border border-yellow-200 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-yellow-800">Action Required</h3>
                    <p className="text-yellow-700 text-sm">
                      You have {pendingDeals.length} pending deal(s) waiting for confirmation.
                    </p>
                    <Link to="/messages" className="text-yellow-600 hover:underline text-sm font-medium">
                      View Chats →
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* My Properties */}
            <div className="card">
              <div className="p-4 border-b flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Home className="h-5 w-5 text-gray-500" />
                  My Properties
                </h2>
                <Link to="/owner/dashboard" className="text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1">
                  View all <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {properties.length === 0 ? (
                <div className="p-8 text-center">
                  <Building className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">No properties yet</h3>
                  <p className="text-gray-500 mb-4">Start by listing your first property</p>
                  <Link to="/owner/properties/new" className="btn-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Property
                  </Link>
                </div>
              ) : (
                <div className="divide-y">
                  {properties.slice(0, 4).map((property) => (
                    <div key={property.id} className="p-4 flex items-center gap-4 hover:bg-gray-50">
                      <div className="w-20 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        {property.images?.[0] ? (
                          <img src={property.images[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Building className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link to={`/properties/${property.id}`} className="font-medium text-gray-900 hover:text-primary-600 truncate block">
                          {property.title}
                        </Link>
                        <p className="text-sm text-gray-500">{property.locality}, {property.city}</p>
                        <div className="flex items-center gap-4 mt-1 text-sm">
                          <span className="flex items-center gap-1 text-gray-500">
                            <Eye className="h-3 w-3" /> {property.viewCount}
                          </span>
                          <span className="flex items-center gap-1 text-gray-500">
                            <MessageSquare className="h-3 w-3" /> {property._count?.conversations || 0}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">₹{formatRent(property.rentAmount)}</div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          property.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                          property.status === 'RENTED' ? 'bg-blue-100 text-blue-700' :
                          property.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {property.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Deals */}
            {deals.length > 0 && (
              <div className="card">
                <div className="p-4 border-b flex items-center justify-between">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-gray-500" />
                    Recent Deals
                  </h2>
                </div>
                <div className="divide-y">
                  {deals.slice(0, 3).map((deal) => (
                    <div key={deal.id} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{deal.property?.title}</p>
                        <p className="text-sm text-gray-500">
                          Tenant: {deal.tenant?.firstName} {deal.tenant?.lastName}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">₹{formatRent(deal.agreedRent)}/mo</div>
                        <span className={deal.status === 'COMPLETED' ? 'badge-success' : 'badge-warning'}>
                          {deal.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Chats */}
            <div className="card">
              <div className="p-4 border-b flex items-center justify-between">
                <h2 className="font-semibold flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-gray-500" />
                  Recent Chats
                </h2>
                <Link to="/messages" className="text-primary-600 hover:text-primary-700 text-sm">
                  View all
                </Link>
              </div>

              {recentChats.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No messages yet</p>
                </div>
              ) : (
                <div className="divide-y">
                  {recentChats.map((chat) => (
                    <Link
                      key={chat.id}
                      to={`/messages/${chat.id}`}
                      className="p-3 flex items-center gap-3 hover:bg-gray-50"
                    >
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Users className="h-5 w-5 text-primary-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {chat.tenant.firstName} {chat.tenant.lastName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{chat.property.title}</p>
                      </div>
                      {chat.lastMessageAt && (
                        <span className="text-xs text-gray-400">
                          {new Date(chat.lastMessageAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Tips */}
            <div className="card p-4 bg-blue-50 border border-blue-100">
              <h3 className="font-semibold text-blue-900 mb-3">💡 Tips to Get More Leads</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  Add high-quality photos of your property
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  Write detailed descriptions with amenities
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  Respond to enquiries within 24 hours
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  Keep your listing price competitive
                </li>
              </ul>
            </div>

            {/* Quick Actions */}
            <div className="card p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Link
                  to="/owner/properties/new"
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add New Property
                </Link>
                <Link
                  to="/owner/dashboard"
                  className="w-full btn-secondary flex items-center justify-center gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  View Full Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerHome;
