import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Home,
  Search,
  MessageSquare,
  User,
  LogOut,
  Menu,
  X,
  Building,
  LayoutDashboard,
  Shield,
  ChevronDown,
} from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Check if we're on the home page - but only show transparent navbar for non-authenticated users
  // Authenticated users see their dashboard on '/' which needs the spacer
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

  // Dynamic navbar classes based on scroll and page
  const navbarClasses = isHomePage && !isScrolled
    ? 'fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-transparent'
    : 'fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm';

  const textClasses = isHomePage && !isScrolled
    ? 'text-white'
    : 'text-gray-600';

  const logoTextClasses = isHomePage && !isScrolled
    ? 'text-white'
    : 'text-gray-900';

  const linkHoverClasses = isHomePage && !isScrolled
    ? 'hover:text-white/80'
    : 'hover:text-primary-600';

  return (
    <>
      {/* Spacer for fixed navbar on non-home pages */}
      {!isHomePage && <div className="h-16" />}

      <nav className={navbarClasses}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <div className={`p-1.5 rounded-lg ${isHomePage && !isScrolled ? 'bg-white/20 backdrop-blur-sm' : 'bg-primary-100'}`}>
                  <Home className={`h-6 w-6 ${isHomePage && !isScrolled ? 'text-white' : 'text-primary-600'}`} />
                </div>
                <span className={`text-xl font-bold ${logoTextClasses}`}>RentDirect</span>
              </Link>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-1">
              <Link
                to="/properties"
                className={`nav-link flex items-center space-x-1 ${textClasses} ${linkHoverClasses} px-4 py-2 rounded-lg transition-all duration-300 group`}
              >
                <Search className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                <span>Find Properties</span>
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    to="/messages"
                    className={`nav-link flex items-center space-x-1 ${textClasses} ${linkHoverClasses} px-4 py-2 rounded-lg transition-all duration-300 group`}
                  >
                    <MessageSquare className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                    <span>Messages</span>
                  </Link>

                  <Link
                    to={getDashboardLink()}
                    className={`nav-link flex items-center space-x-1 ${textClasses} ${linkHoverClasses} px-4 py-2 rounded-lg transition-all duration-300 group`}
                  >
                    {user?.role === 'SUPER_ADMIN' ? (
                      <Shield className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                    ) : user?.role === 'OWNER' ? (
                      <Building className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                    ) : (
                      <LayoutDashboard className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                    )}
                    <span>Dashboard</span>
                  </Link>

                  <div className="relative" ref={profileRef}>
                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className={`flex items-center space-x-2 ${textClasses} ${linkHoverClasses} px-4 py-2 rounded-lg transition-colors`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isHomePage && !isScrolled
                          ? 'bg-white/20 backdrop-blur-sm'
                          : 'bg-primary-100'
                      }`}>
                        <User className={`h-4 w-4 ${isHomePage && !isScrolled ? 'text-white' : 'text-primary-600'}`} />
                      </div>
                      <span>{user?.firstName}</span>
                      <ChevronDown className={`h-4 w-4 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isProfileOpen && (
                      <div className="absolute right-0 mt-2 w-48 glass-card py-1 z-50 dropdown-menu">
                        <div className="px-4 py-2 border-b border-gray-200/50">
                          <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                          <p className="text-xs text-gray-500">{user?.email}</p>
                        </div>
                        <Link
                          to="/profile"
                          onClick={() => setIsProfileOpen(false)}
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-100/50 transition-all duration-200 hover:pl-5"
                        >
                          Profile
                        </Link>
                        <hr className="my-1 border-gray-200/50" />
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50/50 flex items-center gap-2 transition-all duration-200 hover:pl-5 group"
                        >
                          <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className={`nav-link ${textClasses} ${linkHoverClasses} px-4 py-2 rounded-lg transition-all duration-300`}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className={`ml-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 btn-animated ${
                      isHomePage && !isScrolled
                        ? 'bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 hover:scale-105'
                        : 'bg-primary-600 text-white hover:bg-primary-700 hover:scale-105 hover:shadow-lg hover:shadow-primary-500/25'
                    }`}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`${textClasses} ${linkHoverClasses} p-2 rounded-lg transition-colors`}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden glass-card mx-4 my-2 rounded-xl overflow-hidden animate-slide-down">
            <div className="px-2 pt-2 pb-3 space-y-1 animate-stagger">
              <Link
                to="/properties"
                className="block px-4 py-3 text-gray-700 hover:bg-gray-100/50 rounded-lg transition-all duration-200 hover:translate-x-1 group"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="flex items-center gap-2">
                  <Search className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                  Find Properties
                </span>
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    to="/messages"
                    className="block px-4 py-3 text-gray-700 hover:bg-gray-100/50 rounded-lg transition-all duration-200 hover:translate-x-1 group"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                      Messages
                    </span>
                  </Link>
                  <Link
                    to={getDashboardLink()}
                    className="block px-4 py-3 text-gray-700 hover:bg-gray-100/50 rounded-lg transition-all duration-200 hover:translate-x-1 group"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="flex items-center gap-2">
                      <LayoutDashboard className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                      Dashboard
                    </span>
                  </Link>
                  <Link
                    to="/profile"
                    className="block px-4 py-3 text-gray-700 hover:bg-gray-100/50 rounded-lg transition-all duration-200 hover:translate-x-1 group"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="flex items-center gap-2">
                      <User className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                      Profile
                    </span>
                  </Link>
                  <hr className="my-2 border-gray-200/50" />
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-3 text-red-600 hover:bg-red-50/50 rounded-lg transition-all duration-200 hover:translate-x-1 group"
                  >
                    <span className="flex items-center gap-2">
                      <LogOut className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                      Logout
                    </span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block px-4 py-3 text-gray-700 hover:bg-gray-100/50 rounded-lg transition-all duration-200 hover:translate-x-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block px-4 py-3 text-primary-600 font-medium hover:bg-primary-50/50 rounded-lg transition-all duration-200 hover:translate-x-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
