import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminAPI } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../../components/Common';
import {
  Users, Building, CheckCircle, IndianRupee, AlertTriangle,
  TrendingUp, Shield, Activity, Settings,
  Flag, ArrowRight, LogOut, User, ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';

interface OverviewData {
  users: { total: number; owners: number; tenants: number };
  properties: { total: number; active: number; rented: number };
  deals: { total: number; completed: number };
  revenue: { totalPotential: number };
  pendingReports: number;
}

const AdminHome: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsProfileOpen(false);
    logout();
    navigate('/');
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [overviewRes, usersRes] = await Promise.all([
        adminAPI.getOverview(),
        adminAPI.getUsers({ limit: 5 }),
      ]);

      if (overviewRes.data.success) {
        setOverview(overviewRes.data.data);
      }
      if (usersRes.data.success) {
        setRecentUsers(usersRes.data.data.items);
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
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-600 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Admin Control Center</h1>
                <p className="text-sm text-gray-400">Welcome, {user?.firstName}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400 hidden md:block">
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
              </span>
              <Link to="/" className="text-gray-400 hover:text-white text-sm">
                View Site →
              </Link>

              {/* Profile Dropdown */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 text-gray-300 hover:text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="hidden sm:block">{user?.firstName}</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg py-1 border border-gray-700 z-50">
                    <div className="px-4 py-2 border-b border-gray-700">
                      <p className="text-sm font-medium text-white">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs text-gray-400">{user?.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-400 hover:bg-gray-700 flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alerts */}
        {overview && overview.pendingReports > 0 && (
          <div className="mb-6 bg-red-900/50 border border-red-700 rounded-lg p-4 flex items-center gap-4">
            <AlertTriangle className="h-6 w-6 text-red-400" />
            <div className="flex-1">
              <p className="font-medium text-red-200">
                {overview.pendingReports} pending report(s) require attention
              </p>
              <p className="text-sm text-red-300">Review flagged content and user reports</p>
            </div>
            <Link to="/admin/reports" className="btn bg-red-600 hover:bg-red-700 text-white text-sm">
              View Reports
            </Link>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-600/20 rounded-lg">
                <Users className="h-6 w-6 text-blue-400" />
              </div>
              <span className="text-xs text-green-400 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> Active
              </span>
            </div>
            <p className="text-3xl font-bold text-white">{overview?.users.total || 0}</p>
            <p className="text-gray-400 text-sm">Total Users</p>
            <div className="mt-2 flex gap-4 text-xs">
              <span className="text-blue-400">{overview?.users.owners} owners</span>
              <span className="text-green-400">{overview?.users.tenants} tenants</span>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-600/20 rounded-lg">
                <Building className="h-6 w-6 text-green-400" />
              </div>
              <span className="text-xs text-green-400 flex items-center gap-1">
                <Activity className="h-3 w-3" /> Live
              </span>
            </div>
            <p className="text-3xl font-bold text-white">{overview?.properties.total || 0}</p>
            <p className="text-gray-400 text-sm">Total Properties</p>
            <div className="mt-2 flex gap-4 text-xs">
              <span className="text-green-400">{overview?.properties.active} active</span>
              <span className="text-blue-400">{overview?.properties.rented} rented</span>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-600/20 rounded-lg">
                <CheckCircle className="h-6 w-6 text-purple-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{overview?.deals.completed || 0}</p>
            <p className="text-gray-400 text-sm">Deals Completed</p>
            <div className="mt-2 text-xs text-purple-400">
              {overview?.deals.total} total deals
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 rounded-xl p-5 border border-yellow-700/50">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-yellow-600/30 rounded-lg">
                <IndianRupee className="h-6 w-6 text-yellow-400" />
              </div>
              <span className="text-xs text-yellow-400">Revenue</span>
            </div>
            <p className="text-3xl font-bold text-white">
              {formatCurrency(overview?.revenue.totalPotential || 0)}
            </p>
            <p className="text-gray-400 text-sm">Potential Earnings</p>
            <div className="mt-2 text-xs text-yellow-400">
              From success fees
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                to="/admin/users"
                className="bg-gray-800 rounded-xl p-5 border border-gray-700 hover:border-blue-500 transition-colors text-center group"
              >
                <Users className="h-8 w-8 text-blue-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-medium text-white">Manage Users</h3>
                <p className="text-xs text-gray-400 mt-1">View & suspend</p>
              </Link>

              <Link
                to="/admin/properties"
                className="bg-gray-800 rounded-xl p-5 border border-gray-700 hover:border-green-500 transition-colors text-center group"
              >
                <Building className="h-8 w-8 text-green-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-medium text-white">Properties</h3>
                <p className="text-xs text-gray-400 mt-1">Moderate listings</p>
              </Link>

              <Link
                to="/admin/deals"
                className="bg-gray-800 rounded-xl p-5 border border-gray-700 hover:border-purple-500 transition-colors text-center group"
              >
                <CheckCircle className="h-8 w-8 text-purple-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-medium text-white">Deals</h3>
                <p className="text-xs text-gray-400 mt-1">Track revenue</p>
              </Link>

              <Link
                to="/admin/reports"
                className="bg-gray-800 rounded-xl p-5 border border-gray-700 hover:border-red-500 transition-colors text-center group relative"
              >
                {overview && overview.pendingReports > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
                    {overview.pendingReports}
                  </span>
                )}
                <Flag className="h-8 w-8 text-red-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-medium text-white">Reports</h3>
                <p className="text-xs text-gray-400 mt-1">Handle issues</p>
              </Link>
            </div>

            {/* Recent Users */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Recent Users</h2>
                <Link to="/admin/users" className="text-primary-400 hover:text-primary-300 text-sm flex items-center gap-1">
                  View all <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-750">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">User</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Role</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {recentUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-750">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-white">{u.firstName} {u.lastName}</p>
                            <p className="text-xs text-gray-400">{u.email}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            u.role === 'SUPER_ADMIN' ? 'bg-purple-600/20 text-purple-400' :
                            u.role === 'OWNER' ? 'bg-blue-600/20 text-blue-400' :
                            'bg-green-600/20 text-green-400'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            u.status === 'ACTIVE' ? 'bg-green-600/20 text-green-400' :
                            'bg-red-600/20 text-red-400'
                          }`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-400">
                          {new Date(u.createdAt).toLocaleDateString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Platform Health */}
            <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-400" />
                Platform Health
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Deal Success Rate</span>
                    <span className="text-green-400">
                      {overview ? ((overview.deals.completed / (overview.deals.total || 1)) * 100).toFixed(0) : 0}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${overview ? (overview.deals.completed / (overview.deals.total || 1)) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Active Listings</span>
                    <span className="text-blue-400">
                      {overview ? ((overview.properties.active / (overview.properties.total || 1)) * 100).toFixed(0) : 0}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${overview ? (overview.properties.active / (overview.properties.total || 1)) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* System Status */}
            <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Settings className="h-5 w-5 text-gray-400" />
                System Status
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">API Server</span>
                  <span className="flex items-center gap-1 text-green-400 text-sm">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    Online
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Database</span>
                  <span className="flex items-center gap-1 text-green-400 text-sm">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    Connected
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">WebSocket</span>
                  <span className="flex items-center gap-1 text-green-400 text-sm">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    Active
                  </span>
                </div>
              </div>
            </div>

            {/* Fee Structure */}
            <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <IndianRupee className="h-5 w-5 text-yellow-400" />
                Success Fee Slabs
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-300">
                  <span>Rent &lt; ₹10,000</span>
                  <span className="text-yellow-400">₹299</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>₹10,000 - ₹25,000</span>
                  <span className="text-yellow-400">₹499</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Rent &gt; ₹25,000</span>
                  <span className="text-yellow-400">₹999</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
