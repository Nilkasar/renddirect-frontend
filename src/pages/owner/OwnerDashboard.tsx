import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { propertiesAPI, dealsAPI } from '../../lib/api';
import { Property, Deal } from '../../types';
import { LoadingSpinner, BackButton } from '../../components/Common';
import { Building, Eye, MessageSquare, CheckCircle, Plus, IndianRupee, Edit } from 'lucide-react';
import toast from 'react-hot-toast';

const OwnerDashboard: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
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
      const [propertiesRes, statsRes, dealsRes] = await Promise.all([
        propertiesAPI.getMyProperties(),
        propertiesAPI.getOwnerStats(),
        dealsAPI.getAll(),
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
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (propertyId: string, status: string) => {
    try {
      await propertiesAPI.updateStatus(propertyId, status);
      toast.success(`Property ${status === 'ACTIVE' ? 'published' : 'updated'}`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const formatRent = (amount: number) => {
    return new Intl.NumberFormat('en-IN').format(amount);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      ACTIVE: 'badge-success',
      RENTED: 'badge-info',
      DRAFT: 'badge-warning',
      SUSPENDED: 'badge-danger',
    };
    return styles[status] || 'badge';
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
          <BackButton fallbackPath="/owner/home" className="mb-4" />
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Owner Dashboard</h1>
              <p className="text-gray-600">Manage your properties and track performance</p>
            </div>
            <Link to="/owner/properties/new" className="btn-primary flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add Property
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Building className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Properties</p>
                <p className="text-2xl font-bold">{stats.totalProperties}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Eye className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Views</p>
                <p className="text-2xl font-bold">{stats.totalViews}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <MessageSquare className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Chats</p>
                <p className="text-2xl font-bold">{stats.totalChats}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Deals Closed</p>
                <p className="text-2xl font-bold">{stats.totalDeals}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Properties Table */}
        <div className="card mb-8">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">My Properties</h2>
          </div>

          {properties.length === 0 ? (
            <div className="p-12 text-center">
              <Building className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No properties yet</h3>
              <p className="text-gray-500 mb-4">Start by adding your first property listing</p>
              <Link to="/owner/properties/new" className="btn-primary">
                Add Property
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Property
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Rent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Views
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Chats
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {properties.map((property) => (
                    <tr key={property.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                            {property.images?.[0] ? (
                              <img
                                src={property.images[0]}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Building className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div>
                            <Link
                              to={`/properties/${property.id}`}
                              className="font-medium text-gray-900 hover:text-primary-600"
                            >
                              {property.title}
                            </Link>
                            <p className="text-sm text-gray-500">
                              {property.locality}, {property.city}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <IndianRupee className="h-4 w-4 text-gray-400" />
                          <span>{formatRent(property.rentAmount)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={getStatusBadge(property.status)}>
                          {property.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {property.viewCount}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {property._count?.conversations || 0}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/owner/properties/${property.id}/edit`}
                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          {property.status === 'DRAFT' && (
                            <button
                              onClick={() => handleStatusChange(property.id, 'ACTIVE')}
                              className="text-sm text-primary-600 hover:underline"
                            >
                              Publish
                            </button>
                          )}
                          {property.status === 'ACTIVE' && (
                            <button
                              onClick={() => handleStatusChange(property.id, 'RENTED')}
                              className="text-sm text-green-600 hover:underline"
                            >
                              Mark Rented
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Deals */}
        {deals.length > 0 && (
          <div className="card">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">Recent Deals</h2>
            </div>
            <div className="divide-y">
              {deals.slice(0, 5).map((deal) => (
                <div key={deal.id} className="p-6 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{deal.property?.title}</p>
                    <p className="text-sm text-gray-500">
                      Tenant: {deal.tenant?.firstName} {deal.tenant?.lastName}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-lg font-semibold">
                      <IndianRupee className="h-4 w-4" />
                      {formatRent(deal.agreedRent)}/month
                    </div>
                    <span
                      className={
                        deal.status === 'COMPLETED' ? 'badge-success' : 'badge-warning'
                      }
                    >
                      {deal.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerDashboard;
