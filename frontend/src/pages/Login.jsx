import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import { Eye, EyeOff, Mail, X } from 'lucide-react';
import girl2 from '../assets/girl2.png';
import logo from '../assets/logo.png';

const Login = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [loginInput, setLoginInput] = useState(''); // can be email or student ID
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const googleButtonRef = useRef(null);

  // OTP related states
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [tempEmail, setTempEmail] = useState('');

  // Handle Google Login
  const handleGoogleLogin = async (response) => {
    try {
      setIsLoading(true);
      setServerError('');

      const res = await fetch('http://localhost:5000/api/users/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.message || 'Google login failed');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (error) {
      console.error('Google login error:', error);
      setServerError('An error occurred during Google login');
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize Google Login on component mount
  const initializeGoogleLogin = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!window.google || !clientId) {
      console.warn('Google OAuth not configured');
      return;
    }

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleGoogleLogin,
    });

    if (googleButtonRef.current) {
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        width: '100%',
      });
    }
  };

  // Handle Manual Login - Step 1: Send OTP
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!email) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      setIsLoading(true);
      setServerError('');

      const response = await fetch('http://localhost:5000/api/users/login/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setServerError(data.message || 'Login failed. Please try again.');
        return;
      }

      // Show OTP modal
      setTempEmail(data.email);
      setShowOTPModal(true);
      setServerError('');
    } catch (error) {
      console.error('Login error:', error);
      setServerError('An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP Verification
  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setOtpError('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      setIsVerifyingOTP(true);
      setOtpError('');

      const response = await fetch('http://localhost:5000/api/users/login/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: tempEmail, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        setOtpError(data.message || 'Invalid OTP. Please try again.');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (error) {
      console.error('Verify OTP error:', error);
      setOtpError('An error occurred. Please try again.');
    } finally {
      setIsVerifyingOTP(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    try {
      setIsLoading(true);
      setOtpError('');

      const response = await fetch('http://localhost:5000/api/users/login/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: tempEmail, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setOtpError(data.message || 'Failed to resend OTP.');
        return;
      }

      setOtp('');
      alert('New OTP sent to your email!');
    } catch (error) {
      console.error('Resend OTP error:', error);
      setOtpError('Failed to resend OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  // OTP Modal Component
  const OTPModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Mail className="text-blue-600" size={24} />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Verify Your Login</h2>
          </div>
          <button
            onClick={() => {
              setShowOTPModal(false);
              setOtp('');
              setOtpError('');
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            We've sent a 6-digit verification code to:
          </p>
          <p className="font-semibold text-gray-900 dark:text-white mb-4">{tempEmail}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Please enter the code below to complete your login.
          </p>
        </div>

        {otpError && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-300 text-sm">{otpError}</p>
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Enter OTP
          </label>
          <input
            type="text"
            value={otp}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 6);
              setOtp(value);
              setOtpError('');
            }}
            placeholder="000000"
            maxLength={6}
            autoFocus
            className="w-full px-4 py-3 text-center text-2xl font-bold tracking-widest border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <button
          onClick={handleVerifyOTP}
          disabled={isVerifyingOTP || otp.length !== 6}
          className={`w-full ${
            isVerifyingOTP || otp.length !== 6
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white py-3 rounded-lg font-medium transition mb-3`}
        >
          {isVerifyingOTP ? 'Verifying...' : 'Verify OTP'}
        </button>

        <button
          onClick={handleResendOTP}
          disabled={isLoading}
          className="w-full text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
        >
          Didn't receive the code? Resend OTP
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4 relative transition-colors duration-300">
      {/* Top Navigation */}
      <div className="absolute top-0 left-0 right-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 z-20 transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src={logo} alt="SkillMatch Logo" className="w-10 h-10 mr-2" />
            <span className="text-xl font-semibold text-gray-900 dark:text-white">SkillMatch</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link to="/" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm transition-colors">
              Back
            </Link>
            <Link
              to="/signup"
              className="bg-blue-600 text-white px-4 py-2 rounded-2xl hover:bg-blue-700 transition text-sm"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-6xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden flex mt-24 transition-colors duration-300">
        {/* Left Side - Login Form */}
        <div className="w-full lg:w-5/12 p-8 lg:p-12 flex flex-col justify-center">
          <div className="mb-8 text-center lg:text-left">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome back</h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Sign in to your account to continue your learning journey
            </p>
          </div>

          {/* Error Message */}
          {serverError && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-800 dark:text-red-300 text-sm font-medium">{serverError}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className={`w-full px-4 py-2.5 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                  errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className={`w-full px-4 py-2.5 pr-10 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                    errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            {/* Remember Me and Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Remember me
                </label>
              </div>
              <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                Forgot Password?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full ${
                isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              } text-white py-2.5 rounded-2xl font-medium transition text-sm`}
            >
              {isLoading ? 'Sending OTP...' : 'Login'}
            </button>

            {/* Sign Up Link */}
            <div className="text-center">
              <span className="text-gray-600 dark:text-gray-300 text-sm">Don't have an account? </span>
              <Link to="/signup" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm transition-colors">
                Sign up
              </Link>
            </div>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs">Or continue with</span>
            </div>
          </div>

          {/* Google Login Button */}
          <div ref={googleButtonRef} className="w-full flex items-center justify-center">
            <button
              type="button"
              onClick={initializeGoogleLogin}
              className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
              Continue with Google
            </button>
          </div>
        </div>

        {/* Right Side - Image */}
        <div className="hidden lg:flex lg:w-7/12 bg-gradient-to-br from-blue-600 via-blue-500 to-teal-400 items-center justify-center p-12 relative">
          <div className="text-center text-white max-w-md z-10">
            <h2 className="text-3xl font-bold mb-4">Discover Your Potential</h2>
            <p className="text-lg text-blue-50 mb-8">
              Map your skills, track your progress, and unlock new opportunities with SkillMatch.
            </p>
            <div className="w-full flex justify-center">
              <img
                src={girl2}
                alt="Students studying together"
                className="max-w-sm w-full h-auto object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* OTP Verification Modal */}
      {showOTPModal && <OTPModal />}
    </div>
  );
};

export default Login;