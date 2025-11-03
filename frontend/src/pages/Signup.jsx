import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, CheckCircle, Eye, EyeOff, Menu, Mail } from 'lucide-react';
import logo from '../assets/logo.png';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // OTP related states
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [tempEmail, setTempEmail] = useState('');
  const [is404Page, setIs404Page] = useState(false);
  const [emailVerificationEnabled, setEmailVerificationEnabled] = useState(true);

  // Redirect logged-in users to dashboard
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  // Check if registration is disabled and email verification status
  useEffect(() => {
    const checkRegistrationStatus = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/admin/settings/system/public');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            if (!data.data.allowRegistrations) {
              setIs404Page(true);
            }
            setEmailVerificationEnabled(data.data.emailVerification !== false);
          }
        }
      } catch (error) {
        console.error('Failed to check registration status:', error);
      }
    };

    checkRegistrationStatus();
  }, []);

  const validateFirstName = (value) => /^[a-zA-Z\s]*$/.test(value);
  const validateLastName = (value) => /^[a-zA-Z\s]*$/.test(value);
  const validateEmail = (value) => {
    const gmailRegex = /^[^\s@]+@gmail\.com$/i;
    return gmailRegex.test(value);
  };
  const validatePassword = (value) => {
    // Check for whitespace first - reject if any whitespace found
    if (/\s/.test(value)) {
      return false;
    }
    const hasMinLength = value.length >= 8;
    const hasUppercase = /[A-Z]/.test(value);
    const hasLowercase = /[a-z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);
    return hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;

    if (name === 'firstName' || name === 'lastName') {
      finalValue = value.replace(/[^a-zA-Z\s]/g, '');
    }
    
    // Prevent whitespace in password fields
    if (name === 'password' || name === 'confirmPassword') {
      finalValue = value.replace(/\s/g, '');
    }

    setFormData(prev => ({
      ...prev,
      [name]: finalValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    else if (!validateFirstName(formData.firstName)) newErrors.firstName = 'First name must contain only letters';

    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    else if (!validateLastName(formData.lastName)) newErrors.lastName = 'Last name must contain only letters';

    if (!formData.email) newErrors.email = 'Email is required';
    else if (!validateEmail(formData.email)) newErrors.email = 'Please enter a valid Gmail address';

    if (!formData.password) newErrors.password = 'Password is required';
    else if (!validatePassword(formData.password)) newErrors.password = 'Password must be minimum 8 characters with at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character';
    else if (/\s/.test(formData.password)) newErrors.password = 'Password cannot contain whitespace';

    if (!formData.confirmPassword) newErrors.confirmPassword = 'Confirm password is required';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    if (!termsAccepted) newErrors.terms = 'You must accept the Terms of Service';

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    // If email verification is disabled, directly create the account without OTP
    if (!emailVerificationEnabled) {
      try {
        setIsLoading(true);
        setServerError('');

        const response = await fetch('http://localhost:5000/api/users/signup/verify-otp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            otp: '' // Empty OTP when email verification is disabled
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 404 && data.registrationDisabled) {
            setIs404Page(true);
            return;
          }
          setServerError(data.message || 'Failed to create account. Please try again.');
          return;
        }

        // Store token and minimal user data
        localStorage.setItem('token', data.token);
        const minimalUserData = {
          _id: data.user._id,
          id: data.user.id,
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          email: data.user.email,
          profilePicture: data.user.profilePicture,
          course: data.user.course,
          yearLevel: data.user.yearLevel,
          userType: data.user.userType
        };
        
        try {
          localStorage.setItem('user', JSON.stringify(minimalUserData));
        } catch (storageError) {
          console.error('Failed to store user data:', storageError);
          localStorage.setItem('user', JSON.stringify({ _id: data.user._id, email: data.user.email }));
        }

        navigate('/login');
        return;
      } catch (error) {
        console.error('Create account error:', error);
        setServerError('An error occurred. Please try again.');
        return;
      } finally {
        setIsLoading(false);
      }
    }

    // Send OTP to email (only if email verification is enabled)
    try {
      setIsLoading(true);
      setServerError('');

      const response = await fetch('http://localhost:5000/api/users/signup/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Check if registration is disabled (404 error)
        if (response.status === 404 && data.registrationDisabled) {
          setIs404Page(true);
          return;
        }
        setServerError(data.message || 'Failed to send OTP. Please try again.');
        return;
      }

      // Show OTP modal
      setTempEmail(data.email);
      setShowOTPModal(true);
      setServerError('');
    } catch (error) {
      console.error('Send OTP error:', error);
      setServerError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setOtpError('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      setIsVerifyingOTP(true);
      setOtpError('');

      const response = await fetch('http://localhost:5000/api/users/signup/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          otp: otp
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Check if registration is disabled (404 error)
        if (response.status === 404 && data.registrationDisabled) {
          setIs404Page(true);
          return;
        }
        setOtpError(data.message || 'Invalid OTP. Please try again.');
        return;
      }

      // Store token and minimal user data (to avoid localStorage quota issues)
      localStorage.setItem('token', data.token);
      const minimalUserData = {
        _id: data.user._id,
        id: data.user.id,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        email: data.user.email,
        profilePicture: data.user.profilePicture,
        course: data.user.course,
        yearLevel: data.user.yearLevel,
        userType: data.user.userType
      };
      
      try {
        localStorage.setItem('user', JSON.stringify(minimalUserData));
      } catch (storageError) {
        console.error('Failed to store user data:', storageError);
        localStorage.setItem('user', JSON.stringify({ _id: data.user._id, email: data.user.email }));
      }

      // Redirect to login or dashboard
      navigate('/login');
    } catch (error) {
      console.error('Verify OTP error:', error);
      setOtpError('An error occurred. Please try again.');
    } finally {
      setIsVerifyingOTP(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setIsLoading(true);
      setOtpError('');

      const response = await fetch('http://localhost:5000/api/users/signup/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
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
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Verify Your Email</h2>
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
            Please enter the code below to verify your email address.
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

  // Terms of Service Modal (keeping your existing one)
  const TermsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg w-[95%] sm:w-[90%] md:w-[85%] lg:w-[80%] xl:w-[75%] max-w-screen-xl max-h-[85vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-900">Terms of Service</h2>
          <button
            onClick={() => setShowTermsModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          <div className="prose prose-gray max-w-none">
            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle className="text-green-600" size={20} />
                1. Acceptance of Terms
              </h3>
              <p className="text-gray-700 leading-relaxed">
                By accessing and using SkillMatch, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle className="text-green-600" size={20} />
                2. User Accounts
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Maintaining the confidentiality of your account and password</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized use of your account</li>
                <li>Using only Gmail email addresses (@gmail.com)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle className="text-green-600" size={20} />
                3. Prohibited Uses
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                You may not use our service:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
                <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                <li>To submit false or misleading information</li>
                <li>To upload or transmit viruses or any other type of malicious code</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle className="text-green-600" size={20} />
                4. Contact Information
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700"><strong>Email:</strong> support@skillmatch.com</p>
                <p className="text-gray-700"><strong>Phone:</strong> +63 (2) 1234-5678</p>
              </div>
            </section>
          </div>
        </div>
        <div className="flex justify-end gap-3 p-4 sm:p-6 border-t bg-gray-50 flex-shrink-0">
          <button
            onClick={() => setShowTermsModal(false)}
            className="px-6 py-3 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Close
          </button>
          <button
            onClick={() => {
              setTermsAccepted(true);
              setShowTermsModal(false);
            }}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg"
          >
            I Accept
          </button>
        </div>
      </div>
    </div>
  );

  // Show 404 page if registration is disabled
  if (is404Page) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-red-100 dark:bg-red-900/20 rounded-full p-4">
              <X className="text-red-600 dark:text-red-400" size={48} />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            404 - Page Not Found
          </h1>
          
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Registration is currently disabled. Please contact the administrator for more information.
          </p>
          
          <Link 
            to="/" 
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Go Back Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Navigation Bar */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4 sticky top-0 z-40 transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className='flex items-center gap-2'>
            <img src={logo} alt="logo" className='w-8 h-8 sm:w-10 sm:h-10'/>
            <span className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">SkillMatch</span>
          </div>
          
          {/* Desktop Navigation */}
          <div className='hidden md:flex items-center gap-6'>
            <Link 
              to="/" 
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm font-medium transition-colors"
            >
              Back
            </Link>
            <Link 
              to="/login" 
              className="bg-blue-600 text-white px-4 py-2 rounded-2xl hover:bg-blue-700 transition text-sm font-medium"
            >
              Sign In
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 z-40 relative">
            <div className="flex flex-col space-y-3 pt-4">
              <Link 
                to="/" 
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm font-medium py-2 px-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Back
              </Link>
              <Link 
                to="/login" 
                className="bg-blue-600 text-white px-4 py-2 rounded-2xl hover:bg-blue-700 transition text-sm font-medium text-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign In
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <div className='flex justify-center items-center min-h-screen px-4 py-4 sm:py-8 bg-gray-50 dark:bg-gray-800 transition-colors duration-300'>
        <div className='bg-white dark:bg-gray-700 p-6 sm:p-8 rounded-2xl shadow-lg w-full max-w-md transition-colors duration-300'>
          <h2 className='text-2xl font-bold mb-2 text-center text-gray-900 dark:text-white'>Create your account</h2>
          <p className='text-center text-gray-600 dark:text-gray-300 mb-8'>Join SkillMatch to start mapping your skills and tracking your progress</p>

          {serverError && (
            <div className='mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg'>
              <p className='text-red-800 dark:text-red-300 text-sm font-medium'>{serverError}</p>
            </div>
          )}

          <div className='space-y-6'>
            {/* First Name */}
            <div>
              <label className='block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2'>First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.firstName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder='Enter your first name'
              />
              {errors.firstName && <p className='text-red-500 text-xs mt-1'>{errors.firstName}</p>}
            </div>

            {/* Last Name */}
            <div>
              <label className='block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2'>Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.lastName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder='Enter your last name'
              />
              {errors.lastName && <p className='text-red-500 text-xs mt-1'>{errors.lastName}</p>}
            </div>

            {/* Email */}
            <div>
              <label className='block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2'>Email address</label>
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder='Enter your email'
              />
              {errors.email && <p className='text-red-500 text-xs mt-1'>{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className='block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2'>Password</label>
              <div className='relative'>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 pr-10 text-gray-900 dark:text-white bg-white dark:bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder='Create a password'
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className='text-red-500 text-xs mt-1'>{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className='block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2'>Confirm Password</label>
              <div className='relative'>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 pr-10 text-gray-900 dark:text-white bg-white dark:bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder='Confirm your password'
                />
                <button
                  type='button'
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && <p className='text-red-500 text-xs mt-1'>{errors.confirmPassword}</p>}
            </div>

            {/* Checkboxes - ONLY TERMS OF SERVICE */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="w-4 h-4 mt-1 accent-blue-600 cursor-pointer"
                />
                <label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-300">
                  I accept the <button type="button" onClick={() => setShowTermsModal(true)} className="text-blue-600 hover:underline dark:text-blue-400 dark:hover:text-blue-300">Terms of Service</button>
                </label>
              </div>
              {errors.terms && <p className="text-red-500 text-xs -mt-2">{errors.terms}</p>}
            </div>

            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className={`w-full ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white font-semibold py-3 rounded-lg transition-colors duration-200 mt-4`}
            >
              {isLoading ? 'Sending OTP...' : 'Create Account'}
            </button>

            <div className='text-center text-gray-600 dark:text-gray-300'>
              Already have an account? <Link to='/login' className='text-blue-600 hover:underline dark:text-blue-400 dark:hover:text-blue-300 font-medium'>Sign in</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Terms Modal */}
      {showTermsModal && <TermsModal />}
      
      {/* OTP Verification Modal */}
      {showOTPModal && <OTPModal />}
    </div>
  );
};

export default Signup;