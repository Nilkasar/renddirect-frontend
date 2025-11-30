import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../lib/api';
import { LoadingSpinner, BackButton } from '../../components/Common';
import { Users, Building, CheckCircle, IndianRupee, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

interface OverviewData {
  users: {
    total: number;
    owners: number;
    tenants: number;
  };
  properties: {
    total: number;
    active: number;
    rented: number;
  };
  deals: {
    total: number;
    completed: number;
  };
  revenue: {
    totalPotential: number;
  };
  pendingReports: number;
}

const AdminDashboard: React.FC = () => {
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    try {
      const response = await adminAPI.getOverview();
      if (response.data.success) {
        setOverview(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Failed to load data</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <BackButton fallbackPath="/admin" variant="dark" className="mb-4" />
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-400">Platform overview and management</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alerts */}
        {overview.pendingReports > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-center gap-4">
            <AlertTriangle className="h-6 w-6 text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-800">
                {overview.pendingReports} pending report(s) require attention
              </p>
              <Link to="/admin/reports" className="text-sm text-yellow-600 hover:underline">
                View Reports
              </Link>
            </div>
          </div>
        )}

        {/* Main Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="text-2xl font-bold">{overview.users.total}</p>
              </div>
            </div>
            <div className="mt-4 flex gap-4 text-sm">
              <span className="text-gray-500">
                Owners: <span className="font-medium text-gray-900">{overview.users.owners}</span>
              </span>
              <span className="text-gray-500">
                Tenants: <span className="font-medium text-gray-900">{overview.users.tenants}</span>
              </span>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Building className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Properties</p>
                <p className="text-2xl font-bold">{overview.properties.total}</p>
              </div>
            </div>
            <div className="mt-4 flex gap-4 text-sm">
              <span className="text-gray-500">
                Active: <span className="font-medium text-green-600">{overview.properties.active}</span>
              </span>
              <span className="text-gray-500">
                Rented: <span className="font-medium text-blue-600">{overview.properties.rented}</span>
              </span>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Deals</p>
                <p className="text-2xl font-bold">{overview.deals.total}</p>
              </div>
            </div>
            <div className="mt-4 text-sm">
              <span className="text-gray-500">
                Completed: <span className="font-medium text-green-600">{overview.deals.completed}</span>
              </span>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <IndianRupee className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Potential Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(overview.revenue.totalPotential)}</p>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              From success fees
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link
            to="/admin/users"
            className="card p-6 hover:shadow-lg transition-shadow text-center"
          >
            <Users className="h-8 w-8 mx-auto mb-3 text-blue-600" />
            <h3 className="font-medium">Manage Users</h3>
            <p className="text-sm text-gray-500 mt-1">View and manage all users</p>
          </Link>

          <Link
            to="/admin/properties"
            className="card p-6 hover:shadow-lg transition-shadow text-center"
          >
            <Building className="h-8 w-8 mx-auto mb-3 text-green-600" />
            <h3 className="font-medium">Manage Properties</h3>
            <p className="text-sm text-gray-500 mt-1">Review and moderate listings</p>
          </Link>

          <Link
            to="/admin/deals"
            className="card p-6 hover:shadow-lg transition-shadow text-center"
          >
            <CheckCircle className="h-8 w-8 mx-auto mb-3 text-purple-600" />
            <h3 className="font-medium">View Deals</h3>
            <p className="text-sm text-gray-500 mt-1">Track all completed deals</p>
          </Link>

          <Link
            to="/admin/reports"
            className="card p-6 hover:shadow-lg transition-shadow text-center"
          >
            <AlertTriangle className="h-8 w-8 mx-auto mb-3 text-red-600" />
            <h3 className="font-medium">Reports</h3>
            <p className="text-sm text-gray-500 mt-1">Handle user reports</p>
          </Link>
        </div>

        {/* Recent Activity would go here */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Platform Health</h2>
          <div className="grid grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {((overview.deals.completed / (overview.deals.total || 1)) * 100).toFixed(0)}%
              </div>
              <p className="text-sm text-gray-500">Deal Success Rate</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {((overview.properties.active / (overview.properties.total || 1)) * 100).toFixed(0)}%
              </div>
              <p className="text-sm text-gray-500">Active Listings</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {overview.users.owners > 0
                  ? (overview.properties.total / overview.users.owners).toFixed(1)
                  : 0}
              </div>
              <p className="text-sm text-gray-500">Avg Properties/Owner</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
