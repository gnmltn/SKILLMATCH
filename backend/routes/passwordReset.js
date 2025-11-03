import express from 'express';
import User from '../models/User.js';
import PasswordReset from '../models/PasswordReset.js';
import { sendOTPEmail, verifyGmailExists } from '../utils/emailService.js';

const router = express.Router();

// STEP 1: Request Password Reset - Send OTP
router.post("/request-reset", async (req, res) => {
  try {
    const { email } = req.body;

    // Validation
    if (!email) {
      return res.status(400).json({ 
        success: false,
        message: "Please provide your email address" 
      });
    }

    // Validate email format
    const emailCheck = await verifyGmailExists(email);
    if (!emailCheck.exists) {
      return res.status(400).json({ 
        success: false,
        message: emailCheck.message 
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user exists
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      // For security, don't reveal if email exists or not
      return res.status(200).json({
        success: true,
        message: "If an account with that email exists, an OTP has been sent.",
        email: cleanEmail
      });
    }

    // Generate and send OTP
    const otpCode = PasswordReset.generateOTP();
    
    // Delete any existing OTPs for this email
    await PasswordReset.deleteMany({ email: cleanEmail });
    
    // Save OTP to database
    await PasswordReset.create({
      email: cleanEmail,
      otpCode: otpCode,
      otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent') || 'Unknown'
    });

    // Send OTP email
    await sendOTPEmail(cleanEmail, otpCode, 'password-reset');

    console.log('Password reset OTP sent to:', cleanEmail);

    return res.status(200).json({
      success: true,
      message: "OTP sent to your email. Please verify to reset your password.",
      email: cleanEmail
    });

  } catch (error) {
    console.error("REQUEST RESET ERROR:", error);
    return res.status(500).json({ 
      success: false,
      message: "Failed to send reset OTP. Please try again.",
      error: error.message 
    });
  }
});

// STEP 2: Verify OTP for Password Reset
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validation
    if (!email || !otp) {
      return res.status(400).json({ 
        success: false,
        message: "Please provide email and OTP" 
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Find OTP record
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

    // Check attempts
    if (otpRecord.attempts >= 5) {
      await PasswordReset.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ 
        success: false,
        message: "Too many failed attempts. Please request a new OTP." 
      });
    }

    // Mark OTP as verified
    otpRecord.isUsed = true;
    await otpRecord.save();

    console.log('OTP verified for password reset:', cleanEmail);

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully. You can now reset your password.",
      email: cleanEmail
    });

  } catch (error) {
    console.error("VERIFY OTP ERROR:", error);
    return res.status(500).json({ 
      success: false,
      message: "Server error during OTP verification",
      error: error.message 
    });
  }
});

// STEP 3: Reset Password with Verified OTP
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;

    // Validation
    if (!email || !otp || !newPassword || !confirmPassword) {
      return res.status(400).json({ 
        success: false,
        message: "Please provide all required fields" 
      });
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ 
        success: false,
        message: "Passwords do not match" 
      });
    }

    // Check for whitespace in password
    if (/\s/.test(newPassword)) {
      return res.status(400).json({ 
        success: false,
        message: "Password cannot contain whitespace" 
      });
    }

    // Check password strength
    if (newPassword.length < 8) {
      return res.status(400).json({ 
        success: false,
        message: "Password must be at least 8 characters" 
      });
    }

    // Enhanced password validation
    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasLowercase = /[a-z]/.test(newPassword);
    const hasNumber = /\d/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword);
    if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecialChar) {
      return res.status(400).json({ 
        success: false,
        message: "Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character" 
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Find verified OTP record
    const otpRecord = await PasswordReset.findOne({ 
      email: cleanEmail, 
      otpCode: otp,
      isUsed: true
    });

    if (!otpRecord) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid or expired OTP. Please request a new one." 
      });
    }

    // Find user
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Delete OTP record after successful password reset
    await PasswordReset.deleteOne({ _id: otpRecord._id });

    console.log('Password reset successful for:', cleanEmail);

    return res.status(200).json({
      success: true,
      message: "Password reset successfully. You can now login with your new password."
    });

  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    return res.status(500).json({ 
      success: false,
      message: "Server error during password reset",
      error: error.message 
    });
  }
});

// Resend OTP for password reset
router.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false,
        message: "Please provide your email address" 
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user exists
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If an account with that email exists, an OTP has been sent."
      });
    }

    // Generate and send new OTP
    const otpCode = PasswordReset.generateOTP();
    
    // Delete any existing OTPs
    await PasswordReset.deleteMany({ email: cleanEmail });
    
    // Save new OTP
    await PasswordReset.create({
      email: cleanEmail,
      otpCode: otpCode,
      otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent') || 'Unknown'
    });

    // Send OTP email
    await sendOTPEmail(cleanEmail, otpCode, 'password-reset');

    console.log('Password reset OTP resent to:', cleanEmail);

    return res.status(200).json({
      success: true,
      message: "New OTP sent to your email."
    });

  } catch (error) {
    console.error("RESEND OTP ERROR:", error);
    return res.status(500).json({ 
      success: false,
      message: "Failed to resend OTP. Please try again."
    });
  }
});

export default router;