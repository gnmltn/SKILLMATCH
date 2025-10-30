import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { OAuth2Client } from 'google-auth-library';
import PasswordReset from '../models/PasswordReset.js';
import { sendOTPEmail, verifyGmailExists } from '../utils/emailService.js';

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

// Improved unique ID generator
const generateUniqueID = async () => {
  let uniqueID;
  let exists = true;
  let attempts = 0;
  const maxAttempts = 10;
  
  while (exists && attempts < maxAttempts) {
    uniqueID = `SM-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const existingUser = await User.findOne({ id: uniqueID });
    exists = !!existingUser;
    attempts++;
    
    if (attempts >= maxAttempts) {
      throw new Error('Failed to generate unique ID after multiple attempts');
    }
  }
  
  return uniqueID;
};


router.post("/signup/send-otp", async (req, res) => {
  try {
    const { firstName, lastName, email, password, confirmPassword } = req.body;

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return res.status(400).json({ 
        success: false,
        message: "Please fill all required fields" 
      });
    }

   
    if (password !== confirmPassword) {
      return res.status(400).json({ 
        success: false,
        message: "Passwords do not match" 
      });
    }

   
    if (password.length < 8) {
      return res.status(400).json({ 
        success: false,
        message: "Password must be at least 8 characters" 
      });
    }

    
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    if (!hasNumber || !hasSpecialChar) {
      return res.status(400).json({ 
        success: false,
        message: "Password must contain at least 1 number and 1 special character" 
      });
    }

    const gmailRegex = /^[^\s@]+@gmail\.com$/i;
    if (!gmailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        message: "Please use a valid Gmail address" 
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    const existingEmail = await User.findOne({ email: cleanEmail });
    if (existingEmail) {
      return res.status(400).json({ 
        success: false,
        message: "Email already registered" 
      });
    }

    const otpCode = PasswordReset.generateOTP();
    console.log("Generated OTP:", otpCode);
    
    await PasswordReset.deleteMany({ email: cleanEmail });
    
    await PasswordReset.create({
      email: cleanEmail,
      otpCode: otpCode,
      otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent') || 'Unknown'
    });

    console.log("Attempting to send email to:", cleanEmail);
    await sendOTPEmail(cleanEmail, otpCode, 'signup');

    console.log('Signup OTP sent to:', cleanEmail);

    return res.status(200).json({
      success: true,
      message: "OTP sent to your email. Please verify to complete registration.",
      email: cleanEmail,
      // For development, include the OTP in the response
      ...(process.env.NODE_ENV === 'development' && { developmentOtp: otpCode })
    });

  } catch (error) {
    console.error("=== SEND OTP ERROR ===");
    console.error("Error:", error.message);
    console.error("Stack:", error.stack);
    
    return res.status(500).json({ 
      success: false,
      message: "Failed to send OTP. Please try again.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.post("/signup/verify-otp", async (req, res) => {
  try {
    const { firstName, lastName, email, password, otp } = req.body;

    if (!firstName || !lastName || !email || !password || !otp) {
      return res.status(400).json({ 
        success: false,
        message: "Please provide all required fields" 
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    const otpRecord = await PasswordReset.findOne({ 
      email: cleanEmail, 
      otpCode: otp,
      isUsed: false,
      otpExpiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      return res.status(400).json({ 
        success: false,
        message: "OTP expired or not found. Please request a new one." 
      });
    }

    const uniqueID = await generateUniqueID();

    const userData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: cleanEmail,
      id: uniqueID,
      password: password,
      userType: "student",
      profilePicture: null
    };

    const user = await User.create(userData);

    otpRecord.isUsed = true;
    await otpRecord.save();

    const token = generateToken(user._id);

    console.log("USER CREATED SUCCESSFULLY:", { id: user._id, email: user.email });
    
    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        id: user.id,
        userType: user.userType,
        profilePicture: user.profilePicture
      },
      token,
    });

  } catch (error) {
    console.error("VERIFY OTP ERROR:", error);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false,
        message: "User with this ID already exists. Please try again.",
        error: "Duplicate ID error"
      });
    }
    
    return res.status(500).json({ 
      success: false,
      message: "Server error during signup", 
      error: error.message 
    });
  }
});


router.post("/login/send-otp", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: "Please provide both email and password" 
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: cleanEmail }).select('+password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid email or password" 
      });
    }

    const isPasswordValid = await user.matchPassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid email or password" 
      });
    }

    const otpCode = PasswordReset.generateOTP();
    
    await PasswordReset.deleteMany({ email: cleanEmail });
    
    await PasswordReset.create({
      email: cleanEmail,
      otpCode: otpCode,
      otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent') || 'Unknown'
    });

    await sendOTPEmail(cleanEmail, otpCode, 'login');

    console.log('Login OTP sent to:', cleanEmail);

    return res.status(200).json({
      success: true,
      message: "OTP sent to your email. Please verify to complete login.",
      email: cleanEmail
    });

  } catch (error) {
    console.error("LOGIN SEND OTP ERROR:", error);
    return res.status(500).json({ 
      success: false,
      message: "Failed to send OTP. Please try again.",
      error: error.message 
    });
  }
});

router.post("/login/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ 
        success: false,
        message: "Please provide email and OTP" 
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    const otpRecord = await PasswordReset.findOne({ 
      email: cleanEmail, 
      otpCode: otp,
      isUsed: false,
      otpExpiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      return res.status(400).json({ 
        success: false,
        message: "OTP expired or not found. Please request a new one." 
      });
    }

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    otpRecord.isUsed = true;
    await otpRecord.save();

    const token = generateToken(user._id);

    console.log("LOGIN SUCCESSFUL for user:", user._id);
    
    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        id: user.id,
        profilePicture: user.profilePicture,
        course: user.course,
        yearLevel: user.yearLevel,
        skills: user.skills,
        projectHistory: user.projectHistory,
        recommendations: user.recommendations
      },
      token
    });

  } catch (error) {
    console.error("LOGIN VERIFY OTP ERROR:", error);
    return res.status(500).json({ 
      success: false,
      message: "Server error during login verification",
      error: error.message 
    });
  }
});

router.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, email, password, confirmPassword } = req.body;

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return res.status(400).json({ 
        success: false,
        message: "Please fill all required fields" 
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ 
        success: false,
        message: "Passwords do not match" 
      });
    }

    if (password.length < 8) {
      return res.status(400).json({ 
        success: false,
        message: "Password must be at least 8 characters" 
      });
    }

    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    if (!hasNumber || !hasSpecialChar) {
      return res.status(400).json({ 
        success: false,
        message: "Password must contain at least 1 number and 1 special character" 
      });
    }

    const gmailRegex = /^[^\s@]+@gmail\.com$/i;
    if (!gmailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        message: "Please use a valid Gmail address" 
      });
    }

    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({ 
        success: false,
        message: "Email already registered" 
      });
    }

    const uniqueID = await generateUniqueID();

    const userData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      id: uniqueID,
      password: password,
      userType: "student",
      profilePicture: null
    };

    const user = await User.create(userData);

    const token = generateToken(user._id);

    console.log("USER CREATED SUCCESSFULLY:", { id: user._id, email: user.email });
    
    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        id: user.id,
        userType: user.userType,
        profilePicture: user.profilePicture
      },
      token,
    });
  } catch (error) {
    console.error("SIGNUP ERROR:", error);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false,
        message: "User with this ID already exists. Please try again.",
        error: "Duplicate ID error"
      });
    }
    
    return res.status(500).json({ 
      success: false,
      message: "Server error during signup", 
      error: error.message 
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: "Please provide both email and password" 
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: cleanEmail }).select('+password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid email or password" 
      });
    }

    const isPasswordValid = await user.matchPassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid email or password" 
      });
    }

    const token = generateToken(user._id);

    console.log("LOGIN SUCCESSFUL for user:", user._id);
    
    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        id: user.id,
        profilePicture: user.profilePicture,
        course: user.course,
        yearLevel: user.yearLevel,
        skills: user.skills,
        projectHistory: user.projectHistory,
        recommendations: user.recommendations
      },
      token
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({ 
      success: false,
      message: "Server error during login",
      error: error.message 
    });
  }
});

router.get("/me", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profilePicture: user.profilePicture,
        course: user.course,
        yearLevel: user.yearLevel,
        skills: user.skills,
        projectHistory: user.projectHistory,
        recommendations: user.recommendations
      }
    });
  } catch (error) {
    console.error("Get user error:", error);
    return res.status(401).json({ 
      success: false,
      message: "Invalid token"
    });
  }
});

router.post("/google", async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ 
        success: false,
        message: "Missing credential" 
      });
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    
    if (!payload || !payload.email) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid Google token" 
      });
    }

    const email = payload.email.toLowerCase();
    const firstName = payload.given_name || payload.name?.split(" ")[0] || "User";
    const lastName = payload.family_name || payload.name?.split(" ")[1] || "";

    // Check if email is Gmail
    const gmailRegex = /^[^\s@]+@gmail\.com$/i;
    if (!gmailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        message: "Please use a Gmail account" 
      });
    }

    // Find or create user
    let user = await User.findOne({ email });
    if (!user) {
      const uniqueID = await generateUniqueID();
      
      user = await User.create({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        id: uniqueID,
        password: Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2),
        userType: "student",
        profilePicture: payload.picture || null
      });
    }

    // Generate token for Google user
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Google login successful",
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profilePicture: user.profilePicture
      },
      token
    });

  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during Google login'
    });
  }
});

router.get("/debug-db", async (req, res) => {
  try {
    const users = await User.find({});
    const usersWithNullId = await User.find({ id: null });
    
    console.log("DEBUG - Database status:");
    console.log("Total users:", users.length);
    console.log("Users with null ID:", usersWithNullId.length);
    
    res.json({
      success: true,
      totalUsers: users.length,
      usersWithNullId: usersWithNullId.length,
      usersWithNullIds: usersWithNullId.map(u => ({ _id: u._id, email: u.email }))
    });
  } catch (error) {
    console.error("Debug DB error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// DEBUG ROUTE - Check if users exist and their passwords
router.get("/debug-users", async (req, res) => {
  try {
    const users = await User.find({}).select('+password');
    const usersData = users.map(user => ({
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      hasPassword: !!user.password,
      passwordLength: user.password ? user.password.length : 0,
      passwordStartsWith: user.password ? user.password.substring(0, 10) + "..." : "NO PASSWORD",
      isHashed: user.password ? user.password.startsWith('$2') : false
    }));
    
    console.log("DEBUG - All users:", usersData);
    res.json({
      success: true,
      users: usersData
    });
  } catch (error) {
    console.error("Debug error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

router.post("/test-email-config", async (req, res) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      return res.status(500).json({
        success: false,
        message: "Email configuration missing",
        EMAIL_USER: !!process.env.EMAIL_USER,
        EMAIL_PASSWORD: !!process.env.EMAIL_PASSWORD
      });
    }

    const testEmail = "test@example.com";
    const testOTP = "123456";
    
    const result = await sendOTPEmail(testEmail, testOTP, 'signup');
    
    res.json({
      success: true,
      message: "Email configuration is working",
      result
    });
  } catch (error) {
    console.error("Email config test error:", error);
    res.status(500).json({
      success: false,
      message: "Email configuration test failed",
      error: error.message
    });
  }
});

router.post("/debug-email", async (req, res) => {
  try {
    console.log("=== DEBUGGING EMAIL CONFIGURATION ===");
    
    // Check environment variables
    console.log("EMAIL_USER:", process.env.EMAIL_USER);
    console.log("EMAIL_PASSWORD exists:", !!process.env.EMAIL_PASSWORD);
    console.log("EMAIL_PASSWORD length:", process.env.EMAIL_PASSWORD?.length);
    console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET);
    
    // Check if required environment variables are set
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      return res.status(500).json({
        success: false,
        message: "Email configuration missing",
        details: {
          EMAIL_USER_SET: !!process.env.EMAIL_USER,
          EMAIL_PASSWORD_SET: !!process.env.EMAIL_PASSWORD
        }
      });
    }

    // Test database connection
    try {
      const userCount = await User.countDocuments();
      console.log("Database connection successful. Users in DB:", userCount);
    } catch (dbError) {
      console.error("Database connection failed:", dbError);
      return res.status(500).json({
        success: false,
        message: "Database connection failed",
        error: dbError.message
      });
    }

    // Test OTP generation
    const otpCode = PasswordReset.generateOTP();
    console.log("OTP Generation test:", otpCode);

    res.json({
      success: true,
      message: "Debug information",
      emailConfigured: true,
      databaseConnected: true,
      environment: {
        EMAIL_USER: process.env.EMAIL_USER,
        EMAIL_PASSWORD_SET: !!process.env.EMAIL_PASSWORD,
        JWT_SECRET_SET: !!process.env.JWT_SECRET,
        NODE_ENV: process.env.NODE_ENV
      }
    });

  } catch (error) {
    console.error("Debug route error:", error);
    res.status(500).json({
      success: false,
      message: "Debug route failed",
      error: error.message
    });
  }
});

router.post("/verify-email-setup", async (req, res) => {
  try {
    console.log("=== EMAIL SETUP VERIFICATION ===");
    
    // Check environment
    console.log("📧 EMAIL_USER:", process.env.EMAIL_USER);
    console.log("🔑 EMAIL_PASSWORD length:", process.env.EMAIL_PASSWORD?.length);
    console.log("🔑 EMAIL_PASSWORD sample:", process.env.EMAIL_PASSWORD?.substring(0, 4) + '...');
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      return res.json({
        success: false,
        message: "Email configuration missing",
        fix: "Set EMAIL_USER and EMAIL_PASSWORD in .env file"
      });
    }

    if (process.env.EMAIL_PASSWORD.length !== 16) {
      return res.json({
        success: false,
        message: "App Password should be 16 characters",
        currentLength: process.env.EMAIL_PASSWORD.length,
        fix: "Generate a new 16-character App Password from Google Account"
      });
    }

    if (process.env.EMAIL_PASSWORD.includes(' ')) {
      return res.json({
        success: false,
        message: "App Password contains spaces",
        fix: "Remove spaces from the App Password in .env file"
      });
    }

    const testEmail = process.env.EMAIL_USER; // Send to yourself
    const testOTP = "123456";
    
    console.log("🔄 Testing email send...");
    const result = await sendOTPEmail(testEmail, testOTP, 'signup');
    
    res.json({
      success: true,
      message: "Email configuration is working!",
      testEmail: testEmail,
      testOTP: testOTP,
      result: result
    });
    
  } catch (error) {
    console.error("Email setup test failed:", error);
    res.status(500).json({
      success: false,
      message: "Email setup test failed",
      error: error.message,
      fix: "Check the server console for detailed error information"
    });
  }
});
export default router;