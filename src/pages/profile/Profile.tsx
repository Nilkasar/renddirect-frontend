import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../lib/api';
import {
  User, Mail, Phone, MapPin, Calendar, Shield, Camera,
  Edit3, Save, X, CheckCircle, Sparkles, Crown, Star,
  Building, Users, Award, Zap, Heart, TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';

// Floating particle component
const FloatingParticle: React.FC<{ delay: number; duration: number; size: number }> = ({ delay, duration, size }) => (
  <motion.div
    className="absolute rounded-full bg-gradient-to-r from-primary-400/20 to-purple-400/20"
    style={{ width: size, height: size }}
    initial={{ opacity: 0, scale: 0 }}
    animate={{
      opacity: [0, 1, 0],
      scale: [0, 1, 0],
      y: [-20, -100],
      x: [0, Math.random() * 40 - 20],
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: "easeOut"
    }}
  />
);

// Comet trail effect
const CometTrail: React.FC<{ index: number }> = ({ index }) => (
  <motion.div
    className="absolute w-1 h-20 bg-gradient-to-b from-primary-400 via-purple-400 to-transparent rounded-full opacity-30"
    initial={{ x: -100, y: -100, rotate: 45 }}
    animate={{
      x: ['-10%', '110%'],
      y: ['-10%', '110%'],
    }}
    transition={{
      duration: 3 + index * 0.5,
      delay: index * 2,
      repeat: Infinity,
      ease: "linear"
    }}
  />
);

// Avatar with ring animation
const AnimatedAvatar: React.FC<{ user: any; isEditing: boolean; onImageChange: () => void }> = ({ user, isEditing, onImageChange }) => {
  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase();

  return (
    <div className="relative">
      {/* Outer glow rings */}
      <motion.div
        className="absolute -inset-4 rounded-full bg-gradient-to-r from-primary-500/20 via-purple-500/20 to-pink-500/20"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -inset-2 rounded-full bg-gradient-to-r from-primary-500/30 via-purple-500/30 to-pink-500/30"
        animate={{
          scale: [1, 1.05, 1],
          rotate: [0, 180, 360],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />

      {/* Main avatar */}
      <motion.div
        className="relative w-32 h-32 rounded-full bg-gradient-to-br from-primary-500 via-purple-500 to-pink-500 p-1 shadow-2xl shadow-primary-500/30"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
          {user?.profileImage ? (
            <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <span className="text-4xl font-bold bg-gradient-to-br from-primary-600 to-purple-600 text-transparent bg-clip-text">
              {initials}
            </span>
          )}
        </div>

        {/* Edit overlay */}
        {isEditing && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={onImageChange}
            className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center cursor-pointer group"
          >
            <Camera className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
          </motion.button>
        )}
      </motion.div>

      {/* Status badge */}
      <motion.div
        className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-green-500 border-4 border-white flex items-center justify-center"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, delay: 0.3 }}
      >
        <CheckCircle className="w-4 h-4 text-white" />
      </motion.div>
    </div>
  );
};

// Stats card component
const StatCard: React.FC<{ icon: any; label: string; value: string; color: string; delay: number }> = ({ icon: Icon, label, value, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    whileHover={{ scale: 1.05, y: -5 }}
    className={`p-4 rounded-2xl bg-gradient-to-br ${color} text-white shadow-lg relative overflow-hidden group`}
  >
    <motion.div
      className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-white/10"
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ duration: 3, repeat: Infinity }}
    />
    <Icon className="w-6 h-6 mb-2 relative z-10" />
    <p className="text-2xl font-bold relative z-10">{value}</p>
    <p className="text-sm opacity-80 relative z-10">{label}</p>
  </motion.div>
);

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    pincode: '',
    birthDate: '',
    gender: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        address: '',
        city: '',
        pincode: '',
        birthDate: '',
        gender: '',
      });
    }
  }, [user]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await authAPI.updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || undefined,
      });

      if (response.data.success) {
        updateUser(response.data.data);
        toast.success('Profile updated successfully!');
        setIsEditing(false);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleBadge = () => {
    switch (user?.role) {
      case 'OWNER':
        return { icon: Building, text: 'Property Owner', color: 'from-emerald-500 to-teal-500' };
      case 'TENANT':
        return { icon: Users, text: 'Tenant', color: 'from-blue-500 to-cyan-500' };
      case 'SUPER_ADMIN':
        return { icon: Shield, text: 'Super Admin', color: 'from-purple-500 to-pink-500' };
      default:
        return { icon: User, text: 'User', color: 'from-gray-500 to-gray-600' };
    }
  };

  const roleBadge = getRoleBadge();

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient orbs */}
        <motion.div
          className="absolute top-20 -left-20 w-96 h-96 bg-primary-200/30 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 -right-20 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl"
          animate={{
            x: [0, -50, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Comet trails */}
        {[0, 1, 2].map((i) => (
          <CometTrail key={i} index={i} />
        ))}

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-lg mb-4"
            whileHover={{ scale: 1.05 }}
          >
            <Sparkles className="w-4 h-4 text-primary-500" />
            <span className="text-sm font-medium text-gray-600">Your Profile</span>
          </motion.div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back,{' '}
            <span className="bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 text-transparent bg-clip-text">
              {user?.firstName}!
            </span>
          </h1>
          <p className="text-gray-500">Manage your account settings and preferences</p>
        </motion.div>

        {/* Main Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden"
        >
          {/* Hero Banner */}
          <div className="relative h-40 bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 overflow-hidden">
            <motion.div
              className="absolute inset-0"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
              animate={{ x: [0, -60] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />

            {/* Floating particles in banner */}
            <div className="absolute inset-0">
              {[...Array(10)].map((_, i) => (
                <FloatingParticle key={i} delay={i * 0.3} duration={2 + Math.random() * 2} size={4 + Math.random() * 8} />
              ))}
            </div>

            {/* Edit button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsEditing(!isEditing)}
              className="absolute top-4 right-4 p-3 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 transition-colors"
            >
              {isEditing ? <X className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
            </motion.button>
          </div>

          {/* Avatar positioned on banner */}
          <div className="relative px-8 -mt-16 mb-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4">
              <AnimatedAvatar user={user} isEditing={isEditing} onImageChange={() => toast('Image upload coming soon!')} />

              <div className="flex-1 text-center sm:text-left pb-2">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </h2>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r ${roleBadge.color} text-white text-xs font-medium`}
                  >
                    <roleBadge.icon className="w-3 h-3" />
                    {roleBadge.text}
                  </motion.div>
                </div>
                <p className="text-gray-500 flex items-center justify-center sm:justify-start gap-1.5 mt-1">
                  <Mail className="w-4 h-4" />
                  {user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="px-8 pb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={Award} label="Member Since" value={user?.createdAt ? new Date(user.createdAt).getFullYear().toString() : '2024'} color="from-blue-500 to-cyan-500" delay={0.3} />
              <StatCard icon={Star} label="Rating" value="4.9" color="from-amber-500 to-orange-500" delay={0.4} />
              <StatCard icon={Heart} label="Saved" value="12" color="from-pink-500 to-rose-500" delay={0.5} />
              <StatCard icon={TrendingUp} label="Deals" value="3" color="from-emerald-500 to-teal-500" delay={0.6} />
            </div>
          </div>

          {/* Tabs */}
          <div className="border-t border-gray-200/50">
            <div className="flex gap-1 p-2 bg-gray-50/50">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-white text-primary-600 shadow-md'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="p-8"
            >
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* First Name */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <User className="w-4 h-4 text-primary-500" />
                        First Name
                      </label>
                      <motion.input
                        whileFocus={{ scale: 1.01 }}
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>

                    {/* Last Name */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <User className="w-4 h-4 text-primary-500" />
                        Last Name
                      </label>
                      <motion.input
                        whileFocus={{ scale: 1.01 }}
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>

                    {/* Email (Read Only) */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <Mail className="w-4 h-4 text-primary-500" />
                        Email Address
                        <span className="text-xs text-gray-400">(cannot be changed)</span>
                      </label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                      />
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <Phone className="w-4 h-4 text-primary-500" />
                        Phone Number
                      </label>
                      <motion.input
                        whileFocus={{ scale: 1.01 }}
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setFormData({ ...formData, phone: value });
                        }}
                        disabled={!isEditing}
                        placeholder="10-digit number"
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>

                    {/* Address */}
                    <div className="space-y-2 md:col-span-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <MapPin className="w-4 h-4 text-primary-500" />
                        Address
                      </label>
                      <motion.input
                        whileFocus={{ scale: 1.01 }}
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        disabled={!isEditing}
                        placeholder="Enter your full address"
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>

                    {/* City */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <Building className="w-4 h-4 text-primary-500" />
                        City
                      </label>
                      <motion.input
                        whileFocus={{ scale: 1.01 }}
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        disabled={!isEditing}
                        placeholder="Your city"
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>

                    {/* Pincode */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <MapPin className="w-4 h-4 text-primary-500" />
                        Pincode
                      </label>
                      <motion.input
                        whileFocus={{ scale: 1.01 }}
                        type="text"
                        value={formData.pincode}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                          setFormData({ ...formData, pincode: value });
                        }}
                        disabled={!isEditing}
                        placeholder="6-digit pincode"
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>

                    {/* Birth Date */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <Calendar className="w-4 h-4 text-primary-500" />
                        Date of Birth
                      </label>
                      <motion.input
                        whileFocus={{ scale: 1.01 }}
                        type="date"
                        value={formData.birthDate}
                        onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>

                    {/* Gender */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <User className="w-4 h-4 text-primary-500" />
                        Gender
                      </label>
                      <motion.select
                        whileFocus={{ scale: 1.01 }}
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all disabled:bg-gray-50 disabled:text-gray-500"
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer_not_to_say">Prefer not to say</option>
                      </motion.select>
                    </div>
                  </div>

                  {/* Save Button */}
                  <AnimatePresence>
                    {isEditing && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="flex justify-end gap-3 pt-4"
                      >
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setIsEditing(false)}
                          className="px-6 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleSave}
                          disabled={isLoading}
                          className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-purple-600 text-white font-medium flex items-center gap-2 hover:shadow-lg hover:shadow-primary-500/30 transition-all disabled:opacity-50"
                        >
                          {isLoading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4" />
                              Save Changes
                            </>
                          )}
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div className="p-6 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-green-500 text-white">
                        <Shield className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Account Security</h3>
                        <p className="text-gray-600 text-sm">Your account is protected with secure authentication.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <button className="w-full p-4 rounded-xl border-2 border-gray-200 hover:border-primary-300 hover:bg-primary-50/50 transition-all text-left group">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">Change Password</h4>
                          <p className="text-sm text-gray-500">Update your password regularly for better security</p>
                        </div>
                        <Zap className="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors" />
                      </div>
                    </button>

                    <button className="w-full p-4 rounded-xl border-2 border-gray-200 hover:border-primary-300 hover:bg-primary-50/50 transition-all text-left group">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                          <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                        </div>
                        <Shield className="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors" />
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'preferences' && (
                <div className="space-y-6">
                  <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Personalization</h3>
                        <p className="text-gray-600 text-sm">Customize your RentDirect experience</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-200">
                      <div>
                        <h4 className="font-medium text-gray-900">Email Notifications</h4>
                        <p className="text-sm text-gray-500">Receive updates about new properties</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-200">
                      <div>
                        <h4 className="font-medium text-gray-900">SMS Alerts</h4>
                        <p className="text-sm text-gray-500">Get instant SMS for important updates</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* KYC Verification Banner */}
        {!user?.kycVerified && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6 p-6 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-amber-500 text-white">
                <Crown className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Complete Your Verification</h3>
                <p className="text-gray-600 text-sm mb-3">Verify your identity to unlock all features and build trust with other users.</p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition-colors"
                >
                  Start Verification
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Profile;
