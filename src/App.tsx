import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { ProtectedRoute, LoadingSpinner, ScrollToTop } from './components/Common';

// Public Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import PropertyList from './pages/properties/PropertyList';
import PropertyDetails from './pages/properties/PropertyDetails';

// Protected Pages
import Messages from './pages/messages/Messages';
import TenantDashboard from './pages/tenant/TenantDashboard';
import TenantHome from './pages/tenant/TenantHome';
import OwnerDashboard from './pages/owner/OwnerDashboard';
import OwnerHome from './pages/owner/OwnerHome';
import PropertyForm from './pages/owner/PropertyForm';

// Admin Pages
import AdminHome from './pages/admin/AdminHome';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';

// Payment Pages
import DealPayment from './pages/payments/DealPayment';

// Smart Home Component - shows role-specific landing page
const SmartHome: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Home />;
  }

  // Redirect to role-specific home
  switch (user?.role) {
    case 'SUPER_ADMIN':
      return <Navigate to="/admin" replace />;
    case 'OWNER':
      return <OwnerHome />;
    case 'TENANT':
      return <TenantHome />;
    default:
      return <Home />;
  }
};

const App: React.FC = () => {
  const { isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Auth Routes (no layout) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Admin Routes (separate dark theme layout) */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
          <AdminHome />
        </ProtectedRoute>
      } />
      <Route path="/admin/dashboard" element={
        <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
          <AdminUsers />
        </ProtectedRoute>
      } />
      <Route path="/admin/properties" element={
        <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
          <div className="min-h-screen bg-gray-900 py-8">
            <div className="max-w-7xl mx-auto px-4">
              <h1 className="text-2xl font-bold mb-4 text-white">Properties Management</h1>
              <p className="text-gray-400">Coming soon...</p>
            </div>
          </div>
        </ProtectedRoute>
      } />
      <Route path="/admin/deals" element={
        <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
          <div className="min-h-screen bg-gray-900 py-8">
            <div className="max-w-7xl mx-auto px-4">
              <h1 className="text-2xl font-bold mb-4 text-white">Deals Management</h1>
              <p className="text-gray-400">Coming soon...</p>
            </div>
          </div>
        </ProtectedRoute>
      } />
      <Route path="/admin/reports" element={
        <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
          <div className="min-h-screen bg-gray-900 py-8">
            <div className="max-w-7xl mx-auto px-4">
              <h1 className="text-2xl font-bold mb-4 text-white">Reports</h1>
              <p className="text-gray-400">Coming soon...</p>
            </div>
          </div>
        </ProtectedRoute>
      } />

      {/* Public & Role-based Routes with Layout */}
      <Route element={<Layout />}>
        {/* Smart Home - shows role-specific landing */}
        <Route path="/" element={<SmartHome />} />

        {/* Public property browsing */}
        <Route path="/properties" element={<PropertyList />} />
        <Route path="/properties/:id" element={<PropertyDetails />} />

        {/* Protected: Messages */}
        <Route path="/messages" element={
          <ProtectedRoute>
            <Messages />
          </ProtectedRoute>
        } />
        <Route path="/messages/:conversationId" element={
          <ProtectedRoute>
            <Messages />
          </ProtectedRoute>
        } />

        {/* Tenant Routes */}
        <Route path="/tenant/dashboard" element={
          <ProtectedRoute allowedRoles={['TENANT']}>
            <TenantDashboard />
          </ProtectedRoute>
        } />
        <Route path="/tenant/home" element={
          <ProtectedRoute allowedRoles={['TENANT']}>
            <TenantHome />
          </ProtectedRoute>
        } />

        {/* Owner Routes */}
        <Route path="/owner/dashboard" element={
          <ProtectedRoute allowedRoles={['OWNER']}>
            <OwnerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/owner/home" element={
          <ProtectedRoute allowedRoles={['OWNER']}>
            <OwnerHome />
          </ProtectedRoute>
        } />
        <Route path="/owner/properties/new" element={
          <ProtectedRoute allowedRoles={['OWNER']}>
            <PropertyForm />
          </ProtectedRoute>
        } />
        <Route path="/owner/properties/:id/edit" element={
          <ProtectedRoute allowedRoles={['OWNER']}>
            <PropertyForm />
          </ProtectedRoute>
        } />

        {/* Payment Routes */}
        <Route path="/payment/deal/:dealId" element={
          <ProtectedRoute allowedRoles={['TENANT', 'OWNER']}>
            <DealPayment />
          </ProtectedRoute>
        } />

        {/* Profile */}
        <Route path="/profile" element={
          <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 py-8">
              <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-2xl font-bold mb-4">Profile</h1>
                <div className="card p-6">
                  <p className="text-gray-600">
                    Profile management coming soon. For now, you can view your details here:
                  </p>
                  <div className="mt-4 space-y-2">
                    <p><strong>Name:</strong> {user?.firstName} {user?.lastName}</p>
                    <p><strong>Email:</strong> {user?.email}</p>
                    <p><strong>Role:</strong> {user?.role}</p>
                  </div>
                </div>
              </div>
            </div>
          </ProtectedRoute>
        } />
      </Route>

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default App;
