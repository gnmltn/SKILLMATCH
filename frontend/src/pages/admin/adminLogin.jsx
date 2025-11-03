import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Smartphone, X, Key, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from "../../contexts/ThemeContext";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '../../assets/logo.png';


const API_BASE_URL = 'http://localhost:5000/api';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  
  // Forgot Password Modal State
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1); // 1: Email, 2: OTP, 3: New Password, 4: Success
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoadingReset, setIsLoadingReset] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

  // Redirect regular users to dashboard - they shouldn't access admin login
  useEffect(() => {
    const regularToken = localStorage.getItem('token');
    const adminToken = localStorage.getItem('adminToken');
    
    // If regular user is logged in (but not admin), redirect to dashboard
    if (regularToken && !adminToken) {
      navigate('/dashboard', { replace: true });
    }
    // If admin is already logged in, redirect to admin panel
    else if (adminToken) {
      navigate('/admin/adminPanel', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/login`, {
        email,
        password
      });

      if (response.data.success) {
        const { token, user } = response.data;
        
        // Use separate localStorage keys for admin to avoid conflicts with student sessions
        localStorage.setItem('adminToken', token);
        // Store minimal user data to avoid localStorage quota issues
        const minimalUserData = {
          _id: user._id,
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          profilePicture: user.profilePicture,
          userType: user.userType || 'admin',
          role: user.role || 'admin',
          isAdmin: user.isAdmin !== undefined ? user.isAdmin : true
        };
        
        try {
          localStorage.setItem('adminUser', JSON.stringify(minimalUserData));
        } catch (storageError) {
          console.error('Failed to store user data:', storageError);
          localStorage.setItem('adminUser', JSON.stringify({ 
            _id: user._id, 
            email: user.email, 
            role: 'admin',
            isAdmin: true 
          }));
        }
        
        localStorage.setItem('isAdmin', 'true');
        toast.success('Welcome back, Admin!');
        navigate('/admin/adminPanel'); 
      }
    } catch (error) {
      console.error('Admin login error:', error);
      toast.error(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    toast.info('Google login for admin coming soon');
    // Implement Google OAuth for admin
  };

  const handleForgotPassword = () => {
    setShowForgotPasswordModal(true);
    setForgotPasswordStep(1);
    setResetEmail('');
    setResetOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setResetError('');
    setResetSuccess('');
  };

  const closeForgotPasswordModal = () => {
    setShowForgotPasswordModal(false);
    setForgotPasswordStep(1);
    setResetEmail('');
    setResetOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setResetError('');
    setResetSuccess('');
  };

  // Step 1: Request OTP
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    
    if (!resetEmail) {
      setResetError('Please enter your email address');
      return;
    }

    const gmailRegex = /^[^\s@]+@gmail\.com$/i;
    if (!gmailRegex.test(resetEmail)) {
      setResetError('Please enter a valid Gmail address');
      return;
    }

    try {
      setIsLoadingReset(true);
      setResetError('');

      const response = await axios.post(`${API_BASE_URL}/admin/forgot-password/request-reset`, {
        email: resetEmail,
      });

      if (response.data.success) {
        setResetSuccess('OTP sent to your email!');
        setTimeout(() => {
          setResetSuccess('');
          setForgotPasswordStep(2);
        }, 1500);
      }
    } catch (error) {
      console.error('Request OTP error:', error);
      setResetError(error.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoadingReset(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    if (!resetOtp || resetOtp.length !== 6) {
      setResetError('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      setIsLoadingReset(true);
      setResetError('');

      const response = await axios.post(`${API_BASE_URL}/admin/forgot-password/verify-otp`, {
        email: resetEmail,
        otp: resetOtp,
      });

      if (response.data.success) {
        setResetSuccess('OTP verified! Set your new password.');
        setTimeout(() => {
          setResetSuccess('');
          setForgotPasswordStep(3);
        }, 1500);
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      setResetError(error.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsLoadingReset(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      setResetError('Please fill in all fields');
      return;
    }

    // Check for whitespace in password
    if (/\s/.test(newPassword)) {
      setResetError('Password cannot contain whitespace');
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setResetError('Password must be at least 8 characters');
      return;
    }

    const hasNumber = /\d/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword);
    if (!hasNumber || !hasSpecialChar) {
      setResetError('Password must contain at least 1 number and 1 special character');
      return;
    }

    try {
      setIsLoadingReset(true);
      setResetError('');

      const response = await axios.post(`${API_BASE_URL}/admin/forgot-password/reset-password`, {
        email: resetEmail,
        otp: resetOtp,
        newPassword,
        confirmPassword,
      });

      if (response.data.success) {
        setResetSuccess('Password reset successful!');
        setForgotPasswordStep(4);
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setResetError(error.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoadingReset(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    try {
      setIsLoadingReset(true);
      setResetError('');

      const response = await axios.post(`${API_BASE_URL}/admin/forgot-password/resend-otp`, {
        email: resetEmail,
      });

      if (response.data.success) {
        setResetOtp('');
        setResetSuccess('New OTP sent to your email!');
        setTimeout(() => setResetSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      setResetError(error.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setIsLoadingReset(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-0 flex flex-col">
      {/* Navigation Bar */}
        <nav className='h-20 w-full bg-white shadow sticky top-0 flex items-center px-4'>
        <div className="flex items-center gap-3">
            <img src={logo} alt="logo" className='h-12 w-12 object-contain' />
            <h2 className='text-black text-2xl font-bold' style={{ fontFamily: 'Poppins, sans-serif' }}>
            SkillMatch
            </h2>
        </div>
        </nav>
      {/* Main Content - Centered */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Admin Login
          </h2>
          <p className="text-gray-600">
            Access your admin dashboard and manage the platform
          </p>
        </div>

        {/* Login Card - Centered */}
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-300 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={20} className="text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your admin email"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={20} className="text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-700 hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Login
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          

          {/* Admin Notice */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-sm text-blue-700 text-center">
              🔒 Restricted access. Admin privileges required.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Need help?{' '}
            <button className="text-blue-600 hover:text-blue-500 font-medium transition-colors">
              Contact support
            </button>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {forgotPasswordStep === 1 && 'Forgot Password?'}
                {forgotPasswordStep === 2 && 'Verify OTP'}
                {forgotPasswordStep === 3 && 'Set New Password'}
                {forgotPasswordStep === 4 && 'Success'}
              </h2>
              {forgotPasswordStep !== 4 && (
                <button
                  onClick={closeForgotPasswordModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              )}
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Header Icon */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  {forgotPasswordStep === 4 ? (
                    <CheckCircle className="text-green-600" size={32} />
                  ) : (
                    <Key className="text-blue-600" size={32} />
                  )}
                </div>
                <p className="text-gray-600 text-sm">
                  {forgotPasswordStep === 1 && "Enter your admin email to receive a verification code"}
                  {forgotPasswordStep === 2 && "Enter the 6-digit code sent to your email"}
                  {forgotPasswordStep === 3 && "Create a strong password for your account"}
                  {forgotPasswordStep === 4 && "Your password has been successfully reset"}
                </p>
              </div>

              {/* Error Message */}
              {resetError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                  <p className="text-red-800 text-sm font-medium">{resetError}</p>
                </div>
              )}

              {/* Success Message */}
              {resetSuccess && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                  <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
                  <p className="text-green-800 text-sm font-medium">{resetSuccess}</p>
                </div>
              )}

              {/* Step 1: Email Input */}
              {forgotPasswordStep === 1 && (
                <form onSubmit={handleRequestOTP} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="email"
                        value={resetEmail}
                        onChange={(e) => {
                          setResetEmail(e.target.value);
                          setResetError('');
                        }}
                        placeholder="Enter your admin email"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 bg-white"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoadingReset}
                    className={`w-full ${
                      isLoadingReset ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                    } text-white py-3 rounded-lg font-medium transition`}
                  >
                    {isLoadingReset ? 'Sending OTP...' : 'Send Verification Code'}
                  </button>
                </form>
              )}

              {/* Step 2: OTP Verification */}
              {forgotPasswordStep === 2 && (
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="email"
                        value={resetEmail}
                        disabled
                        className="w-full pl-10 pr-4 py-3 text-gray-600 bg-gray-100 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      value={resetOtp}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setResetOtp(value);
                        setResetError('');
                      }}
                      placeholder="000000"
                      maxLength={6}
                      autoFocus
                      className="w-full px-4 py-3 text-center text-2xl font-bold tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 bg-white"
                    />
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Enter the 6-digit code sent to {resetEmail}
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoadingReset || resetOtp.length !== 6}
                    className={`w-full ${
                      isLoadingReset || resetOtp.length !== 6
                        ? 'bg-blue-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    } text-white py-3 rounded-lg font-medium transition`}
                  >
                    {isLoadingReset ? 'Verifying...' : 'Verify OTP'}
                  </button>

                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={isLoadingReset}
                    className="w-full text-blue-600 hover:underline text-sm font-medium"
                  >
                    Didn't receive the code? Resend OTP
                  </button>
                </form>
              )}

              {/* Step 3: Reset Password */}
              {forgotPasswordStep === 3 && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value.replace(/\s/g, ''));
                          setResetError('');
                        }}
                        placeholder="Enter new password"
                        className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Must be at least 8 characters with 1 number and 1 special character
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value.replace(/\s/g, ''));
                          setResetError('');
                        }}
                        placeholder="Confirm new password"
                        className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoadingReset}
                    className={`w-full ${
                      isLoadingReset ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                    } text-white py-3 rounded-lg font-medium transition`}
                  >
                    {isLoadingReset ? 'Resetting Password...' : 'Reset Password'}
                  </button>
                </form>
              )}

              {/* Step 4: Success */}
              {forgotPasswordStep === 4 && (
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full">
                    <CheckCircle className="text-green-600" size={40} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Password Reset Successful!
                    </h3>
                    <p className="text-gray-600">
                      Your password has been successfully changed. You can now log in with your new password.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      closeForgotPasswordModal();
                      toast.success('Password reset successful! Please login with your new password.');
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}