import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, Mail, Lock, ArrowLeft, ArrowRight, CheckCircle, Eye, EyeOff, Shield } from 'lucide-react';
import { authAPI } from '../../lib/api';
import toast from 'react-hot-toast';

type Step = 'email' | 'otp' | 'password' | 'success';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await authAPI.forgotPassword(email);
      toast.success('OTP sent to your email');
      setStep('otp');
      setCountdown(60);
    } catch (error: any) {
      // Don't reveal if email exists
      toast.success('If this email exists, you will receive an OTP shortly');
      setStep('otp');
      setCountdown(60);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }

    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOTPPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);

    // Focus the next empty input or last input
    const nextIndex = Math.min(pastedData.length, 5);
    otpRefs.current[nextIndex]?.focus();
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join('');

    if (otpString.length !== 6) {
      toast.error('Please enter the complete OTP');
      return;
    }

    setIsLoading(true);

    try {
      await authAPI.verifyOTP(email, otpString);
      toast.success('OTP verified');
      setStep('password');
    } catch (error: any) {
      toast.error(error.message || 'Invalid or expired OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      await authAPI.resetPassword(email, otp.join(''), newPassword);
      toast.success('Password reset successfully');
      setStep('success');
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;

    setIsLoading(true);
    try {
      await authAPI.forgotPassword(email);
      toast.success('OTP resent to your email');
      setCountdown(60);
      setOtp(['', '', '', '', '', '']);
    } catch (error: any) {
      toast.error('Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = () => {
    if (!newPassword) return { strength: 0, label: '', color: '' };
    let strength = 0;
    if (newPassword.length >= 8) strength++;
    if (/[A-Z]/.test(newPassword)) strength++;
    if (/[a-z]/.test(newPassword)) strength++;
    if (/[0-9]/.test(newPassword)) strength++;
    if (/[^A-Za-z0-9]/.test(newPassword)) strength++;

    const labels = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-emerald-500'];

    return {
      strength,
      label: labels[strength - 1] || '',
      color: colors[strength - 1] || ''
    };
  };

  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center relative bg-gray-50">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 via-white to-purple-50/50" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary-100 rounded-full blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-30 translate-x-1/2 translate-y-1/2" />

        <div className="relative z-10 w-full max-w-md mx-auto px-6 py-6">
          {/* Logo */}
          <div className="text-center mb-6 animate-bounce-in">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="p-2 bg-primary-100 rounded-xl">
                <Home className="h-7 w-7 text-primary-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">RentDirect</span>
            </Link>
          </div>

          {/* Progress Indicator */}
          {step !== 'success' && (
            <div className="flex items-center justify-center gap-2 mb-6 animate-slide-up">
              {['email', 'otp', 'password'].map((s, idx) => (
                <div key={s} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-500 ${
                      step === s || (step === 'otp' && idx === 0) || (step === 'password' && idx <= 1)
                        ? 'bg-gradient-to-br from-primary-500 to-purple-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {(step === 'otp' && idx === 0) || (step === 'password' && idx <= 1) ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      idx + 1
                    )}
                  </div>
                  {idx < 2 && (
                    <div
                      className={`w-10 h-1 mx-1 rounded-full transition-all duration-500 ${
                        (step === 'otp' && idx === 0) || (step === 'password' && idx <= 1)
                          ? 'bg-gradient-to-r from-primary-500 to-purple-500'
                          : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Step 1: Email */}
          {step === 'email' && (
            <div className="animate-slide-up">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Forgot Password?</h2>
                <p className="text-gray-600 text-sm">Enter your email and we'll send you an OTP to reset your password</p>
              </div>

              <form onSubmit={handleSendOTP} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Email Address</label>
                  <div className={`relative transition-all duration-300 ${focusedField === 'email' ? 'scale-[1.02]' : ''}`}>
                    <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${focusedField === 'email' ? 'text-primary-600' : 'text-gray-400'}`}>
                      <Mail className="h-5 w-5" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all duration-300"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-6 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all duration-500 transform hover:scale-[1.02] hover:shadow-xl hover:shadow-primary-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <span>Send OTP</span>
                      <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link to="/login" className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Login</span>
                </Link>
              </div>
            </div>
          )}

          {/* Step 2: OTP */}
          {step === 'otp' && (
            <div className="animate-slide-up">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify OTP</h2>
                <p className="text-gray-600 text-sm">We sent a 6-digit code to <strong>{email}</strong></p>
              </div>

              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div className="flex justify-center gap-2">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOTPChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOTPKeyDown(idx, e)}
                      onPaste={handleOTPPaste}
                      className="w-12 h-14 text-center text-xl font-bold bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all duration-300"
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otp.join('').length !== 6}
                  className="w-full py-3.5 px-6 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all duration-500 transform hover:scale-[1.02] hover:shadow-xl hover:shadow-primary-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <span>Verify OTP</span>
                  )}
                </button>
              </form>

              <div className="mt-4 text-center">
                <p className="text-gray-600 text-sm">
                  Didn't receive the code?{' '}
                  <button
                    onClick={handleResendOTP}
                    disabled={countdown > 0 || isLoading}
                    className={`font-semibold transition-colors ${
                      countdown > 0 ? 'text-gray-400' : 'text-primary-600 hover:text-primary-700'
                    }`}
                  >
                    {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
                  </button>
                </p>
              </div>

              <div className="mt-4 text-center">
                <button
                  onClick={() => setStep('email')}
                  className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Change Email</span>
                </button>
              </div>
            </div>
          )}

          {/* Step 3: New Password */}
          {step === 'password' && (
            <div className="animate-slide-up">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Create New Password</h2>
                <p className="text-gray-600 text-sm">Your password must be at least 8 characters</p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">New Password</label>
                  <div className={`relative transition-all duration-300 ${focusedField === 'password' ? 'scale-[1.02]' : ''}`}>
                    <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${focusedField === 'password' ? 'text-primary-600' : 'text-gray-400'}`}>
                      <Lock className="h-5 w-5" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      className="w-full pl-12 pr-12 py-3.5 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all duration-300"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>

                  {/* Password Strength */}
                  {newPassword && (
                    <div className="animate-slide-up">
                      <div className="flex gap-1 mt-2">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                              level <= passwordStrength().strength ? passwordStrength().color : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <p className={`text-sm mt-1 ${passwordStrength().color.replace('bg-', 'text-')}`}>
                        {passwordStrength().label}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Confirm Password</label>
                  <div className={`relative transition-all duration-300 ${focusedField === 'confirmPassword' ? 'scale-[1.02]' : ''}`}>
                    <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${focusedField === 'confirmPassword' ? 'text-primary-600' : 'text-gray-400'}`}>
                      <Lock className="h-5 w-5" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onFocus={() => setFocusedField('confirmPassword')}
                      onBlur={() => setFocusedField(null)}
                      className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all duration-300"
                      placeholder="Confirm new password"
                    />
                    {confirmPassword && newPassword === confirmPassword && (
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center animate-scale-in">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-6 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all duration-500 transform hover:scale-[1.02] hover:shadow-xl hover:shadow-primary-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Resetting...</span>
                    </>
                  ) : (
                    <span>Reset Password</span>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 'success' && (
            <div className="animate-slide-up text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Reset Successful!</h2>
              <p className="text-gray-600 mb-6">Your password has been reset successfully. You can now login with your new password.</p>

              <button
                onClick={() => navigate('/login')}
                className="w-full py-3.5 px-6 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all duration-500 transform hover:scale-[1.02] hover:shadow-xl hover:shadow-primary-500/25 flex items-center justify-center gap-2 group"
              >
                <span>Go to Login</span>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right Side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-gray-900 via-primary-900 to-purple-900 overflow-hidden">
        {/* Animated mesh gradient */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-primary-500/30 rounded-full blur-[100px] animate-pulse-slow" />
          <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-purple-500/30 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '1s' }} />
        </div>

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12">
          <div className="mb-8 animate-bounce-in">
            <div className="p-5 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20">
              <Shield className="h-14 w-14 text-white" />
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4 animate-slide-up">
              Secure Password Reset
            </h1>
            <p className="text-xl text-gray-300 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Your security is our top priority
            </p>
          </div>

          <div className="mt-10 space-y-4 w-full max-w-sm animate-slide-up" style={{ animationDelay: '0.3s' }}>
            {[
              { icon: '🔐', text: 'OTP verification for extra security' },
              { icon: '⏱️', text: 'OTP expires in 10 minutes' },
              { icon: '🔒', text: 'Your data is encrypted end-to-end' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10">
                <span className="text-2xl">{item.icon}</span>
                <span className="text-gray-300">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
