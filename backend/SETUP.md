# Backend Setup Guide for Password Reset

## 📋 Prerequisites

1. **Node.js** (v16 or higher)
2. **MongoDB** (local or cloud)
3. **Email Service** (Gmail, SendGrid, etc.)

## 🚀 Installation Steps

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Configuration
Create a `.env` file in the backend directory with:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/skillmatch

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Email Configuration (Gmail Example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password_here
SMTP_FROM=SkillMatch <noreply@skillmatch.com>

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Password Reset
OTP_EXPIRY_MINUTES=10
MAX_OTP_ATTEMPTS=5
MAX_PASSWORD_RESET_ATTEMPTS=3
```

### 3. Email Service Setup

#### Option A: Gmail (Recommended for testing)
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use the app password in `SMTP_PASS`

#### Option B: SendGrid (Production)
1. Create SendGrid account
2. Get API key from SendGrid dashboard
3. Update SMTP settings in `.env`

### 4. Start the Server
```bash
npm run dev
```

## 🔧 API Endpoints

### Password Reset Flow

1. **POST /api/auth/forgot-password**
   - Send OTP to email
   - Rate limited: 3 attempts per hour

2. **POST /api/auth/verify-otp**
   - Verify 6-digit OTP code
   - Rate limited: 5 attempts per 15 minutes

3. **POST /api/auth/reset-password**
   - Reset password with verified OTP
   - Rate limited: 5 attempts per hour

## 🧪 Testing

### Test the Complete Flow:

1. **Send OTP:**
```bash
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@phinmaed.com"}'
```

2. **Verify OTP:**
```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "test@phinmaed.com", "otp": "123456"}'
```

3. **Reset Password:**
```bash
curl -X POST http://localhost:5000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@phinmaed.com", "otp": "123456", "password": "NewPass123", "confirmPassword": "NewPass123"}'
```

## 🔒 Security Features

- ✅ Rate limiting on all endpoints
- ✅ OTP expiration (10 minutes)
- ✅ Password strength validation
- ✅ University email validation
- ✅ Secure password hashing (bcrypt)
- ✅ One-time OTP usage
- ✅ IP-based rate limiting

## 📧 Email Templates

The system includes professional HTML email templates for:
- OTP delivery with security warnings
- Password reset confirmation
- Responsive design for all devices

## 🐛 Troubleshooting

### Common Issues:

1. **Email not sending:**
   - Check SMTP credentials
   - Verify app password (Gmail)
   - Check firewall/network restrictions

2. **Database connection:**
   - Ensure MongoDB is running
   - Check MONGODB_URI format
   - Verify network connectivity

3. **Rate limiting:**
   - Wait for rate limit window to reset
   - Check IP-based restrictions
   - Review rate limit configuration

## 📝 Next Steps

1. Install dependencies: `npm install`
2. Configure environment variables
3. Set up email service
4. Start the server: `npm run dev`
5. Test the API endpoints
6. Integrate with frontend

The backend is now ready for password reset functionality! 🎉
