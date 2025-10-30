import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { OAuth2Client } from 'google-auth-library';

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};

// SIGNUP ROUTE
router.post("/signup", async (req, res) => {
  try {
    console.log("SIGNUP REQUEST:", req.body);

    const { firstName, lastName, email, password, confirmPassword } = req.body;

    // Validation - Check required fields
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return res.status(400).json({ 
        success: false,
        message: "Please fill all required fields" 
      });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({ 
        success: false,
        message: "Passwords do not match" 
      });
    }

    // Check password strength
    if (password.length < 8) {
      return res.status(400).json({ 
        success: false,
        message: "Password must be at least 8 characters" 
      });
    }

    // Enhanced password validation
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    if (!hasNumber || !hasSpecialChar) {
      return res.status(400).json({ 
        success: false,
        message: "Password must contain at least 1 number and 1 special character" 
      });
    }

    // Validate email format (Gmail only)
    const gmailRegex = /^[^\s@]+@gmail\.com$/i;
    if (!gmailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        message: "Please use a valid Gmail address" 
      });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({ 
        success: false,
        message: "Email already registered" 
      });
    }

    // Generate unique ID for user
    const generateUniqueID = async () => {
      let uniqueID;
      let exists = true;
      
      while (exists) {
        uniqueID = `SM-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        const existingUser = await User.findOne({ id: uniqueID });
        exists = !!existingUser;
      }
      
      return uniqueID;
    };

    const uniqueID = await generateUniqueID();

    // Create user
    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      id: uniqueID,
      password: password,
      userType: "student",
      profilePicture: null
    });

    // Generate token - using the imported function
    const token = generateToken(user._id);

    console.log("USER CREATED:", { id: user._id, email: user.email });
    
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
    return res.status(500).json({ 
      success: false,
      message: "Server error during signup", 
      error: error.message 
    });
  }
});

// LOGIN ROUTE
router.post("/login", async (req, res) => {
  try {
    console.log("LOGIN ATTEMPT:", req.body);

    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      console.log("Missing email or password");
      return res.status(400).json({ 
        success: false,
        message: "Please provide both email and password" 
      });
    }

    // Clean the email
    const cleanEmail = email.toLowerCase().trim();
    console.log("Cleaned email:", cleanEmail);

    // Find user by email - MAKE SURE TO INCLUDE PASSWORD
    const user = await User.findOne({ email: cleanEmail }).select('+password');
    
    if (!user) {
      console.log("User not found for email:", cleanEmail);
      return res.status(401).json({ 
        success: false,
        message: "Invalid email or password" 
      });
    }

    console.log("User found:", {
      id: user._id,
      email: user.email,
      hasPassword: !!user.password
    });

    // Check if password is hashed (starts with $2)
    const isPasswordHashed = user.password && user.password.startsWith('$2');
    console.log("Password is hashed:", isPasswordHashed);

    if (!isPasswordHashed) {
      console.log("Password is not hashed properly");
      return res.status(500).json({
        success: false,
        message: "Server configuration error. Please contact support."
      });
    }

    // Check password
    console.log("Starting password comparison...");
    const isPasswordValid = await user.matchPassword(password);
    console.log("Password comparison result:", isPasswordValid);

    if (!isPasswordValid) {
      console.log("Password incorrect");
      return res.status(401).json({ 
        success: false,
        message: "Invalid email or password" 
      });
    }

    // Generate token - using the imported function
    const token = generateToken(user._id);
    console.log("Token generated");

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

// GET CURRENT USER
router.get("/me", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
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

// GOOGLE SIGN-IN
router.post("/google", async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ 
        success: false,
        message: "Missing credential" 
      });
    }

    // Verify Google token
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
      const generateUniqueID = async () => {
        let uniqueID;
        let exists = true;
        
        while (exists) {
          uniqueID = `G-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
          const existingUser = await User.findOne({ id: uniqueID });
          exists = !!existingUser;
        }
        
        return uniqueID;
      };

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

    // Generate token for Google user - using the imported function
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

export default router;