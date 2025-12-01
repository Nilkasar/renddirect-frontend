import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../Common/Avatar';
import {
  Home,
  Search,
  User,
  LogOut,
  Menu,
  X,
  Building,
  LayoutDashboard,
  Shield,
  ChevronDown,
  Sparkles,
  Bell,
  Heart,
  MessageSquare,
  Plus,
  Zap,
} from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Check if we're on the home page - but only show transparent navbar for non-authenticated users
  const isHomePage = location.pathname === '/' && !isAuthenticated;

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
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

  const getDashboardLink = () => {
    if (user?.role === 'SUPER_ADMIN') return '/admin';
    if (user?.role === 'OWNER') return '/owner/dashboard';
    return '/tenant/dashboard';
  };

  const getRoleInfo = () => {
    switch (user?.role) {
      case 'OWNER':
        return { icon: Building, label: 'Property Owner', color: 'from-emerald-500 to-teal-500', badge: 'emerald' };
      case 'TENANT':
        return { icon: Heart, label: 'Tenant', color: 'from-blue-500 to-cyan-500', badge: 'blue' };
      case 'SUPER_ADMIN':
        return { icon: Shield, label: 'Administrator', color: 'from-purple-500 to-pink-500', badge: 'purple' };
      default:
        return { icon: User, label: 'User', color: 'from-gray-500 to-gray-600', badge: 'gray' };
    }
  };

  const roleInfo = getRoleInfo();
  const userName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim();

  // Dynamic navbar classes based on scroll and page
  const navbarClasses = isHomePage && !isScrolled
    ? 'fixed top-0 left-0 right-0 z-50 transition-all duration-500 bg-transparent'
    : 'fixed top-0 left-0 right-0 z-50 transition-all duration-500 bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm';

  const textClasses = isHomePage && !isScrolled
    ? 'text-white'
    : 'text-gray-600';

  const logoTextClasses = isHomePage && !isScrolled
    ? 'text-white'
    : 'text-gray-900';

  return (
    <>
      {/* Spacer for fixed navbar on non-home pages */}
      {!isHomePage && <div className="h-16" />}

      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
        className={navbarClasses}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <motion.div
              className="flex items-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link to="/" className="flex items-center space-x-2 group">
                <motion.div
                  className={`p-2 rounded-xl ${isHomePage && !isScrolled ? 'bg-white/20 backdrop-blur-sm' : 'bg-gradient-to-br from-primary-500 to-indigo-600'} shadow-lg`}
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <Home className="h-5 w-5 text-white" />
                </motion.div>
                <div className="flex flex-col">
                  <span className={`text-xl font-bold leading-tight ${logoTextClasses}`}>
                    Rent<span className="bg-gradient-to-r from-primary-600 to-indigo-600 text-transparent bg-clip-text">Direct</span>
                  </span>
                  <span className={`text-[9px] font-medium tracking-wider ${isHomePage && !isScrolled ? 'text-white/60' : 'text-gray-400'}`}>
                    FIND YOUR HOME
                  </span>
                </div>
              </Link>
            </motion.div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-1">
              {/* Find Properties - Always visible */}
              <NavLink
                to="/properties"
                icon={Search}
                label="Explore"
                isTransparent={isHomePage && !isScrolled}
              />

              {isAuthenticated ? (
                <>
                  {/* Dashboard */}
                  <NavLink
                    to={getDashboardLink()}
                    icon={LayoutDashboard}
                    label="Dashboard"
                    isTransparent={isHomePage && !isScrolled}
                  />

                  {/* Quick Action Button for Owners */}
                  {user?.role === 'OWNER' && (
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Link
                        to="/owner/property/new"
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-sm transition-all ${
                          isHomePage && !isScrolled
                            ? 'bg-white/20 text-white hover:bg-white/30'
                            : 'bg-gradient-to-r from-primary-500 to-indigo-500 text-white hover:shadow-lg hover:shadow-primary-200'
                        }`}
                      >
                        <Plus className="h-4 w-4" />
                        <span className="hidden lg:inline">Add Property</span>
                      </Link>
                    </motion.div>
                  )}

                  {/* Messages */}
                  <Link to="/messages">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className={`relative p-2 rounded-xl transition-colors ${
                        isHomePage && !isScrolled
                          ? 'text-white hover:bg-white/20'
                          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                      }`}
                    >
                      <MessageSquare className="h-5 w-5" />
                    </motion.button>
                  </Link>

                  {/* Notification Bell */}
                  <div className="relative" ref={notificationRef}>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                      className={`relative p-2 rounded-xl transition-colors ${
                        isHomePage && !isScrolled
                          ? 'text-white hover:bg-white/20'
                          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                      }`}
                    >
                      <Bell className="h-5 w-5" />
                      {/* Notification badge */}
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"
                      />
                    </motion.button>

                    <AnimatePresence>
                      {isNotificationOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                        >
                          <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                            <div className="flex items-center justify-between">
                              <h3 className="font-bold text-gray-900">Notifications</h3>
                              <span className="text-xs bg-primary-100 text-primary-700 px-2.5 py-1 rounded-full font-medium">3 new</span>
                            </div>
                          </div>
                          <div className="max-h-72 overflow-y-auto">
                            {[
                              { title: 'New message from Rahul', desc: 'About 2BHK in Koramangala', time: '2 min ago', icon: '💬', color: 'bg-blue-50' },
                              { title: 'Property bookmarked', desc: 'Someone saved your listing', time: '1 hour ago', icon: '❤️', color: 'bg-pink-50' },
                              { title: 'Deal confirmed!', desc: 'Congratulations on your deal', time: '3 hours ago', icon: '🎉', color: 'bg-green-50' },
                            ].map((notif, idx) => (
                              <motion.div
                                key={idx}
                                whileHover={{ backgroundColor: '#fafafa' }}
                                className="p-4 border-b border-gray-50 cursor-pointer"
                              >
                                <div className="flex items-start gap-3">
                                  <span className={`text-xl p-2 rounded-xl ${notif.color}`}>{notif.icon}</span>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900">{notif.title}</p>
                                    <p className="text-xs text-gray-500 truncate">{notif.desc}</p>
                                    <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                          <div className="p-3 bg-gray-50">
                            <button className="w-full py-2.5 text-sm text-primary-600 font-semibold hover:bg-primary-50 rounded-xl transition-colors flex items-center justify-center gap-2">
                              <Zap className="h-4 w-4" />
                              View all notifications
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Profile Dropdown */}
                  <div className="relative ml-2" ref={profileRef}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className={`flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-full transition-all ${
                        isHomePage && !isScrolled
                          ? 'bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20'
                          : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      {/* Avatar */}
                      <Avatar
                        name={userName}
                        size="sm"
                        animated={false}
                      />
                      <div className="text-left hidden lg:block">
                        <p className={`text-sm font-semibold leading-tight ${isHomePage && !isScrolled ? 'text-white' : 'text-gray-900'}`}>
                          {user?.firstName}
                        </p>
                        <p className={`text-[10px] font-medium ${isHomePage && !isScrolled ? 'text-white/60' : 'text-gray-500'}`}>
                          {roleInfo.label}
                        </p>
                      </div>
                      <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''} ${
                        isHomePage && !isScrolled ? 'text-white/70' : 'text-gray-400'
                      }`} />
                    </motion.button>

                    <AnimatePresence>
                      {isProfileOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                        >
                          {/* User Info Header */}
                          <div className="p-5 bg-gradient-to-br from-primary-500 via-indigo-500 to-purple-600 text-white relative overflow-hidden">
                            {/* Background decoration */}
                            <div className="absolute inset-0 opacity-10">
                              <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white" />
                              <div className="absolute -left-10 -bottom-10 w-32 h-32 rounded-full bg-white" />
                            </div>

                            <div className="relative flex items-center gap-4">
                              <Avatar
                                name={userName}
                                size="xl"
                                showRing
                                ringColor="ring-white/30"
                                animated={false}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-lg truncate">{user?.firstName} {user?.lastName}</p>
                                <p className="text-sm text-white/80 truncate">{user?.email}</p>
                                <div className="mt-2 flex items-center gap-2 flex-wrap">
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-xs font-medium`}>
                                    <roleInfo.icon className="w-3 h-3" />
                                    {roleInfo.label}
                                  </span>
                                  {user?.kycVerified && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-400/30 text-xs font-medium">
                                      <Shield className="w-3 h-3" />
                                      Verified
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Menu Items */}
                          <div className="p-2">
                            <DropdownLink
                              to="/profile"
                              icon={User}
                              label="My Profile"
                              description="View and edit your profile"
                              onClick={() => setIsProfileOpen(false)}
                            />
                            <DropdownLink
                              to={getDashboardLink()}
                              icon={LayoutDashboard}
                              label="Dashboard"
                              description="View your activity"
                              onClick={() => setIsProfileOpen(false)}
                            />
                            <DropdownLink
                              to="/messages"
                              icon={MessageSquare}
                              label="Messages"
                              description="Chat with others"
                              onClick={() => setIsProfileOpen(false)}
                            />
                            <DropdownLink
                              to="/tenant/bookmarks"
                              icon={Heart}
                              label="Saved Properties"
                              description="Your bookmarked listings"
                              onClick={() => setIsProfileOpen(false)}
                            />

                            <hr className="my-2 border-gray-100" />

                            <motion.button
                              whileHover={{ x: 5 }}
                              onClick={handleLogout}
                              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors group"
                            >
                              <div className="p-2 rounded-xl bg-red-100 group-hover:bg-red-200 transition-colors">
                                <LogOut className="h-4 w-4" />
                              </div>
                              <div className="text-left">
                                <p className="font-semibold text-sm">Sign Out</p>
                                <p className="text-xs text-red-400">See you soon!</p>
                              </div>
                            </motion.button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${textClasses} hover:bg-gray-100/50`}
                  >
                    Login
                  </Link>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      to="/register"
                      className={`ml-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                        isHomePage && !isScrolled
                          ? 'bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30'
                          : 'bg-gradient-to-r from-primary-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-primary-500/30'
                      }`}
                    >
                      <Sparkles className="w-4 h-4" />
                      Get Started
                    </Link>
                  </motion.div>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center gap-3">
              {isAuthenticated && (
                <Avatar
                  name={userName}
                  size="sm"
                  animated={false}
                />
              )}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`${textClasses} p-2 rounded-xl transition-colors ${
                  isHomePage && !isScrolled ? 'hover:bg-white/20' : 'hover:bg-gray-100'
                }`}
              >
                <AnimatePresence mode="wait">
                  {isMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                    >
                      <X className="h-6 w-6" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                    >
                      <Menu className="h-6 w-6" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white mx-4 my-2 rounded-2xl overflow-hidden shadow-xl border border-gray-100"
            >
              <div className="p-3 space-y-1">
                {isAuthenticated && (
                  <div className="p-4 mb-2 rounded-xl bg-gradient-to-br from-primary-500 via-indigo-500 to-purple-600 text-white">
                    <div className="flex items-center gap-3">
                      <Avatar
                        name={userName}
                        size="lg"
                        showRing
                        ringColor="ring-white/30"
                        animated={false}
                      />
                      <div>
                        <p className="font-bold">{user?.firstName} {user?.lastName}</p>
                        <p className="text-xs text-white/70">{roleInfo.label}</p>
                      </div>
                    </div>
                  </div>
                )}

                <MobileNavLink to="/properties" icon={Search} label="Explore Properties" onClick={() => setIsMenuOpen(false)} />

                {isAuthenticated ? (
                  <>
                    <MobileNavLink to={getDashboardLink()} icon={LayoutDashboard} label="Dashboard" onClick={() => setIsMenuOpen(false)} />
                    <MobileNavLink to="/messages" icon={MessageSquare} label="Messages" onClick={() => setIsMenuOpen(false)} />
                    <MobileNavLink to="/profile" icon={User} label="My Profile" onClick={() => setIsMenuOpen(false)} />
                    <MobileNavLink to="/tenant/bookmarks" icon={Heart} label="Saved Properties" onClick={() => setIsMenuOpen(false)} />

                    {user?.role === 'OWNER' && (
                      <Link
                        to="/owner/property/new"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 mt-2 bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-xl font-medium"
                      >
                        <Plus className="h-5 w-5" />
                        Add New Property
                      </Link>
                    )}

                    <hr className="my-2 border-gray-100" />

                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <LogOut className="h-5 w-5" />
                      <span className="font-medium">Sign Out</span>
                    </motion.button>
                  </>
                ) : (
                  <>
                    <MobileNavLink to="/login" icon={User} label="Login" onClick={() => setIsMenuOpen(false)} />
                    <motion.div whileTap={{ scale: 0.98 }}>
                      <Link
                        to="/register"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 mt-2 bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-xl font-medium"
                      >
                        <Sparkles className="h-5 w-5" />
                        Get Started Free
                      </Link>
                    </motion.div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
};

// Nav Link Component
const NavLink: React.FC<{
  to: string;
  icon: React.ElementType;
  label: string;
  isTransparent: boolean;
}> = ({ to, icon: Icon, label, isTransparent }) => {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(to + '/');

  return (
    <Link to={to}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
          isActive
            ? isTransparent
              ? 'bg-white/20 text-white'
              : 'bg-primary-50 text-primary-600'
            : isTransparent
              ? 'text-white/80 hover:text-white hover:bg-white/10'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        }`}
      >
        <Icon className="h-4 w-4" />
        <span className="font-medium text-sm">{label}</span>
      </motion.div>
    </Link>
  );
};

// Dropdown Link Component
const DropdownLink: React.FC<{
  to: string;
  icon: React.ElementType;
  label: string;
  description: string;
  onClick: () => void;
}> = ({ to, icon: Icon, label, description, onClick }) => (
  <Link to={to} onClick={onClick}>
    <motion.div
      whileHover={{ x: 5 }}
      className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 transition-colors group"
    >
      <div className="p-2.5 rounded-xl bg-gray-100 group-hover:bg-primary-100 group-hover:text-primary-600 transition-colors">
        <Icon className="h-4 w-4" />
      </div>
      <div className="text-left">
        <p className="font-semibold text-sm text-gray-900">{label}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </motion.div>
  </Link>
);

// Mobile Nav Link Component
const MobileNavLink: React.FC<{
  to: string;
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}> = ({ to, icon: Icon, label, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link to={to} onClick={onClick}>
      <motion.div
        whileTap={{ scale: 0.98 }}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
          isActive
            ? 'bg-primary-50 text-primary-600'
            : 'text-gray-700 hover:bg-gray-50'
        }`}
      >
        <Icon className="h-5 w-5" />
        <span className="font-medium">{label}</span>
      </motion.div>
    </Link>
  );
};

export default Navbar;
