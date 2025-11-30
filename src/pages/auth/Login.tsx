import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Home, Mail, Lock, Eye, EyeOff, ArrowRight, Star, Shield, Zap, CheckCircle, Users, Building2, Key } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * Demo Credentials for Testing (kept for documentation purposes)
 * ============================================================
 *
 * Admin Account:
 *   Email: admin@rentalplatform.com
 *   Password: Admin@123456
 *
 * Owner Account:
 *   Email: owner@demo.com
 *   Password: Owner@123
 *
 * Tenant Account:
 *   Email: tenant@demo.com
 *   Password: Tenant@123
 */

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/';

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Track mouse for parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(formData.email, formData.password);
      toast.success('Login successful!');
      navigate(from, { replace: true });
    } catch (error: any) {
      toast.error(error.response?.data?.error || error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    { icon: Shield, text: 'Verified Properties', color: 'from-green-400 to-emerald-500' },
    { icon: Zap, text: 'No Broker Fee', color: 'from-yellow-400 to-orange-500' },
    { icon: Star, text: 'Direct Owner Connect', color: 'from-purple-400 to-pink-500' },
  ];

  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* Left Side - Animated Background */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-gray-900 via-primary-900 to-purple-900 overflow-hidden">
        {/* Animated mesh gradient */}
        <div className="absolute inset-0">
          <div
            className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary-500/30 rounded-full blur-[100px] animate-pulse-slow"
            style={{ transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)` }}
          />
          <div
            className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/30 rounded-full blur-[100px] animate-pulse-slow"
            style={{ transform: `translate(${-mousePosition.x}px, ${-mousePosition.y}px)`, animationDelay: '1s' }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-500/20 rounded-full blur-[120px] animate-float"
          />
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${2 + Math.random() * 4}px`,
                height: `${2 + Math.random() * 4}px`,
                background: `rgba(255, 255, 255, ${0.1 + Math.random() * 0.3})`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12">
          {/* Logo */}
          <div className="mb-12 animate-bounce-in">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 transition-all duration-500 group-hover:scale-110 group-hover:bg-white/20 group-hover:rotate-3 overflow-hidden">
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <Home className="h-10 w-10 text-white relative z-10" />
              </div>
              <span className="text-3xl font-bold text-white tracking-tight">RentDirect</span>
            </Link>
          </div>

          {/* Main heading */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4 animate-slide-up leading-tight">
              Welcome to the
              <span className="block mt-2 bg-gradient-to-r from-primary-400 via-purple-400 to-pink-400 text-transparent bg-clip-text animate-gradient bg-[length:200%_auto]">
                Future of Renting
              </span>
            </h1>
            <p className="text-xl text-gray-300 animate-slide-up mt-4" style={{ animationDelay: '0.2s' }}>
              No brokers. No hassle. Just homes.
            </p>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-3 gap-4 w-full max-w-lg animate-slide-up" style={{ animationDelay: '0.4s' }}>
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="group relative p-4 glass-card-dark rounded-xl text-center transition-all duration-500 hover:scale-105 hover:-translate-y-2 cursor-default overflow-hidden"
                style={{ animationDelay: `${0.5 + idx * 0.1}s` }}
              >
                {/* Hover glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${feature.color} p-2.5 transition-all duration-500 group-hover:rotate-6 group-hover:scale-110 shadow-lg`}>
                  <feature.icon className="w-full h-full text-white" />
                </div>
                <p className="text-white/80 text-sm font-medium relative z-10">{feature.text}</p>
              </div>
            ))}
          </div>

          {/* Stats with improved styling */}
          <div className="mt-12 flex gap-8 animate-slide-up" style={{ animationDelay: '0.6s' }}>
            {[
              { value: '50K+', label: 'Properties', icon: Building2 },
              { value: '10K+', label: 'Happy Users', icon: Users },
              { value: '100+', label: 'Cities', icon: Star },
            ].map((stat, idx) => (
              <div key={idx} className="text-center group cursor-default">
                <div className="text-3xl font-bold text-white mb-1 transition-transform duration-300 group-hover:scale-110">{stat.value}</div>
                <div className="text-gray-400 text-sm flex items-center justify-center gap-1">
                  <stat.icon className="w-3 h-3 opacity-50" />
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center relative bg-gray-50">
        {/* Mobile background gradient */}
        <div className="lg:hidden absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-purple-50" />

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-100 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-100 rounded-full blur-3xl opacity-50 translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 w-full max-w-md mx-auto px-6 py-6">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8 animate-bounce-in">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="p-2 bg-primary-100 rounded-xl">
                <Home className="h-8 w-8 text-primary-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">RentDirect</span>
            </Link>
          </div>

          {/* Form Header */}
          <div className="text-center mb-6 animate-slide-up">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              Sign in to your account
            </h2>
            <p className="text-gray-600 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-600 hover:text-primary-700 font-semibold hover:underline transition-all">
                Create one free
              </Link>
            </p>
          </div>

          {/* Login Form */}
          <form
            className="space-y-4 animate-slide-up"
            style={{ animationDelay: '0.1s' }}
            onSubmit={handleSubmit}
          >
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 transition-colors duration-300">
                Email address
              </label>
              <div className={`relative transition-all duration-500 ease-out ${focusedField === 'email' ? 'transform scale-[1.02]' : ''}`}>
                {/* Glow effect on focus */}
                <div className={`absolute -inset-0.5 bg-gradient-to-r from-primary-500 to-purple-500 rounded-xl opacity-0 blur transition-opacity duration-500 ${focusedField === 'email' ? 'opacity-20' : ''}`} />
                <div className="relative">
                  <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-all duration-300 ${focusedField === 'email' ? 'text-primary-600' : 'text-gray-400'}`}>
                    <Mail className={`h-5 w-5 transition-transform duration-300 ${focusedField === 'email' ? 'scale-110' : ''}`} />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full pl-12 pr-12 py-3.5 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all duration-300 shadow-sm hover:border-gray-300 hover:shadow-md"
                    placeholder="you@example.com"
                  />
                  {formData.email && formData.email.includes('@') && formData.email.includes('.') && (
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                      <div className="animate-scale-in">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                Password
              </label>
              <div className={`relative transition-all duration-500 ease-out ${focusedField === 'password' ? 'transform scale-[1.02]' : ''}`}>
                {/* Glow effect on focus */}
                <div className={`absolute -inset-0.5 bg-gradient-to-r from-primary-500 to-purple-500 rounded-xl opacity-0 blur transition-opacity duration-500 ${focusedField === 'password' ? 'opacity-20' : ''}`} />
                <div className="relative">
                  <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-all duration-300 ${focusedField === 'password' ? 'text-primary-600' : 'text-gray-400'}`}>
                    <Lock className={`h-5 w-5 transition-transform duration-300 ${focusedField === 'password' ? 'scale-110' : ''}`} />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full pl-12 pr-14 py-3.5 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all duration-300 shadow-sm hover:border-gray-300 hover:shadow-md"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-primary-600 transition-all duration-300"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <div className="transition-transform duration-300 hover:scale-110">
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !formData.email || !formData.password}
              className="relative w-full py-3.5 px-6 mt-1 bg-gradient-to-r from-primary-600 via-primary-500 to-purple-600 hover:from-primary-500 hover:via-primary-400 hover:to-purple-500 text-white font-semibold rounded-xl transition-all duration-500 transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary-500/25 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none flex items-center justify-center gap-3 group overflow-hidden"
            >
              {/* Animated background shine */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />

              {/* Ripple effect overlay */}
              <div className="absolute inset-0 opacity-0 group-active:opacity-100 bg-white/10 transition-opacity duration-150" />

              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="animate-pulse">Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          {/* Trust Indicators */}
          <div className="mt-5 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: Shield, label: 'Secure', color: 'text-green-500' },
                { icon: Key, label: 'Private', color: 'text-blue-500' },
                { icon: Users, label: 'Trusted', color: 'text-purple-500' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center p-2.5 rounded-xl bg-white/60 backdrop-blur-sm border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-300 hover:-translate-y-1 group"
                >
                  <item.icon className={`h-4 w-4 ${item.color} mb-0.5 transition-transform duration-300 group-hover:scale-110`} />
                  <span className="text-xs font-medium text-gray-600">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer links */}
          <div className="mt-4 flex items-center justify-center gap-4 text-sm animate-slide-up" style={{ animationDelay: '0.25s' }}>
            <Link to="/forgot-password" className="text-gray-500 hover:text-primary-600 transition-colors duration-300">
              Forgot password?
            </Link>
            <span className="text-gray-300">|</span>
            <span className="text-gray-500">
              <a href="#" className="hover:text-primary-600 transition-colors duration-200">Terms</a>
              {' & '}
              <a href="#" className="hover:text-primary-600 transition-colors duration-200">Privacy</a>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
