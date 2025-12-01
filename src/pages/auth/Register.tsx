import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Home, Mail, Lock, User, Phone, Eye, EyeOff, Building, Users,
  ArrowRight, ArrowLeft, CheckCircle, Sparkles, Shield, Star,
  Heart, Zap
} from 'lucide-react';
import toast from 'react-hot-toast';

const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get('role') as 'OWNER' | 'TENANT' | null;

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: defaultRole || ('TENANT' as 'OWNER' | 'TENANT'),
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
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

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || undefined,
        role: formData.role,
      });
      toast.success('Registration successful!');
      navigate(formData.role === 'OWNER' ? '/owner/dashboard' : '/tenant/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.error || error.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && !formData.role) {
      toast.error('Please select your role');
      return;
    }
    if (step === 2 && (!formData.firstName || !formData.lastName)) {
      toast.error('Please fill in your name');
      return;
    }
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const passwordStrength = () => {
    const { password } = formData;
    if (!password) return { strength: 0, label: '', color: '' };
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const labels = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-emerald-500'];

    return {
      strength,
      label: labels[strength - 1] || '',
      color: colors[strength - 1] || ''
    };
  };

  const roleOptions = [
    {
      value: 'TENANT',
      icon: Users,
      title: 'Find a Home',
      subtitle: "I'm looking to rent",
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50 hover:bg-blue-100 border-blue-200',
      selectedColor: 'bg-blue-100 border-blue-500 ring-4 ring-blue-500/20',
      features: ['Browse verified listings', 'Direct owner contact', 'No broker fees']
    },
    {
      value: 'OWNER',
      icon: Building,
      title: 'List Property',
      subtitle: "I'm a property owner",
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50 hover:bg-green-100 border-green-200',
      selectedColor: 'bg-green-100 border-green-500 ring-4 ring-green-500/20',
      features: ['List unlimited properties', 'Get qualified tenants', 'Zero commission']
    },
  ];

  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center relative bg-gray-50">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 via-white to-purple-50/50" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary-100 rounded-full blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-30 translate-x-1/2 translate-y-1/2" />

        <div className="relative z-10 w-full max-w-lg mx-auto px-6 py-4">
          {/* Logo */}
          <div className="text-center mb-4 animate-bounce-in">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="p-1.5 bg-primary-100 rounded-xl">
                <Home className="h-6 w-6 text-primary-600" />
              </div>
              <span className="text-xl font-bold text-gray-900">RentDirect</span>
            </Link>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2 mb-5 animate-slide-up">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-500 ${
                    step >= s
                      ? 'bg-gradient-to-br from-primary-500 to-purple-500 text-white scale-100'
                      : 'bg-gray-200 text-gray-500 scale-90'
                  } ${step === s ? 'ring-4 ring-primary-500/30 scale-110' : ''}`}
                >
                  {step > s ? <CheckCircle className="w-4 h-4" /> : s}
                </div>
                {s < 3 && (
                  <div
                    className={`w-10 h-1 mx-1 rounded-full transition-all duration-500 ${
                      step > s ? 'bg-gradient-to-r from-primary-500 to-purple-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step Headers */}
          <div className="text-center mb-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              {step === 1 && "What brings you here?"}
              {step === 2 && "Tell us about yourself"}
              {step === 3 && "Secure your account"}
            </h2>
            <p className="text-gray-600 text-sm">
              {step === 1 && "Choose your journey to get started"}
              {step === 2 && "We'd love to know your name"}
              {step === 3 && "Create a strong password"}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Step 1: Role Selection */}
            {step === 1 && (
              <div className="space-y-3 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                {roleOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, role: option.value as 'OWNER' | 'TENANT' })}
                    className={`w-full p-4 rounded-xl border-2 transition-all duration-500 text-left group ${
                      formData.role === option.value
                        ? option.selectedColor
                        : option.bgColor
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${option.color} transition-transform duration-500 ${
                        formData.role === option.value ? 'scale-110 rotate-3' : 'group-hover:scale-105'
                      }`}>
                        <option.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base font-bold text-gray-900">{option.title}</h3>
                        <p className="text-gray-600 text-xs mb-2">{option.subtitle}</p>
                        <div className="flex flex-wrap gap-x-3 gap-y-1">
                          {option.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-1 text-xs text-gray-500">
                              <CheckCircle className={`w-3 h-3 ${formData.role === option.value ? 'text-green-500' : 'text-gray-400'}`} />
                              {feature}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                        formData.role === option.value
                          ? 'border-primary-500 bg-primary-500'
                          : 'border-gray-300'
                      }`}>
                        {formData.role === option.value && (
                          <CheckCircle className="w-3 h-3 text-white animate-scale-in" />
                        )}
                      </div>
                    </div>
                  </button>
                ))}

                <button
                  type="button"
                  onClick={nextStep}
                  className="w-full py-3 px-6 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all duration-500 transform hover:scale-[1.02] hover:shadow-xl hover:shadow-primary-500/25 flex items-center justify-center gap-2 group mt-4"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </div>
            )}

            {/* Step 2: Name & Contact */}
            {step === 2 && (
              <div className="space-y-3 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-700">First Name</label>
                    <div className={`relative transition-all duration-300 ${focusedField === 'firstName' ? 'scale-[1.02]' : ''}`}>
                      <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors ${focusedField === 'firstName' ? 'text-primary-600' : 'text-gray-400'}`}>
                        <User className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        onFocus={() => setFocusedField('firstName')}
                        onBlur={() => setFocusedField(null)}
                        className="w-full pl-10 pr-3 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all duration-300 text-sm"
                        placeholder="John"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-700">Last Name</label>
                    <div className={`relative transition-all duration-300 ${focusedField === 'lastName' ? 'scale-[1.02]' : ''}`}>
                      <input
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        onFocus={() => setFocusedField('lastName')}
                        onBlur={() => setFocusedField(null)}
                        className="w-full px-3 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all duration-300 text-sm"
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-700">Email Address</label>
                  <div className={`relative transition-all duration-300 ${focusedField === 'email' ? 'scale-[1.02]' : ''}`}>
                    <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors ${focusedField === 'email' ? 'text-primary-600' : 'text-gray-400'}`}>
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      className="w-full pl-10 pr-3 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all duration-300 text-sm"
                      placeholder="you@example.com"
                    />
                    {formData.email && formData.email.includes('@') && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center animate-scale-in">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-700">
                    Phone <span className="text-gray-400 font-normal">(Optional - 10 digits)</span>
                  </label>
                  <div className={`relative transition-all duration-300 ${focusedField === 'phone' ? 'scale-[1.02]' : ''}`}>
                    <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors ${focusedField === 'phone' ? 'text-primary-600' : 'text-gray-400'}`}>
                      <Phone className="h-4 w-4" />
                    </div>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => {
                        // Only allow digits and limit to 10 characters
                        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setFormData({ ...formData, phone: value });
                      }}
                      onFocus={() => setFocusedField('phone')}
                      onBlur={() => setFocusedField(null)}
                      className="w-full pl-10 pr-10 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all duration-300 text-sm"
                      placeholder="9876543210"
                      maxLength={10}
                    />
                    {formData.phone && formData.phone.length === 10 && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center animate-scale-in">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                    )}
                  </div>
                  {formData.phone && formData.phone.length > 0 && formData.phone.length < 10 && (
                    <p className="text-xs text-amber-600 mt-1">{10 - formData.phone.length} more digits needed</p>
                  )}
                </div>

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex-1 py-3 px-4 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-300 hover:bg-gray-50 hover:border-gray-300 flex items-center justify-center gap-2 group text-sm"
                  >
                    <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all duration-500 transform hover:scale-[1.02] hover:shadow-xl hover:shadow-primary-500/25 flex items-center justify-center gap-2 group text-sm"
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Password */}
            {step === 3 && (
              <div className="space-y-3 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-700">Create Password</label>
                  <div className={`relative transition-all duration-300 ${focusedField === 'password' ? 'scale-[1.02]' : ''}`}>
                    <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors ${focusedField === 'password' ? 'text-primary-600' : 'text-gray-400'}`}>
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      className="w-full pl-10 pr-12 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all duration-300 text-sm"
                      placeholder="Min. 8 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-all"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  {/* Password Strength */}
                  {formData.password && (
                    <div className="animate-slide-up">
                      <div className="flex gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                              level <= passwordStrength().strength ? passwordStrength().color : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <p className={`text-xs mt-0.5 ${passwordStrength().color.replace('bg-', 'text-')}`}>
                        {passwordStrength().label}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-700">Confirm Password</label>
                  <div className={`relative transition-all duration-300 ${focusedField === 'confirmPassword' ? 'scale-[1.02]' : ''}`}>
                    <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors ${focusedField === 'confirmPassword' ? 'text-primary-600' : 'text-gray-400'}`}>
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      onFocus={() => setFocusedField('confirmPassword')}
                      onBlur={() => setFocusedField(null)}
                      className="w-full pl-10 pr-3 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all duration-300 text-sm"
                      placeholder="Confirm your password"
                    />
                    {formData.confirmPassword && formData.password === formData.confirmPassword && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center animate-scale-in">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex-1 py-3 px-4 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-300 hover:bg-gray-50 hover:border-gray-300 flex items-center justify-center gap-2 group text-sm"
                  >
                    <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
                    <span>Back</span>
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all duration-500 transform hover:scale-[1.02] hover:shadow-xl hover:shadow-primary-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group overflow-hidden relative text-sm"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <span>Create Account</span>
                        <Sparkles className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12" />
                      </>
                    )}
                  </button>
                </div>

                <p className="text-center text-xs text-gray-500 mt-2">
                  By creating an account, you agree to our{' '}
                  <a href="#" className="text-primary-600 hover:underline">Terms</a>
                  {' '}and{' '}
                  <a href="#" className="text-primary-600 hover:underline">Privacy Policy</a>
                </p>
              </div>
            )}
          </form>

          {/* Login Link */}
          <p className="mt-4 text-center text-gray-600 text-sm animate-fade-in">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold hover:underline transition-all">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Animated Background */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-gray-900 via-primary-900 to-purple-900 overflow-hidden">
        {/* Animated mesh gradient */}
        <div className="absolute inset-0">
          <div
            className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-primary-500/30 rounded-full blur-[100px] animate-pulse-slow"
            style={{ transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)` }}
          />
          <div
            className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-purple-500/30 rounded-full blur-[100px] animate-pulse-slow"
            style={{ transform: `translate(${-mousePosition.x}px, ${-mousePosition.y}px)`, animationDelay: '1s' }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-500/20 rounded-full blur-[120px] animate-float"
          />
        </div>

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(25)].map((_, i) => (
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
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-8">
          {/* Logo */}
          <div className="mb-6 animate-bounce-in">
            <div className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
              <Home className="h-10 w-10 text-white" />
            </div>
          </div>

          {/* Main heading */}
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-white mb-2 animate-slide-up">
              Join{' '}
              <span className="bg-gradient-to-r from-primary-400 via-purple-400 to-pink-400 text-transparent bg-clip-text animate-gradient bg-[length:200%_auto]">
                50,000+
              </span>
            </h1>
            <p className="text-xl text-gray-300 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Happy Renters & Owners
            </p>
          </div>

          {/* Testimonial cards */}
          <div className="w-full max-w-sm space-y-3 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            {[
              { name: 'Priya S.', role: 'Tenant', text: 'Found my dream apartment in just 3 days!', rating: 5 },
              { name: 'Rahul M.', role: 'Owner', text: 'Got quality tenants without any broker hassle.', rating: 5 },
            ].map((testimonial, idx) => (
              <div
                key={idx}
                className="glass-card-dark p-4 rounded-xl transition-all duration-500 hover:scale-105 hover:-translate-y-1"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                    {testimonial.name[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold text-white text-sm">{testimonial.name}</span>
                      <span className="text-xs text-gray-400 px-2 py-0.5 bg-white/10 rounded-full">{testimonial.role}</span>
                    </div>
                    <p className="text-gray-300 text-xs mb-1">"{testimonial.text}"</p>
                    <div className="flex gap-0.5">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Trust badges */}
          <div className="mt-6 flex items-center gap-6 animate-slide-up" style={{ animationDelay: '0.5s' }}>
            <div className="flex items-center gap-1.5 text-gray-400">
              <Shield className="w-4 h-4 text-green-400" />
              <span className="text-xs">Verified</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-400">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-xs">Instant</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-400">
              <Heart className="w-4 h-4 text-red-400" />
              <span className="text-xs">Free</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
