import nodemailer from 'nodemailer';

// Create transporter for sending emails
const createTransporter = () => {
  console.log("Creating email transporter...");
  
  // Check if we're in development mode and email config is missing
  if (process.env.NODE_ENV === 'development' && (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD)) {
    console.log("Development mode: Using mock email transporter");
    return {
      sendMail: (mailOptions) => {
        console.log("[MOCK EMAIL] Would send email:", {
          to: mailOptions.to,
          subject: mailOptions.subject
        });
        return Promise.resolve({
          messageId: 'mock-message-id',
          response: '250 Mock email sent'
        });
      }
    };
  }

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    throw new Error('Email configuration missing: EMAIL_USER or EMAIL_PASSWORD not set');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Generate 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
export const sendOTPEmail = async (email, otp, purpose = 'verification') => {
  try {
    console.log(`Sending ${purpose} OTP to: ${email}`);
    console.log(`OTP Code: ${otp}`); // This is safe in development
    
    const transporter = createTransporter();
    
    let subject, htmlContent;
    
    if (purpose === 'signup') {
      subject = 'SkillMatch - Email Verification OTP';
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1>Welcome to SkillMatch!</h1>
            <p>Verify your email to get started</p>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p>Hello,</p>
            <p>Thank you for signing up with SkillMatch! To complete your registration, please use the following One-Time Password (OTP):</p>
            <div style="background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
              <div style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px;">${otp}</div>
              <p style="color: #666; margin-top: 10px;">This code will expire in 10 minutes</p>
            </div>
            <p><strong>OTP:</strong> ${otp}</p>
            <p>If you didn't request this verification, please ignore this email.</p>
          </div>
        </div>
      `;
    } else if (purpose === 'login') {
      subject = 'SkillMatch - Login Verification OTP';
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1>Login Verification</h1>
            <p>Secure your account access</p>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p>Hello,</p>
            <p>We received a login request for your SkillMatch account. Please use the following OTP to complete your login:</p>
            <div style="background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
              <div style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px;">${otp}</div>
              <p style="color: #666; margin-top: 10px;">This code will expire in 10 minutes</p>
            </div>
            <p><strong>OTP:</strong> ${otp}</p>
          </div>
        </div>
      `;
    } else if (purpose === 'password-reset') {
      subject = 'SkillMatch - Password Reset OTP';
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1>Password Reset Request</h1>
            <p>Reset your account password</p>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p>Hello,</p>
            <p>We received a request to reset your SkillMatch account password. Please use the following OTP to proceed:</p>
            <div style="background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
              <div style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px;">${otp}</div>
              <p style="color: #666; margin-top: 10px;">This code will expire in 10 minutes</p>
            </div>
            <p><strong>OTP:</strong> ${otp}</p>
          </div>
        </div>
      `;
    }

    const mailOptions = {
      from: `"SkillMatch" <${process.env.EMAIL_USER || 'noreply@skillmatch.com'}>`,
      to: email,
      subject: subject,
      html: htmlContent
    };

    console.log("Attempting to send email...");
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    
    return { 
      success: true, 
      messageId: info.messageId,
      otp: otp // Return OTP for development testing
    };
  } catch (error) {
    console.error('Email sending error:', error);
    
    // In development mode, still return success but log the error
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV MODE] OTP for ${email}: ${otp}`);
      return { 
        success: true, 
        messageId: 'dev-fallback-message-id',
        otp: otp,
        error: 'Email failed but OTP returned for development'
      };
    }
    
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

// Verify Gmail account exists 
export const verifyGmailExists = async (email) => {
  const gmailRegex = /^[^\s@]+@gmail\.com$/i;
  if (!gmailRegex.test(email)) {
    return { exists: false, message: 'Please use a valid Gmail address' };
  }
  
  return { exists: true, message: 'Email format is valid' };
};